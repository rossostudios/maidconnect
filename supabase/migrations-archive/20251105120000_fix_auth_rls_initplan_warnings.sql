/**
 * Fix all auth_rls_initplan performance warnings
 *
 * Issue: RLS policies calling auth.uid() directly re-evaluate for each row
 * Solution: Wrap as (select auth.uid()) to evaluate once and cache
 *
 * Affected tables: 13 tables, 48 policies total
 * See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
 */

-- ============================================
-- RECURRING_PLANS (5 policies)
-- ============================================

DROP POLICY IF EXISTS "Customers can view own recurring plans" ON recurring_plans;
CREATE POLICY "Customers can view own recurring plans"
ON recurring_plans FOR SELECT
USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Professionals can view assigned recurring plans" ON recurring_plans;
CREATE POLICY "Professionals can view assigned recurring plans"
ON recurring_plans FOR SELECT
USING ((select auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Customers can create recurring plans" ON recurring_plans;
CREATE POLICY "Customers can create recurring plans"
ON recurring_plans FOR INSERT
WITH CHECK ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can update own recurring plans" ON recurring_plans;
CREATE POLICY "Customers can update own recurring plans"
ON recurring_plans FOR UPDATE
USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can delete own recurring plans" ON recurring_plans;
CREATE POLICY "Customers can delete own recurring plans"
ON recurring_plans FOR DELETE
USING ((select auth.uid()) = customer_id);

-- ============================================
-- REBOOK_NUDGE_EXPERIMENTS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Customers can view own rebook nudge experiments" ON rebook_nudge_experiments;
CREATE POLICY "Customers can view own rebook nudge experiments"
ON rebook_nudge_experiments FOR SELECT
USING ((select auth.uid()) = customer_id);

-- ============================================
-- ETTA_CONVERSATIONS (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view own conversations" ON etta_conversations;
CREATE POLICY "Users can view own conversations"
ON etta_conversations FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own conversations" ON etta_conversations;
CREATE POLICY "Users can create own conversations"
ON etta_conversations FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON etta_conversations;
CREATE POLICY "Users can update own conversations"
ON etta_conversations FOR UPDATE
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON etta_conversations;
CREATE POLICY "Users can delete own conversations"
ON etta_conversations FOR DELETE
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all conversations" ON etta_conversations;
CREATE POLICY "Admins can view all conversations"
ON etta_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- CHANGELOG_VIEWS (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view own changelog views" ON changelog_views;
CREATE POLICY "Users can view own changelog views"
ON changelog_views FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own changelog views" ON changelog_views;
CREATE POLICY "Users can insert own changelog views"
ON changelog_views FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own changelog views" ON changelog_views;
CREATE POLICY "Users can update own changelog views"
ON changelog_views FOR UPDATE
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all changelog views" ON changelog_views;
CREATE POLICY "Admins can view all changelog views"
ON changelog_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- FEEDBACK_SUBMISSIONS (5 policies)
-- ============================================

DROP POLICY IF EXISTS "Users view own feedback" ON feedback_submissions;
CREATE POLICY "Users view own feedback"
ON feedback_submissions FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users submit feedback" ON feedback_submissions;
CREATE POLICY "Authenticated users submit feedback"
ON feedback_submissions FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins view all feedback" ON feedback_submissions;
CREATE POLICY "Admins view all feedback"
ON feedback_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins update feedback" ON feedback_submissions;
CREATE POLICY "Admins update feedback"
ON feedback_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins delete feedback" ON feedback_submissions;
CREATE POLICY "Admins delete feedback"
ON feedback_submissions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- MOBILE_PUSH_TOKENS (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Users can manage their own mobile push tokens" ON mobile_push_tokens;
CREATE POLICY "Users can manage their own mobile push tokens"
ON mobile_push_tokens FOR ALL
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- HELP_ARTICLE_FEEDBACK (1 policy)
-- ============================================

DROP POLICY IF EXISTS "Users can view own feedback" ON help_article_feedback;
CREATE POLICY "Users can view own feedback"
ON help_article_feedback FOR SELECT
USING ((select auth.uid()) = user_id);

-- ============================================
-- REFERRAL_CODES (2 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own referral codes" ON referral_codes;
CREATE POLICY "Users can view their own referral codes"
ON referral_codes FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own referral codes" ON referral_codes;
CREATE POLICY "Users can create their own referral codes"
ON referral_codes FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- ROADMAP_ITEMS (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Admins can view all roadmap items" ON roadmap_items;
CREATE POLICY "Admins can view all roadmap items"
ON roadmap_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can create roadmap items" ON roadmap_items;
CREATE POLICY "Admins can create roadmap items"
ON roadmap_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update roadmap items" ON roadmap_items;
CREATE POLICY "Admins can update roadmap items"
ON roadmap_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete roadmap items" ON roadmap_items;
CREATE POLICY "Admins can delete roadmap items"
ON roadmap_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- ROADMAP_VOTES (2 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can create their own votes" ON roadmap_votes;
CREATE POLICY "Users can create their own votes"
ON roadmap_votes FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON roadmap_votes;
CREATE POLICY "Users can delete their own votes"
ON roadmap_votes FOR DELETE
USING ((select auth.uid()) = user_id);

-- ============================================
-- ROADMAP_COMMENTS (7 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own comments" ON roadmap_comments;
CREATE POLICY "Users can view their own comments"
ON roadmap_comments FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all comments" ON roadmap_comments;
CREATE POLICY "Admins can view all comments"
ON roadmap_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON roadmap_comments;
CREATE POLICY "Authenticated users can create comments"
ON roadmap_comments FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON roadmap_comments;
CREATE POLICY "Users can update their own comments"
ON roadmap_comments FOR UPDATE
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can update any comment" ON roadmap_comments;
CREATE POLICY "Admins can update any comment"
ON roadmap_comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can delete their own comments" ON roadmap_comments;
CREATE POLICY "Users can delete their own comments"
ON roadmap_comments FOR DELETE
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can delete any comment" ON roadmap_comments;
CREATE POLICY "Admins can delete any comment"
ON roadmap_comments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- PRICING_PLANS (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Admins can view all pricing plans" ON pricing_plans;
CREATE POLICY "Admins can view all pricing plans"
ON pricing_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can create pricing plans" ON pricing_plans;
CREATE POLICY "Admins can create pricing plans"
ON pricing_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update pricing plans" ON pricing_plans;
CREATE POLICY "Admins can update pricing plans"
ON pricing_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete pricing plans" ON pricing_plans;
CREATE POLICY "Admins can delete pricing plans"
ON pricing_plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- PRICING_FAQS (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Admins can view all FAQs" ON pricing_faqs;
CREATE POLICY "Admins can view all FAQs"
ON pricing_faqs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can create FAQs" ON pricing_faqs;
CREATE POLICY "Admins can create FAQs"
ON pricing_faqs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update FAQs" ON pricing_faqs;
CREATE POLICY "Admins can update FAQs"
ON pricing_faqs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete FAQs" ON pricing_faqs;
CREATE POLICY "Admins can delete FAQs"
ON pricing_faqs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- ============================================
-- SUMMARY
-- ============================================

COMMENT ON SCHEMA public IS 'Fixed 48 auth_rls_initplan warnings by wrapping auth.uid() in SELECT subqueries for performance optimization';
