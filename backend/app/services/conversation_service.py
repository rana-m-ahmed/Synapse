"""
Synapse Backend — Conversation Service
=========================================
Business logic for conversation management.
Handles session resumption, message persistence, and listing.
"""

import logging
from typing import Optional

from supabase import Client

from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.repositories.conversation_repo import ConversationRepository
from app.schemas.conversation import (
    ConversationDetail,
    ConversationListResponse,
    ConversationSummary,
    MessageResponse,
)

logger = logging.getLogger("synapse.service.conversation")


class ConversationService:
    """
    Service layer for conversation operations.
    Manages the lifecycle of chat sessions between visitors and agents.
    """

    def __init__(self, supabase: Client):
        self._repo = ConversationRepository(supabase)

    def get_or_create_conversation(
        self,
        agent_id: str,
        session_id: str,
        visitor_ip: Optional[str] = None,
    ) -> dict:
        """
        Resume an existing conversation or create a new one.
        Uses (agent_id, session_id) as the unique identifier.

        Returns:
            Conversation row dict.
        """
        # Try to find existing conversation
        conv = self._repo.get_by_session(agent_id, session_id)
        if conv:
            logger.info(f"Resumed conversation {conv['id']} for session {session_id}")
            return conv

        # Create new conversation
        conv = self._repo.create(agent_id, session_id, visitor_ip)
        logger.info(f"Created new conversation {conv['id']} for session {session_id}")
        return conv

    def get_conversation_history(
        self,
        conversation_id: str,
        limit: int = 6,
    ) -> list[dict]:
        """
        Get recent messages for context injection into the RAG pipeline.

        Args:
            conversation_id: The conversation to fetch history for.
            limit: Max messages to return (default 6 = 3 user + 3 assistant).

        Returns:
            List of message dicts, ordered chronologically (oldest first).
        """
        return self._repo.get_messages(conversation_id, limit=limit)

    def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        sources: list | None = None,
    ) -> dict:
        """
        Save a message to the conversation.

        Args:
            conversation_id: The conversation to add the message to.
            role: "user" or "assistant".
            content: The message text.
            sources: Source references (for assistant messages).

        Returns:
            The created message row.
        """
        return self._repo.add_message(conversation_id, role, content, sources)

    def list_conversations(
        self,
        agent_id: str,
        page: int = 1,
        limit: int = 20,
    ) -> ConversationListResponse:
        """
        List conversations for an agent with pagination and previews.

        Returns:
            ConversationListResponse with summaries and pagination info.
        """
        conversations, total = self._repo.list_by_agent(agent_id, page, limit)

        summaries = []
        for conv in conversations:
            preview = self._repo.get_first_user_message(conv["id"])
            summaries.append(
                ConversationSummary(
                    id=conv["id"],
                    agent_id=conv["agent_id"],
                    session_id=conv["session_id"],
                    message_count=conv["message_count"],
                    started_at=conv["started_at"],
                    last_message_at=conv["last_message_at"],
                    preview=preview,
                )
            )

        return ConversationListResponse(
            conversations=summaries,
            total=total,
            page=page,
            limit=limit,
            has_more=(page * limit) < total,
        )

    def get_conversation_detail(
        self,
        conversation_id: str,
    ) -> ConversationDetail:
        """
        Get a conversation with all its messages.

        Returns:
            ConversationDetail with full message history.
        """
        conv = self._repo.get_by_id(conversation_id)
        if not conv:
            raise NotFoundError("Conversation", conversation_id)

        messages = self._repo.get_messages(conversation_id)

        return ConversationDetail(
            id=conv["id"],
            agent_id=conv["agent_id"],
            session_id=conv["session_id"],
            message_count=conv["message_count"],
            started_at=conv["started_at"],
            last_message_at=conv["last_message_at"],
            is_resolved=conv["is_resolved"],
            messages=[
                MessageResponse(
                    id=m["id"],
                    role=m["role"],
                    content=m["content"],
                    sources=m.get("sources", []),
                    created_at=m["created_at"],
                )
                for m in messages
            ],
        )
