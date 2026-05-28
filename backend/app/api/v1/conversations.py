"""
Synapse Backend — Conversations API Routes
=============================================
Endpoints for viewing conversation history.
All endpoints require authentication via JWT.

Endpoints:
    GET /api/v1/conversations/                    — List conversations for an agent
    GET /api/v1/conversations/{conversation_id}   — Get conversation with all messages
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user, get_supabase_dep
from app.schemas.conversation import ConversationDetail, ConversationListResponse
from app.services.agent_service import AgentService
from app.services.conversation_service import ConversationService

router = APIRouter()


@router.get("/", response_model=ConversationListResponse)
async def list_conversations(
    agent_id: str = Query(..., description="Agent ID to list conversations for"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_dep),
):
    """
    List conversations for a specific agent with pagination.
    Each conversation includes a preview of the first user message.
    """
    # Verify user owns this agent
    agent_service = AgentService(supabase)
    agent_service.get_agent(user["user_id"], agent_id)

    conv_service = ConversationService(supabase)
    return conv_service.list_conversations(agent_id, page, limit)


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_dep),
):
    """
    Get a conversation with all its messages.
    Verifies that the user owns the agent the conversation belongs to.
    """
    conv_service = ConversationService(supabase)
    conversation = conv_service.get_conversation_detail(conversation_id)

    # Verify ownership via the agent
    agent_service = AgentService(supabase)
    agent_service.get_agent(user["user_id"], conversation.agent_id)

    return conversation
