"""
Synapse Backend — Base Parser
===============================
Abstract base class that all file-type parsers must implement.
Each parser takes raw file bytes and returns a ParsedDocument containing
the extracted text and metadata.

Adding a new file type:
    1. Create a new file in parsers/ (e.g., markdown_parser.py)
    2. Implement a class that extends BaseParser
    3. Register it in processor.py's PARSER_REGISTRY
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ParsedDocument:
    """
    The output of any parser. Contains the extracted text and metadata.

    Attributes:
        text: The full extracted text content from the file.
        metadata: File-type-specific metadata (e.g., page_count for PDFs,
                  sheet_names for Excel, url for web pages).
    """
    text: str
    metadata: dict = field(default_factory=dict)


class BaseParser(ABC):
    """
    Abstract base class for file parsers.

    Every parser must implement the `parse` method which takes raw bytes
    and returns a ParsedDocument. Parsers should handle their own error
    cases and raise DocumentProcessingError for unrecoverable failures.
    """

    @abstractmethod
    async def parse(self, file_content: bytes, file_name: str) -> ParsedDocument:
        """
        Parse file bytes into structured text.

        Args:
            file_content: Raw bytes of the uploaded file.
            file_name: Original filename (used for metadata and error messages).

        Returns:
            ParsedDocument with extracted text and metadata.

        Raises:
            DocumentProcessingError: If the file cannot be parsed.
        """
        ...
