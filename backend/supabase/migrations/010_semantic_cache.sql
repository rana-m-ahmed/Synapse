-- =============================================================================
-- Synapse — Migration 010: Semantic Cache
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.semantic_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    query_embedding vector(384) NOT NULL,
    standalone_query TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INT DEFAULT 1
);

-- Index on agent_id
CREATE INDEX IF NOT EXISTS idx_semantic_cache_agent_id ON public.semantic_cache(agent_id);

-- HNSW vector index for extremely fast lookup
CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding ON public.semantic_cache
    USING hnsw (query_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- RPC for checking semantic cache and updating access stats
CREATE OR REPLACE FUNCTION public.check_semantic_cache(
    query_vec vector(384),
    target_agent_id UUID,
    match_threshold FLOAT DEFAULT 0.95
)
RETURNS TABLE (
    id UUID,
    response TEXT,
    sources JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
    best_match RECORD;
BEGIN
    SELECT 
        c.id, c.response, c.sources, 1 - (c.query_embedding <=> query_vec) AS similarity
    INTO best_match
    FROM public.semantic_cache c
    WHERE c.agent_id = target_agent_id
      AND 1 - (c.query_embedding <=> query_vec) > match_threshold
    ORDER BY c.query_embedding <=> query_vec
    LIMIT 1;

    IF FOUND THEN
        UPDATE public.semantic_cache
        SET last_accessed_at = NOW(), access_count = access_count + 1
        WHERE semantic_cache.id = best_match.id;
        
        RETURN QUERY SELECT best_match.id, best_match.response, best_match.sources, best_match.similarity;
    END IF;
END;
$$;
