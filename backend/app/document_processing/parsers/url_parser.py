"""
Synapse Backend — URL Parser
===============================
Fetches a web page and extracts readable text content using httpx + BeautifulSoup.
Strips navigation, scripts, styles, and other non-content elements.
"""

import logging
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup

from app.core.exceptions import DocumentProcessingError
from app.document_processing.parsers.base import BaseParser, ParsedDocument

logger = logging.getLogger("synapse.parsers.url")

# HTML elements to remove (not useful for knowledge base)
REMOVE_TAGS = [
    "script", "style", "nav", "footer", "header",
    "aside", "form", "iframe", "noscript",
]

# Request timeout and limits
REQUEST_TIMEOUT = 15.0   # seconds
MAX_CONTENT_SIZE = 5_000_000  # 5MB max page size


class UrlParser(BaseParser):
    """
    Fetches a web page URL and extracts the main text content.
    Removes boilerplate (nav, footer, scripts) to keep only the informational content.
    """

    async def parse(self, file_content: bytes, file_name: str) -> ParsedDocument:
        """
        Fetch a URL and extract its text content.

        Note: For URL parsing, file_content contains the URL as bytes (UTF-8 encoded),
        NOT the page content. We fetch the page ourselves.

        Args:
            file_content: The URL encoded as bytes.
            file_name: The URL string (same as file_content decoded).

        Returns:
            ParsedDocument with extracted page text and URL metadata.

        Raises:
            DocumentProcessingError: If the URL can't be fetched or has no content.
        """
        url = file_content.decode("utf-8").strip()

        # Validate URL format
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        logger.info(f"Fetching URL: {url}")

        # Fetch the page
        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=REQUEST_TIMEOUT,
            ) as client:
                response = await client.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (compatible; SynapseBot/1.0)",
                    },
                )
                response.raise_for_status()
        except httpx.TimeoutException:
            raise DocumentProcessingError(
                f"Timed out while fetching URL: {url}"
            )
        except httpx.HTTPStatusError as e:
            raise DocumentProcessingError(
                f"Failed to fetch URL '{url}': HTTP {e.response.status_code}"
            )
        except httpx.RequestError as e:
            raise DocumentProcessingError(
                f"Could not connect to URL '{url}': {str(e)}"
            )

        # Check content size
        if len(response.content) > MAX_CONTENT_SIZE:
            raise DocumentProcessingError(
                f"Page at '{url}' is too large ({len(response.content)} bytes). Max: {MAX_CONTENT_SIZE} bytes."
            )

        # Parse HTML and extract text
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract page title
        page_title = ""
        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            page_title = title_tag.string.strip()

        # Remove non-content elements
        for tag_name in REMOVE_TAGS:
            for tag in soup.find_all(tag_name):
                tag.decompose()

        # Extract text from the remaining content
        text = soup.get_text(separator="\n", strip=True)

        # Clean up: remove excessive blank lines
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)

        if not clean_text:
            raise DocumentProcessingError(
                f"No extractable text found at URL: {url}"
            )

        logger.info(f"Parsed URL '{url}': {len(clean_text)} chars, title: '{page_title}'")

        return ParsedDocument(
            text=clean_text,
            metadata={
                "url": url,
                "page_title": page_title,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "content_length": len(clean_text),
                "source_file": page_title or url,
            },
        )
