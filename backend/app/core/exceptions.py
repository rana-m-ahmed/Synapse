"""
Synapse Backend — Custom Exceptions & Handlers
================================================
Defines application-specific exceptions and registers global exception
handlers on the FastAPI app. This ensures consistent JSON error responses
across all endpoints.

Exception hierarchy:
    SynapseException (base)
    ├── NotFoundError        → 404
    ├── ForbiddenError       → 403
    ├── DocumentProcessingError → 422
    └── RagError             → 500
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


# ── Custom Exception Classes ──────────────────────────────────────────────

class SynapseException(Exception):
    """Base exception for all Synapse application errors."""

    def __init__(self, message: str = "An unexpected error occurred"):
        self.message = message
        super().__init__(self.message)


class NotFoundError(SynapseException):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource", resource_id: str = ""):
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with ID '{resource_id}' not found"
        super().__init__(detail)


class ForbiddenError(SynapseException):
    """Raised when a user tries to access a resource they don't own."""

    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(message)


class DocumentProcessingError(SynapseException):
    """Raised when document parsing or chunking fails."""

    def __init__(self, message: str = "Failed to process document"):
        super().__init__(message)


class RagError(SynapseException):
    """Raised when the RAG pipeline encounters an error."""

    def __init__(self, message: str = "An error occurred while generating a response"):
        super().__init__(message)


# ── Exception Handlers ────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """
    Register global exception handlers on the FastAPI app.
    Call this in main.py after creating the app instance.
    """

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": exc.message, "type": "not_found"},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(request: Request, exc: ForbiddenError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"error": exc.message, "type": "forbidden"},
        )

    @app.exception_handler(DocumentProcessingError)
    async def document_processing_handler(
        request: Request, exc: DocumentProcessingError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": exc.message, "type": "document_processing_error"},
        )

    @app.exception_handler(RagError)
    async def rag_error_handler(request: Request, exc: RagError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": exc.message, "type": "rag_error"},
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
        """
        Catch-all handler for unhandled exceptions.
        In development, include the error message; in production, hide it.
        """
        from app.core.config import get_settings
        settings = get_settings()

        detail = str(exc) if settings.is_development else "Internal server error"

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": detail, "type": "internal_error"},
        )
