from fastapi import APIRouter, Depends, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.core.security import verify_token
from app.core.exceptions import (
    ValidationException,
    AuthenticationException,
    InternalServerErrorException,
)
from app.db.models import User


router = APIRouter()


@router.post("/signup", response_model=Token)
def signup(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)

    try:
        # Check whether the email is already registered
        existing_user = auth_service.get_user_by_email(user_in.email)

        if existing_user:
            raise ValidationException(
                detail="Email already registered",
                error_code="EMAIL_ALREADY_EXISTS",
            )

        # Create the user
        user = auth_service.create_user(user_in)

        # Create access token
        access_token = auth_service.create_access_token_for_user(user)

        return Token(
            access_token=access_token,
            token_type="bearer",
        )

    except ValidationException:
        raise

    except SQLAlchemyError as e:
        raise InternalServerErrorException(
            detail="Database error occurred during signup",
        ) from e

    except Exception as e:
        raise InternalServerErrorException(
            detail="An error occurred during signup",
        ) from e


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)

    try:
        user = auth_service.authenticate_user(
            form_data.username,
            form_data.password,
        )

        access_token = auth_service.create_access_token_for_user(user)

        return Token(
            access_token=access_token,
            token_type="bearer",
        )

    except AuthenticationException:
        raise

    except SQLAlchemyError as e:
        raise InternalServerErrorException(
            detail="Database error occurred during login",
        ) from e

    except Exception as e:
        raise InternalServerErrorException(
            detail="An error occurred during login",
        ) from e


@router.get("/me", response_model=UserResponse)
def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    # Authorization header is required
    if not authorization:
        raise AuthenticationException(
            detail="Not authenticated",
            error_code="NOT_AUTHENTICATED",
        )

    # Validate Authorization header
    parts = authorization.split()

    if len(parts) != 2:
        raise AuthenticationException(
            detail="Invalid authorization header",
            error_code="INVALID_AUTH_HEADER",
        )

    scheme, token = parts

    if scheme.lower() != "bearer":
        raise AuthenticationException(
            detail="Invalid authentication scheme",
            error_code="INVALID_AUTH_SCHEME",
        )

    if not token:
        raise AuthenticationException(
            detail="Invalid token",
            error_code="INVALID_TOKEN",
        )

    # Validate JWT
    try:
        token_data = verify_token(token)
    except Exception as e:
        raise AuthenticationException(
            detail="Invalid token",
            error_code="INVALID_TOKEN",
        ) from e

    if token_data is None or token_data.user_id is None:
        raise AuthenticationException(
            detail="Invalid token",
            error_code="INVALID_TOKEN",
        )

    # Fetch user
    try:
        user = (
            db.query(User)
            .filter(User.id == token_data.user_id)
            .first()
        )

        if user is None:
            raise AuthenticationException(
                detail="User not found",
                error_code="USER_NOT_FOUND",
            )

        return user

    except AuthenticationException:
        raise

    except SQLAlchemyError as e:
        raise InternalServerErrorException(
            detail="Database error occurred while fetching user",
        ) from e