"""
Synapse Backend — Document Service
======================================
Orchestrates document upload, processing, and deletion.
Manages the lifecycle: upload to storage → create record → process in background → update status.
"""

import asyncio
import logging
import uuid
from typing import Optional

from supabase import Client

from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.repositories.document_repo import DocumentRepository
from app.db.repositories.vector_repo import VectorRepository
from app.document_processing.processor import DocumentProcessor, ProcessedChunk
from app.schemas.document import DocumentResponse
from app.services.agent_service import AgentService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("synapse.service.document")

# Supported file extensions mapped to document types
FILE_TYPE_MAP = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".txt": "txt",
    ".csv": "csv",
    ".xlsx": "xlsx",
}

# Supabase Storage bucket name
STORAGE_BUCKET = "documents"


class DocumentService:
    """
    Service layer for document management.
    Handles file upload to Supabase Storage, background processing,
    and knowledge base management.
    """

    def __init__(
        self,
        supabase: Client,
        embedding_service: EmbeddingService,
    ):
        self._client = supabase
        self._doc_repo = DocumentRepository(supabase)
        self._vector_repo = VectorRepository(supabase)
        self._agent_service = AgentService(supabase)
        self._processor = DocumentProcessor(embedding_service)

    def _to_response(self, doc: dict) -> DocumentResponse:
        """Convert a raw document row to a DocumentResponse."""
        return DocumentResponse(
            id=doc["id"],
            agent_id=doc["agent_id"],
            file_name=doc["file_name"],
            file_type=doc["file_type"],
            file_size_bytes=doc.get("file_size_bytes"),
            status=doc["status"],
            chunk_count=doc["chunk_count"],
            error_message=doc.get("error_message"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )

    # ── File Upload ───────────────────────────────────────────────────────

    async def upload_document(
        self,
        user_id: str,
        agent_id: str,
        file_content: bytes,
        file_name: str,
    ) -> DocumentResponse:
        """
        Upload a file and start background processing.

        Flow:
        1. Verify agent ownership
        2. Determine file type from extension
        3. Upload to Supabase Storage
        4. Create document record (status: 'processing')
        5. Start background processing task
        6. Return immediately (client polls for status)

        Args:
            user_id: Authenticated user's ID.
            agent_id: Agent to attach the document to.
            file_content: Raw file bytes.
            file_name: Original filename.

        Returns:
            DocumentResponse with initial status.
        """
        # Step 1: Verify agent ownership
        self._agent_service.get_agent(user_id, agent_id)

        # Step 2: Determine file type
        extension = "." + file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""
        file_type = FILE_TYPE_MAP.get(extension)

        if not file_type:
            from app.core.exceptions import DocumentProcessingError
            raise DocumentProcessingError(
                f"Unsupported file type: '{extension}'. "
                f"Supported: {', '.join(FILE_TYPE_MAP.keys())}"
            )

        # Step 3: Upload to Supabase Storage (optional — processing uses in-memory bytes)
        unique_name = f"{uuid.uuid4().hex}_{file_name}"
        storage_path = f"{agent_id}/{unique_name}"

        try:
            self._client.storage.from_(STORAGE_BUCKET).upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": "application/octet-stream"},
            )
            logger.info(f"Uploaded '{file_name}' to storage: {storage_path}")
        except Exception as e:
            # Storage is optional — the processing pipeline works from in-memory bytes.
            # If the bucket doesn't exist or upload fails, we continue with storage_path=None.
            logger.warning(f"Storage upload skipped for '{file_name}' (non-fatal): {e}")
            storage_path = None

        # Step 4: Create document record
        doc = self._doc_repo.create({
            "agent_id": agent_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_type": file_type,
            "file_size_bytes": len(file_content),
            "storage_path": storage_path,
            "status": "processing",
        })

        # Step 5: Start background processing
        asyncio.create_task(
            self._process_document_task(doc["id"], file_content, file_type, file_name, agent_id)
        )

        return self._to_response(doc)

    # ── Text Paste ────────────────────────────────────────────────────────

    async def add_text_paste(
        self,
        user_id: str,
        agent_id: str,
        title: str,
        content: str,
    ) -> DocumentResponse:
        """
        Add a direct text paste as a knowledge source.
        No file storage needed — the text is processed directly.
        """
        # Verify agent ownership
        self._agent_service.get_agent(user_id, agent_id)

        # Create document record
        doc = self._doc_repo.create({
            "agent_id": agent_id,
            "user_id": user_id,
            "file_name": title,
            "file_type": "text_paste",
            "file_size_bytes": len(content.encode("utf-8")),
            "storage_path": None,
            "status": "processing",
        })

        # Process in background
        file_content = content.encode("utf-8")
        asyncio.create_task(
            self._process_document_task(doc["id"], file_content, "text_paste", title, agent_id)
        )

        return self._to_response(doc)

    # ── URL Source ────────────────────────────────────────────────────────

    async def add_url_source(
        self,
        user_id: str,
        agent_id: str,
        url: str,
    ) -> DocumentResponse:
        """
        Add a URL as a knowledge source.
        The URL content is fetched and processed by the URL parser.
        """
        # Verify agent ownership
        self._agent_service.get_agent(user_id, agent_id)

        # Create document record
        doc = self._doc_repo.create({
            "agent_id": agent_id,
            "user_id": user_id,
            "file_name": url,
            "file_type": "url",
            "file_size_bytes": None,
            "storage_path": None,
            "status": "processing",
        })

        # The URL parser expects the URL as bytes
        file_content = url.encode("utf-8")
        asyncio.create_task(
            self._process_document_task(doc["id"], file_content, "url", url, agent_id)
        )

        return self._to_response(doc)

    # ── Background Processing ─────────────────────────────────────────────

    async def _process_document_task(
        self,
        document_id: str,
        file_content: bytes,
        file_type: str,
        file_name: str,
        agent_id: str,
    ) -> None:
        """
        Background task: process a document through the full pipeline.

        This runs as an asyncio task — errors are caught and recorded
        in the document's status rather than propagated.
        """
        try:
            logger.info(f"Starting background processing for document {document_id}")

            # Run the processing pipeline
            processed_chunks: list[ProcessedChunk] = await self._processor.process(
                file_content=file_content,
                file_type=file_type,
                file_name=file_name,
            )

            # Store chunks with embeddings in the vector database
            chunk_dicts = [
                {
                    "content": chunk.content,
                    "chunk_index": chunk.chunk_index,
                    "metadata": chunk.metadata,
                    "embedding": chunk.embedding,
                }
                for chunk in processed_chunks
            ]

            self._vector_repo.store_chunks(
                agent_id=agent_id,
                document_id=document_id,
                chunks=chunk_dicts,
            )

            # Update document status to ready
            self._doc_repo.update_status(
                document_id=document_id,
                status="ready",
                chunk_count=len(processed_chunks),
            )

            logger.info(
                f"Document {document_id} processed successfully: "
                f"{len(processed_chunks)} chunks"
            )

        except Exception as e:
            logger.error(f"Document processing failed for {document_id}: {e}")
            self._doc_repo.update_status(
                document_id=document_id,
                status="failed",
                error_message=str(e),
            )

    # ── Listing & Details ─────────────────────────────────────────────────

    def list_documents(self, user_id: str, agent_id: str) -> list[DocumentResponse]:
        """List all documents for an agent, verifying ownership."""
        self._agent_service.get_agent(user_id, agent_id)
        docs = self._doc_repo.list_by_agent(agent_id)
        return [self._to_response(d) for d in docs]

    def get_document(self, user_id: str, document_id: str) -> DocumentResponse:
        """Get document details, verifying ownership."""
        doc = self._doc_repo.get_by_id(document_id)
        if not doc:
            raise NotFoundError("Document", document_id)

        # Verify the user owns the agent that owns this document
        self._agent_service.get_agent(user_id, doc["agent_id"])

        return self._to_response(doc)

    # ── Deletion ──────────────────────────────────────────────────────────

    def delete_document(self, user_id: str, document_id: str) -> None:
        """
        Delete a document, its chunks, and its storage file.
        Verifies ownership before deletion.
        """
        doc = self._doc_repo.get_by_id(document_id)
        if not doc:
            raise NotFoundError("Document", document_id)

        # Verify ownership
        self._agent_service.get_agent(user_id, doc["agent_id"])

        # Delete from Supabase Storage (if file was uploaded)
        if doc.get("storage_path"):
            try:
                self._client.storage.from_(STORAGE_BUCKET).remove([doc["storage_path"]])
                logger.info(f"Deleted storage file: {doc['storage_path']}")
            except Exception as e:
                logger.warning(f"Failed to delete storage file: {e}")

        # Delete document record (chunks cascade via FK)
        self._doc_repo.delete(document_id)
        logger.info(f"Document {document_id} deleted by user {user_id}")
