from fastapi import APIRouter, Depends, Header, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.core.security import create_access_token, verify_token
from app.core.exceptions import (
    ValidationException,
    AuthenticationException,
    InternalServerErrorException
)
from datetime import timedelta
from app.core.config import settings
from app.db.models import User

router = APIRouter()


@router.post("/signup", response_model=Token)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    # Check if user already exists
    if auth_service.get_user_by_email(user_in.email):
        raise ValidationException(
            detail="Email already registered",
            error_code="EMAIL_ALREADY_EXISTS"
        )
    user = auth_service.create_user(user_in)
    access_token = auth_service.create_access_token_for_user(user)
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        user = auth_service.authenticate_user(form_data.username, form_data.password)
        access_token = auth_service.create_access_token_for_user(user)
        return Token(access_token=access_token, token_type="bearer")
    except AuthenticationException:
        # Re-raise authentication exceptions as-is
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise InternalServerErrorException(
            detail="An error occurred during login"
        ) from e


@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if authorization is None:
        raise AuthenticationException(
            detail="Not authenticated",
            error_code="NOT_AUTHENTICATED"
        )
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise AuthenticationException(
                detail="Invalid authentication scheme",
                error_code="INVALID_AUTH_SCHEME"
            )
    except ValueError:
        raise AuthenticationException(
            detail="Invalid authorization header",
            error_code="INVALID_AUTH_HEADER"
        )
    token_data = verify_token(token)
    if token_data is None or token_data.user_id is None:
        raise AuthenticationException(
            detail="Invalid token",
            error_code="INVALID_TOKEN"
        )
    try:
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if not user:
            raise AuthenticationException(
                detail="User not found",
                error_code="USER_NOT_FOUND"
            )
        return user
    except SQLAlchemyError as e:
        raise InternalServerErrorException(
            detail="Database error occurred while fetching user"
        ) from e