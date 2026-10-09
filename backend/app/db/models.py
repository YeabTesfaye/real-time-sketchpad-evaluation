from sqlalchemy import Column, String, Boolean, DateTime, func, UUID, Text, Integer, ForeignKey
import uuid
from datetime import datetime
from ..core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    firstname = Column(String, nullable=True)
    lastname = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=False), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=False), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, firstname={self.firstname}, lastname={self.lastname})>"


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=False), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=False), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    drawing_operations = relationship("DrawingOperation", back_populates="room", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Room(id={self.id}, room_code='{self.room_code}', name='{self.name}')>"


class DrawingOperation(Base):
    __tablename__ = "drawing_operations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, nullable=False)  # Storing user ID as string for simplicity
    operation_type = Column(String, nullable=False)  # 'drawing_operation', 'clear_canvas', etc.
    operation_data = Column(Text, nullable=False)  # JSON string of the operation
    timestamp = Column(DateTime(timezone=False), default=datetime.utcnow, nullable=False)

    # Relationships
    room = relationship("Room", back_populates="drawing_operations")

    def __repr__(self):
        return f"<DrawingOperation(id={self.id}, room_id={self.room_id}, type='{self.operation_type}', timestamp='{self.timestamp}')>"