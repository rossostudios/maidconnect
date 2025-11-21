-- =====================================================
-- Security Fix: SECURITY DEFINER Functions Missing Immutable search_path
-- =====================================================
-- Purpose: Fix 44 SECURITY DEFINER functions vulnerable to search_path injection
-- Impact: Eliminates 44 security warnings in Supabase Performance Advisor
-- Vulnerability: Functions without SET search_path can be exploited via malicious schemas
-- Solution: Add immutable search_path to all SECURITY DEFINER functions
-- =====================================================

-- =====================================================
-- Category 1: User & Profile Management (7 functions)
-- =====================================================

ALTER FUNCTION public.create_user_profile(uuid, text, text, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_user_profile(uuid, text, text, text, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_profile(uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.delete_user_account(uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_professional_profile(uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_professional_availability(uuid, jsonb)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_customer_booking_history(uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 2: Booking Functions (3 functions)
-- =====================================================

ALTER FUNCTION public.create_booking(uuid, uuid, uuid, timestamp with time zone, timestamp with time zone, numeric, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_booking_status(uuid, text, uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.cancel_booking(uuid, uuid, text)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 3: Referral & Credits (3 functions)
-- =====================================================

ALTER FUNCTION public.process_referral(uuid, uuid, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.apply_referral_credit(uuid, uuid, numeric)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_trial_credits_status(uuid, uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 4: Messaging (3 functions)
-- =====================================================

ALTER FUNCTION public.create_conversation(uuid, uuid, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.send_message(uuid, uuid, text, jsonb)
SET search_path = public, pg_temp;

ALTER FUNCTION public.mark_messages_as_read(uuid, uuid[])
SET search_path = public, pg_temp;

-- =====================================================
-- Category 5: Authorization & Claims (3 functions)
-- =====================================================

ALTER FUNCTION public.custom_access_token_hook(jsonb)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_roles(uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_user_claims(uuid, jsonb)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 6: Help Center (6 functions)
-- =====================================================

ALTER FUNCTION public.search_help_articles(text, text, integer)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_help_article_by_slug(text, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.increment_article_views(uuid)
SET search_path = public, pg_temp;

ALTER FUNCTION public.submit_article_feedback(uuid, boolean, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_related_articles(uuid, integer)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_help_categories(text)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 7: Analytics (6 functions)
-- =====================================================

ALTER FUNCTION public.track_page_view(uuid, text, text, jsonb)
SET search_path = public, pg_temp;

ALTER FUNCTION public.track_custom_event(uuid, text, jsonb)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_dashboard_analytics(uuid, timestamp with time zone, timestamp with time zone)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_booking_analytics(timestamp with time zone, timestamp with time zone, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_revenue_analytics(timestamp with time zone, timestamp with time zone, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_professional_performance_metrics(uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 8: Changelog (1 function)
-- =====================================================

ALTER FUNCTION public.get_changelog_entries(text, integer, integer)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 9: Roadmap (2 functions)
-- =====================================================

ALTER FUNCTION public.vote_on_roadmap_item(uuid, uuid, integer)
SET search_path = public, pg_temp;

ALTER FUNCTION public.comment_on_roadmap_item(uuid, uuid, text)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 10: Professional Stats (1 function)
-- =====================================================

ALTER FUNCTION public.update_professional_stats(uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 11: Suspension (1 function)
-- =====================================================

ALTER FUNCTION public.check_user_suspension(uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 12: Guest Sessions (2 functions)
-- =====================================================

ALTER FUNCTION public.create_guest_session(text, text)
SET search_path = public, pg_temp;

ALTER FUNCTION public.convert_guest_to_user(uuid, uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 13: Platform Events (1 function)
-- =====================================================

ALTER FUNCTION public.log_platform_event(text, jsonb, uuid)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 14: Consent (1 function)
-- =====================================================

ALTER FUNCTION public.update_user_consent(uuid, text, boolean)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 15: Utility (1 function)
-- =====================================================

ALTER FUNCTION public.generate_unique_slug(text, text)
SET search_path = public, pg_temp;

-- =====================================================
-- Category 16: PostGIS (3 functions)
-- =====================================================

ALTER FUNCTION public.find_nearby_professionals(double precision, double precision, integer, integer)
SET search_path = public, pg_temp;

ALTER FUNCTION public.calculate_distance(double precision, double precision, double precision, double precision)
SET search_path = public, pg_temp;

ALTER FUNCTION public.get_professionals_in_city(text, text)
SET search_path = public, pg_temp;

-- =====================================================
-- Migration Summary
-- =====================================================
-- Total functions fixed: 44
-- Security vulnerability: search_path injection
-- Fix applied: SET search_path = public, pg_temp
--
-- Impact:
-- - Prevents malicious schema creation attacks
-- - Ensures functions only access public schema and temporary tables
-- - Eliminates 44 security warnings from Performance Advisor
--
-- Categories:
-- 1. User/Profile: 7 functions
-- 2. Booking: 3 functions
-- 3. Referral/Credits: 3 functions
-- 4. Messaging: 3 functions
-- 5. Auth/Claims: 3 functions
-- 6. Help Center: 6 functions
-- 7. Analytics: 6 functions
-- 8. Changelog: 1 function
-- 9. Roadmap: 2 functions
-- 10. Professional Stats: 1 function
-- 11. Suspension: 1 function
-- 12. Guest Sessions: 2 functions
-- 13. Platform Events: 1 function
-- 14. Consent: 1 function
-- 15. Utility: 1 function
-- 16. PostGIS: 3 functions
-- =====================================================

-- =====================================================
-- Verification Query (Run After Migration)
-- =====================================================
-- Check for remaining SECURITY DEFINER functions without search_path:
--
-- SELECT
--   n.nspname as schema,
--   p.proname as function_name,
--   pg_get_functiondef(p.oid) as definition
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE p.prosecdefiner = true
--   AND n.nspname = 'public'
--   AND pg_get_functiondef(p.oid) NOT LIKE '%SET search_path%'
-- ORDER BY p.proname;
--
-- Expected result: 0 rows (all functions should have search_path set)
-- =====================================================
