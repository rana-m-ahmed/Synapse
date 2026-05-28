"""
Synapse Backend — Vector Repository
=======================================
Database access layer for the document_chunks table and the match_chunks RPC.
Handles storing embeddings and performing similarity search.
"""

import logging
from typing import Optional

from supabase import Client

logger = logging.getLogger("synapse.repo.vector")


class VectorRepository:
    """
    Repository for vector operations:
    - Storing document chunk embeddings
    - Performing similarity search via the match_chunks RPC
    - Deleting chunks by document
    """

    def __init__(self, supabase: Client):
        self._client = supabase
        self._table = "document_chunks"

    def store_chunks(
        self,
        agent_id: str,
        document_id: str,
        chunks: list[dict],
    ) -> int:
        """
        Batch insert document chunks with their embeddings.

        Args:
            agent_id: The agent this document belongs to.
            document_id: The source document ID.
            chunks: List of dicts with keys: content, chunk_index, metadata, embedding.

        Returns:
            Number of chunks inserted.
        """
        rows = [
            {
                "agent_id": agent_id,
                "document_id": document_id,
                "content": chunk["content"],
                "chunk_index": chunk["chunk_index"],
                "metadata": chunk["metadata"],
                "embedding": chunk["embedding"],
            }
            for chunk in chunks
        ]

        # Batch insert in groups of 100 to avoid request size limits
        batch_size = 100
        total_inserted = 0

        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            self._client.table(self._table).insert(batch).execute()
            total_inserted += len(batch)
            logger.info(f"Inserted batch {i // batch_size + 1}: {len(batch)} chunks")

        logger.info(
            f"Stored {total_inserted} chunks for document {document_id} "
            f"(agent {agent_id})"
        )
        return total_inserted

    def search(
        self,
        agent_id: str,
        query_embedding: list[float],
        threshold: float = 0.3,
        limit: int = 5,
    ) -> list[dict]:
        """
        Perform similarity search using the match_chunks RPC function.
        Results are scoped to the specified agent's knowledge base.

        Args:
            agent_id: Only search chunks belonging to this agent.
            query_embedding: The 384-dimensional query vector.
            threshold: Minimum cosine similarity (0.0 to 1.0).
            limit: Maximum number of results to return.

        Returns:
            List of matching chunks with similarity scores, sorted by relevance.
        """
        response = self._client.rpc(
            "match_chunks",
            {
                "query_embedding": query_embedding,
                "target_agent_id": agent_id,
                "match_threshold": threshold,
                "match_count": limit,
            },
        ).execute()

        results = response.data or []
        logger.info(
            f"Vector search for agent {agent_id}: "
            f"{len(results)} results above threshold {threshold}"
        )
        return results

    def delete_by_document(self, document_id: str) -> int:
        """
        Delete all chunks for a specific document.
        Called when a document is removed from the knowledge base.

        Returns:
            Number of chunks deleted.
        """
        response = (
            self._client.table(self._table)
            .delete()
            .eq("document_id", document_id)
            .execute()
        )
        count = len(response.data)
        logger.info(f"Deleted {count} chunks for document {document_id}")
        return count

    def count_by_agent(self, agent_id: str) -> int:
        """
        Count total chunks for an agent (used in analytics).
        """
        response = (
            self._client.table(self._table)
            .select("id", count="exact")
            .eq("agent_id", agent_id)
            .execute()
        )
        return response.count or 0
