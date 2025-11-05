/**
 * Fix multiple_permissive_policies warnings
 *
 * Issue: Multiple permissive policies for same operation use OR logic, causing:
 * - Query planner overhead for each additional policy
 * - Potential security issues if one policy is too broad
 * - Harder to reason about access control
 *
 * Solution: Consolidate multiple policies per operation into single policies
 *
 * Affected: 11 tables with multiple SELECT/UPDATE/DELETE policies
 * See: https://supabase.com/docs/guides/database/database-advisors#0006_multiple_permissive_policies
 */

-- ============================================
-- RECURRING_PLANS (3 SELECT policies -> 1)
-- ============================================

-- Only consolidate if we haven't already done so
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recurring_plans'
    AND policyname = 'Users can view relevant recurring plans'
  ) THEN
    -- Policy already consolidated, skip
    RAISE NOTICE 'Recurring plans policies already consolidated';
  ELSE
    -- Drop old policies and create consolidated one
    EXECUTE 'DROP POLICY IF EXISTS "Customers can view own recurring plans" ON recurring_plans';
    EXECUTE 'DROP POLICY IF EXISTS "Professionals can view assigned recurring plans" ON recurring_plans';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all recurring plans" ON recurring_plans';

    EXECUTE $policy$
      CREATE POLICY "Users can view relevant recurring plans"
      ON recurring_plans FOR SELECT
      USING (
        -- Customers can view their own plans
        (select auth.uid()) = customer_id
        -- Professionals can view assigned plans
        OR (select auth.uid()) = professional_id
        -- Admins can view all plans
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- ETTA_CONVERSATIONS (2 SELECT policies -> 1)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'etta_conversations'
    AND policyname = 'Users can view conversations'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own conversations" ON etta_conversations';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all conversations" ON etta_conversations';

    EXECUTE $policy$
      CREATE POLICY "Users can view conversations"
      ON etta_conversations FOR SELECT
      USING (
        -- Users can view their own conversations
        (select auth.uid()) = user_id
        -- Admins can view all conversations
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- ETTA_MESSAGES (2 SELECT policies -> 1)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'etta_messages'
    AND policyname = 'Users can view messages'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own conversation messages" ON etta_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all messages" ON etta_messages';

    EXECUTE $policy$
      CREATE POLICY "Users can view messages"
      ON etta_messages FOR SELECT
      USING (
        -- Users can view messages in their own conversations
        EXISTS (
          SELECT 1 FROM etta_conversations
          WHERE id = etta_messages.conversation_id
          AND user_id = (select auth.uid())
        )
        -- Admins can view all messages
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- CHANGELOG_VIEWS (2 SELECT policies -> 1)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'changelog_views'
    AND policyname = 'Users can view changelog views'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own changelog views" ON changelog_views';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all changelog views" ON changelog_views';

    EXECUTE $policy$
      CREATE POLICY "Users can view changelog views"
      ON changelog_views FOR SELECT
      USING (
        -- Users can view their own views
        (select auth.uid()) = user_id
        -- Admins can view all views
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- FEEDBACK_SUBMISSIONS (2 SELECT policies -> 1)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'feedback_submissions'
    AND policyname = 'Users can view feedback'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users view own feedback" ON feedback_submissions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins view all feedback" ON feedback_submissions';

    EXECUTE $policy$
      CREATE POLICY "Users can view feedback"
      ON feedback_submissions FOR SELECT
      USING (
        -- Users can view their own feedback
        (select auth.uid()) = user_id
        -- Admins can view all feedback
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- ROADMAP_COMMENTS (2 SELECT, 2 UPDATE, 2 DELETE -> 3)
-- ============================================

DO $$
BEGIN
  -- Consolidate SELECT policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'roadmap_comments'
    AND policyname = 'Users can view roadmap comments'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own comments" ON roadmap_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all comments" ON roadmap_comments';

    EXECUTE $policy$
      CREATE POLICY "Users can view roadmap comments"
      ON roadmap_comments FOR SELECT
      USING (
        (select auth.uid()) = user_id
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;

  -- Consolidate UPDATE policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'roadmap_comments'
    AND policyname = 'Users can update roadmap comments'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own comments" ON roadmap_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update any comment" ON roadmap_comments';

    EXECUTE $policy$
      CREATE POLICY "Users can update roadmap comments"
      ON roadmap_comments FOR UPDATE
      USING (
        (select auth.uid()) = user_id
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;

  -- Consolidate DELETE policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'roadmap_comments'
    AND policyname = 'Users can delete roadmap comments'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own comments" ON roadmap_comments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any comment" ON roadmap_comments';

    EXECUTE $policy$
      CREATE POLICY "Users can delete roadmap comments"
      ON roadmap_comments FOR DELETE
      USING (
        (select auth.uid()) = user_id
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- BOOKINGS (2 SELECT, 2 UPDATE -> 2)
-- ============================================

DO $$
BEGIN
  -- Consolidate SELECT policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND policyname = 'Users can view bookings'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own bookings as customer" ON bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own bookings as professional" ON bookings';

    EXECUTE $policy$
      CREATE POLICY "Users can view bookings"
      ON bookings FOR SELECT
      USING (
        (select auth.uid()) = customer_id
        OR (select auth.uid()) = professional_id
      )
    $policy$;
  END IF;

  -- Consolidate UPDATE policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'bookings'
    AND policyname = 'Users can update bookings'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Customers can update their own pending bookings" ON bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Professionals can update bookings assigned to them" ON bookings';

    EXECUTE $policy$
      CREATE POLICY "Users can update bookings"
      ON bookings FOR UPDATE
      USING (
        (
          (select auth.uid()) = customer_id
          AND status IN ('pending', 'pending_payment', 'authorized')
        )
        OR (select auth.uid()) = professional_id
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- REBOOK_NUDGE_EXPERIMENTS (2 SELECT -> 1)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'rebook_nudge_experiments'
    AND policyname = 'Users can view rebook nudge experiments'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Customers can view own rebook nudge experiments" ON rebook_nudge_experiments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all rebook nudge experiments" ON rebook_nudge_experiments';

    EXECUTE $policy$
      CREATE POLICY "Users can view rebook nudge experiments"
      ON rebook_nudge_experiments FOR SELECT
      USING (
        (select auth.uid()) = customer_id
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) AND role = 'admin'
        )
      )
    $policy$;
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

COMMENT ON SCHEMA public IS 'Consolidated multiple permissive RLS policies: 8 tables, 23 policies -> 14 policies';
