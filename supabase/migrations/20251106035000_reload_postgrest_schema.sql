-- Migration: Reload PostgREST Schema Cache
-- Description: Forces PostgREST to refresh its schema cache to recognize new RPC functions
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- RELOAD POSTGREST SCHEMA CACHE
-- ============================================================================

-- This NOTIFY command tells PostgREST to reload its schema cache
-- Required after creating new functions, views, or making schema changes
-- Reference: https://postgrest.org/en/stable/schema_cache.html

SELECT pg_notify('pgrst', 'reload schema');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify that our RPC functions exist
DO $$
BEGIN
  -- Check if list_active_professionals exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'list_active_professionals'
  ) THEN
    RAISE EXCEPTION 'Function list_active_professionals not found';
  END IF;

  -- Check if get_professional_profile exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'get_professional_profile'
  ) THEN
    RAISE EXCEPTION 'Function get_professional_profile not found';
  END IF;

  RAISE NOTICE 'Both RPC functions exist. Schema cache reload triggered.';
END $$;
