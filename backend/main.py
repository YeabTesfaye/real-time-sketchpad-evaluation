from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import uuid
from datetime import datetime

app = FastAPI(title="Real-time Sketchpad API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for rooms
# In production, this would be replaced with Redis or a database
class ConnectionManager:
    def __init__(self):
        # room_id -> {user_id: websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # room_id -> list of drawing operations
        self.drawing_operations: Dict[str, List[dict]] = {}
        # room_id -> {user_id: user_info}
        self.room_users: Dict[str, Dict[str, dict]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.drawing_operations[room_id] = []
            self.room_users[room_id] = {}

        self.active_connections[room_id][user_id] = websocket
        self.room_users[room_id][user_id] = {
            "user_id": user_id,
            "joined_at": datetime.now().isoformat(),
            "color": f"hsl({hash(user_id) % 360}, 70%, 50%)",
            "name": f"User-{user_id[:4]}"
        }

        # Notify others in the room about the new user
        await self.broadcast_to_room(
            room_id,
            {
                "type": "user_joined",
                "user": self.room_users[room_id][user_id]
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
                        pass
                    except:
                        self.disconnect(room_id, user_id)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Real-time Sketchpad API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    # Generate a user ID for this connection
    user_id = str(uuid.uuid4())

    await manager.connect(websocket, room_id, user_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            if message["type"] == "drawing_operation":
                # Store the operation
                operation = {
                    **message["operation"],
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat()
                }
                manager.drawing_operations[room_id].append(operation)

                # Broadcast to others in the room
                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "drawing_operation",
                        "operation": operation
                    },
                    exclude_user=user_id
                )

            elif message["type"] == "cursor_move":
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

    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(room_id, user_id)

# For testing HTTP endpoints
@app.get("/rooms/{room_id}")
async def get_room_info(room_id: str):
    if room_id in manager.room_users:
        return {
            "room_id": room_id,
            "users": list(manager.room_users[room_id].values()),
            "operation_count": len(manager.drawing_operations.get(room_id, []))
        }
    return {"error": "Room not found"}