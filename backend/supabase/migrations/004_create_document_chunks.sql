-- =============================================================================
-- Synapse — Migration 004: Create Document Chunks Table
-- =============================================================================
-- Stores text chunks with their vector embeddings.
-- This is the core table for the RAG pipeline — similarity search happens here.
-- Uses pgvector's HNSW index for fast approximate nearest-neighbor search.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    agent_id        UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,                               -- the actual text chunk
    chunk_index     INTEGER NOT NULL,                            -- position within the source document
    metadata        JSONB DEFAULT '{}',                          -- page number, source filename, sheet name, etc.
    embedding       vector(384) NOT NULL,                        -- all-MiniLM-L6-v2 produces 384-dim vectors
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Scope vector search to a specific agent's knowledge base
CREATE INDEX IF NOT EXISTS idx_chunks_agent_id ON public.document_chunks(agent_id);

-- Fast cascading deletes when a document is removed
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON public.document_chunks(document_id);

-- HNSW vector index for fast approximate nearest-neighbor search
-- Using cosine similarity (vector_cosine_ops) to match normalized embeddings.
-- Parameters:
--   m = 16 : number of bi-directional links per node (higher = more accurate, more memory)
--   ef_construction = 64 : size of the dynamic candidate list during index construction
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.document_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

COMMENT ON TABLE public.document_chunks IS 'Text chunks with vector embeddings for RAG similarity search.';
COMMENT ON COLUMN public.document_chunks.embedding IS '384-dimensional vector from all-MiniLM-L6-v2. Indexed with HNSW for cosine similarity search.';
COMMENT ON COLUMN public.document_chunks.metadata IS 'JSON metadata: {page_number, source_file, sheet_name, ...}';
