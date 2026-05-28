"""
Synapse Backend — Document Repository
=========================================
Database access layer for the documents table.
Handles document metadata CRUD — actual file storage is handled via Supabase Storage
in the document service layer.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from supabase import Client

logger = logging.getLogger("synapse.repo.document")


class DocumentRepository:
    """
    Repository for CRUD operations on the documents table.
    """

    def __init__(self, supabase: Client):
        self._client = supabase
        self._table = "documents"

    def create(self, data: dict) -> dict:
        """
        Create a new document record.

        Args:
            data: Document fields (agent_id, user_id, file_name, file_type, etc.)

        Returns:
            The created document row.
        """
        response = self._client.table(self._table).insert(data).execute()
        logger.info(f"Created document record: {data['file_name']} ({data['file_type']})")
        return response.data[0]

    def get_by_id(self, document_id: str) -> Optional[dict]:
        """
        Get a single document by ID.

        Returns:
            Document row dict or None if not found.
        """
        response = (
            self._client.table(self._table)
            .select("*")
            .eq("id", document_id)
            .maybe_single()
            .execute()
        )
        return response.data if response else None

    def list_by_agent(self, agent_id: str) -> list[dict]:
        """
        List all documents for a specific agent, ordered by creation date.

        Returns:
            List of document row dicts.
        """
        response = (
            self._client.table(self._table)
            .select("*")
            .eq("agent_id", agent_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data

    def update_status(
        self,
        document_id: str,
        status: str,
        error_message: Optional[str] = None,
        chunk_count: Optional[int] = None,
    ) -> dict:
        """
        Update a document's processing status.

        Args:
            document_id: The document to update.
            status: New status ('processing', 'ready', 'failed').
            error_message: Error details if status is 'failed'.
            chunk_count: Number of chunks generated if status is 'ready'.

        Returns:
            The updated document row.
        """
        update_data: dict = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        if error_message is not None:
            update_data["error_message"] = error_message

        if chunk_count is not None:
            update_data["chunk_count"] = chunk_count

        response = (
            self._client.table(self._table)
            .update(update_data)
            .eq("id", document_id)
            .execute()
        )

        logger.info(f"Updated document {document_id} status → {status}")
        return response.data[0]

    def delete(self, document_id: str) -> bool:
        """
        Delete a document record. Cascade deletes handle associated chunks.

        Returns:
            True if the document was deleted.
        """
        response = (
            self._client.table(self._table)
            .delete()
            .eq("id", document_id)
            .execute()
        )
        logger.info(f"Deleted document {document_id}")
        return len(response.data) > 0
