"""
Centralized error handling for the application.
"""
import logging
import traceback
from typing import Any, Dict

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import BaseCustomException

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def custom_exception_handler(request: Request, exc: BaseCustomException) -> JSONResponse:
    """
    Handle custom application exceptions.
    Logs technical details but returns sanitized user-friendly responses.
    """
    # Log the technical details for debugging (but don't expose to client)
    logger.error(
        f"Custom exception: {exc.error_code} - {exc.detail} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    # Return sanitized response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                # Don't include internal details in production
                # In development, you might want to include more details
                # "details": getattr(exc, 'details', None)
            }
        },
        headers=getattr(exc, 'headers', None)
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle FastAPI/Starlette HTTP exceptions.
    """
    logger.warning(
        f"HTTP exception: {exc.status_code} - {exc.detail} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    # Determine error code based on status code
    error_code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "UNPROCESSABLE_ENTITY",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_SERVER_ERROR",
        503: "SERVICE_UNAVAILABLE"
    }

    error_code = error_code_map.get(exc.status_code, "HTTP_ERROR")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": error_code,
                "message": exc.detail
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle request validation errors.
    """
    logger.warning(
        f"Validation error: {str(exc)} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    # Extract validation details
    errors = []
    for error in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field_loc,
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request data",
                "details": errors  # Include validation details for client-side fixing
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unexpected exceptions.
    Logs full traceback but returns generic error message to client.
    """
    # Log the full traceback for debugging (critical for production debugging)
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Client: {request.client.host if request.client else 'unknown'}\n"
        f"Traceback: {traceback.format_exc()}"
    )

    # Return generic error message to avoid leaking internal details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred. Please try again later."
            }
        }
    )


def add_exception_handlers(app) -> None:
    """
    Add all exception handlers to the FastAPI application.
    """
    # Custom application exceptions
    app.add_exception_handler(BaseCustomException, custom_exception_handler)

    # FastAPI/Starlette HTTP exceptions
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)

    # Request validation errors
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Catch-all for unexpected exceptions
    app.add_exception_handler(Exception, general_exception_handler)