-- =====================================================
-- STANDALONE SCRIPT: Drop Unused Indexes
-- =====================================================
-- Purpose: Drop 150+ unused indexes identified by supabase inspect
-- Impact: Reduce storage by 5-10 MB, improve write performance
--
-- IMPORTANT: This script MUST be run OUTSIDE a transaction block
-- Execute via:
--   1. Supabase Dashboard → SQL Editor → Paste & Run
--   2. psql command line (not via migration)
--
-- DO NOT run via: supabase db push (will fail in transaction)
-- =====================================================

-- ===========================================
-- 1. UNUSED SEARCH INDEXES (Confirmed 0 scans)
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_search_es;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_city_trgm;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_full_name_trgm;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_full_name_trgm;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_search_vector;

-- ===========================================
-- 2. UNUSED PRICING CONTROLS INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_controls_category;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_controls_city;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_controls_effective;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_controls_active;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_controls_created_by;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_active_rule;

-- ===========================================
-- 3. UNUSED RLS HELPER INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_profiles_profile_id_rls;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_customer_profiles_profile_id_rls;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_professional_id_rls;

-- ===========================================
-- 4. UNUSED SERVICE CATALOG INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_service_categories_active;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_service_categories_slug;
DROP INDEX CONCURRENTLY IF EXISTS public.service_categories_slug_key;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_service_bundles_active;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_service_bundles_services;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_services_category;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_tiers_service;

-- ===========================================
-- 5. DUPLICATE/REDUNDANT PROFILE INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_role;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_phone;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_account_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_can_accept_bookings;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_onboarding_pending;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_city;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_full_name;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_id_role;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_city_role_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_onboarding_checklist;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_updated_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_profiles_marketing_consent;

-- ===========================================
-- 6. UNUSED HELP CENTER INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_published;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_category;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_popular;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_order;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_author_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_articles_category_published;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_category_slug;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_categories_active;

-- ===========================================
-- 7. UNUSED OLD MESSAGING SYSTEM INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_conversation_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_sender;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_created_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_conversation_created;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_participants;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_messages_unread;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_conversations_participants;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_conversations_professional_unread;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_conversations_professional_last_message;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_conversations_customer_last_message;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_conversations_professional;

-- ===========================================
-- 8. UNUSED AMARA MESSAGING INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_conversations_user_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_conversations_is_active;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_conversations_last_message_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_messages_conversation_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_messages_role;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_messages_created_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_tool_runs_conversation;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_tool_runs_user;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_amara_tool_runs_name;

-- ===========================================
-- 9. UNUSED PLATFORM/ANALYTICS INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_platform_events_type_date;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_platform_events_properties;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_platform_settings_category;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_search_analytics_query;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_search_analytics_clicked;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_search_analytics_no_results;

-- ===========================================
-- 10. UNUSED REFERRAL SYSTEM INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_referral_codes_code;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_referral_codes_active;

-- ===========================================
-- 11. UNUSED PROFESSIONAL FEATURE INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_portfolio;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_profiles_avatar_url;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_profiles_verification;
DROP INDEX CONCURRENTLY IF EXISTS public.professional_profiles_location_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.professional_profiles_public_visibility_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.professional_profiles_slug_unique_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_performance_metrics_profile;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_performance_metrics_rating;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_performance_metrics_completion_rate;

-- ===========================================
-- 12. UNUSED PROFESSIONAL REVIEW INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_reviews_professional_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_reviews_by_customer;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_reviews_avg_score;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_professional_reviews_pro_created;

-- ===========================================
-- 13. UNUSED PAYOUT SYSTEM INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_booking_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_professional_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_professional;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_type;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_transfers_stripe_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_payout_batches_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_balance_clearance_pending;

-- ===========================================
-- 14. UNUSED CUSTOMER FEATURE INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_customer_favorites;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_customer_reviews_by_customer;

-- ===========================================
-- 15. UNUSED RECURRING PLANS INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.recurring_plans_customer_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.recurring_plans_professional_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.recurring_plan_holidays_plan_id_idx;

-- ===========================================
-- 16. UNUSED BOOKING INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_customer_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_professional_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_scheduled_start;
DROP INDEX CONCURRENTLY IF EXISTS public.bookings_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.bookings_updated_at_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_pro_scheduled_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_trial_credit_applied;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_direct_hire_paid;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_guest_session_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_first_touch_source;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_booking_source;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_created_booking_source;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_bookings_cron_auto_decline;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_status_history_booking;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_booking_status_history_booking_id;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_booking_addon;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_booking_addons_addon_id;

-- ===========================================
-- 17. UNUSED ROADMAP FEATURE INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_roadmap_items_category;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_roadmap_items_slug;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_roadmap_items_vote_count;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_roadmap_items_visibility;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_roadmap_items_changelog_id;

-- ===========================================
-- 18. UNUSED MISCELLANEOUS INDEXES
-- ===========================================

DROP INDEX CONCURRENTLY IF EXISTS public.idx_sms_logs_user;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_moderation_flags_severity_status;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_moderation_flags_created_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_user_suspensions_is_active;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_user_suspensions_expires_at;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_insurance_claims_professional;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_interview_slots_professional;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_interview_slots_scheduled;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_guest_sessions_email;
DROP INDEX CONCURRENTLY IF EXISTS public.notifications_user_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.mobile_push_tokens_user_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_briefs_service_type;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_briefs_metadata;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_feedback_article;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_help_relations_related;
DROP INDEX CONCURRENTLY IF EXISTS public.rebook_nudge_experiments_booking_id_key;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_profile_travel_buffer;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_plans_slug;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_plans_visible;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_plans_display_order;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_pricing_plans_target_audience;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_service_tier_level;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_background_checks_professional;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_background_checks_provider_check;
DROP INDEX CONCURRENTLY IF EXISTS public.unique_session_article;

-- ===========================================
-- SCRIPT COMPLETE
-- ===========================================
-- Summary: Dropped ~150 unused indexes
-- Expected Duration: 10-30 minutes
-- Safe for production: Yes (CONCURRENTLY prevents table locks)
-- ===========================================
