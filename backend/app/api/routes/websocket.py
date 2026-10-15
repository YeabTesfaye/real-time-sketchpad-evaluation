print("!!! WEBSOCKET.PY LOADED !!!", flush=True)

import asyncio
import json
from datetime import datetime
from typing import Dict, Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.error_handler import logger
from app.core.security import verify_token
from app.db.models import User
from app.services.drawing_service import (
    DrawingService,
)


router = APIRouter()


# ============================================================
# LIMITS
# ============================================================

MAX_MESSAGE_SIZE = 1024 * 1024
MAX_OPERATION_POINTS = 1000
MAX_COORDINATE = 100000

VALID_MESSAGE_TYPES = {
    "drawing_operation",
    "cursor_move",
    "clear_canvas",
    "undo_operation",
    "redo_operation",
}


# ============================================================
# HELPERS
# ============================================================

def is_number(value) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
    )


def make_user_color(
    user_id: str,
) -> str:

    hash_value = 0

    for character in user_id:
        hash_value = (
            ord(character)
            + ((hash_value << 5) - hash_value)
        )

        # Match JavaScript's 32-bit behavior.
        hash_value &= 0xFFFFFFFF

    if hash_value & 0x80000000:
        hash_value -= 0x100000000

    hue = hash_value % 360

    return f"hsl({hue}, 70%, 50%)"


# ============================================================
# CONNECTION MANAGER
# ============================================================

class ConnectionManager:

    def __init__(self):

        # room_id -> user_id -> websocket
        self.active_connections: Dict[
            str,
            Dict[str, WebSocket],
        ] = {}

        # room_id -> user_id -> user information
        self.room_users: Dict[
            str,
            Dict[str, dict],
        ] = {}

        # One lock per room.
        #
        # This makes changes in one server process happen
        # one at a time for a room.
        self.room_locks: Dict[
            str,
            asyncio.Lock,
        ] = {}
        # Lock for protecting access to the room_locks dict
        self._room_locks_lock: asyncio.Lock = asyncio.Lock()

    # ========================================================
    # ROOM LOCK
    # ========================================================

    async def get_room_lock(
        self,
        room_id: str,
    ) -> asyncio.Lock:
        async with self._room_locks_lock:
            lock = self.room_locks.get(room_id)
            if lock is None:
                lock = asyncio.Lock()
                self.room_locks[room_id] = lock
            return lock

    # ========================================================
    # CONNECT
    # ========================================================

    async def connect(
        self,
        websocket: WebSocket,
        room_id: str,
        user_id: str,
        user_info: dict,
    ):

        await websocket.accept()

        lock = await self.get_room_lock(
            room_id
        )

        async with lock:

            if room_id not in self.active_connections:

                self.active_connections[
                    room_id
                ] = {}

                self.room_users[
                    room_id
                ] = {}

            old_websocket = (
                self.active_connections[
                    room_id
                ].get(user_id)
            )

            if old_websocket is not None:

                try:
                    await old_websocket.close(
                        code=status.WS_1000_NORMAL_CLOSURE,
                        reason="Reconnected",
                    )
                except Exception:
                    pass

            self.active_connections[
                room_id
            ][user_id] = websocket

            self.room_users[
                room_id
            ][user_id] = user_info

            existing_users = [
                info
                for existing_user_id, info
                in self.room_users[
                    room_id
                ].items()
                if existing_user_id != user_id
            ]

            await self.send_personal_message(
                {
                    "type": "room_users",
                    "users": existing_users,
                },
                websocket,
            )

            await self.broadcast_to_room(
                room_id,
                {
                    "type": "user_joined",
                    "user": user_info,
                },
                exclude_user=user_id,
            )

            print(
                f"[WS] User {user_id} joined "
                f"room {room_id}",
                flush=True,
            )

    # ========================================================
    # DISCONNECT
    # ========================================================

    async def disconnect(
        self,
        room_id: str,
        user_id: str,
        websocket: Optional[WebSocket] = None,
    ):

        if room_id not in self.active_connections:
            return

        lock = await self.get_room_lock(
            room_id
        )

        async with lock:

            connections = (
                self.active_connections.get(
                    room_id,
                    {},
                )
            )

            current_socket = (
                connections.get(user_id)
            )

            # Do not remove a newer connection when
            # an older connection disconnects.
            if (
                websocket is not None
                and current_socket is not websocket
            ):
                return

            removed = (
                connections.pop(
                    user_id,
                    None,
                )
                is not None
            )

            if not removed:
                return

            self.room_users.get(
                room_id,
                {},
            ).pop(
                user_id,
                None,
            )

            print(
                f"[WS] User {user_id} left "
                f"room {room_id}",
                flush=True,
            )

            if not connections:

                self.active_connections.pop(
                    room_id,
                    None,
                )

                self.room_users.pop(
                    room_id,
                    None,
                )

                return

            await self.broadcast_to_room(
                room_id,
                {
                    "type": "user_left",
                    "userId": user_id,
                },
            )

    # ========================================================
    # PERSONAL MESSAGE
    # ========================================================

    async def send_personal_message(
        self,
        message: dict,
        websocket: WebSocket,
    ):

        await websocket.send_text(
            json.dumps(
                message,
                separators=(",", ":"),
            )
        )

    # ========================================================
    # BROADCAST
    # ========================================================

    async def broadcast_to_room(
        self,
        room_id: str,
        message: dict,
        exclude_user: Optional[str] = None,
    ):

        connections = (
            self.active_connections.get(
                room_id,
                {},
            )
        )

        if not connections:
            return

        message_text = json.dumps(
            message,
            separators=(",", ":"),
        )

        async def send_one(
            connected_user_id: str,
            websocket: WebSocket,
        ):

            if (
                connected_user_id
                == exclude_user
            ):
                return connected_user_id, None

            try:

                await websocket.send_text(
                    message_text
                )

                return (
                    connected_user_id,
                    None,
                )

            except Exception as error:

                return (
                    connected_user_id,
                    error,
                )

        results = await asyncio.gather(
            *[
                send_one(
                    connected_user_id,
                    websocket,
                )
                for (
                    connected_user_id,
                    websocket,
                )
                in list(
                    connections.items()
                )
            ],
            return_exceptions=True,
        )

        failed_users = [
            connected_user_id
            for (
                connected_user_id,
                error,
            )
            in results
            if error is not None
        ]

        for failed_user_id in failed_users:

            failed_socket = (
                connections.get(
                    failed_user_id
                )
            )

            await self.disconnect(
                room_id,
                failed_user_id,
                failed_socket,
            )


manager = ConnectionManager()


# ============================================================
# VALIDATION
# ============================================================

def validate_drawing_operation(
    operation: object,
) -> tuple[bool, str | None]:

    if not isinstance(
        operation,
        dict,
    ):
        return False, (
            "Operation must be an object"
        )

    required_fields = [
        "points",
        "color",
        "size",
        "tool",
    ]

    if not all(
        field in operation
        for field in required_fields
    ):
        return False, (
            "Invalid operation format"
        )

    points = operation[
        "points"
    ]

    if (
        not isinstance(points, list)
        or len(points) == 0
        or len(points) > MAX_OPERATION_POINTS
    ):
        return False, (
            "Invalid points data"
        )

    for point in points:

        if not isinstance(
            point,
            dict,
        ):
            return False, (
                "Invalid point data"
            )

        if (
            "x" not in point
            or "y" not in point
        ):
            return False, (
                "Invalid point data"
            )

        if not is_number(
            point["x"]
        ) or not is_number(
            point["y"]
        ):
            return False, (
                "Point coordinates "
                "must be numbers"
            )

        if (
            abs(point["x"])
            > MAX_COORDINATE
            or abs(point["y"])
            > MAX_COORDINATE
        ):
            return False, (
                "Point coordinates "
                "are too large"
            )

    color = operation.get(
        "color"
    )

    if (
        not isinstance(color, str)
        or not color
        or len(color) > 100
    ):
        return False, (
            "Invalid color"
        )

    size = operation.get(
        "size"
    )

    if (
        not is_number(size)
        or size <= 0
        or size > 100
    ):
        return False, (
            "Invalid brush size"
        )

    tool = operation.get(
        "tool"
    )

    if tool not in {
        "pen",
        "rectangle",
        "ellipse",
        "line",
    }:
        return False, (
            "Invalid drawing tool"
        )

    return True, None


# ============================================================
# WEBSOCKET
# ============================================================

@router.websocket("/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(...),
    db: AsyncSession = Depends(
        get_async_db
    ),
):

    print(
        f"[WS] Endpoint called for room "
        f"{room_id}",
        flush=True,
    )

    user_id: str | None = None

    try:

        # ====================================================
        # AUTHENTICATION
        # ====================================================

        token_data = verify_token(
            token
        )

        if token_data is None:

            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Invalid token",
            )

            return

        result = await db.execute(
            select(User).where(
                User.id
                == token_data.user_id
            )
        )

        user = (
            result.scalar_one_or_none()
        )

        if user is None:

            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="User not found",
            )

            return

        user_id = str(
            user.id
        )

        user_info = {
            "userId": user_id,
            "joinedAt": datetime.utcnow().isoformat(),
            "color": make_user_color(
                user_id
            ),
            "name": (
                f"{user.firstname or ''} "
                f"{user.lastname or ''}"
            ).strip()
            or f"User-{user_id[:4]}",
        }

        # Finish the authentication SELECT transaction.
        await db.rollback()

        # ====================================================
        # CONNECT
        # ====================================================

        await manager.connect(
            websocket=websocket,
            room_id=room_id,
            user_id=user_id,
            user_info=user_info,
        )

        drawing_service = DrawingService(
            db
        )

        # ====================================================
        # SEND CANVAS
        # ====================================================

        current_operations = (
            await drawing_service
            .get_current_canvas_state(
                room_code=room_id
            )
        )

        await manager.send_personal_message(
            {
                "type": "canvas_state",
                "operations": current_operations,
            },
            websocket,
        )

        # ====================================================
        # SEND HISTORY
        # ====================================================

        history = (
            await drawing_service
            .get_user_history_state(
                room_code=room_id,
                user_id=user_id,
            )
        )

        await manager.send_personal_message(
            {
                "type": "history_state",
                **history,
            },
            websocket,
        )

        # ====================================================
        # MAIN LOOP
        # ====================================================

        while True:

            data = (
                await websocket.receive_text()
            )

            # =================================================
            # SIZE
            # =================================================

            if (
                len(
                    data.encode("utf-8")
                )
                > MAX_MESSAGE_SIZE
            ):

                await manager.send_personal_message(
                    {
                        "type": "error",
                        "message": (
                            "Message too large"
                        ),
                    },
                    websocket,
                )

                continue

            # =================================================
            # JSON
            # =================================================

            try:

                message = json.loads(
                    data
                )

            except json.JSONDecodeError:

                await manager.send_personal_message(
                    {
                        "type": "error",
                        "message": (
                            "Invalid JSON"
                        ),
                    },
                    websocket,
                )

                continue

            if not isinstance(
                message,
                dict,
            ):

                await manager.send_personal_message(
                    {
                        "type": "error",
                        "message": (
                            "Message must be "
                            "a JSON object"
                        ),
                    },
                    websocket,
                )

                continue

            message_type = message.get(
                "type"
            )

            if (
                message_type
                not in VALID_MESSAGE_TYPES
            ):

                await manager.send_personal_message(
                    {
                        "type": "error",
                        "message": (
                            "Invalid message type"
                        ),
                    },
                    websocket,
                )

                continue

            # =================================================
            # DRAWING
            # =================================================

            if (
                message_type
                == "drawing_operation"
            ):

                operation = message.get(
                    "operation"
                )

                valid, error_message = (
                    validate_drawing_operation(
                        operation
                    )
                )

                if not valid:

                    await manager.send_personal_message(
                        {
                            "type": "error",
                            "message": error_message,
                        },
                        websocket,
                    )

                    continue

                # ---------------------------------------------
                # SERVER OWNS IDENTITY
                # ---------------------------------------------

                canonical_operation = dict(
                    operation
                )

                canonical_operation.pop(
                    "id",
                    None,
                )

                canonical_operation[
                    "userId"
                ] = user_id

                canonical_operation[
                    "timestamp"
                ] = datetime.utcnow().isoformat()

                # ---------------------------------------------
                # SAVE
                # ---------------------------------------------

                saved = (
                    await drawing_service
                    .save_drawing_operation(
                        room_code=room_id,
                        user_id=user_id,
                        operation_data=(
                            canonical_operation
                        ),
                    )
                )

                canonical_operation[
                    "id"
                ] = saved["id"]

                canonical_operation[
                    "timestamp"
                ] = saved["timestamp"]

                # ---------------------------------------------
                # SEND TO EVERYONE INCLUDING SENDER
                # ---------------------------------------------
                #
                # The sender does NOT add the operation
                # locally first.
                #
                # The server sends the canonical operation
                # back to everyone.
                #

                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": (
                            "drawing_operation"
                        ),
                        "operation": (
                            canonical_operation
                        ),
                    },
                )

                # ---------------------------------------------
                # UPDATE SENDER HISTORY
                # ---------------------------------------------

                history = (
                    await drawing_service
                    .get_user_history_state(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                await manager.send_personal_message(
                    {
                        "type": "history_state",
                        **history,
                    },
                    websocket,
                )

                continue

            # =================================================
            # CURSOR
            # =================================================

            if (
                message_type
                == "cursor_move"
            ):

                position = message.get(
                    "position"
                )

                if not isinstance(
                    position,
                    dict,
                ):

                    await manager.send_personal_message(
                        {
                            "type": "error",
                            "message": (
                                "Invalid cursor "
                                "position"
                            ),
                        },
                        websocket,
                    )

                    continue

                x = position.get(
                    "x"
                )

                y = position.get(
                    "y"
                )

                if (
                    not is_number(x)
                    or not is_number(y)
                ):

                    await manager.send_personal_message(
                        {
                            "type": "error",
                            "message": (
                                "Cursor coordinates "
                                "must be numbers"
                            ),
                        },
                        websocket,
                    )

                    continue

                if (
                    abs(x)
                    > MAX_COORDINATE
                    or abs(y)
                    > MAX_COORDINATE
                ):

                    continue

                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "cursor_move",
                        "userId": user_id,
                        "position": {
                            "x": x,
                            "y": y,
                        },
                        "timestamp": (
                            datetime.utcnow()
                            .isoformat()
                        ),
                    },
                    exclude_user=user_id,
                )

                continue

            # =================================================
            # CLEAR
            # =================================================

            if (
                message_type
                == "clear_canvas"
            ):

                clear_event = (
                    await drawing_service
                    .clear_canvas(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                await manager.broadcast_to_room(
                    room_id,
                    clear_event,
                )

                history = (
                    await drawing_service
                    .get_user_history_state(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                await manager.send_personal_message(
                    {
                        "type": "history_state",
                        **history,
                    },
                    websocket,
                )

                continue

            # =================================================
            # UNDO
            # =================================================

            if (
                message_type
                == "undo_operation"
            ):

                undo_event = (
                    await drawing_service.undo(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                if undo_event is None:

                    history = (
                        await drawing_service
                        .get_user_history_state(
                            room_code=room_id,
                            user_id=user_id,
                        )
                    )

                    await manager.send_personal_message(
                        {
                            "type": "history_state",
                            **history,
                        },
                        websocket,
                    )

                    continue

                await manager.broadcast_to_room(
                    room_id,
                    undo_event,
                )

                history = (
                    await drawing_service
                    .get_user_history_state(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                await manager.send_personal_message(
                    {
                        "type": "history_state",
                        **history,
                    },
                    websocket,
                )

                continue

            # =================================================
            # REDO
            # =================================================

            if (
                message_type
                == "redo_operation"
            ):

                redo_event = (
                    await drawing_service.redo(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                if redo_event is None:

                    history = (
                        await drawing_service
                        .get_user_history_state(
                            room_code=room_id,
                            user_id=user_id,
                        )
                    )

                    await manager.send_personal_message(
                        {
                            "type": "history_state",
                            **history,
                        },
                        websocket,
                    )

                    continue

                await manager.broadcast_to_room(
                    room_id,
                    redo_event,
                )

                history = (
                    await drawing_service
                    .get_user_history_state(
                        room_code=room_id,
                        user_id=user_id,
                    )
                )

                await manager.send_personal_message(
                    {
                        "type": "history_state",
                        **history,
                    },
                    websocket,
                )

                continue

    # ========================================================
    # NORMAL DISCONNECT
    # ========================================================

    except WebSocketDisconnect:

        print(
            f"[WS] User {user_id} disconnected "
            f"from room {room_id}",
            flush=True,
        )

        if user_id is not None:

            await manager.disconnect(
                room_id,
                user_id,
                websocket,
            )

    # ========================================================
    # DATABASE ERROR
    # ========================================================

    except SQLAlchemyError as e:

        logger.error(
            f"Database error in websocket: {e}"
        )

        print(
            f"[WS] Database error: {e}",
            flush=True,
        )

        try:
            await websocket.close(
                code=status.WS_1011_INTERNAL_ERROR,
                reason="Database error",
            )
        except Exception:
            pass

        if user_id is not None:

            await manager.disconnect(
                room_id,
                user_id,
                websocket,
            )

    # ========================================================
    # UNEXPECTED ERROR
    # ========================================================

    except Exception as e:

        logger.error(
            f"Unexpected error in websocket: {e}"
        )

        print(
            f"[WS] Unexpected error: {e}",
            flush=True,
        )

        try:
            await websocket.close(
                code=status.WS_1011_INTERNAL_ERROR,
                reason="Internal server error",
            )
        except Exception:
            pass

        if user_id is not None:

            await manager.disconnect(
                room_id,
                user_id,
                websocket,
            )

    finally:

        try:
            await db.close()
        except Exception:
            pass