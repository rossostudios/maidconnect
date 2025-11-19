-- =====================================================
-- STANDALONE SCRIPT: Vacuum Tables After Index Cleanup
-- =====================================================
-- Purpose: Reclaim space and update statistics after dropping unused indexes
-- Impact: Improved query performance, reclaimed disk space
--
-- IMPORTANT: This script MUST be run OUTSIDE a transaction block
-- Execute via:
--   1. Supabase Dashboard → SQL Editor → Paste & Run
--   2. psql command line (not via migration)
--
-- DO NOT run via: supabase db push (will fail in transaction)
--
-- TIMING: Run this AFTER drop_unused_indexes.sql completes
-- =====================================================

-- ===========================================
-- VACUUM TABLES TO RECLAIM SPACE
-- ===========================================
-- Run VACUUM ANALYZE on tables with dropped indexes
-- This reclaims dead tuple space and updates query planner statistics

VACUUM ANALYZE public.profiles;
VACUUM ANALYZE public.professional_profiles;
VACUUM ANALYZE public.help_articles;
VACUUM ANALYZE public.bookings;
VACUUM ANALYZE public.customer_reviews;

-- ===========================================
-- SCRIPT COMPLETE
-- ===========================================
-- Summary: Vacuumed 5 core tables
-- Expected Duration: 1-5 minutes
-- Safe for production: Yes (VACUUM is non-blocking)
-- ===========================================
