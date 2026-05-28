"""
Synapse Backend — Text Parser
================================
Handles plain text files (.txt) and direct text pastes.
Includes fallback encoding detection for non-UTF-8 files.
"""

import logging

from app.core.exceptions import DocumentProcessingError
from app.document_processing.parsers.base import BaseParser, ParsedDocument

logger = logging.getLogger("synapse.parsers.txt")

# Common encodings to try if UTF-8 fails
FALLBACK_ENCODINGS = ["utf-8", "latin-1", "cp1252", "ascii"]


class TxtParser(BaseParser):
    """
    Parses plain text files with encoding fallback.
    Also used for the "text_paste" document type (direct text input from UI).
    """

    async def parse(self, file_content: bytes, file_name: str) -> ParsedDocument:
        """
        Decode text bytes with encoding fallback.

        Tries UTF-8 first, then falls back to latin-1, cp1252, and ASCII.
        This handles most text files users will upload without needing
        the chardet library.

        Args:
            file_content: Raw text file bytes.
            file_name: Original filename.

        Returns:
            ParsedDocument with decoded text.

        Raises:
            DocumentProcessingError: If no encoding works or text is empty.
        """
        text = None

        for encoding in FALLBACK_ENCODINGS:
            try:
                text = file_content.decode(encoding)
                logger.info(f"Decoded '{file_name}' with encoding: {encoding}")
                break
            except (UnicodeDecodeError, ValueError):
                continue

        if text is None:
            raise DocumentProcessingError(
                f"Could not decode text file '{file_name}'. "
                "The file may use an unsupported character encoding."
            )

        text = text.strip()

        if not text:
            raise DocumentProcessingError(
                f"Text file '{file_name}' is empty."
            )

        logger.info(f"Parsed TXT '{file_name}': {len(text)} chars")

        return ParsedDocument(
            text=text,
            metadata={
                "char_count": len(text),
                "source_file": file_name,
            },
        )
