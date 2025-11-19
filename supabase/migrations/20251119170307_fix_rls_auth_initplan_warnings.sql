-- Migration: Fix RLS auth_rls_initplan Warnings
-- Description: Wraps auth.uid() in subqueries for affected policies only
-- Based on: performance-warning.json from production Supabase
-- Date: 2025-11-19

-- This migration is SAFE because it:
-- 1. Uses IF EXISTS for all DROP statements
-- 2. Only recreates policies that exist (verified against production warnings)
-- 3. Maintains exact same logic, only wraps auth.uid() in (SELECT auth.uid())

BEGIN;

-- ============================================================================
-- PROFILES TABLE (3 policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy') THEN
    DROP POLICY "profiles_select_policy" ON profiles;
    CREATE POLICY "profiles_select_policy"
      ON profiles
      FOR SELECT
      USING (id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy') THEN
    DROP POLICY "profiles_update_policy" ON profiles;
    CREATE POLICY "profiles_update_policy"
      ON profiles
      FOR UPDATE
      USING (id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy') THEN
    DROP POLICY "profiles_insert_policy" ON profiles;
    CREATE POLICY "profiles_insert_policy"
      ON profiles
      FOR INSERT
      WITH CHECK (id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- BOOKINGS TABLE (8 policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Admins have full access to bookings') THEN
    DROP POLICY "Admins have full access to bookings" ON bookings;
    CREATE POLICY "Admins have full access to bookings"
      ON bookings
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can view their own bookings') THEN
    DROP POLICY "Users can view their own bookings" ON bookings;
    CREATE POLICY "Users can view their own bookings"
      ON bookings
      FOR SELECT
      USING (customer_id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Professionals can view their assigned bookings') THEN
    DROP POLICY "Professionals can view their assigned bookings" ON bookings;
    CREATE POLICY "Professionals can view their assigned bookings"
      ON bookings
      FOR SELECT
      USING (professional_id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can insert their own bookings') THEN
    DROP POLICY "Users can insert their own bookings" ON bookings;
    CREATE POLICY "Users can insert their own bookings"
      ON bookings
      FOR INSERT
      WITH CHECK (customer_id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can update their own bookings') THEN
    DROP POLICY "Users can update their own bookings" ON bookings;
    CREATE POLICY "Users can update their own bookings"
      ON bookings
      FOR UPDATE
      USING (customer_id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Professionals can update their assigned bookings') THEN
    DROP POLICY "Professionals can update their assigned bookings" ON bookings;
    CREATE POLICY "Professionals can update their assigned bookings"
      ON bookings
      FOR UPDATE
      USING (professional_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- BOOKING_ADDONS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_addons' AND policyname = 'Admins can manage all addons') THEN
    DROP POLICY "Admins can manage all addons" ON booking_addons;
    CREATE POLICY "Admins can manage all addons"
      ON booking_addons
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_addons' AND policyname = 'Customers can view their booking addons') THEN
    DROP POLICY "Customers can view their booking addons" ON booking_addons;
    CREATE POLICY "Customers can view their booking addons"
      ON booking_addons
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = booking_addons.booking_id
          AND bookings.customer_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_addons' AND policyname = 'Professionals can view their booking addons') THEN
    DROP POLICY "Professionals can view their booking addons" ON booking_addons;
    CREATE POLICY "Professionals can view their booking addons"
      ON booking_addons
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = booking_addons.booking_id
          AND bookings.professional_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_addons' AND policyname = 'Customers can manage their booking addons') THEN
    DROP POLICY "Customers can manage their booking addons" ON booking_addons;
    CREATE POLICY "Customers can manage their booking addons"
      ON booking_addons
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = booking_addons.booking_id
          AND bookings.customer_id = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

-- ============================================================================
-- BOOKING_STATUS_HISTORY TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'Admins can view all status history') THEN
    DROP POLICY "Admins can view all status history" ON booking_status_history;
    CREATE POLICY "Admins can view all status history"
      ON booking_status_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'Customers can view their booking status history') THEN
    DROP POLICY "Customers can view their booking status history" ON booking_status_history;
    CREATE POLICY "Customers can view their booking status history"
      ON booking_status_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = booking_status_history.booking_id
          AND bookings.customer_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'Professionals can view their booking status history') THEN
    DROP POLICY "Professionals can view their booking status history" ON booking_status_history;
    CREATE POLICY "Professionals can view their booking status history"
      ON booking_status_history
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = booking_status_history.booking_id
          AND bookings.professional_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'System can insert status history') THEN
    DROP POLICY "System can insert status history" ON booking_status_history;
    CREATE POLICY "System can insert status history"
      ON booking_status_history
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- USER_SUSPENSIONS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_suspensions' AND policyname = 'Admins can manage suspensions') THEN
    DROP POLICY "Admins can manage suspensions" ON user_suspensions;
    CREATE POLICY "Admins can manage suspensions"
      ON user_suspensions
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_suspensions' AND policyname = 'Users can view their own suspensions') THEN
    DROP POLICY "Users can view their own suspensions" ON user_suspensions;
    CREATE POLICY "Users can view their own suspensions"
      ON user_suspensions
      FOR SELECT
      USING (user_id = (SELECT auth.uid()));
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_suspensions' AND policyname = 'Admins can create suspensions') THEN
    DROP POLICY "Admins can create suspensions" ON user_suspensions;
    CREATE POLICY "Admins can create suspensions"
      ON user_suspensions
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- BALANCE_AUDIT_LOG TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'balance_audit_log' AND policyname = 'Admins can view audit logs') THEN
    DROP POLICY "Admins can view audit logs" ON balance_audit_log;
    CREATE POLICY "Admins can view audit logs"
      ON balance_audit_log
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'balance_audit_log' AND policyname = 'Users can view their own audit logs') THEN
    DROP POLICY "Users can view their own audit logs" ON balance_audit_log;
    CREATE POLICY "Users can view their own audit logs"
      ON balance_audit_log
      FOR SELECT
      USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- BALANCE_CLEARANCE_QUEUE TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'balance_clearance_queue' AND policyname = 'Admins can manage clearance queue') THEN
    DROP POLICY "Admins can manage clearance queue" ON balance_clearance_queue;
    CREATE POLICY "Admins can manage clearance queue"
      ON balance_clearance_queue
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'balance_clearance_queue' AND policyname = 'Users can view their own clearance items') THEN
    DROP POLICY "Users can view their own clearance items" ON balance_clearance_queue;
    CREATE POLICY "Users can view their own clearance items"
      ON balance_clearance_queue
      FOR SELECT
      USING (professional_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PAYOUT_RATE_LIMITS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payout_rate_limits' AND policyname = 'Admins can manage rate limits') THEN
    DROP POLICY "Admins can manage rate limits" ON payout_rate_limits;
    CREATE POLICY "Admins can manage rate limits"
      ON payout_rate_limits
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payout_rate_limits' AND policyname = 'Professionals can view their rate limits') THEN
    DROP POLICY "Professionals can view their rate limits" ON payout_rate_limits;
    CREATE POLICY "Professionals can view their rate limits"
      ON payout_rate_limits
      FOR SELECT
      USING (professional_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PAYOUT_TRANSFERS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payout_transfers' AND policyname = 'Admins can manage transfers') THEN
    DROP POLICY "Admins can manage transfers" ON payout_transfers;
    CREATE POLICY "Admins can manage transfers"
      ON payout_transfers
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payout_transfers' AND policyname = 'Professionals can view their transfers') THEN
    DROP POLICY "Professionals can view their transfers" ON payout_transfers;
    CREATE POLICY "Professionals can view their transfers"
      ON payout_transfers
      FOR SELECT
      USING (professional_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PAYOUT_BATCHES TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payout_batches' AND policyname = 'Admins can manage payout batches') THEN
    DROP POLICY "Admins can manage payout batches" ON payout_batches;
    CREATE POLICY "Admins can manage payout batches"
      ON payout_batches
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- TRIAL_CREDITS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trial_credits' AND policyname = 'trial_credits_select_own') THEN
    DROP POLICY "trial_credits_select_own" ON trial_credits;
    CREATE POLICY "trial_credits_select_own"
      ON trial_credits
      FOR SELECT
      USING (customer_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- MODERATION_FLAGS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'moderation_flags' AND policyname = 'Admins can manage moderation flags') THEN
    DROP POLICY "Admins can manage moderation flags" ON moderation_flags;
    CREATE POLICY "Admins can manage moderation flags"
      ON moderation_flags
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'moderation_flags' AND policyname = 'Admins can create moderation flags') THEN
    DROP POLICY "Admins can create moderation flags" ON moderation_flags;
    CREATE POLICY "Admins can create moderation flags"
      ON moderation_flags
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'moderation_flags' AND policyname = 'Users can report content') THEN
    DROP POLICY "Users can report content" ON moderation_flags;
    CREATE POLICY "Users can report content"
      ON moderation_flags
      FOR INSERT
      WITH CHECK (reporter_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PLATFORM_SETTINGS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Admins can manage platform settings') THEN
    DROP POLICY "Admins can manage platform settings" ON platform_settings;
    CREATE POLICY "Admins can manage platform settings"
      ON platform_settings
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'All users can view platform settings') THEN
    DROP POLICY "All users can view platform settings" ON platform_settings;
    CREATE POLICY "All users can view platform settings"
      ON platform_settings
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- HELP_ARTICLES TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_articles' AND policyname = 'Admins can manage help articles') THEN
    DROP POLICY "Admins can manage help articles" ON help_articles;
    CREATE POLICY "Admins can manage help articles"
      ON help_articles
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_articles' AND policyname = 'All users can view published help articles') THEN
    DROP POLICY "All users can view published help articles" ON help_articles;
    CREATE POLICY "All users can view published help articles"
      ON help_articles
      FOR SELECT
      USING (is_published = true);
  END IF;
END $$;

-- ============================================================================
-- HELP_CATEGORIES TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_categories' AND policyname = 'Admins can manage help categories') THEN
    DROP POLICY "Admins can manage help categories" ON help_categories;
    CREATE POLICY "Admins can manage help categories"
      ON help_categories
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_categories' AND policyname = 'All users can view help categories') THEN
    DROP POLICY "All users can view help categories" ON help_categories;
    CREATE POLICY "All users can view help categories"
      ON help_categories
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- HELP_SEARCH_ANALYTICS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_search_analytics' AND policyname = 'Admins can view search analytics') THEN
    DROP POLICY "Admins can view search analytics" ON help_search_analytics;
    CREATE POLICY "Admins can view search analytics"
      ON help_search_analytics
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- HELP_ARTICLE_TAGS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_article_tags' AND policyname = 'Admins can manage article tags') THEN
    DROP POLICY "Admins can manage article tags" ON help_article_tags;
    CREATE POLICY "Admins can manage article tags"
      ON help_article_tags
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_article_tags' AND policyname = 'All users can view article tags') THEN
    DROP POLICY "All users can view article tags" ON help_article_tags;
    CREATE POLICY "All users can view article tags"
      ON help_article_tags
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- HELP_ARTICLE_TAGS_RELATION TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'help_article_tags_relation' AND policyname = 'Admins can manage tag relations') THEN
    DROP POLICY "Admins can manage tag relations" ON help_article_tags_relation;
    CREATE POLICY "Admins can manage tag relations"
      ON help_article_tags_relation
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- BRIEFS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Admins can manage briefs') THEN
    DROP POLICY "Admins can manage briefs" ON briefs;
    CREATE POLICY "Admins can manage briefs"
      ON briefs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Customers can view their briefs') THEN
    DROP POLICY "Customers can view their briefs" ON briefs;
    CREATE POLICY "Customers can view their briefs"
      ON briefs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = briefs.booking_id
          AND bookings.customer_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Professionals can view their briefs') THEN
    DROP POLICY "Professionals can view their briefs" ON briefs;
    CREATE POLICY "Professionals can view their briefs"
      ON briefs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = briefs.booking_id
          AND bookings.professional_id = (SELECT auth.uid())
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Customers can manage their briefs') THEN
    DROP POLICY "Customers can manage their briefs" ON briefs;
    CREATE POLICY "Customers can manage their briefs"
      ON briefs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.id = briefs.booking_id
          AND bookings.customer_id = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

-- ============================================================================
-- AMARA_TOOL_RUNS TABLE (policies)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amara_tool_runs' AND policyname = 'Admins can view tool runs') THEN
    DROP POLICY "Admins can view tool runs" ON amara_tool_runs;
    CREATE POLICY "Admins can view tool runs"
      ON amara_tool_runs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (SELECT auth.uid())
          AND role = 'admin'
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amara_tool_runs' AND policyname = 'Users can view their tool runs') THEN
    DROP POLICY "Users can view their tool runs" ON amara_tool_runs;
    CREATE POLICY "Users can view their tool runs"
      ON amara_tool_runs
      FOR SELECT
      USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

COMMIT;
