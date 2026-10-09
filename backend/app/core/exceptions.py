"""
Custom exception classes for the application.
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class BaseCustomException(HTTPException):
    """
    Base custom exception class for the application.
    """
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code or self.__class__.__name__


class ValidationException(BaseCustomException):
    """
    Exception raised for validation errors.
    """
    def __init__(
        self,
        detail: str = "Validation error",
        error_code: str = "VALIDATION_ERROR"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code
        )


class AuthenticationException(BaseCustomException):
    """
    Exception raised for authentication errors.
    """
    def __init__(
        self,
        detail: str = "Authentication failed",
        error_code: str = "AUTHENTICATION_ERROR"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
            error_code=error_code
        )


class AuthorizationException(BaseCustomException):
    """
    Exception raised for authorization errors.
    """
    def __init__(
        self,
        detail: str = "Insufficient permissions",
        error_code: str = "AUTHORIZATION_ERROR"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code
        )


class NotFoundException(BaseCustomException):
    """
    Exception raised when a resource is not found.
    """
    def __init__(
        self,
        detail: str = "Resource not found",
        error_code: str = "NOT_FOUND"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code=error_code
        )


class ConflictException(BaseCustomException):
    """
    Exception raised when there's a conflict (e.g., duplicate resource).
    """
    def __init__(
        self,
        detail: str = "Resource conflict",
        error_code: str = "CONFLICT"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code
        )


class RateLimitException(BaseCustomException):
    """
    Exception raised when rate limit is exceeded.
    """
    def __init__(
        self,
        detail: str = "Rate limit exceeded",
        error_code: str = "RATE_LIMIT_EXCEEDED"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code=error_code
        )


class InternalServerErrorException(BaseCustomException):
    """
    Exception raised for internal server errors.
    """
    def __init__(
        self,
        detail: str = "Internal server error",
        error_code: str = "INTERNAL_SERVER_ERROR"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code=error_code
        )


class ServiceUnavailableException(BaseCustomException):
    """
    Exception raised when a service is unavailable.
    """
    def __init__(
        self,
        detail: str = "Service unavailable",
        error_code: str = "SERVICE_UNAVAILABLE"
    ) -> None:
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
            error_code=error_code
        )