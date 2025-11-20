-- =====================================================
-- Database Optimization: Enable Query Monitoring
-- =====================================================
-- Purpose: Enable pg_stat_statements for query performance tracking
-- Impact: Allows monitoring of query execution statistics
--
-- NOTE: Index drops and VACUUM are in separate scripts:
-- - supabase/scripts/drop_unused_indexes.sql
-- - supabase/scripts/vacuum_tables.sql
-- Both must be run manually via Supabase SQL Editor
-- (cannot run CONCURRENTLY or VACUUM in migration transactions)
-- =====================================================

-- ===========================================
-- ENABLE pg_stat_statements FOR MONITORING
-- ===========================================

-- Enable query performance tracking extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

COMMENT ON EXTENSION pg_stat_statements IS 'Track execution statistics for all SQL statements';

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- Summary:
-- ✅ Enabled pg_stat_statements for query monitoring
--
-- Next Steps:
-- 1. Run supabase/scripts/drop_unused_indexes.sql via SQL Editor
-- 2. Wait 10-30 minutes for index drops to complete
-- 3. Run supabase/scripts/vacuum_tables.sql via SQL Editor
-- 4. Verify improvements with: supabase inspect db index-stats
-- ===========================================
