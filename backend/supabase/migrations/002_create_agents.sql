-- =============================================================================
-- Synapse — Migration 002: Create Agents Table
-- =============================================================================
-- Each business user can create multiple AI agents. Each agent has its own
-- knowledge base, widget configuration, and conversation history.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,                              -- references auth.users(id)
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
    accent_color    VARCHAR(7) DEFAULT '#4F46E5',               -- hex color for widget
    fallback_message TEXT DEFAULT 'I don''t have information on that. Please contact our support team for assistance.',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup: list all agents for a specific user
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);

COMMENT ON TABLE public.agents IS 'AI support agents created by business users. Each agent has isolated knowledge and config.';
COMMENT ON COLUMN public.agents.user_id IS 'Owner of this agent — matches auth.users.id from Supabase Auth.';
COMMENT ON COLUMN public.agents.accent_color IS 'Hex color code used in the embeddable chat widget.';
COMMENT ON COLUMN public.agents.fallback_message IS 'Response when the AI cannot find relevant information in the knowledge base.';
