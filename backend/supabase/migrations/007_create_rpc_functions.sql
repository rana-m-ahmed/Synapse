-- =============================================================================
-- Synapse — Migration 007: Create RPC Functions
-- =============================================================================
-- PostgreSQL functions called via Supabase's .rpc() method.
-- These encapsulate complex queries that can't be expressed through PostgREST.
-- =============================================================================

-- ── match_chunks ─────────────────────────────────────────────────────────
-- Performs cosine similarity search on document chunks, scoped to a specific agent.
-- Called by the RAG pipeline to find relevant context for a user's question.
--
-- Usage (Python):
--   supabase.rpc("match_chunks", {
--       "query_embedding": [0.1, 0.2, ...],  # 384-dim vector
--       "target_agent_id": "uuid-here",
--       "match_threshold": 0.3,
--       "match_count": 5
--   }).execute()

CREATE OR REPLACE FUNCTION public.match_chunks(
    query_embedding vector(384),
    target_agent_id UUID,
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    document_id UUID,
    chunk_index INT,
    similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        dc.id,
        dc.content,
        dc.metadata,
        dc.document_id,
        dc.chunk_index,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE dc.agent_id = target_agent_id
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ── get_agent_stats ──────────────────────────────────────────────────────
-- Returns aggregate statistics for a single agent's dashboard.
-- Computes total conversations, total messages, and average messages per conversation.

CREATE OR REPLACE FUNCTION public.get_agent_stats(target_agent_id UUID)
RETURNS TABLE (
    total_conversations BIGINT,
    total_messages BIGINT,
    avg_messages_per_conversation NUMERIC
)
LANGUAGE sql STABLE
AS $$
    SELECT
        (SELECT COUNT(*) FROM public.conversations WHERE agent_id = target_agent_id) AS total_conversations,
        (SELECT COUNT(*) FROM public.messages m
         JOIN public.conversations c ON c.id = m.conversation_id
         WHERE c.agent_id = target_agent_id) AS total_messages,
        COALESCE(
            (SELECT AVG(c.message_count)::NUMERIC(10, 1)
             FROM public.conversations c
             WHERE c.agent_id = target_agent_id AND c.message_count > 0),
            0
        ) AS avg_messages_per_conversation;
$$;


-- ── get_hourly_activity ──────────────────────────────────────────────────
-- Returns message counts grouped by hour of day for the last N days.
-- Used for the "busiest hours" chart on the analytics dashboard.

CREATE OR REPLACE FUNCTION public.get_hourly_activity(
    target_agent_id UUID,
    days_back INT DEFAULT 7
)
RETURNS TABLE (
    hour INT,
    message_count BIGINT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        EXTRACT(HOUR FROM m.created_at)::INT AS hour,
        COUNT(*) AS message_count
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE c.agent_id = target_agent_id
      AND m.created_at >= NOW() - (days_back || ' days')::INTERVAL
      AND m.role = 'user'
    GROUP BY EXTRACT(HOUR FROM m.created_at)
    ORDER BY hour;
$$;


-- ── get_daily_conversations ──────────────────────────────────────────────
-- Returns conversation counts per day for the last N days.
-- Used for the "conversation trend" chart on the analytics dashboard.

CREATE OR REPLACE FUNCTION public.get_daily_conversations(
    target_agent_id UUID,
    days_back INT DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    conversation_count BIGINT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        DATE(started_at) AS date,
        COUNT(*) AS conversation_count
    FROM public.conversations
    WHERE agent_id = target_agent_id
      AND started_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY DATE(started_at)
    ORDER BY date;
$$;
