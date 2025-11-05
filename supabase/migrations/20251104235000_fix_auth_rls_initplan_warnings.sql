-- Fix Auth RLS Initialization Plan Warnings
-- This migration optimizes all RLS policies to use (select auth.<function>())
-- instead of auth.<function>() to avoid re-evaluation for each row
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by the role owner" ON public.profiles;
CREATE POLICY "Public profiles are viewable by the role owner"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view their own consent status" ON public.profiles;
CREATE POLICY "Users can view their own consent status"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

-- ============================================================================
-- PROFESSIONAL_PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Professional profile can be created by owner" ON public.professional_profiles;
CREATE POLICY "Professional profile can be created by owner"
  ON public.professional_profiles FOR INSERT
  WITH CHECK (profile_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professional profile visible to owner" ON public.professional_profiles;
CREATE POLICY "Professional profile visible to owner"
  ON public.professional_profiles FOR SELECT
  USING (profile_id = (select auth.uid()));

-- ============================================================================
-- CUSTOMER_PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Customer profile visible to owner" ON public.customer_profiles;
CREATE POLICY "Customer profile visible to owner"
  ON public.customer_profiles FOR SELECT
  USING (profile_id = (select auth.uid()));

-- ============================================================================
-- PROFESSIONAL_DOCUMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Professional documents are visible to owner" ON public.professional_documents;
CREATE POLICY "Professional documents are visible to owner"
  ON public.professional_documents FOR SELECT
  USING (profile_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professional documents can be deleted by owner" ON public.professional_documents;
CREATE POLICY "Professional documents can be deleted by owner"
  ON public.professional_documents FOR DELETE
  USING (profile_id = (select auth.uid()));

DROP POLICY IF EXISTS "Professional documents can be inserted by owner" ON public.professional_documents;
CREATE POLICY "Professional documents can be inserted by owner"
  ON public.professional_documents FOR INSERT
  WITH CHECK (profile_id = (select auth.uid()));

-- ============================================================================
-- PROFESSIONAL_REVIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Customers can insert their own reviews" ON public.professional_reviews;
CREATE POLICY "Customers can insert their own reviews"
  ON public.professional_reviews FOR INSERT
  WITH CHECK (customer_id = (select auth.uid()));

-- ============================================================================
-- CRON_CONFIG TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Only service role can read cron config" ON public.cron_config;
CREATE POLICY "Only service role can read cron config"
  ON public.cron_config FOR SELECT
  USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Only service role can update cron config" ON public.cron_config;
CREATE POLICY "Only service role can update cron config"
  ON public.cron_config FOR UPDATE
  USING ((select auth.role()) = 'service_role');

-- ============================================================================
-- PAYOUTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Professionals can view their own payouts" ON public.payouts;
CREATE POLICY "Professionals can view their own payouts"
  ON public.payouts FOR SELECT
  USING (professional_id = (select auth.uid()));

DROP POLICY IF EXISTS "Service role can manage all payouts" ON public.payouts;
CREATE POLICY "Service role can manage all payouts"
  ON public.payouts FOR ALL
  USING ((select auth.role()) = 'service_role');

-- ============================================================================
-- ADMIN_AUDIT_LOGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view all audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================================
-- USER_SUSPENSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage suspensions" ON public.user_suspensions;
CREATE POLICY "Admins can manage suspensions"
  ON public.user_suspensions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all suspensions" ON public.user_suspensions;
CREATE POLICY "Admins can view all suspensions"
  ON public.user_suspensions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own suspensions" ON public.user_suspensions;
CREATE POLICY "Users can view their own suspensions"
  ON public.user_suspensions FOR SELECT
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- ADMIN_PROFESSIONAL_REVIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage admin reviews" ON public.admin_professional_reviews;
CREATE POLICY "Admins can manage admin reviews"
  ON public.admin_professional_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all admin reviews" ON public.admin_professional_reviews;
CREATE POLICY "Admins can view all admin reviews"
  ON public.admin_professional_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Professionals can view their own admin reviews" ON public.admin_professional_reviews;
CREATE POLICY "Professionals can view their own admin reviews"
  ON public.admin_professional_reviews FOR SELECT
  USING (professional_id = (select auth.uid()));

-- ============================================================================
-- DISPUTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes"
  ON public.disputes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all disputes" ON public.disputes;
CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view disputes they opened" ON public.disputes;
CREATE POLICY "Users can view disputes they opened"
  ON public.disputes FOR SELECT
  USING (opened_by = (select auth.uid()));

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can create conversations for their bookings" ON public.conversations;
CREATE POLICY "Users can create conversations for their bookings"
  ON public.conversations FOR INSERT
  WITH CHECK (
    customer_id = (select auth.uid()) OR professional_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (
    customer_id = (select auth.uid()) OR professional_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (
    customer_id = (select auth.uid()) OR professional_id = (select auth.uid())
  );

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = (select auth.uid()) OR c.professional_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update messages to mark as read" ON public.messages;
CREATE POLICY "Users can update messages to mark as read"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = (select auth.uid()) OR c.professional_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = (select auth.uid()) OR c.professional_id = (select auth.uid()))
    )
  );

-- ============================================================================
-- NOTIFICATION_SUBSCRIPTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can delete own subscriptions"
  ON public.notification_subscriptions FOR DELETE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.notification_subscriptions FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON public.notification_subscriptions FOR UPDATE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.notification_subscriptions FOR SELECT
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- BOOKING_DISPUTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update disputes" ON public.booking_disputes;
CREATE POLICY "Admins can update disputes"
  ON public.booking_disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all disputes" ON public.booking_disputes;
CREATE POLICY "Admins can view all disputes"
  ON public.booking_disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Customers can view their own disputes" ON public.booking_disputes;
CREATE POLICY "Customers can view their own disputes"
  ON public.booking_disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Professionals can view disputes about them" ON public.booking_disputes;
CREATE POLICY "Professionals can view disputes about them"
  ON public.booking_disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.professional_id = (select auth.uid())
    )
  );

-- ============================================================================
-- CHANGELOGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create changelogs" ON public.changelogs;
CREATE POLICY "Admins can create changelogs"
  ON public.changelogs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete changelogs" ON public.changelogs;
CREATE POLICY "Admins can delete changelogs"
  ON public.changelogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update changelogs" ON public.changelogs;
CREATE POLICY "Admins can update changelogs"
  ON public.changelogs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all changelogs" ON public.changelogs;
CREATE POLICY "Admins can view all changelogs"
  ON public.changelogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================================
-- PROFESSIONAL_SERVICES TABLE (from opened file)
-- ============================================================================

DROP POLICY IF EXISTS "Professionals can manage their own services" ON public.professional_services;
CREATE POLICY "Professionals can manage their own services"
  ON public.professional_services FOR ALL
  USING (profile_id = (select auth.uid()));
