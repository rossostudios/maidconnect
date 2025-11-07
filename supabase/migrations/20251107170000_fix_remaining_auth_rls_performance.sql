-- Migration: Fix remaining auth_rls_initplan performance warnings
-- Description: Optimize RLS policies by wrapping auth.uid() calls with (SELECT ...) subqueries
-- Author: Claude Code
-- Date: 2025-11-07
-- Reference: https://github.com/orgs/supabase/discussions/29561#discussioncomment-11393970

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Bookings Table
-- ============================================================================

-- Drop and recreate: "Customers can view their bookings"
-- BEFORE: customer_id = auth.uid()
-- AFTER: customer_id = (SELECT auth.uid())
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Customers can view their bookings" ON public.bookings;

CREATE POLICY "Customers can view their bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

-- Drop and recreate: "Professionals can view their bookings"
-- BEFORE: professional_id = auth.uid()
-- AFTER: professional_id = (SELECT auth.uid())
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Professionals can view their bookings" ON public.bookings;

CREATE POLICY "Professionals can view their bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Reviews Table
-- ============================================================================

-- Drop and recreate: "Customers can create reviews for their bookings"
-- BEFORE: customer_id = auth.uid()
-- AFTER: customer_id = (SELECT auth.uid())
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Customers can create reviews for their bookings" ON public.reviews;

CREATE POLICY "Customers can create reviews for their bookings"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid()));

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Conversations Table
-- ============================================================================

-- Drop and recreate: "Users can create conversations for their bookings"
-- BEFORE: (customer_id = auth.uid()) OR (professional_id = auth.uid())
-- AFTER: (customer_id = (SELECT auth.uid())) OR (professional_id = (SELECT auth.uid()))
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Users can create conversations for their bookings" ON public.conversations;

CREATE POLICY "Users can create conversations for their bookings"
  ON public.conversations
  FOR INSERT
  TO public
  WITH CHECK (
    (customer_id = (SELECT auth.uid())) OR
    (professional_id = (SELECT auth.uid()))
  );

-- Drop and recreate: "Users can update their own conversations"
-- BEFORE: (customer_id = auth.uid()) OR (professional_id = auth.uid())
-- AFTER: (customer_id = (SELECT auth.uid())) OR (professional_id = (SELECT auth.uid()))
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  TO public
  USING (
    (customer_id = (SELECT auth.uid())) OR
    (professional_id = (SELECT auth.uid()))
  );

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Messages Table
-- ============================================================================

-- Drop and recreate: "Users can update messages to mark as read"
-- BEFORE: EXISTS (... WHERE conversations.customer_id = auth.uid() OR conversations.professional_id = auth.uid())
-- AFTER: EXISTS (... WHERE conversations.customer_id = (SELECT auth.uid()) OR conversations.professional_id = (SELECT auth.uid()))
-- Expected improvement: 10-100x faster query planning
DROP POLICY IF EXISTS "Users can update messages to mark as read" ON public.messages;

CREATE POLICY "Users can update messages to mark as read"
  ON public.messages
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM conversations
      WHERE (
        conversations.id = messages.conversation_id AND
        (
          conversations.customer_id = (SELECT auth.uid()) OR
          conversations.professional_id = (SELECT auth.uid())
        )
      )
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all policies were updated correctly
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count optimized policies (should be 6)
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('bookings', 'reviews', 'conversations', 'messages')
  AND policyname IN (
    'Customers can view their bookings',
    'Professionals can view their bookings',
    'Customers can create reviews for their bookings',
    'Users can create conversations for their bookings',
    'Users can update their own conversations',
    'Users can update messages to mark as read'
  );

  IF policy_count != 6 THEN
    RAISE EXCEPTION 'Expected 6 optimized policies, found %', policy_count;
  END IF;

  RAISE NOTICE 'SUCCESS: All 6 RLS policies optimized with (SELECT auth.uid()) pattern';
  RAISE NOTICE 'Tables optimized: bookings (2), reviews (1), conversations (2), messages (1)';
  RAISE NOTICE 'Expected performance improvement: 10-100x faster query planning';
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Customers can view their bookings" ON public.bookings IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';

COMMENT ON POLICY "Professionals can view their bookings" ON public.bookings IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';

COMMENT ON POLICY "Customers can create reviews for their bookings" ON public.reviews IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';

COMMENT ON POLICY "Users can create conversations for their bookings" ON public.conversations IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';

COMMENT ON POLICY "Users can update their own conversations" ON public.conversations IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';

COMMENT ON POLICY "Users can update messages to mark as read" ON public.messages IS
  'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';
