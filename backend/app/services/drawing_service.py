from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..db.models import Room, DrawingOperation
from ..core.exceptions import InternalServerErrorException
import json
import uuid
from datetime import datetime


class DrawingService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_room(self, room_code: str) -> Room:
        """Get existing room or create new one if it doesn't exist."""
        try:
            room = self.db.query(Room).filter(Room.room_code == room_code).first()
            if not room:
                room = Room(room_code=room_code)
                self.db.add(room)
                self.db.commit()
                self.db.refresh(room)
            return room
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerErrorException(
                detail="Database error occurred while getting/creating room"
            ) from e

    def save_drawing_operation(self, room_code: str, user_id: str, operation_type: str, operation_data: dict) -> DrawingOperation:
        """Save a drawing operation to the database."""
        try:
            room = self.get_or_create_room(room_code)

            drawing_op = DrawingOperation(
                room_id=room.id,
                user_id=user_id,
                operation_type=operation_type,
                operation_data=json.dumps(operation_data)
            )

            self.db.add(drawing_op)
            self.db.commit()
            self.db.refresh(drawing_op)

            return drawing_op
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerErrorException(
                detail="Database error occurred while saving drawing operation"
            ) from e

    def get_room_operations(self, room_code: str, limit: int = 1000) -> list:
        """Get drawing operations for a room, ordered by timestamp."""
        try:
            room = self.db.query(Room).filter(Room.room_code == room_code).first()
            if not room:
                return []

            operations = self.db.query(DrawingOperation)\
                .filter(DrawingOperation.room_id == room.id)\
                .order_by(DrawingOperation.timestamp.asc())\
                .limit(limit)\
                .all()

            # Convert JSON strings back to dictionaries
            result = []
            for op in operations:
                op_dict = {
                    "id": str(op.id),
                    "room_id": str(op.room_id),
                    "user_id": op.user_id,
                    "operation_type": op.operation_type,
                    "operation_data": json.loads(op.operation_data),
                    "timestamp": op.timestamp.isoformat() if op.timestamp else None
                }
                result.append(op_dict)

            return result
        except SQLAlchemyError as e:
            raise InternalServerErrorException(
                detail="Database error occurred while retrieving drawing operations"
            ) from e

    def clear_room_operations(self, room_code: str) -> bool:
        """Clear all drawing operations for a room."""
        try:
            room = self.db.query(Room).filter(Room.room_code == room_code).first()
            if not room:
                return False

            self.db.query(DrawingOperation)\
                .filter(DrawingOperation.room_id == room.id)\
                .delete()

            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerErrorException(
                detail="Database error occurred while clearing drawing operations"
            ) from e