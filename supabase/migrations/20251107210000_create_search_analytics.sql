-- ============================================================================
-- Migration: Create search analytics tracking
-- Description: Track help center searches for content optimization
-- Author: Help Center Improvements Sprint 1
-- Date: 2025-11-07
-- ============================================================================

-- CRITICAL: This migration enables tracking of help center searches to:
--   1. Understand what users are searching for
--   2. Identify content gaps (no-result searches)
--   3. Measure search effectiveness (click-through rates)
--   4. Optimize content based on actual user needs
--
-- Analytics functions provide:
--   - get_top_searches(): Most searched queries with click rates
--   - get_no_result_searches(): Queries returning 0 results (content gaps)

-- ============================================================================
-- 1. Analytics Table
-- ============================================================================

CREATE TABLE public.help_search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  result_count integer NOT NULL,
  clicked_article_id uuid REFERENCES public.help_articles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT help_search_analytics_locale_check CHECK (locale IN ('en', 'es')),
  CONSTRAINT help_search_analytics_result_count_check CHECK (result_count >= 0)
);

-- ============================================================================
-- 2. Indexes for Analytics Queries
-- ============================================================================

-- For finding popular searches
CREATE INDEX idx_search_analytics_query ON public.help_search_analytics(query);
CREATE INDEX idx_search_analytics_created ON public.help_search_analytics(created_at DESC);

-- For finding no-result searches (content gaps)
CREATE INDEX idx_search_analytics_no_results
  ON public.help_search_analytics(result_count)
  WHERE result_count = 0;

-- For locale-specific analytics
CREATE INDEX idx_search_analytics_locale ON public.help_search_analytics(locale);

-- For measuring click-through rates
CREATE INDEX idx_search_analytics_clicked
  ON public.help_search_analytics(clicked_article_id)
  WHERE clicked_article_id IS NOT NULL;

-- ============================================================================
-- 3. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.help_search_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can view search analytics
CREATE POLICY "Admins can view search analytics"
  ON public.help_search_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. Analytics Functions
-- ============================================================================

-- Function: Get top searches with metrics
CREATE OR REPLACE FUNCTION public.get_top_searches(
  days_back integer DEFAULT 30,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  query text,
  search_count bigint,
  avg_results numeric,
  click_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hsa.query,
    COUNT(*) as search_count,
    ROUND(AVG(hsa.result_count)::numeric, 1) as avg_results,
    ROUND(
      (COUNT(hsa.clicked_article_id)::numeric / COUNT(*)::numeric * 100),
      1
    ) as click_rate
  FROM public.help_search_analytics hsa
  WHERE hsa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY hsa.query
  HAVING COUNT(*) > 1  -- Ignore single searches (noise)
  ORDER BY search_count DESC
  LIMIT limit_count;
END;
$$;

-- Function: Get no-result searches (content gaps)
CREATE OR REPLACE FUNCTION public.get_no_result_searches(
  days_back integer DEFAULT 7,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  query text,
  search_count bigint,
  last_searched timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hsa.query,
    COUNT(*) as search_count,
    MAX(hsa.created_at) as last_searched
  FROM public.help_search_analytics hsa
  WHERE
    hsa.result_count = 0
    AND hsa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY hsa.query
  ORDER BY search_count DESC, last_searched DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 5. Comments
-- ============================================================================

COMMENT ON TABLE public.help_search_analytics IS
  'Tracks help center search queries for analytics and content gap analysis. Used to understand user needs and optimize content.';

COMMENT ON COLUMN public.help_search_analytics.query IS
  'The search query entered by the user';

COMMENT ON COLUMN public.help_search_analytics.result_count IS
  'Number of results returned for this search';

COMMENT ON COLUMN public.help_search_analytics.clicked_article_id IS
  'Article that was clicked from search results (NULL if no click)';

COMMENT ON COLUMN public.help_search_analytics.user_id IS
  'Authenticated user ID (NULL for anonymous)';

COMMENT ON COLUMN public.help_search_analytics.session_id IS
  'Anonymous session ID (NULL for authenticated users)';

COMMENT ON FUNCTION public.get_top_searches IS
  'Returns most searched queries with click-through rates for content optimization';

COMMENT ON FUNCTION public.get_no_result_searches IS
  'Returns queries that returned zero results - indicates content gaps that should be filled';

-- ============================================================================
-- Migration Summary
-- ============================================================================
-- Tables created: 1 (help_search_analytics)
-- Indexes created: 5 (query, created_at, no_results, locale, clicked)
-- Functions created: 2 (get_top_searches, get_no_result_searches)
-- RLS policies: 1 (admin-only access)
--
-- Usage:
--   - Search tracking is automatic via frontend
--   - View top searches: SELECT * FROM get_top_searches(30, 10);
--   - View content gaps: SELECT * FROM get_no_result_searches(7, 20);
