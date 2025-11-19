-- ============================================================================
-- Migration: Help Center Diagnostic & Fix
-- Description: Ensure help_articles and help_categories have proper RLS policies
-- Author: Help Center Troubleshooting
-- Date: 2025-11-08
-- ============================================================================

-- CRITICAL: This migration ensures help center articles are visible to anonymous users
-- and fixes common issues preventing article display

-- ============================================================================
-- 1. Verify Tables Exist (Check)
-- ============================================================================

-- Check if help_articles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'help_articles') THEN
    RAISE EXCEPTION 'help_articles table does not exist! Please create it first.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'help_categories') THEN
    RAISE EXCEPTION 'help_categories table does not exist! Please create it first.';
  END IF;
END $$;

-- ============================================================================
-- 2. Enable RLS (if not already enabled)
-- ============================================================================

ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Drop Existing Policies (to recreate fresh)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.help_articles;
DROP POLICY IF EXISTS "Anon can read published help articles" ON public.help_articles;
DROP POLICY IF EXISTS "Public can view published articles" ON public.help_articles;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.help_categories;
DROP POLICY IF EXISTS "Anon can read categories" ON public.help_categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.help_categories;

-- ============================================================================
-- 4. Create Public READ Policies for Articles
-- ============================================================================

-- CRITICAL: Allow anonymous (unauthenticated) users to read PUBLISHED articles
CREATE POLICY "Public can view published articles"
  ON public.help_articles
  FOR SELECT
  TO public  -- This includes both 'anon' and 'authenticated' roles
  USING (is_published = true);

-- Allow admins to view ALL articles (including drafts)
CREATE POLICY "Admins can view all articles"
  ON public.help_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR is_published = true  -- Fallback to published for non-admins
  );

-- Allow admins to manage articles
CREATE POLICY "Admins can manage articles"
  ON public.help_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. Create Public READ Policies for Categories
-- ============================================================================

-- CRITICAL: Allow everyone to view ACTIVE categories
CREATE POLICY "Public can view active categories"
  ON public.help_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow admins to view ALL categories
CREATE POLICY "Admins can view all categories"
  ON public.help_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR is_active = true
  );

-- Allow admins to manage categories
CREATE POLICY "Admins can manage categories"
  ON public.help_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 6. Grant Permissions
-- ============================================================================

-- Grant SELECT to public (anon role)
GRANT SELECT ON public.help_articles TO anon;
GRANT SELECT ON public.help_categories TO anon;

-- Grant SELECT to authenticated users
GRANT SELECT ON public.help_articles TO authenticated;
GRANT SELECT ON public.help_categories TO authenticated;

-- ============================================================================
-- 7. Create Diagnostic Function
-- ============================================================================

-- Function to check help center configuration
CREATE OR REPLACE FUNCTION public.diagnose_help_center()
RETURNS TABLE (
  check_name text,
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  article_count integer;
  category_count integer;
  published_count integer;
  rls_enabled_articles boolean;
  rls_enabled_categories boolean;
BEGIN
  -- Check article counts
  SELECT COUNT(*) INTO article_count FROM public.help_articles;
  SELECT COUNT(*) INTO category_count FROM public.help_categories;
  SELECT COUNT(*) INTO published_count FROM public.help_articles WHERE is_published = true;

  -- Check RLS status
  SELECT relrowsecurity INTO rls_enabled_articles
  FROM pg_class
  WHERE oid = 'public.help_articles'::regclass;

  SELECT relrowsecurity INTO rls_enabled_categories
  FROM pg_class
  WHERE oid = 'public.help_categories'::regclass;

  -- Return diagnostic results
  RETURN QUERY
  SELECT 'Total Articles'::text, 'INFO'::text, article_count::text;

  RETURN QUERY
  SELECT 'Published Articles'::text,
         CASE WHEN published_count > 0 THEN 'OK' ELSE 'WARNING' END::text,
         published_count::text || ' articles';

  RETURN QUERY
  SELECT 'Total Categories'::text, 'INFO'::text, category_count::text;

  RETURN QUERY
  SELECT 'RLS on Articles'::text,
         CASE WHEN rls_enabled_articles THEN 'OK' ELSE 'ERROR' END::text,
         CASE WHEN rls_enabled_articles THEN 'Enabled' ELSE 'DISABLED - Articles are NOT protected!' END::text;

  RETURN QUERY
  SELECT 'RLS on Categories'::text,
         CASE WHEN rls_enabled_categories THEN 'OK' ELSE 'ERROR' END::text,
         CASE WHEN rls_enabled_categories THEN 'Enabled' ELSE 'DISABLED - Categories are NOT protected!' END::text;

  -- Check for articles without categories
  RETURN QUERY
  SELECT 'Orphaned Articles'::text,
         CASE WHEN EXISTS (
           SELECT 1 FROM public.help_articles a
           LEFT JOIN public.help_categories c ON a.category_id = c.id
           WHERE c.id IS NULL
         ) THEN 'WARNING' ELSE 'OK' END::text,
         COALESCE(
           (SELECT COUNT(*)::text || ' articles without valid category'
            FROM public.help_articles a
            LEFT JOIN public.help_categories c ON a.category_id = c.id
            WHERE c.id IS NULL),
           'All articles have valid categories'
         );
END;
$$;

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON FUNCTION public.diagnose_help_center IS
  'Diagnostic function to check help center configuration and identify issues. Run: SELECT * FROM diagnose_help_center();';

-- ============================================================================
-- Migration Summary
-- ============================================================================
-- Actions performed:
--   1. Verified help_articles and help_categories tables exist
--   2. Enabled RLS on both tables
--   3. Created public SELECT policies for anonymous users (critical fix)
--   4. Created admin policies for managing content
--   5. Granted explicit SELECT permissions to anon and authenticated roles
--   6. Created diagnostic function for troubleshooting
--
-- To verify the fix:
--   SELECT * FROM public.diagnose_help_center();
--
-- To test anonymous access:
--   1. In Supabase SQL Editor, toggle "RLS Authenticated" OFF
--   2. Run: SELECT * FROM help_articles WHERE is_published = true;
--   3. You should see published articles
--
