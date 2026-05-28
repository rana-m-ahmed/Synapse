"""
Synapse Backend — Agent Repository
=====================================
Database access layer for the agents table.
All Supabase queries for agents are encapsulated here.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from supabase import Client

logger = logging.getLogger("synapse.repo.agent")


class AgentRepository:
    """
    Repository for CRUD operations on the agents table.
    Uses the Supabase client's PostgREST interface.
    """

    def __init__(self, supabase: Client):
        self._client = supabase
        self._table = "agents"

    def create(self, user_id: str, data: dict) -> dict:
        """
        Create a new agent.

        Args:
            user_id: Owner's user ID from JWT.
            data: Agent fields (name, description, etc.)

        Returns:
            The created agent row.
        """
        row = {
            "user_id": user_id,
            "name": data["name"],
            "description": data.get("description"),
            "welcome_message": data.get("welcome_message", "Hi! How can I help you today?"),
            "accent_color": data.get("accent_color", "#4F46E5"),
            "fallback_message": data.get("fallback_message",
                "I don't have information on that. Please contact our support team for assistance."),
        }

        response = self._client.table(self._table).insert(row).execute()
        logger.info(f"Created agent '{data['name']}' for user {user_id}")
        return response.data[0]

    def get_by_id(self, agent_id: str) -> Optional[dict]:
        """
        Get a single agent by its ID.

        Returns:
            Agent row dict or None if not found.
        """
        response = (
            self._client.table(self._table)
            .select("*")
            .eq("id", agent_id)
            .maybe_single()
            .execute()
        )
        return response.data if response else None

    def list_by_user(self, user_id: str) -> list[dict]:
        """
        List all agents belonging to a user, ordered by creation date.

        Returns:
            List of agent row dicts.
        """
        response = (
            self._client.table(self._table)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data

    def update(self, agent_id: str, data: dict) -> dict:
        """
        Update an agent's fields. Only non-None fields in data are updated.

        Args:
            agent_id: The agent to update.
            data: Dict of fields to update.

        Returns:
            The updated agent row.
        """
        # Filter out None values — only update provided fields
        update_data = {k: v for k, v in data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        response = (
            self._client.table(self._table)
            .update(update_data)
            .eq("id", agent_id)
            .execute()
        )
        logger.info(f"Updated agent {agent_id}: {list(update_data.keys())}")
        return response.data[0]

    def delete(self, agent_id: str) -> bool:
        """
        Delete an agent. Cascade deletes handle documents, chunks, and conversations.

        Returns:
            True if the agent was deleted.
        """
        response = (
            self._client.table(self._table)
            .delete()
            .eq("id", agent_id)
            .execute()
        )
        logger.info(f"Deleted agent {agent_id}")
        return len(response.data) > 0

    def count_documents(self, agent_id: str) -> int:
        """
        Count the number of documents attached to an agent.
        Used for the AgentResponse.document_count field.
        """
        response = (
            self._client.table("documents")
            .select("id", count="exact")
            .eq("agent_id", agent_id)
            .execute()
        )
        return response.count or 0
