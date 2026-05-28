"""
Synapse Backend — Text Chunker
=================================
Splits parsed document text into smaller chunks suitable for embedding.
Uses LangChain's RecursiveCharacterTextSplitter under the hood for reliable,
semantically-aware text splitting.

Chunking strategy:
    1. Split on double newlines (paragraph boundaries)
    2. Fall back to single newlines
    3. Fall back to sentences (. ! ?)
    4. Fall back to spaces (word boundaries)
    5. Last resort: split at exact character count

Each chunk includes metadata about its position in the source document
for attribution when the RAG system cites its sources.
"""

import logging
from dataclasses import dataclass, field

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import get_settings

logger = logging.getLogger("synapse.chunker")


@dataclass
class TextChunk:
    """
    A single chunk of text with its metadata.

    Attributes:
        content: The text content of this chunk.
        chunk_index: Position of this chunk within the source document (0-indexed).
        metadata: Additional metadata (source_file, page_number, etc.)
    """
    content: str
    chunk_index: int
    metadata: dict = field(default_factory=dict)


class TextChunker:
    """
    Splits large text into overlapping chunks for embedding and retrieval.

    Uses configurable chunk_size and chunk_overlap from settings.
    The overlap ensures that information at chunk boundaries isn't lost
    during retrieval — a question about content near a boundary can match
    either the chunk before or after the split.
    """

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ):
        """
        Initialize the chunker with configurable parameters.

        Args:
            chunk_size: Maximum characters per chunk. Default from settings (500).
            chunk_overlap: Character overlap between consecutive chunks. Default from settings (50).
        """
        settings = get_settings()
        self._chunk_size = chunk_size or settings.CHUNK_SIZE
        self._chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self._chunk_size,
            chunk_overlap=self._chunk_overlap,
            length_function=len,
            # Split hierarchy: paragraphs → lines → sentences → words → chars
            separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""],
            keep_separator=True,
        )

    def chunk_text(
        self,
        text: str,
        base_metadata: dict | None = None,
    ) -> list[TextChunk]:
        """
        Split text into chunks with metadata.

        Args:
            text: The full text to split.
            base_metadata: Metadata to attach to every chunk (e.g., source_file).

        Returns:
            List of TextChunk objects, ordered by chunk_index.
        """
        if not text or not text.strip():
            logger.warning("Received empty text for chunking.")
            return []

        base_metadata = base_metadata or {}

        # Use LangChain's splitter to create text segments
        raw_chunks = self._splitter.split_text(text)

        # Wrap each segment in a TextChunk with its index and metadata
        chunks = []
        for i, chunk_text in enumerate(raw_chunks):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            chunk = TextChunk(
                content=chunk_text,
                chunk_index=i,
                metadata={
                    **base_metadata,
                    "chunk_index": i,
                    "chunk_size": len(chunk_text),
                },
            )
            chunks.append(chunk)

        logger.info(
            f"Chunked text into {len(chunks)} chunks "
            f"(size={self._chunk_size}, overlap={self._chunk_overlap})"
        )

        return chunks
