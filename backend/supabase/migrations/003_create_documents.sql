-- =============================================================================
-- Synapse — Migration 003: Create Documents Table
-- =============================================================================
-- Tracks uploaded knowledge base files. Each document belongs to one agent.
-- Status transitions: uploading → processing → ready | failed
-- =============================================================================

-- Enum: document processing status
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('uploading', 'processing', 'ready', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Enum: supported file types
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('pdf', 'docx', 'txt', 'csv', 'xlsx', 'url', 'text_paste');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,                              -- denormalized for fast ownership checks
    file_name       VARCHAR(255) NOT NULL,
    file_type       document_type NOT NULL,
    file_size_bytes INTEGER,
    storage_path    TEXT,                                        -- path in Supabase Storage bucket
    status          document_status DEFAULT 'uploading',
    chunk_count     INTEGER DEFAULT 0,
    error_message   TEXT,                                       -- populated when status = 'failed'
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- List documents belonging to a specific agent
CREATE INDEX IF NOT EXISTS idx_documents_agent_id ON public.documents(agent_id);
-- Filter documents by processing status (e.g., show "processing" docs in UI)
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

COMMENT ON TABLE public.documents IS 'Knowledge base files uploaded by users. Each document is parsed, chunked, and embedded.';
COMMENT ON COLUMN public.documents.storage_path IS 'Path within the Supabase Storage "documents" bucket.';
COMMENT ON COLUMN public.documents.chunk_count IS 'Number of text chunks generated from this document after processing.';
