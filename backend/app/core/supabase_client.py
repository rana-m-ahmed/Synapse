"""
Synapse Backend — Supabase Client
==================================
Singleton Supabase client initialized with the service_role key.
This key bypasses Row Level Security (RLS), which is necessary for
server-side operations like storing embeddings and managing data
across all users.

Usage:
    from app.core.supabase_client import get_supabase_client
    client = get_supabase_client()
    data = client.table("agents").select("*").execute()
"""

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Create and cache a Supabase client using the service_role key.

    The service_role key has full access to all tables and bypasses RLS.
    This is intentional — the backend is the trusted server that enforces
    access control via JWT verification + ownership checks in the service layer.
    """
    settings = get_settings()
    client = create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    return client
