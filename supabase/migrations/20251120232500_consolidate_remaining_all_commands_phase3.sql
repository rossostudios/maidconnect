-- =====================================================
-- RLS Policy Consolidation Phase 3: Final ALL Command Cleanup
-- =====================================================
-- Purpose: Fix remaining 2 tables with ALL command overlaps
-- Tables: admin_professional_reviews, user_suspensions
-- Expected: 51 overlaps → 48 (only service_role overlaps remain)
-- =====================================================

-- =====================================================
-- Table 1: admin_professional_reviews
-- =====================================================
-- Current state:
-- - "Admins can manage admin reviews" (ALL) - creates 4 overlaps
-- - "Professionals can view their own admin reviews" (SELECT)
-- Target: Split ALL into specific commands, consolidate with existing SELECT

-- Drop ALL command policy
DROP POLICY IF EXISTS "Admins can manage admin reviews" ON admin_professional_reviews;

-- Drop existing SELECT policy (will recreate consolidated)
DROP POLICY IF EXISTS "Professionals can view their own admin reviews" ON admin_professional_reviews;

-- Create consolidated SELECT policy
CREATE POLICY "admin_professional_reviews_select" ON admin_professional_reviews FOR SELECT
TO authenticated
USING (
  -- Professionals can view their own reviews
  professional_id = (SELECT auth.uid())
  OR
  -- Admins can view all reviews
  (SELECT private.is_admin())
);

-- Create INSERT policy for admins only
CREATE POLICY "admin_professional_reviews_insert" ON admin_professional_reviews FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

-- Create UPDATE policy for admins only
CREATE POLICY "admin_professional_reviews_update" ON admin_professional_reviews FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Create DELETE policy for admins only
CREATE POLICY "admin_professional_reviews_delete" ON admin_professional_reviews FOR DELETE
TO authenticated
USING ((SELECT private.is_admin()));

-- =====================================================
-- Table 2: user_suspensions
-- =====================================================
-- Current state:
-- - "Admins can manage suspensions" (ALL) - creates 4 overlaps
-- - "Admins can create user suspensions" (INSERT)
-- - "user_suspensions_select" (SELECT) - created in Phase 1
-- - "Admins can update user suspensions" (UPDATE)
-- Target: Split ALL, consolidate all specific command policies

-- Drop ALL command policy
DROP POLICY IF EXISTS "Admins can manage suspensions" ON user_suspensions;

-- Drop existing specific command policies (will recreate consolidated)
DROP POLICY IF EXISTS "Admins can create user suspensions" ON user_suspensions;
DROP POLICY IF EXISTS "user_suspensions_select" ON user_suspensions;
DROP POLICY IF EXISTS "Admins can update user suspensions" ON user_suspensions;

-- Create consolidated SELECT policy
CREATE POLICY "user_suspensions_select" ON user_suspensions FOR SELECT
TO authenticated
USING (
  -- Users can view their own suspensions
  user_id = (SELECT auth.uid())
  OR
  -- Admins can view all suspensions
  (SELECT private.is_admin())
);

-- Create consolidated INSERT policy
CREATE POLICY "user_suspensions_insert" ON user_suspensions FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

-- Create consolidated UPDATE policy
CREATE POLICY "user_suspensions_update" ON user_suspensions FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Create consolidated DELETE policy
CREATE POLICY "user_suspensions_delete" ON user_suspensions FOR DELETE
TO authenticated
USING ((SELECT private.is_admin()));

-- =====================================================
-- Migration Summary
-- =====================================================
-- Tables fixed: 2
-- ALL command policies dropped: 2
-- Specific command policies dropped: 4
-- New consolidated policies created: 8
--
-- Expected overlap reduction:
-- - admin_professional_reviews: 4 overlaps → 0
-- - user_suspensions: 3 overlaps → 0
-- - Total: 51 overlaps → 48 (only acceptable service_role overlaps)
--
-- Remaining 48 overlaps are service_role_all policies (expected/acceptable):
-- - background_checks (4), guest_sessions (4), insurance_claims (4)
-- - interview_slots (4), payout_batches (4), payout_transfers (4)
-- - payouts (4), platform_events (4), platform_settings (4)
-- - rebook_nudge_experiments (4), sms_logs (4), user_blocks (4)
-- =====================================================

-- =====================================================
-- Verification Query (Run After Migration)
-- =====================================================
-- Expected: 48 rows (all service_role overlaps)
--
-- WITH policy_breakdown AS (
--   SELECT tablename,
--     CASE WHEN cmd = 'ALL' THEN ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']
--          ELSE ARRAY[cmd]
--     END as effective_commands,
--     policyname
--   FROM pg_policies
--   WHERE schemaname = 'public' AND permissive = 'PERMISSIVE'
-- ),
-- expanded AS (
--   SELECT tablename, unnest(effective_commands) as cmd, policyname
--   FROM policy_breakdown
-- )
-- SELECT tablename, cmd, COUNT(*) as policy_count, array_agg(policyname ORDER BY policyname) as policy_names
-- FROM expanded
-- GROUP BY tablename, cmd
-- HAVING COUNT(*) > 1
-- ORDER BY COUNT(*) DESC, tablename, cmd;
--
-- All remaining overlaps should be service_role_all policies
-- =====================================================

-- =====================================================
-- Combined Phase 1 + Phase 2 + Phase 3 Stats
-- =====================================================
-- Starting warnings: 208 "Multiple Permissive Policies"
--
-- Phase 1: 208 → 151 (57 warnings eliminated)
-- Phase 2: 151 → 51 (100 warnings eliminated)
-- Phase 3: 51 → 48 (3 warnings eliminated)
--
-- Final: 48 acceptable service_role overlaps (backend design requirement)
-- Real warnings eliminated: 160 out of 160 problematic overlaps (100%)
-- =====================================================
