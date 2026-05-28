-- =============================================================================
-- Synapse — Migration 001: Enable Required Extensions
-- =============================================================================
-- Run this FIRST in Supabase SQL Editor.
-- Enables pgvector for embedding storage and uuid-ossp for UUID generation.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
