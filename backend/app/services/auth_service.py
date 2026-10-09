from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from ..db.models import User
from ..schemas.user import UserCreate, UserResponse
from ..core.security import get_password_hash, verify_password
from ..core.security import create_access_token
from ..core.exceptions import (
    AuthenticationException,
    ValidationException,
    InternalServerErrorException
)
from datetime import timedelta
from typing import Optional
from ..core.config import settings

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str):
        try:
            return self.db.query(User).filter(User.email == email).first()
        except SQLAlchemyError as e:
            # Log the error (in a real app, you'd use proper logging)
            # For now, we'll raise an internal server error
            raise InternalServerErrorException(
                detail="Database error occurred while fetching user"
            ) from e

    def create_user(self, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            firstname=user_in.firstname,
            lastname=user_in.lastname,
        )

        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError as e:
            self.db.rollback()
            # Check if it's a duplicate email error
            if "users.email" in str(e) and "UNIQUE" in str(e):
                raise ValidationException(
                    detail="A user with this email already exists",
                    error_code="EMAIL_ALREADY_EXISTS"
                ) from e
            else:
                raise ValidationException(
                    detail="Data integrity error",
                    error_code="INTEGRITY_ERROR"
                ) from e
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerErrorException(
                detail="Database error occurred while creating user"
            ) from e

    def authenticate_user(self, email: str, password: str):
        try:
            user = self.get_user_by_email(email)
            if not user:
                raise AuthenticationException(
                    detail="Invalid email or password",
                    error_code="INVALID_CREDENTIALS"
                )
            if not verify_password(password, user.hashed_password):
                raise AuthenticationException(
                    detail="Invalid email or password",
                    error_code="INVALID_CREDENTIALS"
                )
            return user
        except SQLAlchemyError as e:
            # This should be caught by get_user_by_email, but just in case
            raise InternalServerErrorException(
                detail="Database error occurred during authentication"
            ) from e

    def create_access_token_for_user(self, user: User, expires_delta: Optional[timedelta] = None):
        if not expires_delta:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=expires_delta
        )
        return access_token

    def get_user_response(self, user: User) -> UserResponse:
        return UserResponse.from_orm(user)