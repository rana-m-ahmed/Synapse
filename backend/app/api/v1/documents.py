"""
Synapse Backend — Documents API Routes
=========================================
Endpoints for uploading, listing, and deleting knowledge base documents.
All endpoints require authentication via JWT.

Endpoints:
    POST   /api/v1/documents/upload         — Upload a file (multipart)
    POST   /api/v1/documents/text           — Paste text content directly
    POST   /api/v1/documents/url            — Add a URL source
    GET    /api/v1/documents/               — List documents for an agent
    GET    /api/v1/documents/{document_id}  — Get document status
    DELETE /api/v1/documents/{document_id}  — Delete a document
"""

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from app.core.dependencies import get_current_user, get_embedding_service_dep, get_supabase_dep
from app.schemas.common import SuccessResponse
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    TextPasteRequest,
    UrlSourceRequest,
)
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService

router = APIRouter()


def _get_service(
    supabase=Depends(get_supabase_dep),
    embedding_service: EmbeddingService = Depends(get_embedding_service_dep),
) -> DocumentService:
    """Dependency: create DocumentService with injected Supabase client and embedding model."""
    return DocumentService(supabase, embedding_service)


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """
    Upload a file to an agent's knowledge base.
    Supported formats: PDF, DOCX, TXT, CSV, XLSX.

    Processing starts in the background — poll GET /documents/{id} for status.
    """
    content = await file.read()

    return await service.upload_document(
        user_id=user["user_id"],
        agent_id=agent_id,
        file_content=content,
        file_name=file.filename or "unnamed",
    )


@router.post("/text", response_model=DocumentResponse, status_code=201)
async def add_text_paste(
    data: TextPasteRequest,
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Add a direct text paste as a knowledge source."""
    return await service.add_text_paste(
        user_id=user["user_id"],
        agent_id=data.agent_id,
        title=data.title,
        content=data.content,
    )


@router.post("/url", response_model=DocumentResponse, status_code=201)
async def add_url_source(
    data: UrlSourceRequest,
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Add a URL as a knowledge source. The page will be fetched and processed."""
    return await service.add_url_source(
        user_id=user["user_id"],
        agent_id=data.agent_id,
        url=data.url,
    )


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    agent_id: str = Query(..., description="Agent ID to list documents for"),
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """List all documents for a specific agent."""
    docs = service.list_documents(user["user_id"], agent_id)
    return DocumentListResponse(documents=docs, total=len(docs))


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Get document details and processing status."""
    return service.get_document(user["user_id"], document_id)


@router.delete("/{document_id}", response_model=SuccessResponse)
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Delete a document and all its chunks from the knowledge base."""
    service.delete_document(user["user_id"], document_id)
    return SuccessResponse(message=f"Document '{document_id}' deleted successfully")
