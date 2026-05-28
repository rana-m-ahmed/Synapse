-- 1. Enable pg_cron extension (Supabase supports this natively)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule Daily Routine VACUUM (Runs at 2:00 AM every day)
-- This cleans up dead tuples and updates table statistics for the query planner.
SELECT cron.schedule(
  'daily-document-chunks-vacuum',
  '0 2 * * *',
  $$VACUUM ANALYZE public.document_chunks;$$
);

-- 3. Schedule Weekly Aggressive Index Compaction (Runs at 3:00 AM every Sunday)
-- This specifically rebuilds the bloat-heavy HNSW and GIN indexes, completely stripping dead nodes and reclaiming disk space.
SELECT cron.schedule(
  'weekly-hnsw-index-rebuild',
  '0 3 * * 0',
  $$REINDEX INDEX public.idx_chunks_embedding;$$
);

SELECT cron.schedule(
  'weekly-gin-index-rebuild',
  '5 3 * * 0',
  $$REINDEX INDEX public.idx_chunks_fts;$$
);
