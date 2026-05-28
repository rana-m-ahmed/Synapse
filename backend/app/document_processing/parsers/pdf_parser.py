"""
Synapse Backend — PDF Parser
===============================
Extracts text from PDF files using pypdf.
Handles multi-page PDFs and includes page numbers in metadata.
"""

import io
import logging

from pypdf import PdfReader

from app.core.exceptions import DocumentProcessingError
from app.document_processing.parsers.base import BaseParser, ParsedDocument

logger = logging.getLogger("synapse.parsers.pdf")


class PdfParser(BaseParser):
    """
    Parses PDF files by extracting text from each page.
    Uses pypdf which is pure Python and doesn't require external system deps.
    """

    async def parse(self, file_content: bytes, file_name: str) -> ParsedDocument:
        """
        Extract text from a PDF file.

        Each page's text is joined with double newlines. If a page has no
        extractable text (e.g., scanned image), it's skipped with a warning.

        Args:
            file_content: Raw PDF bytes.
            file_name: Original filename for error messages.

        Returns:
            ParsedDocument with full text and page_count metadata.

        Raises:
            DocumentProcessingError: If the PDF is encrypted, corrupt, or empty.
        """
        try:
            reader = PdfReader(io.BytesIO(file_content))
        except Exception as e:
            logger.error(f"Failed to read PDF '{file_name}': {e}")
            raise DocumentProcessingError(
                f"Could not read PDF file '{file_name}'. The file may be corrupt or encrypted."
            )

        # Check if the PDF is encrypted
        if reader.is_encrypted:
            raise DocumentProcessingError(
                f"PDF file '{file_name}' is password-protected. Please upload an unencrypted version."
            )

        page_count = len(reader.pages)
        if page_count == 0:
            raise DocumentProcessingError(f"PDF file '{file_name}' has no pages.")

        # Extract text from each page
        page_texts = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                page_texts.append(text.strip())
            else:
                logger.warning(
                    f"Page {i + 1} of '{file_name}' has no extractable text (possibly scanned image)."
                )

        full_text = "\n\n".join(page_texts)

        if not full_text.strip():
            raise DocumentProcessingError(
                f"PDF file '{file_name}' contains no extractable text. "
                "It may be a scanned document — OCR is not currently supported."
            )

        logger.info(f"Parsed PDF '{file_name}': {page_count} pages, {len(full_text)} chars")

        return ParsedDocument(
            text=full_text,
            metadata={
                "page_count": page_count,
                "source_file": file_name,
            },
        )
