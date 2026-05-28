"""
Synapse Backend — Database Models
====================================
TypedDict definitions that mirror the Supabase database tables.
These are NOT ORM models — they're type annotations for the dicts
returned by Supabase's PostgREST client.

Using TypedDicts instead of ORMs because:
1. Supabase's Python client returns plain dicts
2. No SQLAlchemy dependency needed
3. Still get type checking and IDE autocompletion
"""

from typing import Optional, TypedDict


class AgentRow(TypedDict):
    """Mirrors the public.agents table."""
    id: str
    user_id: str
    name: str
    description: Optional[str]
    welcome_message: str
    accent_color: str
    fallback_message: str
    is_active: bool
    created_at: str
    updated_at: str


class DocumentRow(TypedDict):
    """Mirrors the public.documents table."""
    id: str
    agent_id: str
    user_id: str
    file_name: str
    file_type: str
    file_size_bytes: Optional[int]
    storage_path: Optional[str]
    status: str                      # 'uploading' | 'processing' | 'ready' | 'failed'
    chunk_count: int
    error_message: Optional[str]
    created_at: str
    updated_at: str


class DocumentChunkRow(TypedDict):
    """Mirrors the public.document_chunks table."""
    id: str
    document_id: str
    agent_id: str
    content: str
    chunk_index: int
    metadata: dict
    embedding: list[float]
    created_at: str


class ConversationRow(TypedDict):
    """Mirrors the public.conversations table."""
    id: str
    agent_id: str
    session_id: str
    visitor_ip: Optional[str]
    started_at: str
    last_message_at: str
    message_count: int
    is_resolved: bool


class MessageRow(TypedDict):
    """Mirrors the public.messages table."""
    id: str
    conversation_id: str
    role: str                        # 'user' | 'assistant'
    content: str
    sources: list
    created_at: str


class ChunkSearchResult(TypedDict):
    """Result from the match_chunks RPC function."""
    id: str
    content: str
    metadata: dict
    document_id: str
    chunk_index: int
    similarity: float
