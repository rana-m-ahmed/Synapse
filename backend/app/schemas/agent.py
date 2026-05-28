"""
Synapse Backend — Agent Schemas
=================================
Request and response models for the /api/v1/agents endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    """Request body for creating a new agent."""
    name: str = Field(..., min_length=1, max_length=100, description="Agent display name")
    description: Optional[str] = Field(None, max_length=500, description="Brief description of the agent's purpose")
    welcome_message: Optional[str] = Field(
        "Hi! How can I help you today?",
        max_length=500,
        description="First message shown in the chat widget",
    )
    accent_color: Optional[str] = Field(
        "#4F46E5",
        pattern=r"^#[0-9a-fA-F]{6}$",
        description="Hex color for the widget (e.g., #4F46E5)",
    )
    fallback_message: Optional[str] = Field(
        "I don't have information on that. Please contact our support team for assistance.",
        max_length=500,
        description="Response when the AI can't find relevant information",
    )


class AgentUpdate(BaseModel):
    """Request body for updating an agent. All fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    welcome_message: Optional[str] = Field(None, max_length=500)
    accent_color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    fallback_message: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    """Response model for a single agent."""
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    welcome_message: str
    accent_color: str
    fallback_message: str
    is_active: bool
    document_count: int = 0          # Computed: number of documents attached
    created_at: datetime
    updated_at: datetime


class AgentListResponse(BaseModel):
    """Response model for the agent list endpoint."""
    agents: list[AgentResponse]
    total: int
