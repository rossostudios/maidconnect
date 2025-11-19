-- Verify RLS Policy Optimization
-- Checks if all RLS policies use subquery pattern for auth.*() functions
-- Run this before and after applying the optimization migration

-- ============================================================================
-- 1. CHECK FOR UNOPTIMIZED POLICIES (should return 0 after optimization)
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  'UNOPTIMIZED' AS status,
  pg_get_expr(polqual, polrelid) AS using_expr
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE schemaname = 'public'
  AND (
    -- Find auth.* calls NOT wrapped in subquery
    pg_get_expr(polqual, polrelid) ~ 'auth\.[a-z_]+\(\)'
    AND pg_get_expr(polqual, polrelid) !~ '\(SELECT auth\.[a-z_]+\(\)\)'
  )
  OR (
    -- Check WITH CHECK clause too
    pg_get_expr(polwithcheck, polrelid) ~ 'auth\.[a-z_]+\(\)'
    AND pg_get_expr(polwithcheck, polrelid) !~ '\(SELECT auth\.[a-z_]+\(\)\)'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- 2. LIST ALL OPTIMIZED POLICIES (should show all policies after optimization)
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  'OPTIMIZED' AS status,
  CASE
    WHEN pg_get_expr(polqual, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)' THEN '✅ USING'
    ELSE ''
  END AS using_optimized,
  CASE
    WHEN pg_get_expr(polwithcheck, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)' THEN '✅ WITH CHECK'
    ELSE ''
  END AS with_check_optimized
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE schemaname = 'public'
  AND (
    pg_get_expr(polqual, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)'
    OR pg_get_expr(polwithcheck, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- 3. SUMMARY STATISTICS
-- ============================================================================

WITH policy_stats AS (
  SELECT
    COUNT(*) FILTER (
      WHERE pg_get_expr(polqual, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)'
         OR pg_get_expr(polwithcheck, polrelid) ~ '\(SELECT auth\.[a-z_]+\(\)\)'
    ) AS optimized_count,
    COUNT(*) FILTER (
      WHERE (
        pg_get_expr(polqual, polrelid) ~ 'auth\.[a-z_]+\(\)'
        AND pg_get_expr(polqual, polrelid) !~ '\(SELECT auth\.[a-z_]+\(\)\)'
      )
      OR (
        pg_get_expr(polwithcheck, polrelid) ~ 'auth\.[a-z_]+\(\)'
        AND pg_get_expr(polwithcheck, polrelid) !~ '\(SELECT auth\.[a-z_]+\(\)\)'
      )
    ) AS unoptimized_count,
    COUNT(*) AS total_policies_with_auth
  FROM pg_policy
  JOIN pg_class ON pg_policy.polrelid = pg_class.oid
  JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
  WHERE schemaname = 'public'
    AND (
      pg_get_expr(polqual, polrelid) ~ 'auth\.'
      OR pg_get_expr(polwithcheck, polrelid) ~ 'auth\.'
    )
)
SELECT
  optimized_count AS "✅ Optimized Policies",
  unoptimized_count AS "❌ Unoptimized Policies",
  total_policies_with_auth AS "Total Policies Using auth.*",
  ROUND((optimized_count::numeric / NULLIF(total_policies_with_auth, 0)) * 100, 1) AS "Optimization %"
FROM policy_stats;

-- ============================================================================
-- 4. DETAILED POLICY EXPRESSIONS (for debugging)
-- ============================================================================

-- Uncomment to see full policy expressions:
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   pg_get_expr(polqual, polrelid) AS using_expression,
--   pg_get_expr(polwithcheck, polrelid) AS with_check_expression
-- FROM pg_policy
-- JOIN pg_class ON pg_policy.polrelid = pg_class.oid
-- JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
