from sqlalchemy.orm import Session
from ..db.models import User
from ..schemas.user import UserCreate, UserResponse
from ..core.security import get_password_hash, verify_password
from ..core.security import create_access_token
from datetime import timedelta
from typing import Optional
from ..core.config import settings

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            firstname=user_in.firstname,
            lastname=user_in.lastname,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user

    def create_access_token_for_user(self, user: User, expires_delta: Optional[timedelta] = None):
        if not expires_delta:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=expires_delta
        )
        return access_token

    def get_user_response(self, user: User) -> UserResponse:
        return UserResponse.from_orm(user)