-- =============================================================================
-- Synapse — Migration 013: Add User Cascade Deletes
-- =============================================================================
-- This migration enforces database-level referential integrity between
-- Supabase Auth users and their created records in the public schema.
-- When a user is deleted from auth.users, all their agents and documents
-- will be automatically cascade deleted (which in turn cascades to chunks and conversations).
-- =============================================================================

-- 0. Clean up existing orphaned records first
-- This is necessary if users were deleted before this constraint existed.
DELETE FROM public.agents 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.documents 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 1. Add cascade delete constraint to agents table
ALTER TABLE public.agents
    ADD CONSTRAINT agents_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 2. Add cascade delete constraint to the denormalized user_id in documents table
ALTER TABLE public.documents
    ADD CONSTRAINT documents_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
