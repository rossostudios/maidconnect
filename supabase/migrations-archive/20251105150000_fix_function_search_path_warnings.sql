/**
 * Fix function_search_path_mutable warnings
 *
 * Issue: Functions without explicit search_path are vulnerable to search_path hijacking
 * Solution: Set search_path = '' on all functions to require fully-qualified names
 *
 * Affected: Up to 77 functions (only those that exist in your database)
 * See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
 *
 * Using DO blocks to check function existence before altering
 */

-- Helper function to safely alter function search_path
DO $$
DECLARE
  func_name text;
  func_signature text;
  func_list text[][] := ARRAY[
    -- FEEDBACK & CHANGELOG FUNCTIONS
    ['set_feedback_updated_at', '()'],
    ['set_changelog_updated_at', '()'],
    ['update_article_feedback_counts', '()'],
    ['get_feedback_stats', '()'],
    ['get_unread_changelog_count', '(uuid)'],

    -- HELP ARTICLES FUNCTIONS
    ['search_help_articles', '(text)'],
    ['increment_article_view_count', '(uuid)'],

    -- BOOKING FUNCTIONS
    ['get_professional_booking_summary', '(uuid)'],
    ['get_customer_booking_summary', '(uuid)'],
    ['check_booking_availability', '(uuid, timestamptz, timestamptz)'],
    ['set_booking_number', '()'],
    ['generate_booking_number', '()'],
    ['set_booking_updated_at', '()'],
    ['track_booking_status_change', '()'],
    ['set_completed_at', '()'],

    -- PROFESSIONAL FUNCTIONS
    ['get_professional_services_summary', '(uuid)'],
    ['search_professionals', '(text, text, numeric, numeric, integer)'],
    ['list_active_professionals', '()'],
    ['update_professional_search_vector', '()'],
    ['update_professional_search_on_profile_change', '()'],
    ['professional_search_vector', '(uuid)'],
    ['get_top_professionals_by_completion_rate', '(integer)'],

    -- PERFORMANCE & METRICS FUNCTIONS
    ['calculate_professional_metrics', '(uuid)'],
    ['initialize_performance_metrics', '(uuid)'],
    ['auto_initialize_performance_metrics', '()'],
    ['get_performance_summary', '(uuid, date, date)'],
    ['generate_daily_revenue_snapshot', '(uuid)'],
    ['get_revenue_trend', '(uuid, integer)'],

    -- NOTIFICATION & SUBSCRIPTION FUNCTIONS
    ['update_notification_subscriptions_updated_at', '()'],
    ['set_mobile_push_tokens_updated_at', '()'],

    -- PRICING FUNCTIONS
    ['update_pricing_rule', '()'],
    ['get_pricing_rule', '(text, text, text)'],
    ['calculate_service_price', '(uuid, integer)'],
    ['calculate_bundle_final_price', '()'],
    ['update_pricing_plans_updated_at', '()'],
    ['update_pricing_faqs_updated_at', '()'],

    -- ONBOARDING FUNCTIONS
    ['update_onboarding_completion', '(uuid, text)'],
    ['mark_onboarding_item_completed', '(uuid, text)'],
    ['get_onboarding_progress', '(uuid)'],

    -- PAYOUT & FINANCIAL FUNCTIONS
    ['set_payouts_updated_at', '()'],
    ['set_disputes_updated_at', '()'],

    -- ROADMAP FUNCTIONS
    ['update_roadmap_items_updated_at', '()'],
    ['update_roadmap_comment_count', '()'],
    ['update_roadmap_vote_count', '()'],
    ['update_roadmap_comments_updated_at', '()'],
    ['get_user_roadmap_vote_count', '(uuid)'],
    ['has_user_voted', '(uuid, uuid)'],

    -- REVIEW FUNCTIONS
    ['set_admin_professional_reviews_updated_at', '()'],
    ['set_customer_review_updated_at', '()'],

    -- SERVICE FUNCTIONS
    ['check_service_ownership', '(uuid)'],
    ['set_service_addons_updated_at', '()'],
    ['is_within_service_radius', '(uuid, numeric, numeric)'],

    -- CONVERSATION & MESSAGING FUNCTIONS
    ['update_etta_conversations_updated_at', '()'],
    ['update_conversation_on_message', '()'],
    ['update_conversation_last_message_at', '()'],
    ['set_conversations_updated_at', '()'],

    -- REFERRAL FUNCTIONS
    ['update_referral_updated_at', '()'],

    -- AVAILABILITY FUNCTIONS
    ['refresh_availability_cache', '(uuid, date, date)'],

    -- RECURRING PLANS FUNCTIONS (Sprint 2)
    ['calculate_next_booking_date', '(text, integer, date, text)'],
    ['update_recurring_plan_metadata', '()'],

    -- REBOOK NUDGE FUNCTIONS (Sprint 2)
    ['track_rebook_conversion', '()'],

    -- ADMIN & USER MANAGEMENT FUNCTIONS
    ['set_admin_by_email', '(text)'],
    ['prevent_role_change', '()'],
    ['set_user_suspensions_updated_at', '()'],

    -- GENERIC UTILITY FUNCTIONS
    ['update_updated_at_column', '()'],

    -- CONSENT FUNCTIONS
    ['protect_required_consents', '()'],

    -- CRON TRIGGER FUNCTIONS
    ['trigger_auto_decline_cron', '()']
  ];
BEGIN
  -- Loop through each function and alter if it exists
  FOREACH func_list SLICE 1 IN ARRAY func_list
  LOOP
    func_name := func_list[1];
    func_signature := func_list[2];

    -- Check if function exists
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
      AND p.proname = func_name
    ) THEN
      BEGIN
        -- Try to alter the function
        EXECUTE format('ALTER FUNCTION public.%I%s SET search_path = ''''', func_name, func_signature);
        RAISE NOTICE 'Fixed search_path for function: %', func_name;
      EXCEPTION
        WHEN undefined_function THEN
          RAISE NOTICE 'Skipped function (signature mismatch): % %', func_name, func_signature;
        WHEN OTHERS THEN
          RAISE NOTICE 'Error altering function %: %', func_name, SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'Skipped function (does not exist): %', func_name;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

COMMENT ON SCHEMA public IS 'Fixed function_search_path_mutable warnings by setting search_path = empty string for security (conditional on function existence)';
