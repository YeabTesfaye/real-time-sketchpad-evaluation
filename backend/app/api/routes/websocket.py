from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.security import verify_token
from app.db.models import User
from app.core.exceptions import AuthenticationException, InternalServerErrorException
from app.core.error_handler import logger
import json
import uuid
from datetime import datetime
from typing import Dict, List
import asyncio

router = APIRouter()

# Validation constants
MAX_MESSAGE_SIZE = 1024 * 1024  # 1MB
MAX_OPERATION_POINTS = 1000  # Maximum points in a drawing operation
VALID_MESSAGE_TYPES = {
    "drawing_operation",
    "cursor_move",
    "clear_canvas",
    "user_joined",
    "user_left"
}

class ConnectionManager:
    def __init__(self):
        # room_id -> {user_id: websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # room_id -> list of drawing operations
        self.drawing_operations: Dict[str, List[dict]] = {}
        # room_id -> {user_id: user_info}
        self.room_users: Dict[str, Dict[str, dict]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, user_info: dict):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.drawing_operations[room_id] = []
            self.room_users[room_id] = {}

        self.active_connections[room_id][user_id] = websocket
        self.room_users[room_id][user_id] = user_info

        # Notify others in the room about the new user
        await self.broadcast_to_room(
            room_id,
            {
                "type": "user_joined",
                "user": user_info
            },
            exclude_user=user_id
        )

        # Send current canvas state to the new user
        if self.drawing_operations[room_id]:
            await websocket.send_text(json.dumps({
                "type": "canvas_state",
                "operations": self.drawing_operations[room_id]
            }))

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                del self.active_connections[room_id][user_id]
            if user_id in self.room_users[room_id]:
                del self.room_users[room_id][user_id]

            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                del self.drawing_operations[room_id]
                del self.room_users[room_id]
            else:
                # Notify others that user left
                self.broadcast_to_room_sync(
                    room_id,
                    {
                        "type": "user_left",
                        "user_id": user_id
                    }
                )

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        if room_id in self.active_connections:
            for user_id, connection in self.active_connections[room_id].items():
                if user_id != exclude_user:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        # Remove broken connections
                        self.disconnect(room_id, user_id)

    def broadcast_to_room_sync(self, room_id: str, message: dict, exclude_user: str = None):
        if room_id in self.active_connections:
            for user_id, connection in list(self.active_connections[room_id].items()):
                if user_id != exclude_user:
                    try:
                        # Note: This is synchronous, in practice you'd use async
                        # For simplicity in this example, we'll keep it simple
                        connection.send_text(json.dumps(message))
                    except:
                        self.disconnect(room_id, user_id)

manager = ConnectionManager()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Verify token
    try:
        token_data = verify_token(token)
        if token_data is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Get user from database
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        user_id = str(user.id)
        user_info = {
            "user_id": user_id,
            "joined_at": datetime.now().isoformat(),
            "color": f"hsl({hash(user_id) % 360}, 70%, 50%)",  # Generate color from user_id
            "name": f"{user.firstname or ''} {user.lastname or ''}".strip() or f"User-{user_id[:4]}",
        }

        await manager.connect(websocket, room_id, user_id, user_info)

        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()

                # Validate message size
                if len(data.encode('utf-8')) > MAX_MESSAGE_SIZE:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Message too large"
                    }))
                    continue

                try:
                    message = json.loads(data)
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON"
                    }))
                    continue

                # Validate message type
                if "type" not in message or message["type"] not in VALID_MESSAGE_TYPES:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid message type"
                    }))
                    continue

                # Handle different message types
                if message["type"] == "drawing_operation":
                    # Validate drawing operation
                    if "operation" not in message:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Missing operation data"
                        }))
                        continue

                    operation = message["operation"]
                    required_fields = ["points", "color", "size", "tool"]
                    if not all(field in operation for field in required_fields):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Invalid operation format"
                        }))
                        continue

                    # Validate points
                    if not isinstance(operation["points"], list) or len(operation["points"]) > MAX_OPERATION_POINTS:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Invalid points data"
                        }))
                        continue

                    # Validate each point
                    for point in operation["points"]:
                        if not isinstance(point, dict) or "x" not in point or "y" not in point:
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": "Invalid point format"
                            }))
                            continue
                        if not isinstance(point["x"], (int, float)) or not isinstance(point["y"], (int, float)):
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": "Point coordinates must be numbers"
                            }))
                            continue

                    # Store the operation
                    operation_data = {
                        **operation,
                        "user_id": user_id,
                        "timestamp": datetime.now().isoformat()
                    }
                    manager.drawing_operations[room_id].append(operation_data)

                    # Broadcast to others in the room
                    await manager.broadcast_to_room(
                        room_id,
                        {
                            "type": "drawing_operation",
                            "operation": operation_data
                        },
                        exclude_user=user_id
                    )

                elif message["type"] == "cursor_move":
                    # Validate cursor move
                    if "position" not in message or not isinstance(message["position"], dict):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Invalid cursor move data"
                        }))
                        continue

                    position = message["position"]
                    if "x" not in position or "y" not in position:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Invalid position format"
                        }))
                        continue
                    if not isinstance(position["x"], (int, float)) or not isinstance(position["y"], (int, float)):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Position coordinates must be numbers"
                        }))
                        continue

                    # Broadcast cursor position to others
                    await manager.broadcast_to_room(
                        room_id,
                        {
                            "type": "cursor_move",
                        "user_id": user_id,
                        "position": message["position"],
                        "timestamp": datetime.now().isoformat()
                    },
                    exclude_user=user_id
                )

                elif message["type"] == "clear_canvas":
                    # Clear the canvas for this room
                    if room_id in manager.drawing_operations:
                        manager.drawing_operations[room_id] = []

                    # Broadcast clear canvas to others in the room
                    await manager.broadcast_to_room(
                        room_id,
                        {
                            "type": "clear_canvas",
                            "user_id": user_id,
                            "timestamp": datetime.now().isoformat()
                        },
                        exclude_user=user_id
                    )

        except WebSocketDisconnect:
            manager.disconnect(room_id, user_id)
        except SQLAlchemyError as e:
            logger.error(f"Database error in websocket: {e}")
            try:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            except:
                pass
            manager.disconnect(room_id, user_id)
        except Exception as e:
            logger.error(f"Unexpected error in websocket: {e}")
            try:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            except:
                pass
            manager.disconnect(room_id, user_id)
    except SQLAlchemyError as e:
        logger.error(f"Database error in websocket setup: {e}")
        try:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        except:
            pass
    except Exception as e:
        logger.error(f"Unexpected error in websocket setup: {e}")
        try:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        except:
            pass