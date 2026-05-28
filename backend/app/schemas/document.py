"""
Synapse Backend — Document Schemas
=====================================
Request and response models for the /api/v1/documents endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class DocumentUploadResponse(BaseModel):
    """Response after initiating a file upload."""
    id: str
    file_name: str
    file_type: str
    status: str                     # "uploading" → "processing" → "ready" | "failed"
    created_at: datetime


class TextPasteRequest(BaseModel):
    """Request body for adding a direct text paste as a knowledge source."""
    agent_id: str = Field(..., description="Agent to attach this text to")
    title: str = Field(..., min_length=1, max_length=255, description="Title for this text source")
    content: str = Field(..., min_length=10, max_length=100_000, description="The text content to process")


class UrlSourceRequest(BaseModel):
    """Request body for adding a URL as a knowledge source."""
    agent_id: str = Field(..., description="Agent to attach this URL content to")
    url: str = Field(..., description="URL to fetch and process")


class DocumentResponse(BaseModel):
    """Full document details."""
    id: str
    agent_id: str
    file_name: str
    file_type: str
    file_size_bytes: Optional[int] = None
    status: str
    chunk_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    """Response model for the document list endpoint."""
    documents: list[DocumentResponse]
    total: int
