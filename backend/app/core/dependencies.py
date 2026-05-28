"""
Synapse Backend — FastAPI Dependencies
========================================
Reusable dependency injection factories for FastAPI routes.
These are used with Depends() to inject services and config into route handlers.

Usage:
    from app.core.dependencies import get_current_user, get_embedding_service_dep

    @router.get("/agents")
    async def list_agents(
        user: dict = Depends(get_current_user),
    ):
        ...
"""

from fastapi import Depends, Request
from supabase import Client

from app.core.config import Settings, get_settings
from app.core.security import get_current_user  # noqa: F401 — re-exported for convenience
from app.core.supabase_client import get_supabase_client


# ── Settings Dependency ───────────────────────────────────────────────────

def get_settings_dep() -> Settings:
    """Dependency wrapper for the cached settings singleton."""
    return get_settings()


# ── Supabase Client Dependency ────────────────────────────────────────────

def get_supabase_dep() -> Client:
    """Dependency wrapper for the cached Supabase client."""
    return get_supabase_client()


# ── Embedding Service Dependency ──────────────────────────────────────────

def get_embedding_service_dep(request: Request):
    """
    Get the pre-loaded embedding service from FastAPI app state.
    The embedding model is loaded during startup (see main.py lifespan).

    Usage:
        @router.post("/upload")
        async def upload(embedding_svc = Depends(get_embedding_service_dep)):
            ...
    """
    return request.app.state.embedding_service
