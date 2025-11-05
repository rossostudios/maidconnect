/**
 * Fix remaining 30 auth_rls_initplan warnings
 * Part 2: Additional tables and Sprint 2 tables
 */

-- ============================================
-- ETTA_MESSAGES (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view own conversation messages" ON etta_messages;
CREATE POLICY "Users can view own conversation messages"
ON etta_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM etta_conversations
    WHERE id = etta_messages.conversation_id
    AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create messages in own conversations" ON etta_messages;
CREATE POLICY "Users can create messages in own conversations"
ON etta_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM etta_conversations
    WHERE id = etta_messages.conversation_id
    AND user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view all messages" ON etta_messages;
CREATE POLICY "Admins can view all messages"
ON etta_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can update messages in own conversations" ON etta_messages;
CREATE POLICY "Users can update messages in own conversations"
ON etta_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM etta_conversations
    WHERE id = etta_messages.conversation_id
    AND user_id = (select auth.uid())
  )
);

-- ============================================
-- REFERRAL_CODES (1 policy - update)
-- ============================================

DROP POLICY IF EXISTS "Users can update their own referral codes" ON referral_codes;
CREATE POLICY "Users can update their own referral codes"
ON referral_codes FOR UPDATE
USING ((select auth.uid()) = user_id);

-- ============================================
-- REFERRALS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Users can view referrals they're involved in" ON referrals;
CREATE POLICY "Users can view referrals they're involved in"
ON referrals FOR SELECT
USING (
  (select auth.uid()) = referrer_id OR (select auth.uid()) = referee_id
);

-- ============================================
-- REFERRAL_CREDITS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own credits" ON referral_credits;
CREATE POLICY "Users can view their own credits"
ON referral_credits FOR SELECT
USING ((select auth.uid()) = user_id);

-- ============================================
-- PROFESSIONAL_WORKING_HOURS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Professionals can manage their own working hours" ON professional_working_hours;
CREATE POLICY "Professionals can manage their own working hours"
ON professional_working_hours FOR ALL
USING ((select auth.uid()) = profile_id)
WITH CHECK ((select auth.uid()) = profile_id);

-- ============================================
-- PROFESSIONAL_TRAVEL_BUFFERS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Professionals can manage their own travel buffers" ON professional_travel_buffers;
CREATE POLICY "Professionals can manage their own travel buffers"
ON professional_travel_buffers FOR ALL
USING ((select auth.uid()) = profile_id)
WITH CHECK ((select auth.uid()) = profile_id);

-- ============================================
-- SERVICE_BUNDLES (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Professionals can manage their own bundles" ON service_bundles;
CREATE POLICY "Professionals can manage their own bundles"
ON service_bundles FOR ALL
USING ((select auth.uid()) = profile_id)
WITH CHECK ((select auth.uid()) = profile_id);

-- ============================================
-- PROFESSIONAL_PERFORMANCE_METRICS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Professionals can view their own metrics" ON professional_performance_metrics;
CREATE POLICY "Professionals can view their own metrics"
ON professional_performance_metrics FOR SELECT
USING ((select auth.uid()) = profile_id);

-- ============================================
-- PROFESSIONAL_REVENUE_SNAPSHOTS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Professionals can view their own revenue snapshots" ON professional_revenue_snapshots;
CREATE POLICY "Professionals can view their own revenue snapshots"
ON professional_revenue_snapshots FOR SELECT
USING ((select auth.uid()) = profile_id);

-- ============================================
-- BOOKINGS (5 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings as customer" ON bookings;
CREATE POLICY "Users can view their own bookings as customer"
ON bookings FOR SELECT
USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Users can view their own bookings as professional" ON bookings;
CREATE POLICY "Users can view their own bookings as professional"
ON bookings FOR SELECT
USING ((select auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
CREATE POLICY "Customers can create bookings"
ON bookings FOR INSERT
WITH CHECK ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can update their own pending bookings" ON bookings;
CREATE POLICY "Customers can update their own pending bookings"
ON bookings FOR UPDATE
USING (
  (select auth.uid()) = customer_id
  AND status IN ('pending', 'pending_payment', 'authorized')
);

DROP POLICY IF EXISTS "Professionals can update bookings assigned to them" ON bookings;
CREATE POLICY "Professionals can update bookings assigned to them"
ON bookings FOR UPDATE
USING ((select auth.uid()) = professional_id);

-- ============================================
-- BOOKING_STATUS_HISTORY (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Users can view status history for their bookings" ON booking_status_history;
CREATE POLICY "Users can view status history for their bookings"
ON booking_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_status_history.booking_id
    AND ((select auth.uid()) = customer_id OR (select auth.uid()) = professional_id)
  )
);

-- ============================================
-- BOOKING_ADDONS (2 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view addons for their bookings" ON booking_addons;
CREATE POLICY "Users can view addons for their bookings"
ON booking_addons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_addons.booking_id
    AND ((select auth.uid()) = customer_id OR (select auth.uid()) = professional_id)
  )
);

DROP POLICY IF EXISTS "Customers can manage addons for pending bookings" ON booking_addons;
CREATE POLICY "Customers can manage addons for pending bookings"
ON booking_addons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_addons.booking_id
    AND (select auth.uid()) = customer_id
    AND status IN ('pending', 'pending_payment')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_addons.booking_id
    AND (select auth.uid()) = customer_id
    AND status IN ('pending', 'pending_payment')
  )
);

-- ============================================
-- PRICING_CONTROLS (Sprint 2 - 1 policy)
-- ============================================

DROP POLICY IF EXISTS "Admins can manage pricing controls" ON pricing_controls;
CREATE POLICY "Admins can manage pricing controls"
ON pricing_controls FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- RECURRING_PLANS (Sprint 2 - 2 admin policies)
-- ============================================

DROP POLICY IF EXISTS "Admins can view all recurring plans" ON recurring_plans;
CREATE POLICY "Admins can view all recurring plans"
ON recurring_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage all recurring plans" ON recurring_plans;
CREATE POLICY "Admins can manage all recurring plans"
ON recurring_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- RECURRING_PLAN_HOLIDAYS (Sprint 2 - 3 policies)
-- ============================================

DROP POLICY IF EXISTS "Customers can view holidays for own plans" ON recurring_plan_holidays;
CREATE POLICY "Customers can view holidays for own plans"
ON recurring_plan_holidays FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recurring_plans
    WHERE id = recurring_plan_holidays.recurring_plan_id
    AND customer_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Customers can add holidays to own plans" ON recurring_plan_holidays;
CREATE POLICY "Customers can add holidays to own plans"
ON recurring_plan_holidays FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recurring_plans
    WHERE id = recurring_plan_holidays.recurring_plan_id
    AND customer_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Customers can remove holidays from own plans" ON recurring_plan_holidays;
CREATE POLICY "Customers can remove holidays from own plans"
ON recurring_plan_holidays FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM recurring_plans
    WHERE id = recurring_plan_holidays.recurring_plan_id
    AND customer_id = (select auth.uid())
  )
);

-- ============================================
-- REBOOK_NUDGE_EXPERIMENTS (Sprint 2 - 2 policies)
-- ============================================

DROP POLICY IF EXISTS "Admins can view all rebook nudge experiments" ON rebook_nudge_experiments;
CREATE POLICY "Admins can view all rebook nudge experiments"
ON rebook_nudge_experiments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Service role can manage rebook nudge experiments" ON rebook_nudge_experiments;
CREATE POLICY "Service role can manage rebook nudge experiments"
ON rebook_nudge_experiments FOR ALL
USING ((select auth.jwt())->>'role' = 'service_role')
WITH CHECK ((select auth.jwt())->>'role' = 'service_role');

-- ============================================
-- SUMMARY
-- ============================================

COMMENT ON SCHEMA public IS 'Fixed remaining 30 auth_rls_initplan warnings in part 2';
