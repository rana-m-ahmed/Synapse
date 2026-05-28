"""
Synapse Backend — CSV Parser
===============================
Parses CSV files by converting each row into a natural language sentence.
This approach works much better for RAG than raw CSV rows because it gives
the embedding model semantic context about what each value represents.

Example:
    Input CSV row: name,price,category → "Widget A,29.99,Electronics"
    Output text:   "name: Widget A, price: 29.99, category: Electronics"
"""

import csv
import io
import logging

from app.core.exceptions import DocumentProcessingError
from app.document_processing.parsers.base import BaseParser, ParsedDocument

logger = logging.getLogger("synapse.parsers.csv")


class CsvParser(BaseParser):
    """
    Parses CSV files by converting rows into readable sentences.
    Uses the header row as field labels for each data row.
    """

    async def parse(self, file_content: bytes, file_name: str) -> ParsedDocument:
        """
        Parse a CSV file into natural language text.

        Each data row is converted to: "column1: value1, column2: value2, ..."
        This gives the embedding model context about what each field means,
        which significantly improves RAG retrieval quality for tabular data.

        Args:
            file_content: Raw CSV bytes.
            file_name: Original filename.

        Returns:
            ParsedDocument with row-sentence text and row count metadata.

        Raises:
            DocumentProcessingError: If the CSV can't be parsed or is empty.
        """
        # Decode the CSV content
        try:
            text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = file_content.decode("latin-1")
            except UnicodeDecodeError:
                raise DocumentProcessingError(
                    f"Could not decode CSV file '{file_name}'."
                )

        try:
            # Sniff the CSV dialect (delimiter, quoting, etc.)
            sample = text[:8192]
            dialect = csv.Sniffer().sniff(sample)
            reader = csv.DictReader(io.StringIO(text), dialect=dialect)
        except csv.Error:
            # Fallback: assume standard comma-delimited CSV
            reader = csv.DictReader(io.StringIO(text))

        # Convert each row to a readable sentence
        row_sentences: list[str] = []
        row_count = 0

        for row in reader:
            row_count += 1
            # Build "key: value, key: value, ..." for each row
            parts = []
            for key, value in row.items():
                if key and value and value.strip():
                    parts.append(f"{key.strip()}: {value.strip()}")
            if parts:
                row_sentences.append(", ".join(parts))

        if not row_sentences:
            raise DocumentProcessingError(
                f"CSV file '{file_name}' contains no data rows."
            )

        full_text = "\n".join(row_sentences)

        logger.info(f"Parsed CSV '{file_name}': {row_count} rows, {len(full_text)} chars")

        return ParsedDocument(
            text=full_text,
            metadata={
                "row_count": row_count,
                "column_count": len(reader.fieldnames or []),
                "columns": list(reader.fieldnames or []),
                "source_file": file_name,
            },
        )
