-- Migration: Drop Duplicate Indexes
-- Description: Removes redundant indexes identified by Supabase linter
-- Fixes: 8 duplicate_index warnings from performance-warning.json
-- Date: 2025-11-19

-- This migration is SAFE because:
-- 1. Uses DROP INDEX IF EXISTS for safety
-- 2. Only drops redundant indexes (keeps one from each duplicate set)
-- 3. Query performance remains identical after migration

BEGIN;

-- ============================================================================
-- BOOKING_ADDONS TABLE
-- ============================================================================
-- Keep: idx_booking_addons_booking_id
-- Drop: idx_booking_addons_booking

DROP INDEX IF EXISTS idx_booking_addons_booking;

-- ============================================================================
-- BOOKINGS TABLE (4 duplicate sets)
-- ============================================================================

-- Set 1: Created at timestamp indexes
-- Keep: idx_bookings_created_at
-- Drop: bookings_created_at_idx
DROP INDEX IF EXISTS bookings_created_at_idx;

-- Set 2: Customer ID indexes
-- Keep: idx_bookings_customer_id
-- Drop: idx_bookings_customer, idx_bookings_customer_id_rls
DROP INDEX IF EXISTS idx_bookings_customer;
DROP INDEX IF EXISTS idx_bookings_customer_id_rls;

-- Set 3: Professional ID indexes
-- Keep: idx_bookings_professional_id
-- Drop: idx_bookings_professional, idx_bookings_professional_id_rls
DROP INDEX IF EXISTS idx_bookings_professional;
DROP INDEX IF EXISTS idx_bookings_professional_id_rls;

-- Set 4: Status indexes
-- Keep: idx_bookings_status
-- Drop: bookings_status_idx
DROP INDEX IF EXISTS bookings_status_idx;

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Keep: idx_messages_sender_id
-- Drop: idx_messages_sender

DROP INDEX IF EXISTS idx_messages_sender;

-- ============================================================================
-- PROFESSIONAL_REVIEWS TABLE
-- ============================================================================
-- Keep: idx_professional_reviews_pro_created (more descriptive, composite index)
-- Drop: idx_professional_reviews_by_pro

DROP INDEX IF EXISTS idx_professional_reviews_by_pro;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Keep: idx_profiles_role
-- Drop: profiles_role_idx

DROP INDEX IF EXISTS profiles_role_idx;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY (run after migration to verify no performance regression)
-- ============================================================================
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_indexes
-- JOIN pg_class ON pg_indexes.indexname = pg_class.relname
-- WHERE schemaname = 'public'
--   AND tablename IN ('booking_addons', 'bookings', 'messages', 'professional_reviews', 'profiles')
-- ORDER BY tablename, indexname;
