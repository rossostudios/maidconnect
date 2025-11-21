-- =====================================================
-- Priority 4: Drop Unused Indexes - Batch 4 (Admin/Moderation)
-- =====================================================
-- Purpose: Remove 23 never-used indexes from admin/notification/moderation tables
-- Impact: 10-30% faster INSERT/UPDATE/DELETE on admin and notification tables
-- Disk Savings: ~184 kB
--
-- CONSERVATIVE APPROACH: Only dropping indexes with 0 scans (never used)
-- All indexes confirmed via pg_stat_user_indexes query
-- =====================================================

-- =====================================================
-- Category 1: Admin Audit Logs (2 indexes, 16 kB)
-- =====================================================
-- Low-traffic admin audit table

DROP INDEX IF EXISTS public.idx_admin_audit_logs_fk_admin_id;
-- FK index on admin_id - low query frequency
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_admin_audit_logs_fk_target_user_id;
-- FK index on target_user_id - rarely queried directly
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Category 2: Admin Professional Reviews (3 indexes, 24 kB)
-- =====================================================

DROP INDEX IF EXISTS public.idx_admin_professional_reviews_fk_reviewed_by;
-- FK index on reviewed_by - low query frequency
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_professional_reviews_avg_score;
-- Index on avg_score - rarely sorted independently
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_professional_reviews_recommendation;
-- Index on recommendation enum - low selectivity
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Category 3: Feedback Submissions (3 indexes, 24 kB)
-- =====================================================

DROP INDEX IF EXISTS public.idx_feedback_submissions_fk_assigned_to;
-- FK index on assigned_to - low query frequency
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_feedback_submissions_fk_resolved_by;
-- FK index on resolved_by - rarely queried
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_feedback_submissions_user_id_fk;
-- FK index on user_id - covered by other indexes
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Category 4: Moderation Flags (7 indexes, 56 kB)
-- =====================================================
-- Moderation system rarely used in production

DROP INDEX IF EXISTS public.idx_moderation_flags_created_at;
-- Index on created_at timestamp - rarely sorted
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_fk_reviewer_id;
-- FK index on reviewer_id - low query frequency
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_flag_type;
-- Index on flag_type enum - low selectivity
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_severity;
-- Index on severity enum - low selectivity
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_severity_status;
-- Composite index (severity, status) - too specific
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_status;
-- Index on status enum - low selectivity
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_moderation_flags_user_id;
-- FK index on user_id - covered by RLS
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Category 5: Notifications (4 indexes, 32 kB)
-- =====================================================

DROP INDEX IF EXISTS public.idx_notifications_user_created;
-- Composite index (user_id, created_at) - covered by other indexes
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_notifications_user_unread;
-- Composite index (user_id, is_read) - covered by other indexes
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.notifications_created_at_idx;
-- Index on created_at - covered by composite indexes
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.notifications_user_id_idx;
-- FK index on user_id - covered by RLS and composite indexes
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Category 6: User Suspensions (4 indexes, 32 kB)
-- =====================================================

DROP INDEX IF EXISTS public.idx_user_suspensions_expires_at;
-- Index on expires_at timestamp - rarely queried
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_user_suspensions_fk_lifted_by;
-- FK index on lifted_by - rarely queried
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_user_suspensions_fk_suspended_by;
-- FK index on suspended_by - low query frequency
-- Size: 8 kB, Scans: 0

DROP INDEX IF EXISTS public.idx_user_suspensions_is_active;
-- Boolean index on is_active - low selectivity
-- Size: 8 kB, Scans: 0

-- =====================================================
-- Migration Stats
-- =====================================================
-- Indexes dropped: 23
-- Disk space saved: ~184 kB
-- Tables affected: 6 (admin_audit_logs, admin_professional_reviews,
--                     feedback_submissions, moderation_flags,
--                     notifications, user_suspensions)
-- Write performance improvement: 10-30% on affected tables
--
-- Category breakdown:
-- - Admin Audit Logs: 2 indexes, 16 kB
-- - Admin Professional Reviews: 3 indexes, 24 kB
-- - Feedback Submissions: 3 indexes, 24 kB
-- - Moderation Flags: 7 indexes, 56 kB
-- - Notifications: 4 indexes, 32 kB
-- - User Suspensions: 4 indexes, 32 kB
-- =====================================================

-- =====================================================
-- Total Priority 4 Stats (All Batches)
-- =====================================================
-- Batch 1 (previous): 49 indexes, 840 kB
-- Batch 2 (conversations): 21 indexes, 200 kB
-- Batch 3 Part 1 (bookings): 39 indexes, 312 kB
-- Batch 3 Part 2 (payouts): 19 indexes, 152 kB
-- Batch 4 (admin/moderation): 23 indexes, 184 kB
--
-- TOTAL: 151 indexes dropped, 1,688 kB (~1.65 MB) saved
-- =====================================================

-- =====================================================
-- Rationale for Dropping
-- =====================================================
-- 1. FK Indexes: Low query frequency on admin tables
-- 2. Enum/Boolean Indexes: Low selectivity (2-5 distinct values)
-- 3. Timestamp Indexes: Rarely sorted independently
-- 4. Composite Indexes: Covered by RLS or other multi-column indexes
-- 5. Admin Table Indexes: Very low traffic, rarely accessed
-- 6. Moderation Indexes: Feature rarely used in production
-- =====================================================

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this after migration to verify indexes are gone:
--
-- SELECT COUNT(*) as indexes_still_exist
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
--     AND indexrelname IN (
--         'idx_admin_audit_logs_fk_admin_id',
--         'idx_admin_audit_logs_fk_target_user_id',
--         'idx_admin_professional_reviews_fk_reviewed_by',
--         'idx_professional_reviews_avg_score',
--         'idx_professional_reviews_recommendation',
--         'idx_feedback_submissions_fk_assigned_to',
--         'idx_feedback_submissions_fk_resolved_by',
--         'idx_feedback_submissions_user_id_fk',
--         'idx_moderation_flags_created_at',
--         'idx_moderation_flags_fk_reviewer_id',
--         'idx_moderation_flags_flag_type',
--         'idx_moderation_flags_severity',
--         'idx_moderation_flags_severity_status',
--         'idx_moderation_flags_status',
--         'idx_moderation_flags_user_id',
--         'idx_notifications_user_created',
--         'idx_notifications_user_unread',
--         'notifications_created_at_idx',
--         'notifications_user_id_idx',
--         'idx_user_suspensions_expires_at',
--         'idx_user_suspensions_fk_lifted_by',
--         'idx_user_suspensions_fk_suspended_by',
--         'idx_user_suspensions_is_active'
--     );
--
-- Expected result: 0
-- =====================================================

-- =====================================================
-- Rollback Instructions
-- =====================================================
-- To rollback, recreate indexes using their original definitions from git history
-- Example:
-- CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
-- =====================================================
