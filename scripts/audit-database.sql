-- Database Security & Performance Audit Script
-- Run this to identify common issues

-- ============================================
-- SECURITY AUDIT
-- ============================================

-- 1. Tables without RLS enabled
SELECT
  schemaname,
  tablename,
  'RLS not enabled' as issue,
  'security' as type,
  'high' as severity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
  AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = schemaname
      AND c.relname = tablename
      AND c.relrowsecurity = true
  )
ORDER BY tablename;

-- 2. Tables with RLS enabled but no policies
SELECT
  t.schemaname,
  t.tablename,
  'RLS enabled but no policies defined' as issue,
  'security' as type,
  'high' as severity
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = t.schemaname
      AND c.relname = t.tablename
      AND c.relrowsecurity = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = t.schemaname
      AND p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- 3. Tables with overly permissive policies (allowing SELECT for anonymous users)
SELECT
  schemaname,
  tablename,
  policyname,
  'Policy allows anonymous access' as issue,
  'security' as type,
  'medium' as severity
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND qual LIKE '%anon%'
ORDER BY tablename, policyname;

-- ============================================
-- PERFORMANCE AUDIT
-- ============================================

-- 4. Tables without primary keys
SELECT
  t.schemaname,
  t.tablename,
  'Missing primary key' as issue,
  'performance' as type,
  'high' as severity
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_class cl ON cl.oid = c.conrelid
    WHERE n.nspname = t.schemaname
      AND cl.relname = t.tablename
      AND c.contype = 'p'
  )
ORDER BY t.tablename;

-- 5. Foreign keys without indexes
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  'Foreign key without index' as issue,
  'performance' as type,
  'medium' as severity
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = tc.table_schema
      AND i.tablename = tc.table_name
      AND i.indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY tc.table_name, kcu.column_name;

-- 6. Tables with high sequential scans (would need pg_stat_user_tables, check if stats exist)
SELECT
  schemaname,
  relname as tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  CASE
    WHEN seq_scan > 0 THEN ROUND((100.0 * seq_scan / NULLIF(seq_scan + COALESCE(idx_scan, 0), 0))::numeric, 2)
    ELSE 0
  END as seq_scan_pct,
  'High sequential scan ratio' as issue,
  'performance' as type,
  'medium' as severity
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 1000
  AND seq_scan > COALESCE(idx_scan, 0) * 2
ORDER BY seq_scan DESC;

-- 7. Unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  'Unused index (0 scans)' as issue,
  'performance' as type,
  'low' as severity,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 8. Missing indexes on commonly filtered columns
-- Check for columns used in WHERE clauses without indexes
-- This is a heuristic check - look for timestamp and status columns
SELECT
  t.schemaname,
  t.tablename,
  c.column_name,
  'Potentially missing index on ' || c.column_name as issue,
  'performance' as type,
  'medium' as severity
FROM information_schema.columns c
JOIN pg_tables t ON t.tablename = c.table_name AND t.schemaname = c.table_schema
WHERE c.table_schema = 'public'
  AND (
    c.column_name IN ('status', 'created_at', 'updated_at', 'deleted_at', 'is_active', 'email')
    OR c.column_name LIKE '%_status'
    OR c.column_name LIKE '%_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = c.table_schema
      AND i.tablename = c.table_name
      AND (
        i.indexdef LIKE '%' || c.column_name || '%'
        OR i.indexdef LIKE '%' || c.column_name || ',%'
      )
  )
ORDER BY t.tablename, c.column_name;

-- Summary counts
SELECT 'SUMMARY' as report;
SELECT 'Total Security Issues' as category, COUNT(*) as count FROM (
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
  AND NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = schemaname AND c.relname = tablename AND c.relrowsecurity = true)
) t;
SELECT 'Total Performance Issues' as category, COUNT(*) as count FROM (
  SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  AND NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace JOIN pg_class cl ON cl.oid = c.conrelid WHERE n.nspname = schemaname AND cl.relname = tablename AND c.contype = 'p')
) t;
