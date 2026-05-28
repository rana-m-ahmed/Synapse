"""
Synapse Backend — Analytics Repository
=========================================
Database access layer for analytics queries.
Uses Supabase RPC functions for aggregate computations.
"""

import logging

from supabase import Client

logger = logging.getLogger("synapse.repo.analytics")


class AnalyticsRepository:
    """
    Repository for analytics queries.
    Delegates heavy computation to PostgreSQL RPC functions
    defined in migration 007.
    """

    def __init__(self, supabase: Client):
        self._client = supabase

    def get_agent_stats(self, agent_id: str) -> dict:
        """
        Get aggregate stats for an agent using the get_agent_stats RPC.

        Returns:
            Dict with total_conversations, total_messages, avg_messages_per_conversation.
        """
        response = self._client.rpc(
            "get_agent_stats",
            {"target_agent_id": agent_id},
        ).execute()

        if response.data:
            return response.data[0]

        return {
            "total_conversations": 0,
            "total_messages": 0,
            "avg_messages_per_conversation": 0,
        }

    def get_hourly_activity(self, agent_id: str, days: int = 7) -> list[dict]:
        """
        Get message counts grouped by hour for the last N days.

        Returns:
            List of {hour: int, message_count: int} dicts.
        """
        response = self._client.rpc(
            "get_hourly_activity",
            {
                "target_agent_id": agent_id,
                "days_back": days,
            },
        ).execute()

        return response.data or []

    def get_daily_conversations(self, agent_id: str, days: int = 30) -> list[dict]:
        """
        Get conversation counts per day for the last N days.

        Returns:
            List of {date: str, conversation_count: int} dicts.
        """
        response = self._client.rpc(
            "get_daily_conversations",
            {
                "target_agent_id": agent_id,
                "days_back": days,
            },
        ).execute()

        return response.data or []

    def get_document_stats(self, agent_id: str) -> dict:
        """
        Get document and chunk counts for an agent.

        Returns:
            Dict with total_documents and total_chunks.
        """
        # Document count
        doc_response = (
            self._client.table("documents")
            .select("id", count="exact")
            .eq("agent_id", agent_id)
            .execute()
        )

        # Chunk count
        chunk_response = (
            self._client.table("document_chunks")
            .select("id", count="exact")
            .eq("agent_id", agent_id)
            .execute()
        )

        return {
            "total_documents": doc_response.count or 0,
            "total_chunks": chunk_response.count or 0,
        }
