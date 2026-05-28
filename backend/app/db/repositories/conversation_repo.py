"""
Synapse Backend — Conversation Repository
=============================================
Database access layer for conversations and messages tables.
Handles conversation lifecycle and message persistence.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from supabase import Client

logger = logging.getLogger("synapse.repo.conversation")


class ConversationRepository:
    """
    Repository for conversations and their messages.
    Handles session resumption, message persistence, and conversation listing.
    """

    def __init__(self, supabase: Client):
        self._client = supabase

    # ── Conversations ─────────────────────────────────────────────────────

    def create(
        self,
        agent_id: str,
        session_id: str,
        visitor_ip: Optional[str] = None,
    ) -> dict:
        """
        Create a new conversation.

        Args:
            agent_id: The agent this conversation belongs to.
            session_id: Client-generated session ID.
            visitor_ip: Optional visitor IP for analytics.

        Returns:
            The created conversation row.
        """
        row = {
            "agent_id": agent_id,
            "session_id": session_id,
            "visitor_ip": visitor_ip,
        }

        response = self._client.table("conversations").insert(row).execute()
        logger.info(f"Created conversation for agent {agent_id}, session {session_id}")
        return response.data[0]

    def get_by_id(self, conversation_id: str) -> Optional[dict]:
        """Get a conversation by its ID."""
        response = (
            self._client.table("conversations")
            .select("*")
            .eq("id", conversation_id)
            .maybe_single()
            .execute()
        )
        return response.data if response else None

    def get_by_session(self, agent_id: str, session_id: str) -> Optional[dict]:
        """
        Find an existing conversation by agent + session ID.
        Used to resume conversations when a visitor returns.
        """
        response = (
            self._client.table("conversations")
            .select("*")
            .eq("agent_id", agent_id)
            .eq("session_id", session_id)
            .maybe_single()
            .execute()
        )
        return response.data if response else None

    def list_by_agent(
        self,
        agent_id: str,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[dict], int]:
        """
        List conversations for an agent with pagination.

        Returns:
            Tuple of (conversations list, total count).
        """
        offset = (page - 1) * limit

        # Get paginated results with total count
        response = (
            self._client.table("conversations")
            .select("*", count="exact")
            .eq("agent_id", agent_id)
            .order("last_message_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return response.data, response.count or 0

    def update_last_message(self, conversation_id: str) -> None:
        """Update the last_message_at timestamp and increment message_count."""
        # We use raw update since Supabase PostgREST doesn't support increment directly
        # Instead, we fetch current count and increment
        conv = self.get_by_id(conversation_id)
        if conv:
            self._client.table("conversations").update({
                "last_message_at": datetime.now(timezone.utc).isoformat(),
                "message_count": conv["message_count"] + 1,
            }).eq("id", conversation_id).execute()

    # ── Messages ──────────────────────────────────────────────────────────

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        sources: list | None = None,
    ) -> dict:
        """
        Add a message to a conversation.

        Args:
            conversation_id: The conversation to add the message to.
            role: "user" or "assistant".
            content: The message text.
            sources: List of source reference dicts (for assistant messages).

        Returns:
            The created message row.
        """
        row = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "sources": sources or [],
        }

        response = self._client.table("messages").insert(row).execute()

        # Update conversation's last_message_at and message_count
        self.update_last_message(conversation_id)

        return response.data[0]

    def get_messages(
        self,
        conversation_id: str,
        limit: Optional[int] = None,
    ) -> list[dict]:
        """
        Get messages for a conversation, ordered chronologically.

        Args:
            conversation_id: The conversation to fetch messages for.
            limit: Max messages to return. None = all messages.

        Returns:
            List of message row dicts, oldest first.
        """
        query = (
            self._client.table("messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=False)
        )

        if limit:
            # Get the LAST N messages (most recent) by sorting desc and limiting
            query = (
                self._client.table("messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=True)
                .limit(limit)
            )
            response = query.execute()
            # Reverse to get chronological order
            return list(reversed(response.data))

        response = query.execute()
        return response.data

    def get_first_user_message(self, conversation_id: str) -> Optional[str]:
        """
        Get the first user message in a conversation (for preview in lists).
        """
        response = (
            self._client.table("messages")
            .select("content")
            .eq("conversation_id", conversation_id)
            .eq("role", "user")
            .order("created_at", desc=False)
            .limit(1)
            .execute()
        )

        if response.data:
            content = response.data[0]["content"]
            # Truncate for preview
            return content[:100] + "..." if len(content) > 100 else content
        return None
