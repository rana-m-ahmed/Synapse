-- =============================================================================
-- Synapse — Migration 008: Create Additional Indexes
-- =============================================================================
-- Performance indexes for analytics queries and common access patterns.
-- Run this last, after all tables are created.
-- =============================================================================

-- Analytics: efficiently count user messages over time ranges
CREATE INDEX IF NOT EXISTS idx_messages_user_analytics
    ON public.messages(created_at)
    WHERE role = 'user';

-- Composite index: list conversations for an agent sorted by most recent
CREATE INDEX IF NOT EXISTS idx_conversations_agent_time
    ON public.conversations(agent_id, last_message_at DESC);

-- Document chunks: composite index for document-scoped queries (e.g., counting chunks)
CREATE INDEX IF NOT EXISTS idx_chunks_doc_order
    ON public.document_chunks(document_id, chunk_index);
