-- =============================================================================
-- Synapse — Migration 009: Hybrid Search
-- =============================================================================

-- 1. Add fts column to document_chunks
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS fts tsvector;

-- 2. Update existing rows
UPDATE public.document_chunks SET fts = to_tsvector('english', content) WHERE fts IS NULL;

-- 3. Create index for FTS
CREATE INDEX IF NOT EXISTS idx_chunks_fts ON public.document_chunks USING gin (fts);

-- 4. Create trigger to automatically update FTS on insert/update
CREATE OR REPLACE FUNCTION public.document_chunks_fts_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts := to_tsvector('english', NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_document_chunks_fts ON public.document_chunks;
CREATE TRIGGER trg_document_chunks_fts
BEFORE INSERT OR UPDATE OF content ON public.document_chunks
FOR EACH ROW
EXECUTE FUNCTION public.document_chunks_fts_update();

-- 5. Create hybrid search RPC (Vector + BM25 using Reciprocal Rank Fusion)
CREATE OR REPLACE FUNCTION public.match_chunks_hybrid(
    query_text TEXT,
    query_embedding vector(384),
    target_agent_id UUID,
    match_count INT DEFAULT 5,
    full_text_weight FLOAT DEFAULT 1.0,
    semantic_weight FLOAT DEFAULT 1.0,
    rrf_k INT DEFAULT 60
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
WITH semantic_search AS (
    SELECT
        dc.id,
        1 - (dc.embedding <=> query_embedding) AS semantic_score,
        ROW_NUMBER() OVER (ORDER BY dc.embedding <=> query_embedding) AS rank
    FROM public.document_chunks dc
    WHERE dc.agent_id = target_agent_id
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count * 2
),
keyword_search AS (
    SELECT
        dc.id,
        ts_rank(dc.fts, websearch_to_tsquery('english', query_text)) AS fts_score,
        ROW_NUMBER() OVER (ORDER BY ts_rank(dc.fts, websearch_to_tsquery('english', query_text)) DESC) AS rank
    FROM public.document_chunks dc
    WHERE dc.agent_id = target_agent_id
      AND dc.fts @@ websearch_to_tsquery('english', query_text)
    ORDER BY fts_score DESC
    LIMIT match_count * 2
)
SELECT
    dc.id,
    dc.content,
    dc.metadata,
    dc.document_id,
    dc.chunk_index,
    (
        COALESCE(semantic_weight / (rrf_k + ss.rank), 0.0) +
        COALESCE(full_text_weight / (rrf_k + ks.rank), 0.0)
    ) AS similarity
FROM semantic_search ss
FULL OUTER JOIN keyword_search ks ON ss.id = ks.id
JOIN public.document_chunks dc ON dc.id = COALESCE(ss.id, ks.id)
ORDER BY similarity DESC
LIMIT match_count;
$$;
