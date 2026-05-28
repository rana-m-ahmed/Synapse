"""
Synapse Backend — Chat API Route
====================================
Streaming chat endpoint that uses SSE (Server-Sent Events).
Requires authentication — for the public widget version, see widget.py.

Endpoint:
    POST /api/v1/chat/ — Send a message and get a streaming AI response

SSE Event Types:
    event: sources  → {"sources": [{document_name, chunk_preview, similarity_score}]}
    event: token    → {"token": "word"}
    event: done     → {}
    event: error    → {"message": "..."}
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.core.dependencies import get_current_user, get_embedding_service_dep, get_supabase_dep
from app.schemas.chat import ChatRequest
from app.services.agent_service import AgentService
from app.services.rag_service import RagService

router = APIRouter()


@router.post("/")
async def chat(
    data: ChatRequest,
    user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_dep),
    embedding_service=Depends(get_embedding_service_dep),
):
    """
    Send a message to an AI agent and receive a streaming response.

    The response is a stream of Server-Sent Events (SSE).
    Connect using `fetch()` with a readable stream or `EventSource`.

    The frontend should:
    1. Listen for 'sources' event → display source badges
    2. Listen for 'token' events → append tokens to the message bubble
    3. Listen for 'done' event → finalize the message
    4. Listen for 'error' event → show error state
    """
    # Verify user owns this agent
    agent_service = AgentService(supabase)
    agent = agent_service.get_agent(user["user_id"], data.agent_id)

    # Create RAG service and start streaming
    rag_service = RagService(supabase, embedding_service)

    return StreamingResponse(
        rag_service.chat_stream(
            agent_id=data.agent_id,
            agent_name=agent.name,
            fallback_message=agent.fallback_message,
            session_id=data.session_id,
            user_message=data.message,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
