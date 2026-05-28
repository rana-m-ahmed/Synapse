-- =============================================================================
-- Synapse — Migration 006: Create Messages Table
-- =============================================================================
-- Individual messages within a conversation. Both user and assistant messages
-- are stored here. Assistant messages include source references (which chunks
-- were used to generate the answer).
-- =============================================================================

-- Enum: message sender role
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         TEXT NOT NULL,
    sources         JSONB DEFAULT '[]',                         -- [{document_name, chunk_preview, similarity}]
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fetch messages for a conversation (chronological order)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Analytics: time-based message queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

COMMENT ON TABLE public.messages IS 'Individual chat messages within a conversation.';
COMMENT ON COLUMN public.messages.sources IS 'JSON array of source references used to generate assistant responses.';
