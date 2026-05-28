"""
Synapse Backend — API v1 Router Aggregator
=============================================
Mounts all v1 sub-routers under a single parent router.
This is included in main.py as: app.include_router(api_v1_router, prefix="/api/v1")

Endpoint summary:
    /api/v1/agents/*          — Agent CRUD (authenticated)
    /api/v1/documents/*       — Document management (authenticated)
    /api/v1/chat/             — Streaming chat (authenticated)
    /api/v1/conversations/*   — Conversation history (authenticated)
    /api/v1/analytics/*       — Dashboard analytics (authenticated)
    /api/v1/widget/*          — Public widget endpoints (no auth)
"""

from fastapi import APIRouter

from app.api.v1.agents import router as agents_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.chat import router as chat_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.documents import router as documents_router
from app.api.v1.widget import router as widget_router

api_v1_router = APIRouter()

# ── Mount sub-routers ─────────────────────────────────────────────────────
api_v1_router.include_router(agents_router, prefix="/agents", tags=["Agents"])
api_v1_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_v1_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_v1_router.include_router(conversations_router, prefix="/conversations", tags=["Conversations"])
api_v1_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(widget_router, prefix="/widget", tags=["Widget"])
