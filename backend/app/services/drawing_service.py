from datetime import datetime
import json
import uuid

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import (
    DrawingOperation,
    Room,
)
from ..core.error_handler import logger
from ..core.exceptions import (
    InternalServerErrorException,
)


DRAW_OPERATION = "drawing_operation"
CLEAR_OPERATION = "clear_canvas"
UNDO_OPERATION = "undo_operation"
REDO_OPERATION = "redo_operation"


class DrawingService:

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    # =========================================================
    # ROOM
    # =========================================================

    async def get_or_create_room(
        self,
        room_code: str,
    ) -> Room:

        try:
            async with self.db.begin():

                result = await self.db.execute(
                    select(Room).where(
                        Room.room_code == room_code
                    )
                )

                room = result.scalar_one_or_none()

                if room:
                    return room

                room = Room(
                    room_code=room_code
                )

                self.db.add(room)

                await self.db.flush()

                return room

        except SQLAlchemyError as e:

            await self.db.rollback()

            # A different request may have created
            # the same room at exactly the same time.
            try:
                async with self.db.begin():

                    result = await self.db.execute(
                        select(Room).where(
                            Room.room_code == room_code
                        )
                    )

                    room = result.scalar_one_or_none()

                    if room:
                        return room

            except SQLAlchemyError:
                pass

            logger.error(
                "Database error while getting/creating "
                f"room {room_code}: {e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while getting/creating room"
                )
            ) from e

    # =========================================================
    # ROOM LOCK
    # =========================================================

    async def _get_locked_room(
        self,
        room_code: str,
    ) -> Room:

        result = await self.db.execute(
            select(Room)
            .where(
                Room.room_code == room_code
            )
            .with_for_update()
        )

        room = result.scalar_one_or_none()

        if room is None:
            room = Room(
                room_code=room_code
            )

            self.db.add(room)

            await self.db.flush()

        return room

    # =========================================================
    # READ EVENTS
    # =========================================================

    async def _get_events(
        self,
        room_id,
        limit: int = 10000,
    ) -> list[DrawingOperation]:

        result = await self.db.execute(
            select(DrawingOperation)
            .where(
                DrawingOperation.room_id
                == room_id
            )
            .order_by(
                DrawingOperation.timestamp.asc(),
                DrawingOperation.id.asc(),
            )
            .limit(limit)
        )

        return list(
            result.scalars().all()
        )

    # =========================================================
    # CONVERT DB EVENT
    # =========================================================

    @staticmethod
    def _event_to_operation(
        event: DrawingOperation,
    ) -> dict | None:

        try:
            data = json.loads(
                event.operation_data
            )

        except (
            json.JSONDecodeError,
            TypeError,
        ):
            return None

        if not isinstance(data, dict):
            return None

        if (
            event.operation_type
            != DRAW_OPERATION
        ):
            return None

        operation = dict(data)

        operation["id"] = str(
            event.id
        )

        operation["userId"] = str(
            event.user_id
        )

        operation["timestamp"] = (
            event.timestamp.isoformat()
            if event.timestamp
            else operation.get(
                "timestamp"
            )
        )

        return operation

    # =========================================================
    # REBUILD CURRENT STATE
    # =========================================================

    @classmethod
    def _rebuild_state(
        cls,
        events: list[DrawingOperation],
    ) -> tuple[
        list[dict],
        dict[str, list[str]],
    ]:
        """
        Rebuild the current canvas and each user's
        undo/redo history from the event list.

        Nothing is deleted.

        draw  -> add drawing
        undo  -> remove drawing
        redo  -> restore drawing
        clear -> empty canvas and histories
        """

        operations: dict[
            str,
            dict,
        ] = {}

        operation_order: list[str] = []

        active_ids: set[str] = set()

        redo_stacks: dict[
            str,
            list[str],
        ] = {}

        for event in events:

            event_type = (
                event.operation_type
            )

            # -------------------------------------------------
            # CLEAR
            # -------------------------------------------------

            if event_type == CLEAR_OPERATION:

                operations.clear()
                operation_order.clear()
                active_ids.clear()
                redo_stacks.clear()

                continue

            # -------------------------------------------------
            # DRAW
            # -------------------------------------------------

            if event_type == DRAW_OPERATION:

                operation = (
                    cls._event_to_operation(
                        event
                    )
                )

                if operation is None:
                    continue

                operation_id = str(
                    event.id
                )

                user_id = str(
                    event.user_id
                )

                operations[
                    operation_id
                ] = operation

                operation_order.append(
                    operation_id
                )

                active_ids.add(
                    operation_id
                )

                # A new drawing removes that user's
                # ability to redo older undone drawings.
                redo_stacks[
                    user_id
                ] = []

                continue

            # -------------------------------------------------
            # UNDO
            # -------------------------------------------------

            if event_type == UNDO_OPERATION:

                target_id = (
                    str(event.target_operation_id)
                    if event.target_operation_id
                    else None
                )

                if not target_id:
                    continue

                if target_id not in active_ids:
                    continue

                target_operation = operations.get(
                    target_id
                )

                if target_operation is None:
                    continue

                active_ids.remove(
                    target_id
                )

                user_id = str(
                    target_operation[
                        "userId"
                    ]
                )

                redo_stacks.setdefault(
                    user_id,
                    [],
                ).append(
                    target_id
                )

                continue

            # -------------------------------------------------
            # REDO
            # -------------------------------------------------

            if event_type == REDO_OPERATION:

                target_id = (
                    str(event.target_operation_id)
                    if event.target_operation_id
                    else None
                )

                if not target_id:
                    continue

                if target_id not in operations:
                    continue

                if target_id in active_ids:
                    continue

                target_operation = operations[
                    target_id
                ]

                user_id = str(
                    target_operation[
                        "userId"
                    ]
                )

                stack = redo_stacks.setdefault(
                    user_id,
                    [],
                )

                if target_id in stack:
                    stack.remove(
                        target_id
                    )

                active_ids.add(
                    target_id
                )

                continue

        current_operations = [
            operations[
                operation_id
            ]
            for operation_id
            in operation_order
            if operation_id in active_ids
        ]

        return (
            current_operations,
            redo_stacks,
        )

    # =========================================================
    # CURRENT CANVAS
    # =========================================================

    async def get_current_canvas_state(
        self,
        room_code: str,
        limit: int = 10000,
    ) -> list[dict]:

        try:

            async with self.db.begin():

                result = await self.db.execute(
                    select(Room).where(
                        Room.room_code
                        == room_code
                    )
                )

                room = (
                    result.scalar_one_or_none()
                )

                if room is None:
                    return []

                events = (
                    await self._get_events(
                        room.id,
                        limit,
                    )
                )

                current_operations, _ = (
                    self._rebuild_state(
                        events
                    )
                )

                return current_operations

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error while retrieving "
                f"canvas for {room_code}: {e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while retrieving canvas"
                )
            ) from e

    # =========================================================
    # USER HISTORY
    # =========================================================

    async def get_user_history_state(
        self,
        room_code: str,
        user_id: str,
        limit: int = 10000,
    ) -> dict:

        try:

            async with self.db.begin():

                result = await self.db.execute(
                    select(Room).where(
                        Room.room_code
                        == room_code
                    )
                )

                room = (
                    result.scalar_one_or_none()
                )

                if room is None:
                    return {
                        "canUndo": False,
                        "canRedo": False,
                    }

                events = (
                    await self._get_events(
                        room.id,
                        limit,
                    )
                )

                current_operations, redo_stacks = (
                    self._rebuild_state(
                        events
                    )
                )

                can_undo = any(
                    operation.get(
                        "userId"
                    )
                    == str(user_id)
                    for operation
                    in reversed(
                        current_operations
                    )
                )

                can_redo = bool(
                    redo_stacks.get(
                        str(user_id),
                        [],
                    )
                )

                return {
                    "canUndo": can_undo,
                    "canRedo": can_redo,
                }

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error while retrieving "
                f"history for {user_id}: {e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while retrieving history"
                )
            ) from e

    # =========================================================
    # SAVE DRAWING
    # =========================================================

    async def save_drawing_operation(
        self,
        room_code: str,
        user_id: str,
        operation_data: dict,
    ) -> dict:

        try:

            async with self.db.begin():

                room = (
                    await self._get_locked_room(
                        room_code
                    )
                )

                server_timestamp = (
                    datetime.utcnow()
                )

                canonical_data = dict(
                    operation_data
                )

                canonical_data["userId"] = str(
                    user_id
                )

                canonical_data["timestamp"] = (
                    server_timestamp.isoformat()
                )

                drawing_op = DrawingOperation(
                    room_id=room.id,
                    user_id=str(user_id),
                    operation_type=DRAW_OPERATION,
                    operation_data=json.dumps(
                        canonical_data
                    ),
                    timestamp=server_timestamp,
                )

                self.db.add(
                    drawing_op
                )

                await self.db.flush()

                return {
                    "id": str(
                        drawing_op.id
                    ),
                    "room_id": str(
                        drawing_op.room_id
                    ),
                    "user_id": str(
                        drawing_op.user_id
                    ),
                    "operation_type": (
                        drawing_op.operation_type
                    ),
                    "operation_data": (
                        canonical_data
                    ),
                    "timestamp": (
                        drawing_op.timestamp.isoformat()
                    ),
                }

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error in "
                f"save_drawing_operation: {e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while saving drawing operation"
                )
            ) from e

    # =========================================================
    # UNDO
    # =========================================================

    async def undo(
        self,
        room_code: str,
        user_id: str,
    ) -> dict | None:

        try:

            async with self.db.begin():

                room = (
                    await self._get_locked_room(
                        room_code
                    )
                )

                events = (
                    await self._get_events(
                        room.id
                    )
                )

                (
                    current_operations,
                    _,
                ) = self._rebuild_state(
                    events
                )

                # Find the user's latest currently
                # visible drawing.
                target = None

                for operation in reversed(
                    current_operations
                ):
                    if (
                        operation.get(
                            "userId"
                        )
                        == str(user_id)
                    ):
                        target = operation
                        break

                if target is None:
                    return None

                target_id = uuid.UUID(
                    str(target["id"])
                )

                timestamp = (
                    datetime.utcnow()
                )

                event = DrawingOperation(
                    room_id=room.id,
                    user_id=str(user_id),
                    operation_type=UNDO_OPERATION,
                    operation_data=json.dumps(
                        {
                            "targetOperationId": str(
                                target_id
                            )
                        }
                    ),
                    target_operation_id=target_id,
                    timestamp=timestamp,
                )

                self.db.add(event)

                await self.db.flush()

                return {
                    "type": UNDO_OPERATION,
                    "targetOperationId": str(
                        target_id
                    ),
                    "timestamp": (
                        timestamp.isoformat()
                    ),
                }

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error in undo: "
                f"{e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while undoing operation"
                )
            ) from e

    # =========================================================
    # REDO
    # =========================================================

    async def redo(
        self,
        room_code: str,
        user_id: str,
    ) -> dict | None:

        try:

            async with self.db.begin():

                room = (
                    await self._get_locked_room(
                        room_code
                    )
                )

                events = (
                    await self._get_events(
                        room.id
                    )
                )

                (
                    current_operations,
                    redo_stacks,
                ) = self._rebuild_state(
                    events
                )

                stack = redo_stacks.get(
                    str(user_id),
                    [],
                )

                if not stack:
                    return None

                target_id = stack[-1]

                # Make sure the operation still exists
                # in the current room history.
                target_operation = None

                for operation in current_operations:
                    if str(
                        operation["id"]
                    ) == target_id:
                        target_operation = operation
                        break

                # It should not be visible right now,
                # otherwise it cannot be redone.
                if target_operation is not None:
                    return None

                # Find the original operation from the events.
                for event in reversed(events):
                    if (
                        event.operation_type
                        == DRAW_OPERATION
                        and str(event.id)
                        == target_id
                    ):
                        target_operation = (
                            self._event_to_operation(
                                event
                            )
                        )
                        break

                if target_operation is None:
                    return None

                target_uuid = uuid.UUID(
                    target_id
                )

                timestamp = (
                    datetime.utcnow()
                )

                event = DrawingOperation(
                    room_id=room.id,
                    user_id=str(user_id),
                    operation_type=REDO_OPERATION,
                    operation_data=json.dumps(
                        {
                            "targetOperationId": target_id,
                            "operation": target_operation,
                        }
                    ),
                    target_operation_id=target_uuid,
                    timestamp=timestamp,
                )

                self.db.add(event)

                await self.db.flush()

                return {
                    "type": REDO_OPERATION,
                    "targetOperationId": target_id,
                    "operation": target_operation,
                    "timestamp": (
                        timestamp.isoformat()
                    ),
                }

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error in redo: "
                f"{e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while redoing operation"
                )
            ) from e

    # =========================================================
    # CLEAR
    # =========================================================

    async def clear_canvas(
        self,
        room_code: str,
        user_id: str,
    ) -> dict:

        try:

            async with self.db.begin():

                room = (
                    await self._get_locked_room(
                        room_code
                    )
                )

                timestamp = (
                    datetime.utcnow()
                )

                event = DrawingOperation(
                    room_id=room.id,
                    user_id=str(user_id),
                    operation_type=CLEAR_OPERATION,
                    operation_data=json.dumps(
                        {}
                    ),
                    timestamp=timestamp,
                )

                self.db.add(event)

                await self.db.flush()

                return {
                    "type": CLEAR_OPERATION,
                    "userId": str(user_id),
                    "timestamp": (
                        timestamp.isoformat()
                    ),
                }

        except SQLAlchemyError as e:

            await self.db.rollback()

            logger.error(
                "Database error in clear_canvas: "
                f"{e}"
            )

            raise InternalServerErrorException(
                detail=(
                    "Database error occurred "
                    "while clearing canvas"
                )
            ) from e