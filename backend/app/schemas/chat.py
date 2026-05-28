"""
Synapse Backend — Chat Schemas
=================================
Request and response models for the chat and widget chat endpoints.
"""

from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request body for the authenticated chat endpoint (/api/v1/chat)."""
    agent_id: str = Field(..., description="ID of the agent to chat with")
    session_id: str = Field(..., min_length=1, max_length=100, description="Client-generated session ID for conversation tracking")
    message: str = Field(..., min_length=1, max_length=4000, description="The user's message")


class WidgetChatRequest(BaseModel):
    """Request body for the public widget chat endpoint (/api/v1/widget/chat)."""
    agent_id: str = Field(..., description="ID of the agent to chat with")
    session_id: str = Field(..., min_length=1, max_length=100, description="Client-generated session ID")
    message: str = Field(..., min_length=1, max_length=4000, description="The user's message")
    visitor_ip: Optional[str] = Field(None, description="Visitor IP (set by the backend, not the client)")


class ChatSourceRef(BaseModel):
    """Reference to a knowledge base chunk used to generate a response."""
    document_name: str
    chunk_preview: str              # First ~100 chars of the chunk
    similarity_score: float


class WidgetConfigResponse(BaseModel):
    """Public widget configuration (no auth required)."""
    agent_id: str
    agent_name: str
    welcome_message: str
    accent_color: str
