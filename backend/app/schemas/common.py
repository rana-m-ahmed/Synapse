"""
Synapse Backend — Common Schemas
===================================
Shared Pydantic models used across multiple endpoints:
pagination, generic success response, and error response.
"""

from pydantic import BaseModel, Field
from typing import Generic, TypeVar

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for paginated list endpoints."""
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        """Calculate the SQL OFFSET from page and limit."""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""
    items: list[T]
    total: int
    page: int
    limit: int
    has_more: bool

    @classmethod
    def create(cls, items: list[T], total: int, page: int, limit: int):
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            has_more=(page * limit) < total,
        )


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool = True
    message: str = "Operation completed successfully"


class ErrorResponse(BaseModel):
    """Generic error response (used in OpenAPI docs)."""
    error: str
    type: str
