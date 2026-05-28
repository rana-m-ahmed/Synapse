"""
Synapse Backend — Conversation Schemas
=========================================
Request and response models for the /api/v1/conversations endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """A single message within a conversation."""
    id: str
    role: str                       # "user" or "assistant"
    content: str
    sources: list = []              # List of ChatSourceRef dicts
    created_at: datetime


class ConversationSummary(BaseModel):
    """Summary view of a conversation (used in list views)."""
    id: str
    agent_id: str
    session_id: str
    message_count: int
    started_at: datetime
    last_message_at: datetime
    preview: Optional[str] = None   # First user message (truncated)


class ConversationDetail(BaseModel):
    """Full conversation with all messages."""
    id: str
    agent_id: str
    session_id: str
    message_count: int
    started_at: datetime
    last_message_at: datetime
    is_resolved: bool
    messages: list[MessageResponse]


class ConversationListResponse(BaseModel):
    """Response model for the conversation list endpoint."""
    conversations: list[ConversationSummary]
    total: int
    page: int
    limit: int
    has_more: bool
