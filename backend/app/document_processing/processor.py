"""
Synapse Backend — Document Processor (Orchestrator)
=====================================================
The main orchestrator that takes a raw document and produces
embedded chunks ready for vector storage.

Pipeline:
    1. Select parser based on file type (registry pattern)
    2. Parse file → ParsedDocument (text + metadata)
    3. Chunk text → list[TextChunk]
    4. Batch embed chunks → list[list[float]]
    5. Return processed chunks with embeddings

This module does NOT handle storage or status updates — that's the
responsibility of document_service.py, which calls this processor.
"""

import logging
from dataclasses import dataclass

from app.core.exceptions import DocumentProcessingError
from app.document_processing.chunker import TextChunk, TextChunker
from app.document_processing.parsers.base import BaseParser
from app.document_processing.parsers.csv_parser import CsvParser
from app.document_processing.parsers.docx_parser import DocxParser
from app.document_processing.parsers.excel_parser import ExcelParser
from app.document_processing.parsers.pdf_parser import PdfParser
from app.document_processing.parsers.txt_parser import TxtParser
from app.document_processing.parsers.url_parser import UrlParser
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger("synapse.processor")


# ── Parser Registry ───────────────────────────────────────────────────────
# Maps file_type strings to their parser classes.
# To add a new file type: create a parser class and add it here.

PARSER_REGISTRY: dict[str, type[BaseParser]] = {
    "pdf": PdfParser,
    "docx": DocxParser,
    "txt": TxtParser,
    "text_paste": TxtParser,    # Text pastes use the same parser as .txt files
    "csv": CsvParser,
    "xlsx": ExcelParser,
    "url": UrlParser,
}


@dataclass
class ProcessedChunk:
    """
    A chunk with its embedding, ready for storage in the vector database.

    Attributes:
        content: The text content of this chunk.
        chunk_index: Position within the source document.
        metadata: Chunk metadata (source_file, page_number, etc.)
        embedding: Dense vector (384 floats for all-MiniLM-L6-v2).
    """
    content: str
    chunk_index: int
    metadata: dict
    embedding: list[float]


class DocumentProcessor:
    """
    Orchestrates the full document processing pipeline:
    parse → chunk → embed.

    This class is stateless — it uses injected services and can be
    instantiated per-request or shared across requests.
    """

    def __init__(self, embedding_service: EmbeddingService):
        """
        Args:
            embedding_service: Pre-loaded embedding service (model already in memory).
        """
        self._embedding_service = embedding_service
        self._chunker = TextChunker()

    async def process(
        self,
        file_content: bytes,
        file_type: str,
        file_name: str,
    ) -> list[ProcessedChunk]:
        """
        Process a document through the full pipeline: parse → chunk → embed.

        Args:
            file_content: Raw bytes of the uploaded file.
            file_type: One of the supported types (pdf, docx, txt, csv, xlsx, url, text_paste).
            file_name: Original filename for metadata and error messages.

        Returns:
            List of ProcessedChunk objects, each containing text, metadata, and embedding.

        Raises:
            DocumentProcessingError: If any stage of the pipeline fails.
        """
        # ── Step 1: Select parser ─────────────────────────────────────
        parser_class = PARSER_REGISTRY.get(file_type)
        if not parser_class:
            raise DocumentProcessingError(
                f"Unsupported file type: '{file_type}'. "
                f"Supported types: {', '.join(PARSER_REGISTRY.keys())}"
            )

        parser = parser_class()
        logger.info(f"Processing '{file_name}' ({file_type}) with {parser_class.__name__}")

        # ── Step 2: Parse file ────────────────────────────────────────
        parsed = await parser.parse(file_content, file_name)
        logger.info(f"Parsed '{file_name}': {len(parsed.text)} chars")

        if not parsed.text.strip():
            raise DocumentProcessingError(
                f"No text could be extracted from '{file_name}'."
            )

        # ── Step 3: Chunk text ────────────────────────────────────────
        chunks: list[TextChunk] = self._chunker.chunk_text(
            text=parsed.text,
            base_metadata=parsed.metadata,
        )

        if not chunks:
            raise DocumentProcessingError(
                f"No chunks were generated from '{file_name}'. The text may be too short."
            )

        logger.info(f"Chunked '{file_name}' into {len(chunks)} chunks")

        # ── Step 4: Batch embed ───────────────────────────────────────
        chunk_texts = [chunk.content for chunk in chunks]
        embeddings = self._embedding_service.embed_texts(chunk_texts)

        if len(embeddings) != len(chunks):
            raise DocumentProcessingError(
                f"Embedding count mismatch: {len(embeddings)} embeddings for {len(chunks)} chunks."
            )

        # ── Step 5: Combine into ProcessedChunks ──────────────────────
        processed_chunks = [
            ProcessedChunk(
                content=chunk.content,
                chunk_index=chunk.chunk_index,
                metadata=chunk.metadata,
                embedding=embedding,
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]

        logger.info(
            f"Document '{file_name}' fully processed: "
            f"{len(processed_chunks)} chunks with embeddings"
        )

        return processed_chunks
