-- Migration: Create handle_updated_at() Trigger Function
-- Description: Common trigger function for automatically updating updated_at timestamps
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- TRIGGER FUNCTION FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- This is a common PostgreSQL pattern for automatically maintaining updated_at columns.
-- The function is called by triggers on tables that have an updated_at column.
-- When a row is updated, this function automatically sets updated_at to the current timestamp.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the updated_at column to the current timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS 'Trigger function to automatically update updated_at timestamp on row updates';

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================
-- To use this function on a table:
--
-- CREATE TRIGGER set_table_name_updated_at
--   BEFORE UPDATE ON public.table_name
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_updated_at();
