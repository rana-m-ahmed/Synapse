-- =============================================================================
-- Synapse — Migration 005: Create Conversations Table
-- =============================================================================
-- Tracks chat sessions between website visitors and AI agents.
-- A conversation is identified by (agent_id, session_id) — the session_id
-- is generated client-side so the same visitor can resume their conversation.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    session_id      VARCHAR(100) NOT NULL,                      -- browser-generated session identifier
    visitor_ip      VARCHAR(45),                                -- IPv4 or IPv6, for analytics only
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    message_count   INTEGER DEFAULT 0,
    is_resolved     BOOLEAN DEFAULT false
);

-- List conversations for a specific agent (dashboard view)
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);

-- Sort conversations by most recent activity
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- Unique constraint: one conversation per (agent, session) pair
-- This prevents duplicate conversations if the same visitor reconnects
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_agent_session
    ON public.conversations(agent_id, session_id);

COMMENT ON TABLE public.conversations IS 'Chat sessions between website visitors and AI agents.';
COMMENT ON COLUMN public.conversations.session_id IS 'Client-generated ID stored in localStorage. Enables conversation resumption.';
