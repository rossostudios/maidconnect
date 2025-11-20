


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'Fixed remaining 30 auth_rls_initplan warnings in part 2';


-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA "extensions";


-- Create private schema for internal helper functions (needed by RLS policies)
CREATE SCHEMA IF NOT EXISTS private;

-- Helper function to check user role (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION private.user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = check_role
  );
$$;

COMMENT ON FUNCTION private.user_has_role(text) IS
  'Checks if current user has specified role. Uses SECURITY DEFINER to avoid RLS recursion.';


CREATE TYPE "public"."authorization_status" AS ENUM (
    'authorized',
    'captured',
    'cancelled',
    'expired'
);


ALTER TYPE "public"."authorization_status" OWNER TO "postgres";


CREATE TYPE "public"."background_check_status" AS ENUM (
    'pending',
    'clear',
    'consider',
    'suspended'
);


ALTER TYPE "public"."background_check_status" OWNER TO "postgres";


CREATE TYPE "public"."claim_status" AS ENUM (
    'filed',
    'investigating',
    'approved',
    'denied',
    'paid'
);


ALTER TYPE "public"."claim_status" OWNER TO "postgres";


CREATE TYPE "public"."claim_type" AS ENUM (
    'damage',
    'theft',
    'injury',
    'other'
);


ALTER TYPE "public"."claim_type" OWNER TO "postgres";


CREATE TYPE "public"."interview_status" AS ENUM (
    'scheduled',
    'completed',
    'no_show',
    'rescheduled',
    'cancelled'
);


ALTER TYPE "public"."interview_status" OWNER TO "postgres";


CREATE TYPE "public"."sms_status" AS ENUM (
    'sent',
    'delivered',
    'failed',
    'undelivered'
);


ALTER TYPE "public"."sms_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE professional_profiles
  SET
    pending_balance_cop = pending_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id;
END;
$$;


ALTER FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) IS 'Atomically adds amount to professional pending balance. Called when booking is completed.';



CREATE OR REPLACE FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_blocks
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
$$;


ALTER FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") IS 'Check if two users have blocked each other (mutual or one-way)';



CREATE OR REPLACE FUNCTION "public"."audit_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only audit if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Insert into audit_logs if it exists (assuming admin_audit_logs table)
    -- This will be called by the application layer
    NULL;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."audit_booking_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_slug_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only generate slug if not already provided and full_name exists
  IF NEW.slug IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.slug := generate_professional_slug(NEW.full_name, NEW.profile_id);
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_generate_slug_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_initialize_performance_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.role = 'professional' THEN
    INSERT INTO professional_performance_metrics (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_initialize_performance_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referral record;
  v_referrer_balance integer;
  v_referee_balance integer;
  v_credits_expire_at timestamptz := now() + interval '365 days'; -- Credits expire in 1 year
BEGIN
  -- Get referral details
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE id = p_referral_id
    AND status = 'qualified'
  FOR UPDATE; -- Lock row to prevent double-awarding

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral not found or not in qualified status';
  END IF;

  -- Get current balances
  v_referrer_balance := public.get_user_referral_credits(v_referral.referrer_id);
  v_referee_balance := public.get_user_referral_credits(v_referral.referee_id);

  -- Award credit to referrer
  INSERT INTO public.referral_credits (
    user_id, amount, balance_after, transaction_type, referral_id, description, expires_at
  ) VALUES (
    v_referral.referrer_id,
    v_referral.referrer_credit_amount,
    v_referrer_balance + v_referral.referrer_credit_amount,
    'referral_reward',
    p_referral_id,
    'Referral reward for inviting ' || (SELECT email FROM auth.users WHERE id = v_referral.referee_id),
    v_credits_expire_at
  );

  -- Award credit to referee (signup bonus)
  INSERT INTO public.referral_credits (
    user_id, amount, balance_after, transaction_type, referral_id, description, expires_at
  ) VALUES (
    v_referral.referee_id,
    v_referral.referee_credit_amount,
    v_referee_balance + v_referral.referee_credit_amount,
    'signup_bonus',
    p_referral_id,
    'Welcome bonus for signing up with a referral code',
    v_credits_expire_at
  );

  -- Update referral status
  UPDATE public.referrals
  SET
    status = 'rewarded',
    rewarded_at = now(),
    qualifying_booking_id = p_booking_id,
    updated_at = now()
  WHERE id = p_referral_id;

  -- Increment referral code usage count
  UPDATE public.referral_codes
  SET
    uses_count = uses_count + 1,
    updated_at = now()
  WHERE id = v_referral.referral_code_id;
END;
$$;


ALTER FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") IS 'Awards credits to both referrer and referee when qualifying booking completes';



CREATE OR REPLACE FUNCTION "public"."calculate_bundle_final_price"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.final_price_cop := NEW.base_price_cop - (NEW.base_price_cop * NEW.discount_percentage / 100);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_bundle_final_price"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT (booking_total * deposit_percentage / 100);
$$;


ALTER FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) IS 'Calculate deposit amount from total and percentage';



CREATE OR REPLACE FUNCTION "public"."calculate_next_booking_date"("start_date" "date", "frequency_type" "text", "day_of_week" integer) RETURNS "date"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  next_date date;
  days_until_target integer;
begin
  -- For monthly, just add 30 days
  if frequency_type = 'monthly' then
    return start_date + interval '30 days';
  end if;

  -- Calculate days until target day of week
  days_until_target := (day_of_week - extract(dow from start_date)::integer + 7) % 7;

  -- If days_until_target is 0, move to next occurrence
  if days_until_target = 0 then
    days_until_target := case
      when frequency_type = 'weekly' then 7
      when frequency_type = 'biweekly' then 14
      else 7
    end;
  end if;

  next_date := start_date + days_until_target;

  return next_date;
end;
$$;


ALTER FUNCTION "public"."calculate_next_booking_date"("start_date" "date", "frequency_type" "text", "day_of_week" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_professional_metrics"("professional_profile_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  metrics JSONB;
BEGIN
  -- For now, return placeholder metrics
  -- This will be updated when the bookings table is created
  metrics := jsonb_build_object(
    'totalBookings', 0,
    'completedBookings', 0,
    'cancelledBookings', 0,
    'completionRate', 0.00,
    'cancellationRate', 0.00,
    'totalRevenueCop', 0,
    'averageBookingValueCop', 0,
    'averageRating', 0.00,
    'totalReviews', 0,
    'bookingsLast30Days', 0,
    'bookingsLast7Days', 0,
    'revenueLast30DaysCop', 0,
    'revenueLast7DaysCop', 0
  );

  RETURN metrics;
END;
$$;


ALTER FUNCTION "public"."calculate_professional_metrics"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  booking_record record;
  hours_until_service integer;
  refund_percentage integer;
  refund_amount integer;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.bookings
  WHERE id = booking_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate hours until scheduled service
  hours_until_service := EXTRACT(EPOCH FROM (booking_record.scheduled_start - cancellation_time)) / 3600;

  -- Tiered refund policy
  IF hours_until_service >= 48 THEN
    refund_percentage := 100; -- Full refund
  ELSIF hours_until_service >= 24 THEN
    refund_percentage := 50; -- 50% refund
  ELSE
    refund_percentage := 0; -- No refund
  END IF;

  -- Calculate refund amount (from deposit)
  refund_amount := (COALESCE(booking_record.deposit_amount, 0) * refund_percentage / 100);

  RETURN refund_amount;
END;
$$;


ALTER FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) IS 'Calculate refund based on tiered cancellation policy';



CREATE OR REPLACE FUNCTION "public"."calculate_service_price"("service_id_param" "uuid", "tier_id_param" "uuid" DEFAULT NULL::"uuid", "addon_ids_param" "uuid"[] DEFAULT ARRAY[]::"uuid"[]) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_price INTEGER;
  tier_price INTEGER := 0;
  addons_price INTEGER := 0;
  service_duration INTEGER := 0;
  addons_duration INTEGER := 0;
  total_duration INTEGER;
  result JSONB;
BEGIN
  SELECT base_price_cop, COALESCE(estimated_duration_minutes, 0)
  INTO base_price, service_duration
  FROM professional_services
  WHERE id = service_id_param;

  IF tier_id_param IS NOT NULL THEN
    SELECT price_cop INTO tier_price
    FROM service_pricing_tiers
    WHERE id = tier_id_param AND service_id = service_id_param;
  END IF;

  IF array_length(addon_ids_param, 1) > 0 THEN
    SELECT COALESCE(SUM(price_cop), 0), COALESCE(SUM(additional_duration_minutes), 0)
    INTO addons_price, addons_duration
    FROM service_addons
    WHERE id = ANY(addon_ids_param) AND service_id = service_id_param;
  END IF;

  total_duration := service_duration + addons_duration;

  result := jsonb_build_object(
    'basePrice', base_price,
    'tierPrice', tier_price,
    'addonsPrice', addons_price,
    'totalPrice', COALESCE(tier_price, base_price) + addons_price,
    'estimatedDurationMinutes', total_duration
  );

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."calculate_service_price"("service_id_param" "uuid", "tier_id_param" "uuid", "addon_ids_param" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_booking_availability"("professional_profile_id" "uuid", "booking_date" "date", "start_time" time without time zone, "end_time" time without time zone, "exclude_booking_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE professional_id = professional_profile_id
    AND scheduled_date = booking_date
    AND status NOT IN ('cancelled', 'completed')
    AND (id != exclude_booking_id OR exclude_booking_id IS NULL)
    AND (scheduled_start_time, scheduled_end_time) OVERLAPS (start_time, end_time);
  RETURN conflict_count = 0;
END;
$$;


ALTER FUNCTION "public"."check_booking_availability"("professional_profile_id" "uuid", "booking_date" "date", "start_time" time without time zone, "end_time" time without time zone, "exclude_booking_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer DEFAULT 3) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Upsert today's rate limit record
  INSERT INTO payout_rate_limits (professional_id, payout_date, instant_payout_count, last_payout_at)
  VALUES (p_professional_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (professional_id, payout_date)
  DO UPDATE SET
    instant_payout_count = payout_rate_limits.instant_payout_count + 1,
    last_payout_at = NOW(),
    updated_at = NOW()
  RETURNING instant_payout_count INTO v_current_count;

  -- Return true if under limit, false if exceeded
  RETURN v_current_count <= p_max_daily_limit;
END;
$$;


ALTER FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer) IS 'Atomically checks and increments daily instant payout count. Returns true if under limit (default: 3/day).';



CREATE OR REPLACE FUNCTION "public"."check_service_ownership"("p_service_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM professional_services
    WHERE id = p_service_id AND profile_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."check_service_ownership"("p_service_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_guest_sessions"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM public.guest_sessions
  WHERE expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_guest_sessions"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_expired_guest_sessions"() IS 'Removes expired guest sessions (called by cron)';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_platform_events"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM public.platform_events
  WHERE created_at < now() - interval '90 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_platform_events"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_platform_events"() IS 'Removes events older than 90 days (called by cron)';



CREATE OR REPLACE FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE professional_profiles
  SET
    pending_balance_cop = pending_balance_cop - p_amount_cop,
    available_balance_cop = available_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id
    AND pending_balance_cop >= p_amount_cop; -- Safety check

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient pending balance for professional %', p_professional_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) IS 'Moves amount from pending to available balance after 24hr clearance. Includes safety checks.';



CREATE OR REPLACE FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Update all bookings associated with guest session
  -- Set customer_id and clear guest_session_id
  UPDATE public.bookings
  SET
    customer_id = p_user_id,
    guest_session_id = NULL,  -- Clear guest session after conversion
    updated_at = now()
  WHERE guest_session_id = p_guest_session_id;

  -- Mark guest session as converted
  UPDATE public.guest_sessions
  SET
    metadata = metadata || jsonb_build_object(
      'converted_to_user_id', p_user_id,
      'converted_at', now()
    )
  WHERE id = p_guest_session_id;
END;
$$;


ALTER FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") IS 'Converts guest bookings to authenticated user account';



CREATE OR REPLACE FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE professional_profiles
  SET
    available_balance_cop = available_balance_cop - p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id
    AND available_balance_cop >= p_amount_cop; -- Safety check

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient available balance for professional %', p_professional_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) IS 'Deducts amount from available balance when instant payout is processed. Prevents overdrafts.';



CREATE OR REPLACE FUNCTION "public"."diagnose_help_center"() RETURNS TABLE("check_name" "text", "status" "text", "details" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  article_count integer;
  category_count integer;
  published_count integer;
  rls_enabled_articles boolean;
  rls_enabled_categories boolean;
BEGIN
  -- Check article counts
  SELECT COUNT(*) INTO article_count FROM public.help_articles;
  SELECT COUNT(*) INTO category_count FROM public.help_categories;
  SELECT COUNT(*) INTO published_count FROM public.help_articles WHERE is_published = true;

  -- Check RLS status
  SELECT relrowsecurity INTO rls_enabled_articles
  FROM pg_class
  WHERE oid = 'public.help_articles'::regclass;

  SELECT relrowsecurity INTO rls_enabled_categories
  FROM pg_class
  WHERE oid = 'public.help_categories'::regclass;

  -- Return diagnostic results
  RETURN QUERY
  SELECT 'Total Articles'::text, 'INFO'::text, article_count::text;

  RETURN QUERY
  SELECT 'Published Articles'::text,
         CASE WHEN published_count > 0 THEN 'OK' ELSE 'WARNING' END::text,
         published_count::text || ' articles';

  RETURN QUERY
  SELECT 'Total Categories'::text, 'INFO'::text, category_count::text;

  RETURN QUERY
  SELECT 'RLS on Articles'::text,
         CASE WHEN rls_enabled_articles THEN 'OK' ELSE 'ERROR' END::text,
         CASE WHEN rls_enabled_articles THEN 'Enabled' ELSE 'DISABLED - Articles are NOT protected!' END::text;

  RETURN QUERY
  SELECT 'RLS on Categories'::text,
         CASE WHEN rls_enabled_categories THEN 'OK' ELSE 'ERROR' END::text,
         CASE WHEN rls_enabled_categories THEN 'Enabled' ELSE 'DISABLED - Categories are NOT protected!' END::text;

  -- Check for articles without categories
  RETURN QUERY
  SELECT 'Orphaned Articles'::text,
         CASE WHEN EXISTS (
           SELECT 1 FROM public.help_articles a
           LEFT JOIN public.help_categories c ON a.category_id = c.id
           WHERE c.id IS NULL
         ) THEN 'WARNING' ELSE 'OK' END::text,
         COALESCE(
           (SELECT COUNT(*)::text || ' articles without valid category'
            FROM public.help_articles a
            LEFT JOIN public.help_categories c ON a.category_id = c.id
            WHERE c.id IS NULL),
           'All articles have valid categories'
         );
END;
$$;


ALTER FUNCTION "public"."diagnose_help_center"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."diagnose_help_center"() IS 'Diagnostic function to check help center configuration and identify issues. Run: SELECT * FROM diagnose_help_center();';



CREATE OR REPLACE FUNCTION "public"."generate_booking_number"() RETURNS character varying
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  next_num INTEGER;
  new_number VARCHAR(20);
BEGIN
  next_num := nextval('booking_number_seq');
  new_number := 'BK' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(next_num::TEXT, 6, '0');
  RETURN new_number;
END;
$$;


ALTER FUNCTION "public"."generate_booking_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_daily_revenue_snapshot"("professional_profile_id" "uuid", "snapshot_date" "date" DEFAULT CURRENT_DATE) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  snapshot_data JSONB;
BEGIN
  -- Placeholder implementation
  -- Will be updated when bookings table exists
  INSERT INTO professional_revenue_snapshots (
    profile_id,
    snapshot_date,
    period_type,
    total_revenue_cop,
    completed_bookings,
    average_booking_value_cop
  )
  VALUES (
    professional_profile_id,
    snapshot_date,
    'daily',
    0, -- Will calculate from bookings
    0, -- Will count from bookings
    0  -- Will average from bookings
  )
  ON CONFLICT (profile_id, snapshot_date, period_type)
  DO UPDATE SET
    total_revenue_cop = EXCLUDED.total_revenue_cop,
    completed_bookings = EXCLUDED.completed_bookings,
    average_booking_value_cop = EXCLUDED.average_booking_value_cop;

  SELECT row_to_json(rs.*)::JSONB INTO snapshot_data
  FROM professional_revenue_snapshots rs
  WHERE rs.profile_id = professional_profile_id
    AND rs.snapshot_date = snapshot_date
    AND rs.period_type = 'daily';

  RETURN snapshot_data;
END;
$$;


ALTER FUNCTION "public"."generate_daily_revenue_snapshot"("professional_profile_id" "uuid", "snapshot_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  -- Generate base slug from full name
  -- 1. Convert to lowercase
  -- 2. Replace spaces with hyphens
  -- 3. Remove special characters (keep only letters, numbers, hyphens)
  -- 4. Remove consecutive hyphens
  -- 5. Trim leading/trailing hyphens
  v_base_slug := LOWER(p_full_name);
  v_base_slug := REGEXP_REPLACE(v_base_slug, '\s+', '-', 'g');
  v_base_slug := REGEXP_REPLACE(v_base_slug, '[^a-z0-9\-]', '', 'g');
  v_base_slug := REGEXP_REPLACE(v_base_slug, '\-+', '-', 'g');
  v_base_slug := TRIM(BOTH '-' FROM v_base_slug);

  -- Limit slug length to 50 characters
  IF LENGTH(v_base_slug) > 50 THEN
    v_base_slug := SUBSTRING(v_base_slug FROM 1 FOR 50);
    v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
  END IF;

  -- If slug is empty after processing, use a default
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'professional';
  END IF;

  -- Append short hash from profile_id for uniqueness
  -- Use first 6 characters of profile_id
  v_final_slug := v_base_slug || '-' || SUBSTRING(p_profile_id::TEXT FROM 1 FOR 6);

  -- Check if slug already exists (should be rare with UUID hash)
  SELECT EXISTS(
    SELECT 1 FROM professional_profiles
    WHERE slug = v_final_slug
    AND profile_id != p_profile_id
  ) INTO v_exists;

  -- If exists, add counter
  WHILE v_exists LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_base_slug || '-' || SUBSTRING(p_profile_id::TEXT FROM 1 FOR 6) || '-' || v_counter::TEXT;

    SELECT EXISTS(
      SELECT 1 FROM professional_profiles
      WHERE slug = v_final_slug
      AND profile_id != p_profile_id
    ) INTO v_exists;
  END LOOP;

  RETURN v_final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") IS 'Generates a unique, SEO-friendly slug from professional full name and profile ID';



CREATE OR REPLACE FUNCTION "public"."generate_referral_code"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- 32 characters (no I, L, O, 0, 1)
  code_length int := 8;
  new_code text;
  code_exists boolean;
  max_attempts int := 100;
  attempt int := 0;
BEGIN
  LOOP
    -- Generate random code
    new_code := '';
    FOR i IN 1..code_length LOOP
      new_code := new_code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    END LOOP;

    -- Format with hyphen for readability: XXXX-YYYY
    new_code := substr(new_code, 1, 4) || '-' || substr(new_code, 5, 4);

    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE code = new_code
    ) INTO code_exists;

    -- Exit if unique or max attempts reached
    EXIT WHEN NOT code_exists OR attempt >= max_attempts;

    attempt := attempt + 1;
  END LOOP;

  IF attempt >= max_attempts THEN
    RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;
  END IF;

  RETURN new_code;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_referral_code"() IS 'Generates unique 8-character referral code (format: XXXX-YYYY) using human-readable alphabet';



CREATE OR REPLACE FUNCTION "public"."get_active_suspension"("user_uuid" "uuid") RETURNS TABLE("id" "uuid", "suspension_type" "text", "reason" "text", "expires_at" timestamp with time zone, "suspended_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.suspension_type,
    s.reason,
    s.expires_at,
    s.suspended_at
  FROM user_suspensions s
  WHERE s.user_id = user_uuid
    AND s.is_active = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
  ORDER BY s.suspended_at DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_active_suspension"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text" DEFAULT 'en'::"text") RETURNS TABLE("article_id" "uuid", "title" "text", "slug" "text", "excerpt" "text", "category_slug" "text", "view_count" integer, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as article_id,
    a.title,
    a.slug,
    a.excerpt,
    c.slug as category_slug,
    a.view_count,
    a.created_at
  FROM public.help_articles a
  JOIN public.help_categories c ON a.category_id = c.id
  JOIN public.help_article_tags_relation r ON a.id = r.article_id
  JOIN public.help_article_tags t ON r.tag_id = t.id
  WHERE
    a.is_published = true
    AND a.locale = locale_filter
    AND t.slug = tag_slug_filter
  ORDER BY a.view_count DESC, a.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text") IS 'Returns all published articles with a specific tag, ordered by popularity.';



CREATE OR REPLACE FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone DEFAULT ("now"() - '30 days'::interval), "p_end_date" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("stage" "text", "unique_users" bigint, "conversion_rate" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  WITH funnel_stages AS (
    SELECT
      'SearchStarted' as stage,
      COUNT(DISTINCT user_id) as users
    FROM public.platform_events
    WHERE event_type = 'SearchStarted'
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    UNION ALL
    SELECT
      'ProfessionalViewed' as stage,
      COUNT(DISTINCT user_id) as users
    FROM public.platform_events
    WHERE event_type = 'ProfessionalViewed'
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    UNION ALL
    SELECT
      'CheckoutStarted' as stage,
      COUNT(DISTINCT user_id) as users
    FROM public.platform_events
    WHERE event_type = 'CheckoutStarted'
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    UNION ALL
    SELECT
      'BookingConfirmed' as stage,
      COUNT(DISTINCT user_id) as users
    FROM public.platform_events
    WHERE event_type = 'BookingConfirmed'
      AND created_at >= p_start_date
      AND created_at <= p_end_date
  )
  SELECT
    fs.stage,
    fs.users as unique_users,
    ROUND(
      100.0 * fs.users / NULLIF(
        (SELECT users FROM funnel_stages WHERE stage = 'SearchStarted'),
        0
      ),
      2
    ) as conversion_rate
  FROM funnel_stages fs;
END;
$$;


ALTER FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) IS 'Calculate conversion funnel metrics (admin only)';



CREATE OR REPLACE FUNCTION "public"."get_customer_booking_summary"("customer_profile_id" "uuid") RETURNS TABLE("total_bookings" integer, "pending_bookings" integer, "completed_bookings" integer, "cancelled_bookings" integer, "total_spent_cop" integer, "pending_ratings" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER,
    COUNT(CASE WHEN status = 'completed' AND customer_rating IS NULL THEN 1 END)::INTEGER
  FROM bookings WHERE customer_id = customer_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_customer_booking_summary"("customer_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone DEFAULT ("now"() - '30 days'::interval), "p_end_date" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("event_type" "text", "event_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.event_type,
    COUNT(*) as event_count
  FROM public.platform_events pe
  WHERE pe.created_at >= p_start_date
    AND pe.created_at <= p_end_date
  GROUP BY pe.event_type
  ORDER BY event_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) IS 'Get event counts by type for analytics (admin only)';



CREATE OR REPLACE FUNCTION "public"."get_feedback_stats"() RETURNS TABLE("total_count" bigint, "new_count" bigint, "in_review_count" bigint, "resolved_count" bigint, "bug_count" bigint, "feature_request_count" bigint, "average_resolution_hours" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_count,
    COUNT(*) FILTER (WHERE status = 'in_review')::BIGINT as in_review_count,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_count,
    COUNT(*) FILTER (WHERE feedback_type = 'bug')::BIGINT as bug_count,
    COUNT(*) FILTER (WHERE feedback_type = 'feature_request')::BIGINT as feature_request_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::NUMERIC, 2) as average_resolution_hours
  FROM feedback_submissions
  WHERE status != 'spam';
END;
$$;


ALTER FUNCTION "public"."get_feedback_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_message_participants"("msg_conversation_id" "uuid") RETURNS "uuid"[]
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT ARRAY[customer_id, professional_id]
  FROM public.conversations
  WHERE id = msg_conversation_id;
$$;


ALTER FUNCTION "public"."get_message_participants"("msg_conversation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_moderation_stats"() RETURNS TABLE("total_flags" bigint, "critical_flags" bigint, "pending_flags" bigint, "auto_detected_flags" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_flags,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT AS critical_flags,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_flags,
    COUNT(*) FILTER (WHERE auto_detected = true)::BIGINT AS auto_detected_flags
  FROM moderation_flags;
END;
$$;


ALTER FUNCTION "public"."get_moderation_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_no_result_searches"("days_back" integer DEFAULT 7, "limit_count" integer DEFAULT 20) RETURNS TABLE("query" "text", "search_count" bigint, "last_searched" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    hsa.query,
    COUNT(*) as search_count,
    MAX(hsa.created_at) as last_searched
  FROM public.help_search_analytics hsa
  WHERE
    hsa.result_count = 0
    AND hsa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY hsa.query
  ORDER BY search_count DESC, last_searched DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_no_result_searches"("days_back" integer, "limit_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_no_result_searches"("days_back" integer, "limit_count" integer) IS 'Returns queries that returned zero results - indicates content gaps that should be filled';



CREATE OR REPLACE FUNCTION "public"."get_onboarding_progress"("professional_profile_id" "uuid") RETURNS TABLE("completion_percentage" integer, "can_accept_bookings" boolean, "completed_items" "jsonb", "pending_required_items" "jsonb")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.onboarding_completion_percentage,
    p.can_accept_bookings,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'completed')::boolean = true
    ) AS completed_items,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'required')::boolean = true
        AND (item->>'completed')::boolean = false
    ) AS pending_required_items
  FROM profiles p
  WHERE p.id = professional_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_onboarding_progress"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_performance_summary"("professional_profile_id" "uuid") RETURNS TABLE("total_bookings" integer, "completion_rate" numeric, "average_rating" numeric, "total_revenue_cop" integer, "revenue_last_30_days_cop" integer, "bookings_last_30_days" integer, "average_booking_value_cop" integer, "repeat_customer_rate" numeric)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.total_bookings,
    pm.completion_rate,
    pm.average_rating,
    pm.total_revenue_cop,
    pm.revenue_last_30_days_cop,
    pm.bookings_last_30_days,
    pm.average_booking_value_cop,
    pm.repeat_customer_rate
  FROM professional_performance_metrics pm
  WHERE pm.profile_id = professional_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_performance_summary"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_popular_tags"("limit_count" integer DEFAULT 10, "locale_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("tag_id" "uuid", "slug" "text", "name" "text", "color" "text", "article_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as tag_id,
    t.slug,
    CASE
      WHEN locale_filter = 'es' THEN t.name_es
      ELSE t.name_en
    END as name,
    t.color,
    COUNT(r.article_id) as article_count
  FROM public.help_article_tags t
  LEFT JOIN public.help_article_tags_relation r ON t.id = r.tag_id
  GROUP BY t.id, t.slug, t.name_en, t.name_es, t.color
  HAVING COUNT(r.article_id) > 0
  ORDER BY article_count DESC, t.slug ASC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_popular_tags"("limit_count" integer, "locale_filter" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_popular_tags"("limit_count" integer, "locale_filter" "text") IS 'Returns most frequently used tags with article counts. Useful for tag clouds and popular topics.';



CREATE OR REPLACE FUNCTION "public"."get_pricing_rule"("p_service_category" "text" DEFAULT NULL::"text", "p_city" "text" DEFAULT NULL::"text", "p_effective_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("id" "uuid", "commission_rate" numeric, "background_check_fee_cop" integer, "min_price_cop" integer, "max_price_cop" integer, "deposit_percentage" numeric, "late_cancel_hours" integer, "late_cancel_fee_percentage" numeric)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Priority order:
  -- 1. Exact category + city match
  -- 2. Category match (any city)
  -- 3. City match (any category)
  -- 4. Default rule (NULL category, NULL city)

  RETURN QUERY
  SELECT
    pc.id,
    pc.commission_rate,
    pc.background_check_fee_cop,
    pc.min_price_cop,
    pc.max_price_cop,
    pc.deposit_percentage,
    pc.late_cancel_hours,
    pc.late_cancel_fee_percentage
  FROM pricing_controls pc
  WHERE
    pc.is_active = true
    AND pc.effective_from <= p_effective_date
    AND (pc.effective_until IS NULL OR pc.effective_until >= p_effective_date)
  ORDER BY
    -- Prioritize most specific rules first
    CASE
      WHEN pc.service_category = p_service_category AND pc.city = p_city THEN 1
      WHEN pc.service_category = p_service_category AND pc.city IS NULL THEN 2
      WHEN pc.service_category IS NULL AND pc.city = p_city THEN 3
      WHEN pc.service_category IS NULL AND pc.city IS NULL THEN 4
      ELSE 5
    END
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_pricing_rule"("p_service_category" "text", "p_city" "text", "p_effective_date" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_pricing_rule"("p_service_category" "text", "p_city" "text", "p_effective_date" "date") IS 'Gets most specific applicable pricing rule for given context';



CREATE OR REPLACE FUNCTION "public"."get_professional_booking_summary"("professional_profile_id" "uuid") RETURNS TABLE("total_bookings" integer, "pending_bookings" integer, "confirmed_bookings" integer, "completed_bookings" integer, "cancelled_bookings" integer, "total_earned_cop" integer, "average_rating" numeric, "total_ratings" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER,
    ROUND(AVG(CASE WHEN professional_rating IS NOT NULL THEN professional_rating END), 2),
    COUNT(CASE WHEN professional_rating IS NOT NULL THEN 1 END)::INTEGER
  FROM bookings WHERE professional_id = professional_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_professional_booking_summary"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") RETURNS TABLE("profile_id" "uuid", "full_name" "text", "bio" "text", "experience_years" integer, "languages" "text"[], "services" "jsonb", "primary_services" "text"[], "availability" "jsonb", "references_data" "jsonb", "portfolio_images" "jsonb", "city" "text", "country" "text", "verification_level" "text", "interview_completed" boolean, "direct_hire_fee_cop" integer, "background_check_passed" boolean, "documents_verified" boolean, "references_verified" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    pp.languages,
    pp.services,
    pp.primary_services,
    pp.availability,
    pp.references_data,
    pp.portfolio_images,
    pp.city,
    pp.country,
    pp.verification_level,
    pp.interview_completed,
    pp.direct_hire_fee_cop,
    -- Verification data from admin_professional_reviews (latest review)
    apr.background_check_passed,
    apr.documents_verified,
    apr.references_verified
  FROM professional_profiles pp
  LEFT JOIN LATERAL (
    SELECT
      background_check_passed,
      documents_verified,
      references_verified
    FROM admin_professional_reviews
    WHERE professional_id = pp.profile_id
    ORDER BY reviewed_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  ) apr ON true
  WHERE pp.profile_id = p_profile_id
    AND pp.status = 'active';
$$;


ALTER FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") IS 'Retrieves a professional profile with verification data from admin_professional_reviews (latest review)';



CREATE OR REPLACE FUNCTION "public"."get_professional_services_summary"("professional_profile_id" "uuid") RETURNS TABLE("total_services" integer, "active_services" integer, "featured_services" integer, "total_bookings" integer, "average_rating" numeric)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN is_active THEN 1 END)::INTEGER,
    COUNT(CASE WHEN is_featured THEN 1 END)::INTEGER,
    COALESCE(SUM(booking_count), 0)::INTEGER,
    ROUND(AVG(CASE WHEN average_rating > 0 THEN average_rating END), 2)
  FROM professional_services
  WHERE profile_id = professional_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_professional_services_summary"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_revenue_trend"("professional_profile_id" "uuid", "days" integer DEFAULT 30) RETURNS TABLE("date" "date", "revenue_cop" integer, "bookings_count" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.snapshot_date AS date,
    rs.total_revenue_cop AS revenue_cop,
    rs.completed_bookings AS bookings_count
  FROM professional_revenue_snapshots rs
  WHERE rs.profile_id = professional_profile_id
    AND rs.period_type = 'daily'
    AND rs.snapshot_date >= CURRENT_DATE - days
  ORDER BY rs.snapshot_date ASC;
END;
$$;


ALTER FUNCTION "public"."get_revenue_trend"("professional_profile_id" "uuid", "days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_professionals_by_completion_rate"("limit_count" integer DEFAULT 10, "min_bookings" integer DEFAULT 5) RETURNS TABLE("profile_id" "uuid", "full_name" "text", "completion_rate" numeric, "total_bookings" integer, "average_rating" numeric)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.profile_id,
    p.full_name::TEXT,
    pm.completion_rate,
    pm.total_bookings,
    pm.average_rating
  FROM professional_performance_metrics pm
  JOIN profiles p ON p.id = pm.profile_id
  WHERE pm.total_bookings >= min_bookings
  ORDER BY pm.completion_rate DESC, pm.average_rating DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_top_professionals_by_completion_rate"("limit_count" integer, "min_bookings" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_searches"("days_back" integer DEFAULT 30, "limit_count" integer DEFAULT 10) RETURNS TABLE("query" "text", "search_count" bigint, "avg_results" numeric, "click_rate" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    hsa.query,
    COUNT(*) as search_count,
    ROUND(AVG(hsa.result_count)::numeric, 1) as avg_results,
    ROUND(
      (COUNT(hsa.clicked_article_id)::numeric / COUNT(*)::numeric * 100),
      1
    ) as click_rate
  FROM public.help_search_analytics hsa
  WHERE hsa.created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY hsa.query
  HAVING COUNT(*) > 1  -- Ignore single searches (noise)
  ORDER BY search_count DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_top_searches"("days_back" integer, "limit_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_top_searches"("days_back" integer, "limit_count" integer) IS 'Returns most searched queries with click-through rates for content optimization';



CREATE OR REPLACE FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") RETURNS TABLE("has_credit" boolean, "credit_available_cop" bigint, "credit_available_usd" integer, "bookings_completed" integer, "total_bookings_value_cop" bigint, "max_credit_cop" bigint, "percentage_earned" numeric)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_direct_hire_fee_cop BIGINT;
BEGIN
  -- Fetch professional's direct hire fee for max credit calculation
  SELECT COALESCE(pp.direct_hire_fee_cop, 1196000) INTO v_direct_hire_fee_cop
  FROM professional_profiles pp
  WHERE pp.id = p_professional_id;

  -- Return credit info (or defaults if no record exists)
  RETURN QUERY
  SELECT
    COALESCE(tc.credit_remaining_cop > 0, false) AS has_credit,
    COALESCE(tc.credit_remaining_cop, 0) AS credit_available_cop,
    ROUND(COALESCE(tc.credit_remaining_cop, 0) / 4000)::INTEGER AS credit_available_usd,
    COALESCE(tc.total_bookings_count, 0) AS bookings_completed,
    COALESCE(tc.total_bookings_value_cop, 0) AS total_bookings_value_cop,
    ROUND(v_direct_hire_fee_cop * 0.5) AS max_credit_cop,
    LEAST(
      CASE
        WHEN v_direct_hire_fee_cop > 0 THEN
          (COALESCE(tc.credit_earned_cop, 0)::NUMERIC / (v_direct_hire_fee_cop * 0.5)) * 100
        ELSE 0
      END,
      100.0
    ) AS percentage_earned
  FROM (SELECT p_customer_id AS cid, p_professional_id AS pid) AS params
  LEFT JOIN trial_credits tc
    ON tc.customer_id = params.cid
    AND tc.professional_id = params.pid;
END;
$$;


ALTER FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") IS 'Returns trial credit information for display in UI and direct hire checkout';



CREATE OR REPLACE FUNCTION "public"."get_unread_changelog_count"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM changelogs c
    WHERE c.visibility = 'published'
    AND c.published_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM changelog_views cv
      WHERE cv.user_id = p_user_id
      AND cv.changelog_id = c.id
      AND cv.dismissed_at IS NOT NULL
    )
  );
END;
$$;


ALTER FUNCTION "public"."get_unread_changelog_count"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_total_credits integer;
BEGIN
  -- Sum all referrer credit amounts where user is the referrer
  -- and referral status is 'rewarded'
  SELECT COALESCE(SUM(referrer_credit_amount), 0)
  INTO v_total_credits
  FROM public.referrals
  WHERE referrer_id = p_user_id
    AND status = 'rewarded';

  RETURN v_total_credits;
END;
$$;


ALTER FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") IS 'Calculate total referral credits earned by a user (rewarded referrals only)';



CREATE OR REPLACE FUNCTION "public"."get_user_roadmap_vote_count"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.roadmap_votes
    WHERE roadmap_votes.user_id = user_id
  );
END;
$$;


ALTER FUNCTION "public"."get_user_roadmap_vote_count"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_message_read"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conv_customer_id UUID;
  conv_professional_id UUID;
  remaining_unread INTEGER;
BEGIN
  -- Only proceed if read_at was just set
  IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
    -- Get conversation participants
    SELECT customer_id, professional_id
    INTO conv_customer_id, conv_professional_id
    FROM public.conversations
    WHERE id = NEW.conversation_id;

    -- Determine who read the message and reset their unread count
    IF auth.uid() = conv_customer_id THEN
      -- Customer read message, recalculate customer unread count
      SELECT COUNT(*)
      INTO remaining_unread
      FROM public.messages
      WHERE conversation_id = NEW.conversation_id
      AND sender_id = conv_professional_id
      AND read_at IS NULL;

      UPDATE public.conversations
      SET customer_unread_count = remaining_unread
      WHERE id = NEW.conversation_id;
    ELSE
      -- Professional read message, recalculate professional unread count
      SELECT COUNT(*)
      INTO remaining_unread
      FROM public.messages
      WHERE conversation_id = NEW.conversation_id
      AND sender_id = conv_customer_id
      AND read_at IS NULL;

      UPDATE public.conversations
      SET professional_unread_count = remaining_unread
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_message_read"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conv_customer_id UUID;
  conv_professional_id UUID;
BEGIN
  -- Get conversation participants
  SELECT customer_id, professional_id
  INTO conv_customer_id, conv_professional_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  -- Update conversation timestamp and increment unread count for recipient
  IF NEW.sender_id = conv_customer_id THEN
    -- Customer sent message, increment professional unread count
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      professional_unread_count = professional_unread_count + 1,
      updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSE
    -- Professional sent message, increment customer unread count
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      customer_unread_count = customer_unread_count + 1,
      updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, role, locale, onboarding_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'professional'
      THEN 'application_pending'
      ELSE 'active'
    END
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Trigger function that creates a profile record when a new auth user is created. Extracts consent data from user metadata to comply with Ley 1581 de 2012.';



CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Set the updated_at column to the current timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_updated_at"() IS 'Trigger function to automatically update updated_at timestamp on row updates';



CREATE OR REPLACE FUNCTION "public"."has_user_voted"("item_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roadmap_votes
    WHERE roadmap_item_id = item_id
    AND roadmap_votes.user_id = user_id
  );
END;
$$;


ALTER FUNCTION "public"."has_user_voted"("item_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_article_view_count"("article_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Increment view count for the specified article
  UPDATE public.help_articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;


ALTER FUNCTION "public"."increment_article_view_count"("article_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_article_view_count"("article_id" "uuid") IS 'Increments view count for a help article. Callable by anonymous users.';



CREATE OR REPLACE FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Atomically update stats for the professional
  UPDATE professional_profiles
  SET
    total_earnings_cop = COALESCE(total_earnings_cop, 0) + p_earnings_cop,
    total_bookings_completed = COALESCE(total_bookings_completed, 0) + 1,
    updated_at = NOW()
  WHERE profile_id = p_professional_id;

  -- Raise exception if professional not found (helps with debugging)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professional profile not found: %', p_professional_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) IS 'Atomically increments professional career stats (earnings and bookings count) when bookings complete. Called from Stripe webhook handler.';



CREATE OR REPLACE FUNCTION "public"."initialize_performance_metrics"("professional_profile_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_metrics JSONB;
BEGIN
  INSERT INTO professional_performance_metrics (profile_id)
  VALUES (professional_profile_id)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT row_to_json(pm.*)::JSONB INTO new_metrics
  FROM professional_performance_metrics pm
  WHERE pm.profile_id = professional_profile_id;

  RETURN new_metrics;
END;
$$;


ALTER FUNCTION "public"."initialize_performance_metrics"("professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT expires_at < now()
  FROM public.booking_authorizations
  WHERE id = auth_id;
$$;


ALTER FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") IS 'Check if a booking authorization has expired';



CREATE OR REPLACE FUNCTION "public"."is_within_service_radius"("professional_profile_id" "uuid", "customer_location" "public"."geography") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
DECLARE
  service_center GEOGRAPHY;
  max_radius_m NUMERIC;
  distance_m NUMERIC;
BEGIN
  SELECT service_location, service_radius_km * 1000
  INTO service_center, max_radius_m
  FROM professional_travel_buffers
  WHERE profile_id = professional_profile_id;

  IF service_center IS NULL THEN
    RETURN false;
  END IF;

  distance_m := ST_Distance(service_center, customer_location);

  RETURN distance_m <= max_radius_m;
END;
$$;


ALTER FUNCTION "public"."is_within_service_radius"("professional_profile_id" "uuid", "customer_location" "public"."geography") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_active_professionals"() RETURNS TABLE("profile_id" "uuid", "full_name" "text", "bio" "text", "experience_years" integer, "languages" "text"[], "services" "jsonb", "primary_services" "text"[], "availability" "jsonb", "references_data" "jsonb", "portfolio_images" "jsonb", "city" "text", "country" "text", "verification_level" "text", "interview_completed" boolean, "direct_hire_fee_cop" integer, "background_check_passed" boolean, "documents_verified" boolean, "references_verified" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    pp.languages,
    pp.services,
    pp.primary_services,
    pp.availability,
    pp.references_data,
    pp.portfolio_images,
    pp.city,
    pp.country,
    pp.verification_level,
    pp.interview_completed,
    pp.direct_hire_fee_cop,
    -- Verification data from admin_professional_reviews (latest review)
    apr.background_check_passed,
    apr.documents_verified,
    apr.references_verified
  FROM professional_profiles pp
  LEFT JOIN LATERAL (
    SELECT
      background_check_passed,
      documents_verified,
      references_verified
    FROM admin_professional_reviews
    WHERE professional_id = pp.profile_id
    ORDER BY reviewed_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  ) apr ON true
  WHERE pp.status = 'active'
  ORDER BY pp.created_at DESC;
$$;


ALTER FUNCTION "public"."list_active_professionals"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."list_active_professionals"() IS 'Lists all active professional profiles with verification data from admin_professional_reviews';



CREATE OR REPLACE FUNCTION "public"."log_balance_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Log pending balance changes
  IF OLD.pending_balance_cop IS DISTINCT FROM NEW.pending_balance_cop THEN
    INSERT INTO balance_audit_log (
      professional_id,
      change_type,
      amount_cop,
      balance_before_cop,
      balance_after_cop,
      balance_type
    ) VALUES (
      NEW.profile_id,
      CASE
        WHEN NEW.pending_balance_cop > OLD.pending_balance_cop THEN 'add_pending'
        ELSE 'clear_to_available'
      END,
      ABS(NEW.pending_balance_cop - OLD.pending_balance_cop),
      OLD.pending_balance_cop,
      NEW.pending_balance_cop,
      'pending'
    );
  END IF;

  -- Log available balance changes
  IF OLD.available_balance_cop IS DISTINCT FROM NEW.available_balance_cop THEN
    INSERT INTO balance_audit_log (
      professional_id,
      change_type,
      amount_cop,
      balance_before_cop,
      balance_after_cop,
      balance_type
    ) VALUES (
      NEW.profile_id,
      CASE
        WHEN NEW.available_balance_cop > OLD.available_balance_cop THEN 'refund'
        ELSE 'deduct_payout'
      END,
      ABS(NEW.available_balance_cop - OLD.available_balance_cop),
      OLD.available_balance_cop,
      NEW.available_balance_cop,
      'available'
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_balance_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_onboarding_item_completed"("professional_profile_id" "uuid", "item_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  updated_checklist JSONB;
  item_index INTEGER;
BEGIN
  -- Find the index of the item in the array
  SELECT ordinality - 1 INTO item_index
  FROM jsonb_array_elements(
    (SELECT onboarding_checklist->'items' FROM profiles WHERE id = professional_profile_id)
  ) WITH ORDINALITY arr(item, ordinality)
  WHERE item->>'id' = item_id;

  IF item_index IS NULL THEN
    RAISE EXCEPTION 'Onboarding item % not found', item_id;
  END IF;

  -- Update the specific item's completed status
  UPDATE profiles
  SET onboarding_checklist = jsonb_set(
    onboarding_checklist,
    array['items', item_index::text, 'completed'],
    'true'::jsonb
  )
  WHERE id = professional_profile_id
  RETURNING onboarding_checklist INTO updated_checklist;

  RETURN updated_checklist;
END;
$$;


ALTER FUNCTION "public"."mark_onboarding_item_completed"("professional_profile_id" "uuid", "item_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Allow admins to change any role
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Prevent non-admins from changing roles
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You do not have permission to change user roles. Only admins can modify roles.';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."professional_search_vector"("full_name" "text", "bio" "text", "primary_services" "text"[], "city" "text", "country" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN
    -- A weight (highest): Professional name
    setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
    -- B weight: Bio/description
    setweight(to_tsvector('english', coalesce(bio, '')), 'B') ||
    -- C weight: Service types
    setweight(to_tsvector('english', coalesce(array_to_string(primary_services, ' '), '')), 'C') ||
    -- D weight (lowest): Location
    setweight(to_tsvector('english', coalesce(city, '') || ' ' || coalesce(country, '')), 'D');
END;
$$;


ALTER FUNCTION "public"."professional_search_vector"("full_name" "text", "bio" "text", "primary_services" "text"[], "city" "text", "country" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_required_consents"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Once privacy_policy_accepted is TRUE, it cannot be changed back to FALSE
  IF OLD.privacy_policy_accepted = TRUE AND NEW.privacy_policy_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke privacy policy consent after it has been accepted';
  END IF;

  -- Once terms_accepted is TRUE, it cannot be changed back to FALSE
  IF OLD.terms_accepted = TRUE AND NEW.terms_accepted = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke terms of service consent after it has been accepted';
  END IF;

  -- Once data_processing_consent is TRUE, it cannot be changed back to FALSE
  IF OLD.data_processing_consent = TRUE AND NEW.data_processing_consent = FALSE THEN
    RAISE EXCEPTION 'Cannot revoke data processing consent after it has been accepted';
  END IF;

  -- Marketing consent can be changed freely (GDPR/Ley 1581 requirement)
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."protect_required_consents"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_availability_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY professional_availability_cache;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."refresh_availability_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE professional_profiles
  SET
    available_balance_cop = available_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id;
END;
$$;


ALTER FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) IS 'Refunds amount to available balance if instant payout fails (e.g., Stripe error).';



CREATE OR REPLACE FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text" DEFAULT 'en'::"text", "limit_count" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "category_id" "uuid", "category_slug" "text", "category_name" "text", "slug" "text", "title" "text", "excerpt" "text", "rank" real)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  IF locale = 'es' THEN
    RETURN QUERY
    SELECT
      a.id,
      a.category_id,
      c.slug as category_slug,
      c.name_es as category_name,
      a.slug,
      a.title_es as title,
      a.excerpt_es as excerpt,
      ts_rank(a.search_vector_es, websearch_to_tsquery('spanish', search_query)) as rank
    FROM public.help_articles a
    JOIN public.help_categories c ON a.category_id = c.id
    WHERE
      a.is_published = true
      AND c.is_active = true
      AND a.search_vector_es @@ websearch_to_tsquery('spanish', search_query)
    ORDER BY rank DESC, a.view_count DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT
      a.id,
      a.category_id,
      c.slug as category_slug,
      c.name_en as category_name,
      a.slug,
      a.title_en as title,
      a.excerpt_en as excerpt,
      ts_rank(a.search_vector_en, websearch_to_tsquery('english', search_query)) as rank
    FROM public.help_articles a
    JOIN public.help_categories c ON a.category_id = c.id
    WHERE
      a.is_published = true
      AND c.is_active = true
      AND a.search_vector_en @@ websearch_to_tsquery('english', search_query)
    ORDER BY rank DESC, a.view_count DESC
    LIMIT limit_count;
  END IF;
END;
$$;


ALTER FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text", "limit_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text", "limit_count" integer) IS 'Full-text search for help articles with ranking';



CREATE OR REPLACE FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "full_name" "text", "bio" "text", "service_types" "text"[], "city" "text", "country" "text", "profile_photo_url" "text", "avg_rating" numeric, "review_count" bigint, "rank" real)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    prof.profile_id AS id,
    prof.full_name,
    prof.bio,
    prof.primary_services AS service_types,
    p.city,
    p.country,
    prof.avatar_url AS profile_photo_url,
    CAST(NULL AS NUMERIC) AS avg_rating,  -- Placeholder for future rating system
    CAST(0 AS BIGINT) AS review_count,    -- Placeholder for future review system
    -- ts_rank calculates relevance score based on:
    -- 1. Term frequency (how often search terms appear)
    -- 2. Document length (shorter docs with matches rank higher)
    -- 3. Weight (A > B > C > D as defined above)
    ts_rank(prof.search_vector, to_tsquery('english', search_query)) AS rank
  FROM professional_profiles prof
  INNER JOIN profiles p ON prof.profile_id = p.id
  WHERE
    p.role = 'professional'
    AND prof.status = 'active'
    AND prof.search_vector @@ to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer) IS 'Full-text search for professionals with relevance ranking. Returns top matches ordered by ts_rank score. Joins professional_profiles with profiles for location data.';



CREATE OR REPLACE FUNCTION "public"."set_admin_by_email"("user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update the user's role to admin
  UPDATE public.profiles
  SET
    role = 'admin',
    onboarding_status = 'active',
    account_status = 'active',
    updated_at = now()
  WHERE id = target_user_id;

  RAISE NOTICE 'Successfully set user % (%) as admin', user_email, target_user_id;
END;
$$;


ALTER FUNCTION "public"."set_admin_by_email"("user_email" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_admin_by_email"("user_email" "text") IS 'Security-sensitive function to grant admin role. Only callable by database admins.';



CREATE OR REPLACE FUNCTION "public"."set_admin_professional_reviews_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_admin_professional_reviews_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_authorization_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  booking_customer uuid;
  booking_professional uuid;
BEGIN
  SELECT customer_id, professional_id
  INTO booking_customer, booking_professional
  FROM public.bookings
  WHERE id = NEW.booking_id;

  NEW.customer_id := booking_customer;
  NEW.professional_id := booking_professional;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_authorization_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_booking_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_booking_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_booking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_booking_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_changelog_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_changelog_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_claim_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  booking_customer uuid;
  booking_professional uuid;
BEGIN
  SELECT customer_id, professional_id
  INTO booking_customer, booking_professional
  FROM public.bookings
  WHERE id = NEW.booking_id;

  NEW.customer_id := booking_customer;
  NEW.professional_id := booking_professional;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_claim_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_completed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = timezone('utc', now());
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."set_completed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_conversations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_conversations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_customer_review_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_customer_review_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_disputes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_disputes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_feedback_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_feedback_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_message_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.participant_ids := public.get_message_participants(NEW.conversation_id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_message_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_mobile_push_tokens_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_mobile_push_tokens_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_payouts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_payouts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_service_addons_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_service_addons_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_suspensions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_user_suspensions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, reason)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.cancellation_reason);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_booking_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_rebook_conversion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  original_booking_id UUID;
  original_professional_id UUID;
BEGIN
  -- Check if this is a rebook (same customer + professional as a previous completed booking)
  SELECT b.id, b.professional_id INTO original_booking_id, original_professional_id
  FROM bookings b
  WHERE b.customer_id = NEW.customer_id
    AND b.professional_id = NEW.professional_id
    AND b.status = 'completed'
    AND b.actual_end_time IS NOT NULL
    AND b.id != NEW.id
    AND EXISTS (
      SELECT 1 FROM rebook_nudge_experiments rne
      WHERE rne.booking_id = b.id
        AND rne.rebooked = false
    )
  ORDER BY b.actual_end_time DESC
  LIMIT 1;

  -- If this is a rebook, update the experiment
  IF original_booking_id IS NOT NULL THEN
    UPDATE rebook_nudge_experiments
    SET
      rebooked = true,
      rebooked_at = NOW(),
      rebook_booking_id = NEW.id,
      updated_at = NOW()
    WHERE booking_id = original_booking_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_rebook_conversion"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."track_rebook_conversion"() IS 'Automatically tracks when a customer rebooks with the same professional';



CREATE OR REPLACE FUNCTION "public"."trigger_auto_decline_cron"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  api_url text;
  cron_secret text;
  request_id bigint;
begin
  -- Get API URL and CRON_SECRET from config table
  select
    c.api_url,
    c.cron_secret
  into api_url, cron_secret
  from public.cron_config c
  where c.id = 1;

  -- If not set, skip execution (will be configured after deployment)
  if api_url is null or cron_secret is null then
    raise notice 'API URL or CRON_SECRET not configured in cron_config table. Skipping auto-decline.';
    return;
  end if;

  -- Make HTTP GET request to our API endpoint
  select net.http_get(
    url := api_url || '/api/cron/auto-decline-bookings',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cron_secret,
      'Content-Type', 'application/json'
    )
  ) into request_id;

  raise notice 'Auto-decline cron triggered. Request ID: %', request_id;
end;
$$;


ALTER FUNCTION "public"."trigger_auto_decline_cron"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_article_feedback_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE public.help_articles
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.article_id;
    ELSE
      UPDATE public.help_articles
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote changes
    IF OLD.is_helpful != NEW.is_helpful THEN
      IF NEW.is_helpful THEN
        UPDATE public.help_articles
        SET helpful_count = helpful_count + 1,
            not_helpful_count = not_helpful_count - 1
        WHERE id = NEW.article_id;
      ELSE
        UPDATE public.help_articles
        SET helpful_count = helpful_count - 1,
            not_helpful_count = not_helpful_count + 1
        WHERE id = NEW.article_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE public.help_articles
      SET helpful_count = helpful_count - 1
      WHERE id = OLD.article_id;
    ELSE
      UPDATE public.help_articles
      SET not_helpful_count = not_helpful_count - 1
      WHERE id = OLD.article_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_article_feedback_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_briefs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_briefs_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_last_message_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.etta_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversation_last_message_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_on_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    customer_unread_count = case
      when new.sender_id != customer_id then customer_unread_count + 1
      else customer_unread_count
    end,
    professional_unread_count = case
      when new.sender_id != professional_id then professional_unread_count + 1
      else professional_unread_count
    end
  where id = new.conversation_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."update_conversation_on_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_etta_conversations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_etta_conversations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notification_subscriptions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notification_subscriptions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_onboarding_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  completed_count INTEGER;
  required_count INTEGER;
  percentage INTEGER;
BEGIN
  -- Count completed required items
  SELECT COUNT(*) INTO completed_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true
    AND (item->>'completed')::boolean = true;

  -- Count total required items
  SELECT COUNT(*) INTO required_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true;

  -- Calculate percentage
  IF required_count > 0 THEN
    percentage := (completed_count * 100) / required_count;
  ELSE
    percentage := 0;
  END IF;

  -- Update fields
  NEW.onboarding_completion_percentage := percentage;
  NEW.can_accept_bookings := (percentage = 100);

  -- Update lastUpdated timestamp in JSONB
  NEW.onboarding_checklist := jsonb_set(
    NEW.onboarding_checklist,
    '{lastUpdated}',
    to_jsonb(NOW())
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_onboarding_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payout_batches_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_payout_batches_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payout_transfers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_payout_transfers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pricing_faqs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pricing_faqs_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pricing_plans_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pricing_plans_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pricing_rule"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pricing_rule"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_professional_search_on_profile_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE professional_profiles
  SET search_vector = professional_search_vector(
    full_name,
    bio,
    primary_services,
    NEW.city,
    NEW.country
  )
  WHERE profile_id = NEW.id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_professional_search_on_profile_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_professional_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  profile_city TEXT;
  profile_country TEXT;
BEGIN
  -- Get city and country from profiles table
  SELECT city, country INTO profile_city, profile_country
  FROM profiles
  WHERE id = NEW.profile_id;

  -- Update search vector with all fields
  NEW.search_vector := professional_search_vector(
    NEW.full_name,
    NEW.bio,
    NEW.primary_services,
    profile_city,
    profile_country
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_professional_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_recurring_plan_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  -- Update next_booking_date if frequency or day_of_week changed, or on insert
  if (TG_OP = 'INSERT') or
     (NEW.frequency != OLD.frequency) or
     (NEW.day_of_week is distinct from OLD.day_of_week) or
     (NEW.status != OLD.status and NEW.status = 'active') then

    NEW.next_booking_date := calculate_next_booking_date(
      current_date,
      NEW.frequency,
      NEW.day_of_week
    );
  end if;

  -- Always update updated_at
  NEW.updated_at := timezone('utc', now());

  return NEW;
end;
$$;


ALTER FUNCTION "public"."update_recurring_plan_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_referral_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_referral_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roadmap_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.roadmap_items
    SET comment_count = comment_count + 1
    WHERE id = NEW.roadmap_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.roadmap_items
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.roadmap_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_roadmap_comment_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roadmap_comments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_roadmap_comments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roadmap_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_roadmap_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roadmap_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.roadmap_items
    SET vote_count = vote_count + 1
    WHERE id = NEW.roadmap_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.roadmap_items
    SET vote_count = GREATEST(0, vote_count - 1)
    WHERE id = OLD.roadmap_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_roadmap_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trial_credit_on_booking_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  v_credit_cap_cop BIGINT;
  v_new_credit_earned_cop BIGINT;
  v_direct_hire_fee_cop BIGINT;
  v_total_bookings_value_cop BIGINT;
BEGIN
  -- Only process when booking transitions to 'completed' status
  -- Must be 'hourly' type (not 'direct_hire') and have captured amount
  IF NEW.status = 'completed'
     AND OLD.status != 'completed'
     AND NEW.booking_type = 'hourly'
     AND NEW.amount_captured IS NOT NULL
     AND NEW.amount_captured > 0 THEN

    -- Get professional's direct hire fee for credit cap calculation
    SELECT COALESCE(direct_hire_fee_cop, 1196000) INTO v_direct_hire_fee_cop
    FROM professional_profiles
    WHERE id = NEW.professional_id;

    -- Calculate credit cap: 50% of direct hire fee
    -- Example: $299 fee (1,196,000 COP) → $149.50 max credit (598,000 COP)
    v_credit_cap_cop := ROUND(v_direct_hire_fee_cop * 0.5);

    -- Upsert trial credit record
    -- Increment booking count and total value
    INSERT INTO trial_credits (
      customer_id,
      professional_id,
      total_bookings_count,
      total_bookings_value_cop,
      last_booking_at,
      last_booking_id,
      created_at,
      updated_at
    )
    VALUES (
      NEW.customer_id,
      NEW.professional_id,
      1,  -- First booking
      NEW.amount_captured,
      NEW.completed_at,
      NEW.id,
      NOW(),
      NOW()
    )
    ON CONFLICT (customer_id, professional_id)
    DO UPDATE SET
      total_bookings_count = trial_credits.total_bookings_count + 1,
      total_bookings_value_cop = trial_credits.total_bookings_value_cop + NEW.amount_captured,
      last_booking_at = NEW.completed_at,
      last_booking_id = NEW.id,
      updated_at = NOW();

    -- Calculate new credit earned: 50% of total bookings, capped
    -- Formula: MIN(total_bookings * 0.5, direct_hire_fee * 0.5)
    SELECT total_bookings_value_cop INTO v_total_bookings_value_cop
    FROM trial_credits
    WHERE customer_id = NEW.customer_id AND professional_id = NEW.professional_id;

    v_new_credit_earned_cop := LEAST(
      ROUND(v_total_bookings_value_cop * 0.5),  -- 50% of all bookings
      v_credit_cap_cop                           -- Max: 50% of direct hire fee
    );

    -- Update credit amounts
    -- Maintain invariant: credit_remaining_cop = credit_earned_cop - credit_used_cop
    UPDATE trial_credits
    SET
      credit_earned_cop = v_new_credit_earned_cop,
      credit_remaining_cop = GREATEST(v_new_credit_earned_cop - COALESCE(credit_used_cop, 0), 0),
      updated_at = NOW()
    WHERE customer_id = NEW.customer_id AND professional_id = NEW.professional_id;

    -- Mark booking as trial eligible
    UPDATE bookings
    SET is_trial_eligible = true
    WHERE id = NEW.id;

    RAISE NOTICE 'Trial credit updated for customer % with professional %: % COP earned (capped at % COP)',
      NEW.customer_id, NEW.professional_id, v_new_credit_earned_cop, v_credit_cap_cop;
  END IF;

  RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."update_trial_credit_on_booking_completion"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_trial_credit_on_booking_completion"() IS 'Auto-calculates trial credit when booking is marked completed. Credit = 50% of total bookings, capped at 50% of direct hire fee.';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_consent"("p_user_id" "uuid", "p_consent_type" "text", "p_accepted" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Validate consent type
  IF p_consent_type NOT IN ('privacy_policy', 'terms', 'data_processing', 'marketing') THEN
    RAISE EXCEPTION 'Invalid consent type: %', p_consent_type;
  END IF;

  -- Update the appropriate consent field
  CASE p_consent_type
    WHEN 'privacy_policy' THEN
      UPDATE public.profiles
      SET
        privacy_policy_accepted = p_accepted,
        privacy_policy_accepted_at = CASE WHEN p_accepted THEN NOW() ELSE privacy_policy_accepted_at END
      WHERE id = p_user_id;

    WHEN 'terms' THEN
      UPDATE public.profiles
      SET
        terms_accepted = p_accepted,
        terms_accepted_at = CASE WHEN p_accepted THEN NOW() ELSE terms_accepted_at END
      WHERE id = p_user_id;

    WHEN 'data_processing' THEN
      UPDATE public.profiles
      SET
        data_processing_consent = p_accepted,
        data_processing_consent_at = CASE WHEN p_accepted THEN NOW() ELSE data_processing_consent_at END
      WHERE id = p_user_id;

    WHEN 'marketing' THEN
      UPDATE public.profiles
      SET
        marketing_consent = p_accepted,
        marketing_consent_at = NOW()
      WHERE id = p_user_id;
  END CASE;
END;
$$;


ALTER FUNCTION "public"."update_user_consent"("p_user_id" "uuid", "p_consent_type" "text", "p_accepted" boolean) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "target_user_id" "uuid",
    "target_resource_type" "text",
    "target_resource_id" "uuid",
    "details" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "admin_audit_logs_action_type_check" CHECK (("action_type" = ANY (ARRAY['approve_professional'::"text", 'reject_professional'::"text", 'suspend_user'::"text", 'unsuspend_user'::"text", 'ban_user'::"text", 'verify_document'::"text", 'reject_document'::"text", 'resolve_dispute'::"text", 'update_professional_status'::"text", 'manual_payout'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."admin_audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_audit_logs" IS 'Audit trail of all administrative actions';



CREATE TABLE IF NOT EXISTS "public"."admin_professional_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "reviewed_by" "uuid" NOT NULL,
    "review_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "documents_verified" boolean DEFAULT false,
    "background_check_passed" boolean,
    "references_verified" boolean,
    "interview_completed" boolean,
    "notes" "text",
    "internal_notes" "text",
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "reviewed_at" timestamp with time zone,
    "interview_scores" "jsonb",
    "interview_average_score" numeric(3,2) DEFAULT NULL::numeric,
    "recommendation" "text",
    "interviewer_name" "text",
    CONSTRAINT "admin_professional_reviews_recommendation_check" CHECK (("recommendation" = ANY (ARRAY['approve'::"text", 'reject'::"text", 'second_interview'::"text"]))),
    CONSTRAINT "admin_professional_reviews_review_type_check" CHECK (("review_type" = ANY (ARRAY['application'::"text", 'document'::"text", 'background_check'::"text", 'periodic'::"text"]))),
    CONSTRAINT "admin_professional_reviews_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'needs_info'::"text"])))
);


ALTER TABLE "public"."admin_professional_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_professional_reviews" IS 'Track professional vetting and review process (admin reviews, not customer reviews)';



COMMENT ON COLUMN "public"."admin_professional_reviews"."interview_scores" IS 'JSON object containing interview ratings: { professionalism: 1-5, communication: 1-5, technical_knowledge: 1-5, customer_service: 1-5 }';



COMMENT ON COLUMN "public"."admin_professional_reviews"."interview_average_score" IS 'Average of all interview ratings (1.00 to 5.00)';



COMMENT ON COLUMN "public"."admin_professional_reviews"."recommendation" IS 'Interview outcome recommendation: approve, reject, or second_interview';



COMMENT ON COLUMN "public"."admin_professional_reviews"."interviewer_name" IS 'Name of the person who conducted the interview';



CREATE TABLE IF NOT EXISTS "public"."amara_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "locale" "text" DEFAULT 'en'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."amara_conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."amara_conversations" IS 'Stores conversation sessions with Amara AI assistant';



COMMENT ON COLUMN "public"."amara_conversations"."user_id" IS 'User who owns this conversation';



COMMENT ON COLUMN "public"."amara_conversations"."locale" IS 'User locale (en/es) for conversation context';



COMMENT ON COLUMN "public"."amara_conversations"."is_active" IS 'Whether conversation is active or archived';



COMMENT ON COLUMN "public"."amara_conversations"."last_message_at" IS 'Timestamp of last message for sorting';



CREATE TABLE IF NOT EXISTS "public"."amara_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "tool_calls" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "parts" "jsonb" DEFAULT '[]'::"jsonb",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    CONSTRAINT "amara_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"]))),
    CONSTRAINT "amara_messages_status_check" CHECK (("status" = ANY (ARRAY['submitted'::"text", 'streaming'::"text", 'completed'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."amara_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."amara_messages" IS 'Stores individual messages within Amara AI conversations';



COMMENT ON COLUMN "public"."amara_messages"."conversation_id" IS 'Parent conversation this message belongs to';



COMMENT ON COLUMN "public"."amara_messages"."role" IS 'Message sender: user, assistant, or system';



COMMENT ON COLUMN "public"."amara_messages"."content" IS 'Text content of the message';



COMMENT ON COLUMN "public"."amara_messages"."tool_calls" IS 'JSON array of tool calls made by assistant (if any)';



COMMENT ON COLUMN "public"."amara_messages"."metadata" IS 'Additional metadata (model, usage stats, etc.)';



COMMENT ON COLUMN "public"."amara_messages"."parts" IS 'Structured UI parts (text, files, tool results) for each chat message.';



COMMENT ON COLUMN "public"."amara_messages"."attachments" IS 'Subset of parts that represent user-uploaded files.';



CREATE TABLE IF NOT EXISTS "public"."amara_tool_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "message_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_call_id" "text" NOT NULL,
    "tool_name" "text" NOT NULL,
    "state" "text" DEFAULT 'output-available'::"text" NOT NULL,
    "input" "jsonb",
    "output" "jsonb",
    "error_text" "text",
    "latency_ms" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "amara_tool_runs_state_check" CHECK (("state" = ANY (ARRAY['input-streaming'::"text", 'input-available'::"text", 'approval-requested'::"text", 'approval-responded'::"text", 'output-available'::"text", 'output-error'::"text", 'output-denied'::"text"])))
);


ALTER TABLE "public"."amara_tool_runs" OWNER TO "postgres";


COMMENT ON TABLE "public"."amara_tool_runs" IS 'Detailed log of Amara tool executions (input/output/error metadata).';



CREATE TABLE IF NOT EXISTS "public"."background_checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "provider_check_id" "text" NOT NULL,
    "status" "public"."background_check_status" DEFAULT 'pending'::"public"."background_check_status" NOT NULL,
    "result_data" "jsonb" DEFAULT '{}'::"jsonb",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."background_checks" OWNER TO "postgres";


COMMENT ON TABLE "public"."background_checks" IS 'Stores background check results from external providers';



COMMENT ON COLUMN "public"."background_checks"."result_data" IS 'JSON blob with full background check results from provider';



CREATE TABLE IF NOT EXISTS "public"."balance_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "change_type" "text" NOT NULL,
    "amount_cop" bigint NOT NULL,
    "balance_before_cop" bigint,
    "balance_after_cop" bigint,
    "balance_type" "text" NOT NULL,
    "booking_id" "uuid",
    "payout_transfer_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "balance_audit_log_balance_type_check" CHECK (("balance_type" = ANY (ARRAY['pending'::"text", 'available'::"text"]))),
    CONSTRAINT "balance_audit_log_change_type_check" CHECK (("change_type" = ANY (ARRAY['add_pending'::"text", 'clear_to_available'::"text", 'deduct_payout'::"text", 'refund'::"text"])))
);


ALTER TABLE "public"."balance_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."balance_audit_log" IS 'Audit trail for all balance changes. Critical for debugging, dispute resolution, and accounting.';



CREATE TABLE IF NOT EXISTS "public"."balance_clearance_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "amount_cop" bigint NOT NULL,
    "completed_at" timestamp with time zone NOT NULL,
    "clearance_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "cleared_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "balance_clearance_queue_amount_cop_check" CHECK (("amount_cop" > 0)),
    CONSTRAINT "balance_clearance_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'cleared'::"text", 'disputed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."balance_clearance_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."balance_clearance_queue" IS 'Tracks bookings waiting for 24hr clearance period before funds become available for instant payout. Prevents chargeback risk.';



CREATE TABLE IF NOT EXISTS "public"."booking_addons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "addon_id" "uuid" NOT NULL,
    "addon_name" character varying(200) NOT NULL,
    "addon_price_cop" integer NOT NULL,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "booking_addons_addon_price_cop_check" CHECK (("addon_price_cop" >= 0)),
    CONSTRAINT "booking_addons_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."booking_addons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_disputes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "resolution_notes" "text",
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "booking_disputes_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'investigating'::"text", 'resolved'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."booking_disputes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."booking_number_seq"
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."booking_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "professional_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "scheduled_start" timestamp with time zone,
    "scheduled_end" timestamp with time zone,
    "checked_in_at" timestamp with time zone,
    "checked_out_at" timestamp with time zone,
    "total_amount" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "deposit_amount" integer,
    "deposit_captured_at" timestamp with time zone,
    "insurance_fee" integer DEFAULT 0,
    "requires_insurance" boolean DEFAULT false,
    "final_amount_captured" integer,
    "guest_session_id" "uuid",
    "address" "text",
    "service_name" "text",
    "service_hourly_rate" integer,
    "duration_minutes" integer,
    "amount_estimated" integer,
    "amount_final" integer,
    "amount_authorized" integer,
    "currency" "text" DEFAULT 'COP'::"text",
    "special_instructions" "text",
    "time_extension_minutes" integer,
    "time_extension_amount" integer,
    "tip_amount" integer,
    "stripe_payment_intent_id" "text",
    "stripe_payment_method_id" "text",
    "included_in_payout_id" "uuid",
    "declined_reason" "text",
    "auto_declined_at" timestamp with time zone,
    "processed_by_cron" boolean DEFAULT false,
    "booking_type" "text" DEFAULT 'hourly'::"text",
    "direct_hire_fee_paid" boolean DEFAULT false,
    "direct_hire_completed_at" timestamp with time zone,
    "booking_source" "text" DEFAULT 'direct'::"text",
    "source_details" "jsonb",
    "first_touch_source" "text",
    "last_touch_source" "text",
    "touch_points" integer DEFAULT 1,
    "trial_credit_applied_cop" bigint DEFAULT 0,
    "original_price_cop" bigint,
    "is_trial_eligible" boolean DEFAULT false,
    CONSTRAINT "bookings_booking_source_check" CHECK (("booking_source" = ANY (ARRAY['amara'::"text", 'concierge'::"text", 'direct'::"text", 'phone'::"text", 'email'::"text"]))),
    CONSTRAINT "bookings_booking_type_check" CHECK (("booking_type" = ANY (ARRAY['hourly'::"text", 'direct_hire'::"text"]))),
    CONSTRAINT "bookings_customer_or_guest_check" CHECK ((("customer_id" IS NOT NULL) OR ("guest_session_id" IS NOT NULL))),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'declined'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "check_deposit_amount_valid" CHECK ((("deposit_amount" IS NULL) OR ("deposit_amount" <= "total_amount"))),
    CONSTRAINT "check_insurance_fee_non_negative" CHECK (("insurance_fee" >= 0))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


COMMENT ON TABLE "public"."bookings" IS 'Booking records between customers and professionals';



COMMENT ON COLUMN "public"."bookings"."deposit_amount" IS 'Deposit amount authorized at booking creation (in cents)';



COMMENT ON COLUMN "public"."bookings"."insurance_fee" IS 'Damage waiver/insurance fee (in cents)';



COMMENT ON COLUMN "public"."bookings"."final_amount_captured" IS 'Total amount captured after service completion (in cents)';



COMMENT ON COLUMN "public"."bookings"."guest_session_id" IS 'Guest session ID for anonymous bookings (null after conversion to user)';



COMMENT ON COLUMN "public"."bookings"."address" IS 'Service delivery address';



COMMENT ON COLUMN "public"."bookings"."service_name" IS 'Name of the service being booked';



COMMENT ON COLUMN "public"."bookings"."service_hourly_rate" IS 'Hourly rate in cents (e.g., 5000 = $50.00/hr)';



COMMENT ON COLUMN "public"."bookings"."duration_minutes" IS 'Planned service duration in minutes';



COMMENT ON COLUMN "public"."bookings"."amount_estimated" IS 'Estimated amount in cents before service';



COMMENT ON COLUMN "public"."bookings"."amount_final" IS 'Final amount in cents after service';



COMMENT ON COLUMN "public"."bookings"."amount_authorized" IS 'Amount authorized on payment method in cents';



COMMENT ON COLUMN "public"."bookings"."currency" IS 'Currency code (COP or USD)';



COMMENT ON COLUMN "public"."bookings"."special_instructions" IS 'Customer instructions for the professional';



COMMENT ON COLUMN "public"."bookings"."time_extension_minutes" IS 'Additional time added during service';



COMMENT ON COLUMN "public"."bookings"."time_extension_amount" IS 'Additional amount for time extension in cents';



COMMENT ON COLUMN "public"."bookings"."tip_amount" IS 'Tip amount in cents';



COMMENT ON COLUMN "public"."bookings"."stripe_payment_intent_id" IS 'Stripe Payment Intent ID';



COMMENT ON COLUMN "public"."bookings"."stripe_payment_method_id" IS 'Stripe Payment Method ID';



COMMENT ON COLUMN "public"."bookings"."included_in_payout_id" IS 'References the payout this booking was included in';



COMMENT ON COLUMN "public"."bookings"."declined_reason" IS 'Reason for decline: professional_no_response, payment_failed, customer_cancelled, etc.';



COMMENT ON COLUMN "public"."bookings"."auto_declined_at" IS 'Timestamp when booking was automatically declined by cron job';



COMMENT ON COLUMN "public"."bookings"."processed_by_cron" IS 'Flag indicating this booking was processed by auto-decline cron (for debugging and metrics)';



COMMENT ON COLUMN "public"."bookings"."booking_type" IS 'Type of booking: "hourly" for standard marketplace bookings, "direct_hire" for finder fee bookings';



COMMENT ON COLUMN "public"."bookings"."direct_hire_fee_paid" IS 'True if the direct hire finder fee has been successfully paid via Stripe';



COMMENT ON COLUMN "public"."bookings"."direct_hire_completed_at" IS 'Timestamp when the direct hire transaction was completed and contact information was released';



COMMENT ON COLUMN "public"."bookings"."booking_source" IS 'Primary channel where booking was initiated: amara (AI chat), concierge (human service), direct (browse), phone, email';



COMMENT ON COLUMN "public"."bookings"."source_details" IS 'Additional source metadata: chat_session_id, concierge_agent_id, referral_code, utm_params, etc.';



COMMENT ON COLUMN "public"."bookings"."first_touch_source" IS 'First channel where customer interacted with Casaora (for attribution analysis)';



COMMENT ON COLUMN "public"."bookings"."last_touch_source" IS 'Last channel before booking conversion (for attribution analysis)';



COMMENT ON COLUMN "public"."bookings"."touch_points" IS 'Number of interactions customer had before booking (journey complexity)';



COMMENT ON COLUMN "public"."bookings"."trial_credit_applied_cop" IS 'Amount of trial credit discount applied to this booking (in COP cents)';



COMMENT ON COLUMN "public"."bookings"."original_price_cop" IS 'Original direct hire fee before trial credit discount';



COMMENT ON COLUMN "public"."bookings"."is_trial_eligible" IS 'Flag indicating this booking contributed to trial credit calculation';



CREATE OR REPLACE VIEW "public"."booking_source_analytics" AS
 SELECT "booking_source",
    "count"(*) AS "total_bookings",
    "count"(*) FILTER (WHERE ("status" = 'completed'::"text")) AS "completed_bookings",
    "count"(*) FILTER (WHERE ("status" = 'cancelled'::"text")) AS "cancelled_bookings",
    "count"(*) FILTER (WHERE ("status" = 'disputed'::"text")) AS "disputed_bookings",
    "round"("avg"((("final_amount_captured")::numeric / 100.0)), 2) AS "avg_booking_value_cop",
    "round"("sum"((("final_amount_captured")::numeric / 100.0)), 2) AS "total_revenue_cop",
    "round"("avg"("touch_points"), 1) AS "avg_touch_points",
    "min"("created_at") AS "first_booking_date",
    "max"("created_at") AS "last_booking_date"
   FROM "public"."bookings"
  WHERE ("booking_source" IS NOT NULL)
  GROUP BY "booking_source";


ALTER VIEW "public"."booking_source_analytics" OWNER TO "postgres";


COMMENT ON VIEW "public"."booking_source_analytics" IS 'Analytics view for comparing booking performance across Amara, Concierge, and Direct channels';



CREATE TABLE IF NOT EXISTS "public"."booking_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "old_status" character varying(20),
    "new_status" character varying(20) NOT NULL,
    "changed_by" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."booking_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."briefs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_type" "text" NOT NULL,
    "city" "text" NOT NULL,
    "language" "text" NOT NULL,
    "start_date" "text" NOT NULL,
    "hours_per_week" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "requirements" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    CONSTRAINT "briefs_language_check" CHECK (("language" = ANY (ARRAY['english'::"text", 'spanish'::"text", 'both'::"text"]))),
    CONSTRAINT "briefs_service_type_check" CHECK (("service_type" = ANY (ARRAY['housekeeping'::"text", 'childcare'::"text", 'eldercare'::"text", 'cooking'::"text", 'estate_management'::"text", 'other'::"text"]))),
    CONSTRAINT "briefs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewing'::"text", 'matched'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."briefs" OWNER TO "postgres";


COMMENT ON TABLE "public"."briefs" IS 'Client intake requests for both brief forms and concierge services. Use metadata.type to differentiate between "brief" and "concierge" requests.';



COMMENT ON COLUMN "public"."briefs"."metadata" IS 'Store additional data like { "type": "brief" | "concierge", "source": "web" | "mobile", etc. }';



CREATE TABLE IF NOT EXISTS "public"."changelog_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "changelog_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dismissed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."changelog_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."changelogs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sprint_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "summary" "text",
    "content" "text" NOT NULL,
    "published_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "categories" "text"[] DEFAULT '{}'::"text"[],
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "target_audience" "text"[] DEFAULT '{all}'::"text"[],
    "featured_image_url" "text",
    "visibility" "text" DEFAULT 'draft'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "changelogs_visibility_check" CHECK (("visibility" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."changelogs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "last_message_at" timestamp with time zone,
    "customer_unread_count" integer DEFAULT 0,
    "professional_unread_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "participant_ids" "uuid"[] GENERATED ALWAYS AS (ARRAY["customer_id", "professional_id"]) STORED
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversations" IS 'Conversations between customers and professionals for bookings';



COMMENT ON COLUMN "public"."conversations"."booking_id" IS 'Reference to the booking this conversation is about';



COMMENT ON COLUMN "public"."conversations"."customer_id" IS 'Reference to the customer profile';



COMMENT ON COLUMN "public"."conversations"."professional_id" IS 'Reference to the professional profile';



COMMENT ON COLUMN "public"."conversations"."customer_unread_count" IS 'Number of unread messages for the customer';



COMMENT ON COLUMN "public"."conversations"."professional_unread_count" IS 'Number of unread messages for the professional';



CREATE TABLE IF NOT EXISTS "public"."cron_config" (
    "id" integer DEFAULT 1 NOT NULL,
    "api_url" "text",
    "cron_secret" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "single_row" CHECK (("id" = 1))
);


ALTER TABLE "public"."cron_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_profiles" (
    "profile_id" "uuid" NOT NULL,
    "verification_tier" "text" DEFAULT 'basic'::"text" NOT NULL,
    "property_preferences" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "default_address" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "saved_addresses" "jsonb" DEFAULT '[]'::"jsonb",
    "booking_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "favorite_professionals" "uuid"[] DEFAULT '{}'::"uuid"[],
    "notification_preferences" "jsonb" DEFAULT '{"newMessage": true, "reviewReminder": true, "serviceStarted": true, "bookingAccepted": true, "bookingDeclined": true, "bookingConfirmed": true, "serviceCompleted": true}'::"jsonb",
    "emergency_contact" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."customer_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_profiles" IS 'Extended profile data for customer users';



COMMENT ON COLUMN "public"."customer_profiles"."saved_addresses" IS 'Customer saved addresses for quick booking';



COMMENT ON COLUMN "public"."customer_profiles"."booking_preferences" IS 'Customer default booking preferences';



COMMENT ON COLUMN "public"."customer_profiles"."favorite_professionals" IS 'Array of professional IDs customer has favorited';



COMMENT ON COLUMN "public"."customer_profiles"."emergency_contact" IS 'Emergency contact info: {name, relationship, phone, alternate_phone}';



CREATE TABLE IF NOT EXISTS "public"."customer_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "title" "text",
    "comment" "text",
    "punctuality_rating" integer,
    "communication_rating" integer,
    "respectfulness_rating" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "customer_reviews_communication_rating_check" CHECK ((("communication_rating" >= 1) AND ("communication_rating" <= 5))),
    CONSTRAINT "customer_reviews_punctuality_rating_check" CHECK ((("punctuality_rating" >= 1) AND ("punctuality_rating" <= 5))),
    CONSTRAINT "customer_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "customer_reviews_respectfulness_rating_check" CHECK ((("respectfulness_rating" >= 1) AND ("respectfulness_rating" <= 5)))
);


ALTER TABLE "public"."customer_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_reviews" IS 'Reviews written by professionals about customers after completing services';



CREATE TABLE IF NOT EXISTS "public"."disputes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "opened_by" "uuid" NOT NULL,
    "opened_by_role" "text" NOT NULL,
    "dispute_type" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "description" "text" NOT NULL,
    "customer_statement" "text",
    "professional_statement" "text",
    "evidence_urls" "text"[],
    "assigned_to" "uuid",
    "resolution_notes" "text",
    "resolution_action" "text",
    "refund_amount" integer,
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "resolution_type" "text",
    "action_taken" "text",
    "admin_notes" "text",
    "resolution_message" "text",
    CONSTRAINT "disputes_dispute_type_check" CHECK (("dispute_type" = ANY (ARRAY['service_quality'::"text", 'payment'::"text", 'cancellation'::"text", 'no_show'::"text", 'damage'::"text", 'safety'::"text", 'other'::"text"]))),
    CONSTRAINT "disputes_opened_by_role_check" CHECK (("opened_by_role" = ANY (ARRAY['customer'::"text", 'professional'::"text"]))),
    CONSTRAINT "disputes_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "disputes_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'investigating'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."disputes" OWNER TO "postgres";


COMMENT ON TABLE "public"."disputes" IS 'Customer/professional dispute resolution system';



CREATE TABLE IF NOT EXISTS "public"."feedback_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "user_email" "text",
    "user_role" "text",
    "feedback_type" "text" NOT NULL,
    "subject" "text",
    "message" "text" NOT NULL,
    "page_url" "text" NOT NULL,
    "page_path" "text" NOT NULL,
    "user_agent" "text",
    "viewport_size" "jsonb",
    "screenshot_url" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text",
    "assigned_to" "uuid",
    "admin_notes" "text",
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "feedback_submissions_feedback_type_check" CHECK (("feedback_type" = ANY (ARRAY['bug'::"text", 'feature_request'::"text", 'improvement'::"text", 'complaint'::"text", 'praise'::"text", 'other'::"text"]))),
    CONSTRAINT "feedback_submissions_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "feedback_submissions_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'in_review'::"text", 'resolved'::"text", 'closed'::"text", 'spam'::"text"]))),
    CONSTRAINT "feedback_submissions_user_role_check" CHECK (("user_role" = ANY (ARRAY['customer'::"text", 'professional'::"text", 'admin'::"text", 'anonymous'::"text"])))
);


ALTER TABLE "public"."feedback_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_token" "text" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."guest_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."guest_sessions" IS 'Stores anonymous guest checkout sessions (24-hour expiry)';



COMMENT ON COLUMN "public"."guest_sessions"."session_token" IS 'Unique secure token for session identification';



COMMENT ON COLUMN "public"."guest_sessions"."email" IS 'Guest email for booking communication';



COMMENT ON COLUMN "public"."guest_sessions"."full_name" IS 'Guest name for booking';



COMMENT ON COLUMN "public"."guest_sessions"."phone" IS 'Guest phone number (optional)';



COMMENT ON COLUMN "public"."guest_sessions"."metadata" IS 'Additional session data and conversion tracking';



COMMENT ON COLUMN "public"."guest_sessions"."expires_at" IS 'Session expiration (default 24 hours)';



CREATE TABLE IF NOT EXISTS "public"."help_article_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "is_helpful" boolean NOT NULL,
    "feedback_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "has_identifier" CHECK ((("user_id" IS NOT NULL) OR ("session_id" IS NOT NULL)))
);


ALTER TABLE "public"."help_article_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_article_feedback" IS 'User feedback on help articles (helpful/not helpful)';



CREATE TABLE IF NOT EXISTS "public"."help_article_relations" (
    "article_id" "uuid" NOT NULL,
    "related_article_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "no_self_relation" CHECK (("article_id" <> "related_article_id"))
);


ALTER TABLE "public"."help_article_relations" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_article_relations" IS 'Related articles for cross-referencing';



CREATE TABLE IF NOT EXISTS "public"."help_article_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name_en" "text" NOT NULL,
    "name_es" "text" NOT NULL,
    "color" "text" DEFAULT 'gray'::"text" NOT NULL,
    "description_en" "text",
    "description_es" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "help_article_tags_color_check" CHECK (("color" = ANY (ARRAY['blue'::"text", 'green'::"text", 'red'::"text", 'yellow'::"text", 'purple'::"text", 'gray'::"text", 'pink'::"text", 'indigo'::"text"]))),
    CONSTRAINT "help_article_tags_slug_check" CHECK (("slug" ~ '^[a-z0-9-]+$'::"text"))
);


ALTER TABLE "public"."help_article_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_article_tags" IS 'Tags for categorizing help articles. Supports bilingual names (EN/ES) and color coding.';



COMMENT ON COLUMN "public"."help_article_tags"."slug" IS 'URL-safe unique identifier for the tag (lowercase, hyphenated)';



COMMENT ON COLUMN "public"."help_article_tags"."color" IS 'Color category for visual grouping (blue, green, red, yellow, purple, gray, pink, indigo)';



CREATE TABLE IF NOT EXISTS "public"."help_article_tags_relation" (
    "article_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."help_article_tags_relation" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_article_tags_relation" IS 'Many-to-many junction table linking articles to tags. Allows articles to have multiple tags.';



CREATE TABLE IF NOT EXISTS "public"."help_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "title_en" "text" NOT NULL,
    "title_es" "text" NOT NULL,
    "content_en" "text" NOT NULL,
    "content_es" "text" NOT NULL,
    "excerpt_en" "text",
    "excerpt_es" "text",
    "author_id" "uuid",
    "view_count" integer DEFAULT 0 NOT NULL,
    "helpful_count" integer DEFAULT 0 NOT NULL,
    "not_helpful_count" integer DEFAULT 0 NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone,
    "search_vector_en" "tsvector" GENERATED ALWAYS AS ((("setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("title_en", ''::"text")), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("excerpt_en", ''::"text")), 'B'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("content_en", ''::"text")), 'C'::"char"))) STORED,
    "search_vector_es" "tsvector" GENERATED ALWAYS AS ((("setweight"("to_tsvector"('"spanish"'::"regconfig", COALESCE("title_es", ''::"text")), 'A'::"char") || "setweight"("to_tsvector"('"spanish"'::"regconfig", COALESCE("excerpt_es", ''::"text")), 'B'::"char")) || "setweight"("to_tsvector"('"spanish"'::"regconfig", COALESCE("content_es", ''::"text")), 'C'::"char"))) STORED
);


ALTER TABLE "public"."help_articles" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_articles" IS 'Help center articles with bilingual content and full-text search';



CREATE TABLE IF NOT EXISTS "public"."help_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name_en" "text" NOT NULL,
    "name_es" "text" NOT NULL,
    "description_en" "text",
    "description_es" "text",
    "icon" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."help_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_categories" IS 'Help center categories for organizing articles (customer and professional facing)';



COMMENT ON COLUMN "public"."help_categories"."slug" IS 'URL-friendly category identifier';



COMMENT ON COLUMN "public"."help_categories"."name_en" IS 'Category name in English';



COMMENT ON COLUMN "public"."help_categories"."name_es" IS 'Category name in Spanish (Colombian)';



COMMENT ON COLUMN "public"."help_categories"."description_en" IS 'Category description in English';



COMMENT ON COLUMN "public"."help_categories"."description_es" IS 'Category description in Spanish (Colombian)';



COMMENT ON COLUMN "public"."help_categories"."icon" IS 'Icon name for category (rocket, calendar, credit-card, book-open, shield-check, wrench)';



COMMENT ON COLUMN "public"."help_categories"."display_order" IS 'Display order for categories (1 = first, 7 = last)';



CREATE TABLE IF NOT EXISTS "public"."help_search_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "query" "text" NOT NULL,
    "locale" "text" DEFAULT 'en'::"text" NOT NULL,
    "result_count" integer NOT NULL,
    "clicked_article_id" "uuid",
    "user_id" "uuid",
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "help_search_analytics_locale_check" CHECK (("locale" = ANY (ARRAY['en'::"text", 'es'::"text"]))),
    CONSTRAINT "help_search_analytics_result_count_check" CHECK (("result_count" >= 0))
);


ALTER TABLE "public"."help_search_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."help_search_analytics" IS 'Tracks help center search queries for analytics and content gap analysis. Used to understand user needs and optimize content.';



COMMENT ON COLUMN "public"."help_search_analytics"."query" IS 'The search query entered by the user';



COMMENT ON COLUMN "public"."help_search_analytics"."result_count" IS 'Number of results returned for this search';



COMMENT ON COLUMN "public"."help_search_analytics"."clicked_article_id" IS 'Article that was clicked from search results (NULL if no click)';



COMMENT ON COLUMN "public"."help_search_analytics"."user_id" IS 'Authenticated user ID (NULL for anonymous)';



COMMENT ON COLUMN "public"."help_search_analytics"."session_id" IS 'Anonymous session ID (NULL for authenticated users)';



CREATE TABLE IF NOT EXISTS "public"."insurance_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "filed_by" "uuid" NOT NULL,
    "claim_type" "public"."claim_type" NOT NULL,
    "description" "text" NOT NULL,
    "estimated_cost" integer,
    "evidence_urls" "text"[] DEFAULT '{}'::"text"[],
    "status" "public"."claim_status" DEFAULT 'filed'::"public"."claim_status" NOT NULL,
    "payout_amount" integer,
    "resolution_notes" "text",
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_id" "uuid",
    "professional_id" "uuid"
);


ALTER TABLE "public"."insurance_claims" OWNER TO "postgres";


COMMENT ON TABLE "public"."insurance_claims" IS 'FUTURE FEATURE: Insurance claim management system for handling damage/incident claims. Not yet implemented in frontend.';



COMMENT ON COLUMN "public"."insurance_claims"."estimated_cost" IS 'Amount in cents (e.g., 5000 = $50.00)';



COMMENT ON COLUMN "public"."insurance_claims"."evidence_urls" IS 'Array of Supabase Storage URLs for photos/receipts';



CREATE TABLE IF NOT EXISTS "public"."interview_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "location" "text" NOT NULL,
    "location_address" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "public"."interview_status" DEFAULT 'scheduled'::"public"."interview_status" NOT NULL,
    "interview_notes" "text",
    "completed_by" "uuid",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_slots" OWNER TO "postgres";


COMMENT ON TABLE "public"."interview_slots" IS 'Stores scheduled in-person interviews for professional vetting';



COMMENT ON COLUMN "public"."interview_slots"."location_address" IS 'Structured address with street, city, directions';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "attachments" "text"[] DEFAULT '{}'::"text"[],
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "participant_ids" "uuid"[]
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."messages" IS 'Messages within conversations';



COMMENT ON COLUMN "public"."messages"."sender_id" IS 'Profile ID of the message sender';



COMMENT ON COLUMN "public"."messages"."read_at" IS 'Timestamp when message was marked as read by recipient';



CREATE TABLE IF NOT EXISTS "public"."mobile_push_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expo_push_token" "text" NOT NULL,
    "platform" "text" DEFAULT 'unknown'::"text",
    "device_name" "text",
    "app_version" "text",
    "last_seen_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "mobile_push_tokens_platform_check" CHECK (("platform" = ANY (ARRAY['ios'::"text", 'android'::"text", 'web'::"text", 'unknown'::"text"])))
);


ALTER TABLE "public"."mobile_push_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."mobile_push_tokens" IS 'Expo push tokens registered by MaidConnect mobile apps.';



COMMENT ON COLUMN "public"."mobile_push_tokens"."platform" IS 'Platform reported by the device (ios, android, web, unknown).';



CREATE TABLE IF NOT EXISTS "public"."moderation_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "flag_type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "reason" "text" NOT NULL,
    "auto_detected" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewer_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "moderation_flags_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "moderation_flags_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'dismissed'::"text", 'action_taken'::"text"])))
);


ALTER TABLE "public"."moderation_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "url" "text",
    "tag" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payout_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "text" NOT NULL,
    "run_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_amount_cop" bigint DEFAULT 0 NOT NULL,
    "total_transfers" integer DEFAULT 0 NOT NULL,
    "successful_transfers" integer DEFAULT 0 NOT NULL,
    "failed_transfers" integer DEFAULT 0 NOT NULL,
    "error_message" "text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payout_batches_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."payout_batches" OWNER TO "postgres";


COMMENT ON TABLE "public"."payout_batches" IS 'Tracks payout batch runs for idempotency and audit trail';



COMMENT ON COLUMN "public"."payout_batches"."batch_id" IS 'Unique batch identifier (e.g., "payout-2025-11-12-tue")';



CREATE TABLE IF NOT EXISTS "public"."payout_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "payout_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "instant_payout_count" integer DEFAULT 0,
    "last_payout_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payout_rate_limits_instant_payout_count_check" CHECK (("instant_payout_count" >= 0))
);


ALTER TABLE "public"."payout_rate_limits" OWNER TO "postgres";


COMMENT ON TABLE "public"."payout_rate_limits" IS 'Tracks daily instant payout count per professional to prevent abuse. Max 3 instant payouts per 24hr period.';



CREATE TABLE IF NOT EXISTS "public"."payout_transfers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid" NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "amount_cop" bigint NOT NULL,
    "stripe_transfer_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payout_type" "text" DEFAULT 'batch'::"text",
    "fee_amount_cop" bigint DEFAULT 0,
    "fee_percentage" numeric(5,2),
    "requested_at" timestamp with time zone,
    CONSTRAINT "payout_transfers_fee_amount_cop_check" CHECK (("fee_amount_cop" >= 0)),
    CONSTRAINT "payout_transfers_payout_type_check" CHECK (("payout_type" = ANY (ARRAY['batch'::"text", 'instant'::"text"]))),
    CONSTRAINT "payout_transfers_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."payout_transfers" OWNER TO "postgres";


COMMENT ON TABLE "public"."payout_transfers" IS 'Tracks individual payout transfers within a batch, ensures each booking is paid exactly once';



COMMENT ON COLUMN "public"."payout_transfers"."booking_id" IS 'Booking this payout is for (unique constraint prevents double-payout)';



COMMENT ON COLUMN "public"."payout_transfers"."payout_type" IS 'Type of payout: "batch" for weekly payouts, "instant" for on-demand cashouts';



COMMENT ON COLUMN "public"."payout_transfers"."fee_amount_cop" IS 'Fee charged for instant payout in COP cents. Zero for batch payouts.';



COMMENT ON COLUMN "public"."payout_transfers"."fee_percentage" IS 'Fee percentage used for this payout (audit trail if fee changes over time). E.g., 1.50 = 1.5%';



COMMENT ON COLUMN "public"."payout_transfers"."requested_at" IS 'Timestamp when professional requested the payout (for instant payouts)';



CREATE TABLE IF NOT EXISTS "public"."payouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "stripe_connect_account_id" "text" NOT NULL,
    "stripe_payout_id" "text",
    "gross_amount" integer NOT NULL,
    "commission_amount" integer NOT NULL,
    "net_amount" integer NOT NULL,
    "currency" "text" DEFAULT 'COP'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payout_date" timestamp with time zone,
    "arrival_date" timestamp with time zone,
    "failure_reason" "text",
    "booking_ids" "uuid"[] NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "payouts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'paid'::"text", 'failed'::"text", 'canceled'::"text"])))
);


ALTER TABLE "public"."payouts" OWNER TO "postgres";


COMMENT ON TABLE "public"."payouts" IS 'Tracks payouts to professionals with commission calculations';



COMMENT ON COLUMN "public"."payouts"."gross_amount" IS 'Total earnings from bookings before 18% commission';



COMMENT ON COLUMN "public"."payouts"."commission_amount" IS '18% platform fee deducted from gross';



COMMENT ON COLUMN "public"."payouts"."net_amount" IS 'Amount actually paid to professional (gross - commission)';



CREATE TABLE IF NOT EXISTS "public"."platform_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "properties" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."platform_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."platform_events" IS 'Tracks platform analytics and conversion funnel events';



COMMENT ON COLUMN "public"."platform_events"."event_type" IS 'Type of event (SearchStarted, CheckoutStarted, etc.)';



COMMENT ON COLUMN "public"."platform_events"."user_id" IS 'User who triggered event (null for anonymous)';



COMMENT ON COLUMN "public"."platform_events"."session_id" IS 'Anonymous session ID for pre-signup tracking';



COMMENT ON COLUMN "public"."platform_events"."properties" IS 'Event-specific data and metadata';



CREATE TABLE IF NOT EXISTS "public"."platform_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "setting_category" "text" DEFAULT 'general'::"text" NOT NULL
);


ALTER TABLE "public"."platform_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."platform_settings" IS 'Global platform configuration settings for fees, limits, and business rules';



COMMENT ON COLUMN "public"."platform_settings"."setting_key" IS 'Unique key for the setting (e.g., "background_check_provider")';



COMMENT ON COLUMN "public"."platform_settings"."setting_value" IS 'JSONB value containing the setting configuration';



CREATE TABLE IF NOT EXISTS "public"."pricing_controls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_category" "text",
    "city" "text",
    "country" "text" DEFAULT 'Colombia'::"text",
    "commission_rate" numeric(5,4) NOT NULL,
    "background_check_fee_cop" integer DEFAULT 0,
    "min_price_cop" integer,
    "max_price_cop" integer,
    "deposit_percentage" numeric(5,4),
    "late_cancel_hours" integer DEFAULT 24,
    "late_cancel_fee_percentage" numeric(5,4) DEFAULT 0.50,
    "effective_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "effective_until" "date",
    "created_by" "uuid",
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pricing_controls_background_check_fee_cop_check" CHECK (("background_check_fee_cop" >= 0)),
    CONSTRAINT "pricing_controls_check" CHECK ((("max_price_cop" IS NULL) OR ("max_price_cop" >= "min_price_cop"))),
    CONSTRAINT "pricing_controls_commission_rate_check" CHECK ((("commission_rate" >= 0.10) AND ("commission_rate" <= 0.30))),
    CONSTRAINT "pricing_controls_deposit_percentage_check" CHECK ((("deposit_percentage" IS NULL) OR (("deposit_percentage" >= (0)::numeric) AND ("deposit_percentage" <= 1.0)))),
    CONSTRAINT "pricing_controls_late_cancel_fee_percentage_check" CHECK ((("late_cancel_fee_percentage" >= (0)::numeric) AND ("late_cancel_fee_percentage" <= 1.0))),
    CONSTRAINT "pricing_controls_late_cancel_hours_check" CHECK (("late_cancel_hours" >= 0)),
    CONSTRAINT "pricing_controls_min_price_cop_check" CHECK ((("min_price_cop" IS NULL) OR ("min_price_cop" >= 0))),
    CONSTRAINT "valid_date_range" CHECK ((("effective_until" IS NULL) OR ("effective_until" >= "effective_from")))
);


ALTER TABLE "public"."pricing_controls" OWNER TO "postgres";


COMMENT ON TABLE "public"."pricing_controls" IS 'Tunable pricing configuration by service category and city';



COMMENT ON COLUMN "public"."pricing_controls"."commission_rate" IS 'Platform commission rate (0.10 to 0.30, i.e., 10% to 30%)';



COMMENT ON COLUMN "public"."pricing_controls"."background_check_fee_cop" IS 'One-time background check fee in COP';



COMMENT ON COLUMN "public"."pricing_controls"."min_price_cop" IS 'Minimum allowed price for this category/city';



COMMENT ON COLUMN "public"."pricing_controls"."max_price_cop" IS 'Maximum allowed price for this category/city';



COMMENT ON COLUMN "public"."pricing_controls"."deposit_percentage" IS 'Required deposit percentage (NULL = use default)';



COMMENT ON COLUMN "public"."pricing_controls"."late_cancel_hours" IS 'Hours before service when late cancel fee applies';



COMMENT ON COLUMN "public"."pricing_controls"."late_cancel_fee_percentage" IS 'Percentage of booking to charge as late cancel fee';



CREATE TABLE IF NOT EXISTS "public"."pricing_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price_monthly" numeric(10,2),
    "price_annual" numeric(10,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "billing_period" "text" DEFAULT 'monthly'::"text",
    "features" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "highlight_as_popular" boolean DEFAULT false,
    "recommended_for" "text",
    "cta_text" "text" DEFAULT 'Get Started'::"text",
    "cta_url" "text",
    "target_audience" "text" DEFAULT 'both'::"text",
    "display_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pricing_plans_billing_period_check" CHECK (("billing_period" = ANY (ARRAY['monthly'::"text", 'annual'::"text", 'custom'::"text"]))),
    CONSTRAINT "pricing_plans_target_audience_check" CHECK (("target_audience" = ANY (ARRAY['customer'::"text", 'professional'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."pricing_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."pricing_plans" IS 'Stores subscription pricing plans - seeded with Starter, Professional, and Business tiers';



COMMENT ON COLUMN "public"."pricing_plans"."billing_period" IS 'Default billing period: monthly, annual, or custom';



COMMENT ON COLUMN "public"."pricing_plans"."features" IS 'JSONB array of feature objects with category, items, and availability';



COMMENT ON COLUMN "public"."pricing_plans"."highlight_as_popular" IS 'Whether to highlight this plan as "Most Popular" or "Best Value"';



COMMENT ON COLUMN "public"."pricing_plans"."target_audience" IS 'Which user type this plan is for: customer, professional, or both';



CREATE TABLE IF NOT EXISTS "public"."professional_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "status" "text" DEFAULT 'uploaded'::"text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."professional_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "total_bookings" integer DEFAULT 0,
    "completed_bookings" integer DEFAULT 0,
    "cancelled_bookings" integer DEFAULT 0,
    "completion_rate" numeric(5,2) DEFAULT 0.00,
    "cancellation_rate" numeric(5,2) DEFAULT 0.00,
    "total_revenue_cop" integer DEFAULT 0,
    "revenue_last_30_days_cop" integer DEFAULT 0,
    "revenue_last_7_days_cop" integer DEFAULT 0,
    "average_booking_value_cop" integer DEFAULT 0,
    "average_rating" numeric(3,2) DEFAULT 0.00,
    "total_reviews" integer DEFAULT 0,
    "five_star_count" integer DEFAULT 0,
    "four_star_count" integer DEFAULT 0,
    "three_star_count" integer DEFAULT 0,
    "two_star_count" integer DEFAULT 0,
    "one_star_count" integer DEFAULT 0,
    "average_response_time_minutes" integer DEFAULT 0,
    "on_time_arrival_rate" numeric(5,2) DEFAULT 0.00,
    "repeat_customer_rate" numeric(5,2) DEFAULT 0.00,
    "bookings_last_30_days" integer DEFAULT 0,
    "bookings_last_7_days" integer DEFAULT 0,
    "last_calculated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."professional_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_profiles" (
    "profile_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "bio" "text",
    "services" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "verification_level" "text" DEFAULT 'none'::"text" NOT NULL,
    "onboarding_completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "full_name" "text",
    "id_number" "text",
    "experience_years" integer,
    "primary_services" "text"[] DEFAULT '{}'::"text"[],
    "rate_expectations" "jsonb" DEFAULT '{}'::"jsonb",
    "languages" "text"[] DEFAULT '{}'::"text"[],
    "availability" "jsonb" DEFAULT '{}'::"jsonb",
    "references_data" "jsonb" DEFAULT '[]'::"jsonb",
    "consent_background_check" boolean DEFAULT false,
    "stripe_connect_account_id" "text",
    "stripe_connect_onboarding_status" "text" DEFAULT 'not_started'::"text",
    "stripe_connect_last_refresh" timestamp with time zone,
    "instant_booking_enabled" boolean DEFAULT false,
    "instant_booking_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "availability_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "blocked_dates" "jsonb" DEFAULT '[]'::"jsonb",
    "portfolio_images" "jsonb" DEFAULT '[]'::"jsonb",
    "featured_work" "text",
    "notification_preferences" "jsonb" DEFAULT '{"newMessage": true, "reviewReceived": true, "bookingCanceled": true, "paymentReceived": true, "newBookingRequest": true}'::"jsonb",
    "city" "text",
    "country" "text",
    "location_latitude" numeric,
    "location_longitude" numeric,
    "search_vector" "tsvector",
    "emergency_contact" "jsonb" DEFAULT '{}'::"jsonb",
    "latest_background_check_id" "uuid",
    "background_check_status" "text" DEFAULT 'pending'::"text",
    "latest_interview_id" "uuid",
    "interview_completed" boolean DEFAULT false,
    "avatar_url" "text",
    "direct_hire_fee_cop" integer DEFAULT 1196000,
    "available_balance_cop" bigint DEFAULT 0,
    "pending_balance_cop" bigint DEFAULT 0,
    "last_balance_update" timestamp with time zone,
    "instant_payout_enabled" boolean DEFAULT true,
    "slug" "text",
    "profile_visibility" "text" DEFAULT 'private'::"text",
    "share_earnings_badge" boolean DEFAULT false,
    "total_earnings_cop" bigint DEFAULT 0,
    "total_bookings_completed" integer DEFAULT 0,
    "earnings_last_updated_at" timestamp with time zone,
    CONSTRAINT "professional_profiles_available_balance_cop_check" CHECK (("available_balance_cop" >= 0)),
    CONSTRAINT "professional_profiles_pending_balance_cop_check" CHECK (("pending_balance_cop" >= 0)),
    CONSTRAINT "professional_profiles_profile_visibility_check" CHECK (("profile_visibility" = ANY (ARRAY['public'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."professional_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."professional_profiles" IS 'Extended profile data for professional users';



COMMENT ON COLUMN "public"."professional_profiles"."services" IS 'JSONB array of services. Each service can include: {id, name, description, hourly_rate, requires_insurance: boolean, damage_waiver_amount: integer}';



COMMENT ON COLUMN "public"."professional_profiles"."instant_booking_enabled" IS 'Allow customers to book instantly without approval';



COMMENT ON COLUMN "public"."professional_profiles"."instant_booking_settings" IS 'Rules for instant booking (min notice, max duration, etc)';



COMMENT ON COLUMN "public"."professional_profiles"."availability_settings" IS 'Working hours, buffer times, max bookings per day';



COMMENT ON COLUMN "public"."professional_profiles"."blocked_dates" IS 'Array of dates when professional is unavailable (YYYY-MM-DD format)';



COMMENT ON COLUMN "public"."professional_profiles"."portfolio_images" IS 'Array of portfolio images showcasing professional work';



COMMENT ON COLUMN "public"."professional_profiles"."featured_work" IS 'Text description of featured work or specialties';



COMMENT ON COLUMN "public"."professional_profiles"."search_vector" IS 'Weighted tsvector for full-text search. Auto-generated from full_name (A), bio (B), primary_services (C), and location (D). Indexed with GIN for fast lookups.';



COMMENT ON COLUMN "public"."professional_profiles"."emergency_contact" IS 'Emergency contact info: {name, relationship, phone, alternate_phone}';



COMMENT ON COLUMN "public"."professional_profiles"."latest_background_check_id" IS 'Latest background check ID (manually maintained, no FK constraint)';



COMMENT ON COLUMN "public"."professional_profiles"."background_check_status" IS 'Current background check status';



COMMENT ON COLUMN "public"."professional_profiles"."latest_interview_id" IS 'Latest interview slot ID (manually maintained, no FK constraint)';



COMMENT ON COLUMN "public"."professional_profiles"."interview_completed" IS 'Whether in-person interview has been completed';



COMMENT ON COLUMN "public"."professional_profiles"."avatar_url" IS 'URL to professional profile photo stored in Supabase Storage';



COMMENT ON COLUMN "public"."professional_profiles"."direct_hire_fee_cop" IS 'Direct hire placement fee in COP cents. Default 1,196,000 COP (~$299 USD at 4,000 COP/USD exchange rate). Professionals can customize this amount.';



COMMENT ON COLUMN "public"."professional_profiles"."available_balance_cop" IS 'Balance available for instant withdrawal (cleared after 24hr hold). Amount in COP cents.';



COMMENT ON COLUMN "public"."professional_profiles"."pending_balance_cop" IS 'Balance pending clearance (24hr hold period after booking completion). Amount in COP cents.';



COMMENT ON COLUMN "public"."professional_profiles"."last_balance_update" IS 'Timestamp of last balance update for audit trail';



COMMENT ON COLUMN "public"."professional_profiles"."instant_payout_enabled" IS 'Whether professional can use instant payout feature (can be disabled for risk management)';



COMMENT ON COLUMN "public"."professional_profiles"."slug" IS 'Unique, SEO-friendly URL slug for public profile (e.g., maria-garcia-abc123). Auto-generated from full_name.';



COMMENT ON COLUMN "public"."professional_profiles"."profile_visibility" IS 'Controls whether profile is publicly accessible. Options: public, private. Default: private.';



COMMENT ON COLUMN "public"."professional_profiles"."share_earnings_badge" IS 'Opt-in flag for displaying earnings badge on public profile. Default: false.';



COMMENT ON COLUMN "public"."professional_profiles"."total_earnings_cop" IS 'Total earnings in COP from completed bookings. Updated automatically.';



COMMENT ON COLUMN "public"."professional_profiles"."total_bookings_completed" IS 'Total number of completed bookings. Updated automatically.';



COMMENT ON COLUMN "public"."professional_profiles"."earnings_last_updated_at" IS 'Timestamp of last earnings calculation update.';



CREATE TABLE IF NOT EXISTS "public"."professional_revenue_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "snapshot_date" "date" NOT NULL,
    "period_type" character varying(20) NOT NULL,
    "total_revenue_cop" integer DEFAULT 0,
    "completed_bookings" integer DEFAULT 0,
    "average_booking_value_cop" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_revenue_snapshots_period_type_check" CHECK ((("period_type")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying])::"text"[])))
);


ALTER TABLE "public"."professional_revenue_snapshots" OWNER TO "postgres";


COMMENT ON TABLE "public"."professional_revenue_snapshots" IS 'FUTURE FEATURE: Professional revenue analytics with historical snapshots. Advanced analytics not yet fully implemented.';



CREATE TABLE IF NOT EXISTS "public"."professional_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "title" "text",
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "professional_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."professional_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "name" character varying(200) NOT NULL,
    "description" "text",
    "service_type" character varying(20) DEFAULT 'one-time'::character varying,
    "base_price_cop" integer NOT NULL,
    "pricing_unit" character varying(20) DEFAULT 'hour'::character varying,
    "estimated_duration_minutes" integer,
    "min_duration_minutes" integer,
    "max_duration_minutes" integer,
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "requires_approval" boolean DEFAULT false,
    "advance_booking_hours" integer DEFAULT 24,
    "max_booking_days_ahead" integer DEFAULT 90,
    "requirements" "jsonb" DEFAULT '[]'::"jsonb",
    "included_items" "jsonb" DEFAULT '[]'::"jsonb",
    "booking_count" integer DEFAULT 0,
    "average_rating" numeric(3,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_services_advance_booking_hours_check" CHECK (("advance_booking_hours" >= 0)),
    CONSTRAINT "professional_services_base_price_cop_check" CHECK (("base_price_cop" >= 0)),
    CONSTRAINT "professional_services_estimated_duration_minutes_check" CHECK (("estimated_duration_minutes" > 0)),
    CONSTRAINT "professional_services_max_booking_days_ahead_check" CHECK (("max_booking_days_ahead" > 0)),
    CONSTRAINT "professional_services_max_duration_minutes_check" CHECK (("max_duration_minutes" > 0)),
    CONSTRAINT "professional_services_min_duration_minutes_check" CHECK (("min_duration_minutes" > 0)),
    CONSTRAINT "professional_services_pricing_unit_check" CHECK ((("pricing_unit")::"text" = ANY ((ARRAY['hour'::character varying, 'day'::character varying, 'job'::character varying, 'week'::character varying, 'month'::character varying])::"text"[]))),
    CONSTRAINT "professional_services_service_type_check" CHECK ((("service_type")::"text" = ANY ((ARRAY['one-time'::character varying, 'recurring'::character varying, 'package'::character varying])::"text"[]))),
    CONSTRAINT "valid_duration_range" CHECK (((("min_duration_minutes" IS NULL) AND ("max_duration_minutes" IS NULL)) OR ("min_duration_minutes" <= "max_duration_minutes")))
);


ALTER TABLE "public"."professional_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_travel_buffers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "service_radius_km" numeric(4,1) DEFAULT 10.0 NOT NULL,
    "service_location" "public"."geography"(Point,4326) NOT NULL,
    "travel_buffer_before_minutes" integer DEFAULT 30,
    "travel_buffer_after_minutes" integer DEFAULT 30,
    "avg_travel_speed_kmh" numeric(4,1) DEFAULT 30.0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_travel_buffers_avg_travel_speed_kmh_check" CHECK (("avg_travel_speed_kmh" > (0)::numeric)),
    CONSTRAINT "professional_travel_buffers_service_radius_km_check" CHECK ((("service_radius_km" > (0)::numeric) AND ("service_radius_km" <= (100)::numeric))),
    CONSTRAINT "professional_travel_buffers_travel_buffer_after_minutes_check" CHECK (("travel_buffer_after_minutes" >= 0)),
    CONSTRAINT "professional_travel_buffers_travel_buffer_before_minutes_check" CHECK (("travel_buffer_before_minutes" >= 0))
);


ALTER TABLE "public"."professional_travel_buffers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_working_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "is_available" boolean DEFAULT true,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_working_hours_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6))),
    CONSTRAINT "valid_time_range" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."professional_working_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "locale" "text" DEFAULT 'en-US'::"text" NOT NULL,
    "phone" "text",
    "country" "text",
    "city" "text",
    "onboarding_status" "text" DEFAULT 'application_pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "full_name" "text",
    "stripe_customer_id" "text",
    "avatar_url" "text",
    "privacy_policy_accepted" boolean DEFAULT false,
    "privacy_policy_accepted_at" timestamp with time zone,
    "terms_accepted" boolean DEFAULT false,
    "terms_accepted_at" timestamp with time zone,
    "data_processing_consent" boolean DEFAULT false,
    "data_processing_consent_at" timestamp with time zone,
    "marketing_consent" boolean DEFAULT false,
    "marketing_consent_at" timestamp with time zone,
    "account_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "onboarding_checklist" "jsonb" DEFAULT "jsonb_build_object"('items', "jsonb_build_array"("jsonb_build_object"('id', 'profile_photo', 'label', 'Upload profile photo', 'required', true, 'completed', false), "jsonb_build_object"('id', 'services', 'label', 'Add at least one service', 'required', true, 'completed', false), "jsonb_build_object"('id', 'availability', 'label', 'Set your working hours', 'required', true, 'completed', false), "jsonb_build_object"('id', 'service_radius', 'label', 'Define service area', 'required', true, 'completed', false), "jsonb_build_object"('id', 'bio', 'label', 'Write a bio (min 100 chars)', 'required', true, 'completed', false), "jsonb_build_object"('id', 'background_check', 'label', 'Complete background check', 'required', true, 'completed', false), "jsonb_build_object"('id', 'portfolio', 'label', 'Add portfolio photos', 'required', false, 'completed', false), "jsonb_build_object"('id', 'certifications', 'label', 'Upload certifications', 'required', false, 'completed', false)), 'lastUpdated', "to_jsonb"("now"())),
    "onboarding_completion_percentage" integer DEFAULT 0,
    "can_accept_bookings" boolean DEFAULT false,
    "sms_notifications_enabled" boolean DEFAULT true,
    "phone_verified" boolean DEFAULT false,
    "phone_verification_code" "text",
    "phone_verification_sent_at" timestamp with time zone,
    CONSTRAINT "profiles_account_status_check" CHECK (("account_status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'banned'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'professional'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles extending auth.users with role-based data';



COMMENT ON COLUMN "public"."profiles"."role" IS 'User role (customer/professional/admin). Protected by trigger - only admins can change roles to prevent privilege escalation.';



COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'URL to user profile avatar image (stored in Supabase Storage)';



COMMENT ON COLUMN "public"."profiles"."privacy_policy_accepted" IS 'User has accepted the Privacy Policy (required for registration)';



COMMENT ON COLUMN "public"."profiles"."privacy_policy_accepted_at" IS 'Timestamp when Privacy Policy was accepted (ISO 8601)';



COMMENT ON COLUMN "public"."profiles"."terms_accepted" IS 'User has accepted the Terms of Service (required for registration)';



COMMENT ON COLUMN "public"."profiles"."terms_accepted_at" IS 'Timestamp when Terms of Service were accepted (ISO 8601)';



COMMENT ON COLUMN "public"."profiles"."data_processing_consent" IS 'User has consented to data processing including third-party transfers (required by Ley 1581 de 2012)';



COMMENT ON COLUMN "public"."profiles"."data_processing_consent_at" IS 'Timestamp when data processing consent was given (ISO 8601)';



COMMENT ON COLUMN "public"."profiles"."marketing_consent" IS 'User has opted in to receive marketing communications (optional)';



COMMENT ON COLUMN "public"."profiles"."marketing_consent_at" IS 'Timestamp when marketing consent was given or withdrawn (ISO 8601)';



COMMENT ON COLUMN "public"."profiles"."sms_notifications_enabled" IS 'User opt-in for SMS notifications';



COMMENT ON COLUMN "public"."profiles"."phone_verified" IS 'Whether phone number has been verified via SMS code';



CREATE TABLE IF NOT EXISTS "public"."rebook_nudge_experiments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "variant" "text" NOT NULL,
    "email_sent_at" timestamp with time zone,
    "email_opened" boolean DEFAULT false,
    "email_opened_at" timestamp with time zone,
    "email_clicked" boolean DEFAULT false,
    "email_clicked_at" timestamp with time zone,
    "push_sent_at" timestamp with time zone,
    "push_clicked" boolean DEFAULT false,
    "push_clicked_at" timestamp with time zone,
    "rebooked" boolean DEFAULT false,
    "rebooked_at" timestamp with time zone,
    "rebook_booking_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "rebook_nudge_experiments_variant_check" CHECK (("variant" = ANY (ARRAY['24h'::"text", '72h'::"text"])))
);


ALTER TABLE "public"."rebook_nudge_experiments" OWNER TO "postgres";


COMMENT ON TABLE "public"."rebook_nudge_experiments" IS 'Sprint 2: A/B test tracking for rebook nudges (24h vs 72h)';



COMMENT ON COLUMN "public"."rebook_nudge_experiments"."variant" IS '24h or 72h delay after booking completion';



COMMENT ON COLUMN "public"."rebook_nudge_experiments"."rebooked" IS 'True if customer booked the same professional again';



CREATE TABLE IF NOT EXISTS "public"."recurring_plan_holidays" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recurring_plan_id" "uuid" NOT NULL,
    "skip_date" "date" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."recurring_plan_holidays" OWNER TO "postgres";


COMMENT ON TABLE "public"."recurring_plan_holidays" IS 'FUTURE FEATURE: Holiday/vacation pause functionality for recurring cleaning plans. Not yet implemented in frontend.';



CREATE TABLE IF NOT EXISTS "public"."recurring_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "address" "text" NOT NULL,
    "special_instructions" "text",
    "frequency" "text" NOT NULL,
    "day_of_week" integer,
    "preferred_time" time without time zone NOT NULL,
    "base_amount" integer NOT NULL,
    "discount_percentage" integer DEFAULT 10 NOT NULL,
    "final_amount" integer NOT NULL,
    "currency" "text" DEFAULT 'COP'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "pause_start_date" "date",
    "pause_end_date" "date",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "next_booking_date" "date" NOT NULL,
    "total_bookings_completed" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "day_of_week_required_for_weekly" CHECK ((("frequency" = 'monthly'::"text") OR ("day_of_week" IS NOT NULL))),
    CONSTRAINT "recurring_plans_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6))),
    CONSTRAINT "recurring_plans_discount_percentage_check" CHECK ((("discount_percentage" >= 0) AND ("discount_percentage" <= 30))),
    CONSTRAINT "recurring_plans_frequency_check" CHECK (("frequency" = ANY (ARRAY['weekly'::"text", 'biweekly'::"text", 'monthly'::"text"]))),
    CONSTRAINT "recurring_plans_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "valid_pause_dates" CHECK (((("pause_start_date" IS NULL) AND ("pause_end_date" IS NULL)) OR (("pause_start_date" IS NOT NULL) AND ("pause_end_date" IS NOT NULL) AND ("pause_end_date" >= "pause_start_date"))))
);


ALTER TABLE "public"."recurring_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."recurring_plans" IS 'Sprint 2: Stores recurring service plans with discount pricing (5-15% off)';



COMMENT ON COLUMN "public"."recurring_plans"."frequency" IS 'weekly (15% off), biweekly (10% off), monthly (5% off)';



COMMENT ON COLUMN "public"."recurring_plans"."day_of_week" IS '0=Sunday, 1=Monday, ..., 6=Saturday. NULL for monthly plans.';



COMMENT ON COLUMN "public"."recurring_plans"."discount_percentage" IS 'Discount for recurring plans (5-15% based on frequency)';



COMMENT ON COLUMN "public"."recurring_plans"."status" IS 'active: plan is running, paused: temporarily stopped, cancelled: permanently ended';



CREATE TABLE IF NOT EXISTS "public"."referral_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "uses_count" integer DEFAULT 0 NOT NULL,
    "max_uses" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."referral_codes" OWNER TO "postgres";


COMMENT ON TABLE "public"."referral_codes" IS 'Unique referral codes for users to share with friends';



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "referee_id" "uuid" NOT NULL,
    "referral_code_id" "uuid" NOT NULL,
    "referrer_credit_amount" integer DEFAULT 1500 NOT NULL,
    "referee_credit_amount" integer DEFAULT 1000 NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "qualified_at" timestamp with time zone,
    "rewarded_at" timestamp with time zone,
    "qualifying_booking_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "no_self_referral" CHECK (("referrer_id" <> "referee_id")),
    CONSTRAINT "referrals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'qualified'::"text", 'rewarded'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


COMMENT ON TABLE "public"."referrals" IS 'Tracks referral relationships and reward status';



CREATE TABLE IF NOT EXISTS "public"."roadmap_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roadmap_item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment" "text" NOT NULL,
    "is_approved" boolean DEFAULT false,
    "is_from_admin" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roadmap_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."roadmap_comments" IS 'Stores user comments and feedback on roadmap items';



CREATE TABLE IF NOT EXISTS "public"."roadmap_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'under_consideration'::"text" NOT NULL,
    "category" "text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text",
    "target_quarter" "text",
    "visibility" "text" DEFAULT 'draft'::"text" NOT NULL,
    "target_audience" "text"[] DEFAULT ARRAY['all'::"text"],
    "vote_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "tags" "text"[],
    "featured_image_url" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "changelog_id" "uuid",
    "published_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roadmap_items_category_check" CHECK (("category" = ANY (ARRAY['features'::"text", 'infrastructure'::"text", 'ui_ux'::"text", 'security'::"text", 'integrations'::"text"]))),
    CONSTRAINT "roadmap_items_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "roadmap_items_status_check" CHECK (("status" = ANY (ARRAY['under_consideration'::"text", 'planned'::"text", 'in_progress'::"text", 'shipped'::"text"]))),
    CONSTRAINT "roadmap_items_visibility_check" CHECK (("visibility" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."roadmap_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."roadmap_items" IS 'Stores public product roadmap items with voting and comments';



COMMENT ON COLUMN "public"."roadmap_items"."status" IS 'Current status: under_consideration, planned, in_progress, or shipped';



COMMENT ON COLUMN "public"."roadmap_items"."category" IS 'Type of roadmap item: features, infrastructure, ui_ux, security, or integrations';



COMMENT ON COLUMN "public"."roadmap_items"."priority" IS 'Internal priority: low, medium, or high';



COMMENT ON COLUMN "public"."roadmap_items"."visibility" IS 'Publication status: draft, published, or archived';



COMMENT ON COLUMN "public"."roadmap_items"."target_audience" IS 'Who sees this item: all, customer, or professional';



COMMENT ON COLUMN "public"."roadmap_items"."changelog_id" IS 'Link to changelog entry when item is shipped';



CREATE TABLE IF NOT EXISTS "public"."roadmap_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "roadmap_item_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roadmap_votes" OWNER TO "postgres";


COMMENT ON TABLE "public"."roadmap_votes" IS 'Tracks user votes on roadmap items';



CREATE TABLE IF NOT EXISTS "public"."service_addons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "name" character varying(200) NOT NULL,
    "description" "text",
    "price_cop" integer NOT NULL,
    "pricing_type" character varying(20) DEFAULT 'fixed'::character varying,
    "additional_duration_minutes" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_required" boolean DEFAULT false,
    "max_quantity" integer DEFAULT 1,
    "display_order" integer DEFAULT 0,
    "icon" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_addons_additional_duration_minutes_check" CHECK (("additional_duration_minutes" >= 0)),
    CONSTRAINT "service_addons_max_quantity_check" CHECK (("max_quantity" > 0)),
    CONSTRAINT "service_addons_price_cop_check" CHECK (("price_cop" >= 0)),
    CONSTRAINT "service_addons_pricing_type_check" CHECK ((("pricing_type")::"text" = ANY ((ARRAY['fixed'::character varying, 'per_hour'::character varying, 'per_item'::character varying])::"text"[])))
);


ALTER TABLE "public"."service_addons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_bundles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "services" "jsonb" NOT NULL,
    "total_duration_minutes" integer NOT NULL,
    "base_price_cop" integer NOT NULL,
    "discount_percentage" integer DEFAULT 0,
    "final_price_cop" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_bundles_base_price_cop_check" CHECK (("base_price_cop" > 0)),
    CONSTRAINT "service_bundles_discount_percentage_check" CHECK ((("discount_percentage" >= 0) AND ("discount_percentage" <= 50))),
    CONSTRAINT "service_bundles_final_price_cop_check" CHECK (("final_price_cop" > 0)),
    CONSTRAINT "service_bundles_total_duration_minutes_check" CHECK (("total_duration_minutes" > 0)),
    CONSTRAINT "valid_bundle_pricing" CHECK (("final_price_cop" = ("base_price_cop" - (("base_price_cop" * "discount_percentage") / 100))))
);


ALTER TABLE "public"."service_bundles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "icon" character varying(50),
    "parent_category_id" "uuid",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_pricing_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "tier_name" character varying(50) NOT NULL,
    "tier_level" integer NOT NULL,
    "description" "text",
    "price_cop" integer NOT NULL,
    "pricing_adjustment_type" character varying(20) DEFAULT 'fixed'::character varying,
    "pricing_adjustment_value" integer DEFAULT 0,
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "max_area_sqm" integer,
    "max_hours" integer,
    "is_active" boolean DEFAULT true,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_pricing_tiers_price_cop_check" CHECK (("price_cop" >= 0)),
    CONSTRAINT "service_pricing_tiers_pricing_adjustment_type_check" CHECK ((("pricing_adjustment_type")::"text" = ANY ((ARRAY['fixed'::character varying, 'percentage'::character varying])::"text"[]))),
    CONSTRAINT "service_pricing_tiers_tier_level_check" CHECK (("tier_level" > 0))
);


ALTER TABLE "public"."service_pricing_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sms_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "phone" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "public"."sms_status" NOT NULL,
    "provider_message_id" "text",
    "error_message" "text",
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sms_logs_status_check" CHECK (("status" = ANY (ARRAY['sent'::"public"."sms_status", 'delivered'::"public"."sms_status", 'failed'::"public"."sms_status", 'undelivered'::"public"."sms_status"])))
);


ALTER TABLE "public"."sms_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."sms_logs" IS 'FUTURE FEATURE: SMS notification logging and audit trail. SMS notifications not yet implemented.';



COMMENT ON COLUMN "public"."sms_logs"."provider_message_id" IS 'Message ID from Twilio or other SMS provider';



CREATE TABLE IF NOT EXISTS "public"."trial_credits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "professional_id" "uuid" NOT NULL,
    "total_bookings_count" integer DEFAULT 0 NOT NULL,
    "total_bookings_value_cop" bigint DEFAULT 0 NOT NULL,
    "credit_earned_cop" bigint DEFAULT 0 NOT NULL,
    "credit_used_cop" bigint DEFAULT 0 NOT NULL,
    "credit_remaining_cop" bigint DEFAULT 0 NOT NULL,
    "last_booking_at" timestamp with time zone,
    "last_booking_id" "uuid",
    "credit_applied_to_booking_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trial_credits_bookings_count_positive" CHECK (("total_bookings_count" >= 0)),
    CONSTRAINT "trial_credits_earned_positive" CHECK (("credit_earned_cop" >= 0)),
    CONSTRAINT "trial_credits_remaining_positive" CHECK (("credit_remaining_cop" >= 0)),
    CONSTRAINT "trial_credits_remaining_valid" CHECK (("credit_remaining_cop" = ("credit_earned_cop" - "credit_used_cop"))),
    CONSTRAINT "trial_credits_used_positive" CHECK (("credit_used_cop" >= 0)),
    CONSTRAINT "trial_credits_value_positive" CHECK (("total_bookings_value_cop" >= 0))
);


ALTER TABLE "public"."trial_credits" OWNER TO "postgres";


COMMENT ON TABLE "public"."trial_credits" IS 'Tracks trial credit earned from completed bookings, redeemable toward direct hire placement fee';



COMMENT ON COLUMN "public"."trial_credits"."credit_earned_cop" IS '50% of total_bookings_value_cop, capped at 50% of professional direct_hire_fee_cop';



COMMENT ON COLUMN "public"."trial_credits"."credit_remaining_cop" IS 'Available credit balance: credit_earned_cop - credit_used_cop';



CREATE TABLE IF NOT EXISTS "public"."user_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_blocks_check" CHECK (("blocker_id" <> "blocked_id"))
);


ALTER TABLE "public"."user_blocks" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_blocks" IS 'FUTURE FEATURE: User blocking functionality to prevent interactions between specific users. Not yet implemented in frontend.';



COMMENT ON COLUMN "public"."user_blocks"."reason" IS 'Optional reason provided by blocker';



CREATE TABLE IF NOT EXISTS "public"."user_suspensions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "suspended_by" "uuid" NOT NULL,
    "suspension_type" "text" NOT NULL,
    "reason" "text" NOT NULL,
    "details" "jsonb",
    "suspended_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "lifted_at" timestamp with time zone,
    "lifted_by" "uuid",
    "lift_reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_active" boolean DEFAULT true,
    CONSTRAINT "user_suspensions_suspension_type_check" CHECK (("suspension_type" = ANY (ARRAY['temporary'::"text", 'permanent'::"text", 'ban'::"text"])))
);


ALTER TABLE "public"."user_suspensions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_suspensions" IS 'Track user suspensions and bans';



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_professional_reviews"
    ADD CONSTRAINT "admin_professional_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."amara_conversations"
    ADD CONSTRAINT "amara_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."amara_messages"
    ADD CONSTRAINT "amara_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."amara_tool_runs"
    ADD CONSTRAINT "amara_tool_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."background_checks"
    ADD CONSTRAINT "background_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."balance_audit_log"
    ADD CONSTRAINT "balance_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."balance_clearance_queue"
    ADD CONSTRAINT "balance_clearance_queue_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."balance_clearance_queue"
    ADD CONSTRAINT "balance_clearance_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_addons"
    ADD CONSTRAINT "booking_addons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_disputes"
    ADD CONSTRAINT "booking_disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_status_history"
    ADD CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."briefs"
    ADD CONSTRAINT "briefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."changelog_views"
    ADD CONSTRAINT "changelog_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."changelog_views"
    ADD CONSTRAINT "changelog_views_user_id_changelog_id_key" UNIQUE ("user_id", "changelog_id");



ALTER TABLE ONLY "public"."changelogs"
    ADD CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."changelogs"
    ADD CONSTRAINT "changelogs_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cron_config"
    ADD CONSTRAINT "cron_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."customer_reviews"
    ADD CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guest_sessions"
    ADD CONSTRAINT "guest_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guest_sessions"
    ADD CONSTRAINT "guest_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."help_article_feedback"
    ADD CONSTRAINT "help_article_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_article_relations"
    ADD CONSTRAINT "help_article_relations_pkey" PRIMARY KEY ("article_id", "related_article_id");



ALTER TABLE ONLY "public"."help_article_tags"
    ADD CONSTRAINT "help_article_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_article_tags_relation"
    ADD CONSTRAINT "help_article_tags_relation_pkey" PRIMARY KEY ("article_id", "tag_id");



ALTER TABLE ONLY "public"."help_article_tags"
    ADD CONSTRAINT "help_article_tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_categories"
    ADD CONSTRAINT "help_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_categories"
    ADD CONSTRAINT "help_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."help_search_analytics"
    ADD CONSTRAINT "help_search_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_claims"
    ADD CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mobile_push_tokens"
    ADD CONSTRAINT "mobile_push_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mobile_push_tokens"
    ADD CONSTRAINT "mobile_push_tokens_user_id_expo_push_token_key" UNIQUE ("user_id", "expo_push_token");



ALTER TABLE ONLY "public"."moderation_flags"
    ADD CONSTRAINT "moderation_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_subscriptions"
    ADD CONSTRAINT "notification_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_subscriptions"
    ADD CONSTRAINT "notification_subscriptions_user_id_endpoint_key" UNIQUE ("user_id", "endpoint");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_batches"
    ADD CONSTRAINT "payout_batches_batch_id_key" UNIQUE ("batch_id");



ALTER TABLE ONLY "public"."payout_batches"
    ADD CONSTRAINT "payout_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_rate_limits"
    ADD CONSTRAINT "payout_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_rate_limits"
    ADD CONSTRAINT "payout_rate_limits_professional_id_payout_date_key" UNIQUE ("professional_id", "payout_date");



ALTER TABLE ONLY "public"."payout_transfers"
    ADD CONSTRAINT "payout_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_stripe_payout_id_key" UNIQUE ("stripe_payout_id");



ALTER TABLE ONLY "public"."platform_events"
    ADD CONSTRAINT "platform_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_settings"
    ADD CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_settings"
    ADD CONSTRAINT "platform_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."pricing_controls"
    ADD CONSTRAINT "pricing_controls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_plans"
    ADD CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_plans"
    ADD CONSTRAINT "pricing_plans_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."professional_documents"
    ADD CONSTRAINT "professional_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_performance_metrics"
    ADD CONSTRAINT "professional_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_profiles"
    ADD CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."professional_revenue_snapshots"
    ADD CONSTRAINT "professional_revenue_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_reviews"
    ADD CONSTRAINT "professional_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_services"
    ADD CONSTRAINT "professional_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_travel_buffers"
    ADD CONSTRAINT "professional_travel_buffers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_working_hours"
    ADD CONSTRAINT "professional_working_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rebook_nudge_experiments"
    ADD CONSTRAINT "rebook_nudge_experiments_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."rebook_nudge_experiments"
    ADD CONSTRAINT "rebook_nudge_experiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_plan_holidays"
    ADD CONSTRAINT "recurring_plan_holidays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_plan_holidays"
    ADD CONSTRAINT "recurring_plan_holidays_recurring_plan_id_skip_date_key" UNIQUE ("recurring_plan_id", "skip_date");



ALTER TABLE ONLY "public"."recurring_plans"
    ADD CONSTRAINT "recurring_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_comments"
    ADD CONSTRAINT "roadmap_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_items"
    ADD CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_items"
    ADD CONSTRAINT "roadmap_items_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_user_id_roadmap_item_id_key" UNIQUE ("user_id", "roadmap_item_id");



ALTER TABLE ONLY "public"."service_addons"
    ADD CONSTRAINT "service_addons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_bundles"
    ADD CONSTRAINT "service_bundles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."service_pricing_tiers"
    ADD CONSTRAINT "service_pricing_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sms_logs"
    ADD CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_customer_professional_unique" UNIQUE ("customer_id", "professional_id");



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_addons"
    ADD CONSTRAINT "unique_booking_addon" UNIQUE ("booking_id", "addon_id");



ALTER TABLE ONLY "public"."payout_transfers"
    ADD CONSTRAINT "unique_booking_payout" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "unique_category_slug" UNIQUE ("category_id", "slug");



ALTER TABLE ONLY "public"."professional_working_hours"
    ADD CONSTRAINT "unique_profile_day" UNIQUE ("profile_id", "day_of_week");



ALTER TABLE ONLY "public"."professional_performance_metrics"
    ADD CONSTRAINT "unique_profile_metrics" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."professional_revenue_snapshots"
    ADD CONSTRAINT "unique_profile_snapshot" UNIQUE ("profile_id", "snapshot_date", "period_type");



ALTER TABLE ONLY "public"."professional_travel_buffers"
    ADD CONSTRAINT "unique_profile_travel_buffer" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "unique_referee" UNIQUE ("referee_id");



ALTER TABLE ONLY "public"."service_pricing_tiers"
    ADD CONSTRAINT "unique_service_tier_level" UNIQUE ("service_id", "tier_level");



ALTER TABLE ONLY "public"."help_article_feedback"
    ADD CONSTRAINT "unique_session_article" UNIQUE NULLS NOT DISTINCT ("article_id", "session_id");



ALTER TABLE ONLY "public"."help_article_feedback"
    ADD CONSTRAINT "unique_user_article" UNIQUE NULLS NOT DISTINCT ("article_id", "user_id");



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocker_id_blocked_id_key" UNIQUE ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_suspensions"
    ADD CONSTRAINT "user_suspensions_pkey" PRIMARY KEY ("id");



CREATE INDEX "bookings_updated_at_idx" ON "public"."bookings" USING "btree" ("updated_at" DESC);



CREATE INDEX "changelog_views_changelog_id_idx" ON "public"."changelog_views" USING "btree" ("changelog_id");



CREATE INDEX "changelog_views_unread_idx" ON "public"."changelog_views" USING "btree" ("user_id") WHERE ("dismissed_at" IS NULL);



CREATE INDEX "changelog_views_user_id_idx" ON "public"."changelog_views" USING "btree" ("user_id", "viewed_at" DESC);



CREATE INDEX "changelogs_created_by_idx" ON "public"."changelogs" USING "btree" ("created_by");



CREATE INDEX "changelogs_published_at_idx" ON "public"."changelogs" USING "btree" ("published_at" DESC) WHERE ("visibility" = 'published'::"text");



CREATE INDEX "changelogs_slug_idx" ON "public"."changelogs" USING "btree" ("slug");



CREATE INDEX "changelogs_sprint_number_idx" ON "public"."changelogs" USING "btree" ("sprint_number" DESC);



CREATE INDEX "changelogs_visibility_idx" ON "public"."changelogs" USING "btree" ("visibility");



CREATE INDEX "customer_reviews_booking_id_idx" ON "public"."customer_reviews" USING "btree" ("booking_id");



CREATE UNIQUE INDEX "customer_reviews_booking_professional_unique_idx" ON "public"."customer_reviews" USING "btree" ("booking_id", "professional_id");



CREATE INDEX "customer_reviews_customer_id_idx" ON "public"."customer_reviews" USING "btree" ("customer_id");



CREATE INDEX "customer_reviews_professional_id_idx" ON "public"."customer_reviews" USING "btree" ("professional_id");



CREATE INDEX "feedback_created_at_idx" ON "public"."feedback_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_professional_reviews_professional_id" ON "public"."admin_professional_reviews" USING "btree" ("professional_id");



CREATE INDEX "idx_amara_conversations_is_active" ON "public"."amara_conversations" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_amara_conversations_last_message_at" ON "public"."amara_conversations" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_amara_conversations_user_id" ON "public"."amara_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_amara_messages_conversation_created" ON "public"."amara_messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_amara_messages_conversation_id" ON "public"."amara_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_amara_messages_created_at" ON "public"."amara_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_amara_messages_role" ON "public"."amara_messages" USING "btree" ("role");



CREATE INDEX "idx_amara_tool_runs_conversation" ON "public"."amara_tool_runs" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_amara_tool_runs_name" ON "public"."amara_tool_runs" USING "btree" ("tool_name");



CREATE INDEX "idx_amara_tool_runs_user" ON "public"."amara_tool_runs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_article_tags_relation_article_id" ON "public"."help_article_tags_relation" USING "btree" ("article_id");



CREATE INDEX "idx_article_tags_relation_tag_id" ON "public"."help_article_tags_relation" USING "btree" ("tag_id");



CREATE INDEX "idx_article_tags_slug" ON "public"."help_article_tags" USING "btree" ("slug");



CREATE INDEX "idx_background_checks_professional" ON "public"."background_checks" USING "btree" ("professional_id");



CREATE INDEX "idx_background_checks_provider_check" ON "public"."background_checks" USING "btree" ("provider_check_id");



CREATE INDEX "idx_background_checks_status" ON "public"."background_checks" USING "btree" ("status");



CREATE INDEX "idx_balance_audit_professional" ON "public"."balance_audit_log" USING "btree" ("professional_id", "created_at" DESC);



CREATE INDEX "idx_balance_clearance_pending" ON "public"."balance_clearance_queue" USING "btree" ("clearance_at", "status") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_balance_clearance_professional" ON "public"."balance_clearance_queue" USING "btree" ("professional_id", "status");



CREATE INDEX "idx_booking_addons_addon_id" ON "public"."booking_addons" USING "btree" ("addon_id");



CREATE INDEX "idx_booking_addons_booking_id" ON "public"."booking_addons" USING "btree" ("booking_id");



CREATE INDEX "idx_booking_status_history_booking_id" ON "public"."booking_status_history" USING "btree" ("booking_id");



CREATE INDEX "idx_booking_status_history_changed_by" ON "public"."booking_status_history" USING "btree" ("changed_by");



CREATE INDEX "idx_bookings_active" ON "public"."bookings" USING "btree" ("professional_id", "scheduled_start") WHERE ("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'in_progress'::"text"]));



CREATE INDEX "idx_bookings_address" ON "public"."bookings" USING "btree" ("address");



CREATE INDEX "idx_bookings_booking_source" ON "public"."bookings" USING "btree" ("booking_source");



CREATE INDEX "idx_bookings_booking_type" ON "public"."bookings" USING "btree" ("booking_type") WHERE ("booking_type" = 'direct_hire'::"text");



CREATE INDEX "idx_bookings_created_at" ON "public"."bookings" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_bookings_created_booking_source" ON "public"."bookings" USING "btree" ("created_at", "booking_source");



CREATE INDEX "idx_bookings_cron_auto_decline" ON "public"."bookings" USING "btree" ("status", "updated_at") WHERE ("status" = 'authorized'::"text");



CREATE INDEX "idx_bookings_customer_id" ON "public"."bookings" USING "btree" ("customer_id");



CREATE INDEX "idx_bookings_customer_scheduled_status" ON "public"."bookings" USING "btree" ("customer_id", "scheduled_start", "status");



COMMENT ON INDEX "public"."idx_bookings_customer_scheduled_status" IS 'Optimizes customer booking history queries';



CREATE INDEX "idx_bookings_direct_hire_paid" ON "public"."bookings" USING "btree" ("direct_hire_fee_paid", "created_at") WHERE ("booking_type" = 'direct_hire'::"text");



CREATE INDEX "idx_bookings_first_touch_source" ON "public"."bookings" USING "btree" ("first_touch_source");



CREATE INDEX "idx_bookings_guest_session_id" ON "public"."bookings" USING "btree" ("guest_session_id");



CREATE INDEX "idx_bookings_pro_scheduled_status" ON "public"."bookings" USING "btree" ("professional_id", "scheduled_start", "status");



COMMENT ON INDEX "public"."idx_bookings_pro_scheduled_status" IS 'Optimizes professional calendar and availability queries';



CREATE INDEX "idx_bookings_processed_by_cron" ON "public"."bookings" USING "btree" ("processed_by_cron", "updated_at") WHERE ("processed_by_cron" = true);



CREATE INDEX "idx_bookings_professional_id" ON "public"."bookings" USING "btree" ("professional_id");



CREATE INDEX "idx_bookings_scheduled_end" ON "public"."bookings" USING "btree" ("scheduled_end");



CREATE INDEX "idx_bookings_scheduled_start" ON "public"."bookings" USING "btree" ("scheduled_start");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "idx_bookings_status_scheduled" ON "public"."bookings" USING "btree" ("status", "scheduled_start" DESC) WHERE ("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'in_progress'::"text"]));



CREATE INDEX "idx_bookings_stripe_payment_intent" ON "public"."bookings" USING "btree" ("stripe_payment_intent_id");



CREATE INDEX "idx_bookings_trial_credit_applied" ON "public"."bookings" USING "btree" ("trial_credit_applied_cop") WHERE ("trial_credit_applied_cop" > 0);



CREATE INDEX "idx_bookings_trial_eligible" ON "public"."bookings" USING "btree" ("is_trial_eligible") WHERE ("is_trial_eligible" = true);



CREATE INDEX "idx_bookings_upcoming" ON "public"."bookings" USING "btree" ("scheduled_start", "status") WHERE ("status" = ANY (ARRAY['confirmed'::"text", 'in_progress'::"text"]));



CREATE INDEX "idx_briefs_city" ON "public"."briefs" USING "btree" ("city");



CREATE INDEX "idx_briefs_created_at" ON "public"."briefs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_briefs_email" ON "public"."briefs" USING "btree" ("email");



CREATE INDEX "idx_briefs_metadata" ON "public"."briefs" USING "gin" ("metadata");



CREATE INDEX "idx_briefs_service_type" ON "public"."briefs" USING "btree" ("service_type");



CREATE INDEX "idx_briefs_status" ON "public"."briefs" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_conversations_booking" ON "public"."conversations" USING "btree" ("booking_id");



CREATE INDEX "idx_conversations_customer" ON "public"."conversations" USING "btree" ("customer_id");



CREATE INDEX "idx_conversations_customer_last_message" ON "public"."conversations" USING "btree" ("customer_id", "last_message_at" DESC NULLS LAST);



CREATE INDEX "idx_conversations_customer_unread" ON "public"."conversations" USING "btree" ("customer_id", "customer_unread_count") WHERE ("customer_unread_count" > 0);



CREATE INDEX "idx_conversations_last_message" ON "public"."conversations" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_conversations_participants" ON "public"."conversations" USING "gin" ("participant_ids");



CREATE INDEX "idx_conversations_professional" ON "public"."conversations" USING "btree" ("professional_id");



CREATE INDEX "idx_conversations_professional_last_message" ON "public"."conversations" USING "btree" ("professional_id", "last_message_at" DESC NULLS LAST);



CREATE INDEX "idx_conversations_professional_unread" ON "public"."conversations" USING "btree" ("professional_id", "professional_unread_count") WHERE ("professional_unread_count" > 0);



CREATE INDEX "idx_customer_favorites" ON "public"."customer_profiles" USING "gin" ("favorite_professionals");



CREATE INDEX "idx_customer_profiles_profile_id_rls" ON "public"."customer_profiles" USING "btree" ("profile_id");



CREATE INDEX "idx_customer_reviews_by_customer" ON "public"."customer_reviews" USING "btree" ("customer_id", "created_at" DESC);



COMMENT ON INDEX "public"."idx_customer_reviews_by_customer" IS 'Optimizes loading reviews about a specific customer.';



CREATE INDEX "idx_customer_reviews_by_professional" ON "public"."customer_reviews" USING "btree" ("professional_id", "created_at" DESC);



CREATE INDEX "idx_customer_reviews_customer_id_rls" ON "public"."customer_reviews" USING "btree" ("customer_id") WHERE ("customer_id" IS NOT NULL);



CREATE INDEX "idx_customer_reviews_professional_id_rls" ON "public"."customer_reviews" USING "btree" ("professional_id") WHERE ("professional_id" IS NOT NULL);



CREATE INDEX "idx_guest_sessions_email" ON "public"."guest_sessions" USING "btree" ("email");



CREATE INDEX "idx_guest_sessions_expires_at" ON "public"."guest_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_guest_sessions_session_token" ON "public"."guest_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_help_articles_author_id" ON "public"."help_articles" USING "btree" ("author_id");



CREATE INDEX "idx_help_articles_category" ON "public"."help_articles" USING "btree" ("category_id");



CREATE INDEX "idx_help_articles_category_published" ON "public"."help_articles" USING "btree" ("category_id", "display_order", "created_at" DESC) WHERE ("is_published" = true);



CREATE INDEX "idx_help_articles_category_slug" ON "public"."help_articles" USING "btree" ("category_id", "slug");



CREATE INDEX "idx_help_articles_order" ON "public"."help_articles" USING "btree" ("display_order");



CREATE INDEX "idx_help_articles_popular" ON "public"."help_articles" USING "btree" ("view_count" DESC) WHERE ("is_published" = true);



CREATE INDEX "idx_help_articles_published" ON "public"."help_articles" USING "btree" ("is_published") WHERE ("is_published" = true);



CREATE INDEX "idx_help_articles_search_en" ON "public"."help_articles" USING "gin" ("search_vector_en");



CREATE INDEX "idx_help_articles_search_es" ON "public"."help_articles" USING "gin" ("search_vector_es");



CREATE INDEX "idx_help_articles_slug" ON "public"."help_articles" USING "btree" ("slug");



CREATE INDEX "idx_help_categories_active" ON "public"."help_categories" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_help_categories_order" ON "public"."help_categories" USING "btree" ("display_order");



CREATE INDEX "idx_help_categories_slug" ON "public"."help_categories" USING "btree" ("slug");



CREATE INDEX "idx_help_feedback_article" ON "public"."help_article_feedback" USING "btree" ("article_id");



CREATE INDEX "idx_help_feedback_user" ON "public"."help_article_feedback" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_help_relations_article" ON "public"."help_article_relations" USING "btree" ("article_id");



CREATE INDEX "idx_help_relations_related" ON "public"."help_article_relations" USING "btree" ("related_article_id");



CREATE INDEX "idx_insurance_claims_booking" ON "public"."insurance_claims" USING "btree" ("booking_id");



CREATE INDEX "idx_insurance_claims_customer" ON "public"."insurance_claims" USING "btree" ("customer_id");



CREATE INDEX "idx_insurance_claims_filed_by" ON "public"."insurance_claims" USING "btree" ("filed_by");



CREATE INDEX "idx_insurance_claims_professional" ON "public"."insurance_claims" USING "btree" ("professional_id");



CREATE INDEX "idx_insurance_claims_resolved_by" ON "public"."insurance_claims" USING "btree" ("resolved_by");



CREATE INDEX "idx_insurance_claims_status" ON "public"."insurance_claims" USING "btree" ("status");



CREATE INDEX "idx_interview_slots_completed_by" ON "public"."interview_slots" USING "btree" ("completed_by");



CREATE INDEX "idx_interview_slots_professional" ON "public"."interview_slots" USING "btree" ("professional_id");



CREATE INDEX "idx_interview_slots_scheduled" ON "public"."interview_slots" USING "btree" ("scheduled_at") WHERE ("status" = 'scheduled'::"public"."interview_status");



CREATE INDEX "idx_interview_slots_status" ON "public"."interview_slots" USING "btree" ("status");



CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



COMMENT ON INDEX "public"."idx_messages_conversation_created" IS 'Optimizes message thread display with chronological ordering';



CREATE INDEX "idx_messages_conversation_id" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_participants" ON "public"."messages" USING "gin" ("participant_ids");



CREATE INDEX "idx_messages_sender_id" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_unread" ON "public"."messages" USING "btree" ("conversation_id") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_moderation_flags_created_at" ON "public"."moderation_flags" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_moderation_flags_flag_type" ON "public"."moderation_flags" USING "btree" ("flag_type");



CREATE INDEX "idx_moderation_flags_severity" ON "public"."moderation_flags" USING "btree" ("severity");



CREATE INDEX "idx_moderation_flags_severity_status" ON "public"."moderation_flags" USING "btree" ("severity", "status");



CREATE INDEX "idx_moderation_flags_status" ON "public"."moderation_flags" USING "btree" ("status");



CREATE INDEX "idx_moderation_flags_user_id" ON "public"."moderation_flags" USING "btree" ("user_id");



CREATE INDEX "idx_notification_subscriptions_user_id" ON "public"."notification_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_unread_count" ON "public"."notifications" USING "btree" ("user_id", "read_at") WHERE ("read_at" IS NULL);



COMMENT ON INDEX "public"."idx_notifications_unread_count" IS 'Critical performance index for unread notification counts. Part of TanStack Query optimization. Reduces API calls from 200+ to <10.';



CREATE INDEX "idx_notifications_user_created" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC) WHERE ("read_at" IS NULL);



CREATE INDEX "idx_payout_batches_batch_id" ON "public"."payout_batches" USING "btree" ("batch_id");



CREATE INDEX "idx_payout_batches_run_date" ON "public"."payout_batches" USING "btree" ("run_date" DESC);



CREATE INDEX "idx_payout_batches_status" ON "public"."payout_batches" USING "btree" ("status");



CREATE INDEX "idx_payout_rate_limits_lookup" ON "public"."payout_rate_limits" USING "btree" ("professional_id", "payout_date");



CREATE INDEX "idx_payout_transfers_batch_id" ON "public"."payout_transfers" USING "btree" ("batch_id");



CREATE INDEX "idx_payout_transfers_booking_id" ON "public"."payout_transfers" USING "btree" ("booking_id");



CREATE INDEX "idx_payout_transfers_professional" ON "public"."payout_transfers" USING "btree" ("professional_id", "created_at" DESC);



CREATE INDEX "idx_payout_transfers_professional_id" ON "public"."payout_transfers" USING "btree" ("professional_id");



CREATE INDEX "idx_payout_transfers_status" ON "public"."payout_transfers" USING "btree" ("status");



CREATE INDEX "idx_payout_transfers_stripe_id" ON "public"."payout_transfers" USING "btree" ("stripe_transfer_id");



CREATE INDEX "idx_payout_transfers_type" ON "public"."payout_transfers" USING "btree" ("payout_type", "created_at" DESC);



CREATE INDEX "idx_payouts_payout_date" ON "public"."payouts" USING "btree" ("payout_date");



CREATE INDEX "idx_payouts_professional_id" ON "public"."payouts" USING "btree" ("professional_id");



CREATE INDEX "idx_payouts_status" ON "public"."payouts" USING "btree" ("status");



CREATE INDEX "idx_payouts_stripe_payout_id" ON "public"."payouts" USING "btree" ("stripe_payout_id") WHERE ("stripe_payout_id" IS NOT NULL);



CREATE INDEX "idx_performance_metrics_completion_rate" ON "public"."professional_performance_metrics" USING "btree" ("completion_rate" DESC);



CREATE INDEX "idx_performance_metrics_profile" ON "public"."professional_performance_metrics" USING "btree" ("profile_id");



CREATE INDEX "idx_performance_metrics_rating" ON "public"."professional_performance_metrics" USING "btree" ("average_rating" DESC) WHERE ("average_rating" > (0)::numeric);



CREATE INDEX "idx_platform_events_created_at" ON "public"."platform_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_platform_events_event_type" ON "public"."platform_events" USING "btree" ("event_type");



CREATE INDEX "idx_platform_events_properties" ON "public"."platform_events" USING "gin" ("properties" "jsonb_path_ops");



CREATE INDEX "idx_platform_events_session_id" ON "public"."platform_events" USING "btree" ("session_id");



CREATE INDEX "idx_platform_events_type_date" ON "public"."platform_events" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "idx_platform_events_user_id" ON "public"."platform_events" USING "btree" ("user_id");



CREATE INDEX "idx_platform_events_user_journey" ON "public"."platform_events" USING "btree" ("user_id", "created_at" DESC) WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_platform_settings_category" ON "public"."platform_settings" USING "btree" ("setting_category");



CREATE INDEX "idx_platform_settings_key" ON "public"."platform_settings" USING "btree" ("setting_key");



CREATE INDEX "idx_pricing_controls_active" ON "public"."pricing_controls" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_pricing_controls_category" ON "public"."pricing_controls" USING "btree" ("service_category") WHERE ("is_active" = true);



CREATE INDEX "idx_pricing_controls_city" ON "public"."pricing_controls" USING "btree" ("city") WHERE ("is_active" = true);



CREATE INDEX "idx_pricing_controls_created_by" ON "public"."pricing_controls" USING "btree" ("created_by");



CREATE INDEX "idx_pricing_controls_effective" ON "public"."pricing_controls" USING "btree" ("effective_from", "effective_until") WHERE ("is_active" = true);



CREATE INDEX "idx_pricing_plans_display_order" ON "public"."pricing_plans" USING "btree" ("display_order");



CREATE INDEX "idx_pricing_plans_slug" ON "public"."pricing_plans" USING "btree" ("slug");



CREATE INDEX "idx_pricing_plans_target_audience" ON "public"."pricing_plans" USING "btree" ("target_audience");



CREATE INDEX "idx_pricing_plans_visible" ON "public"."pricing_plans" USING "btree" ("is_visible") WHERE ("is_visible" = true);



CREATE INDEX "idx_pricing_tiers_active" ON "public"."service_pricing_tiers" USING "btree" ("is_active", "tier_level") WHERE ("is_active" = true);



CREATE INDEX "idx_pricing_tiers_service" ON "public"."service_pricing_tiers" USING "btree" ("service_id");



CREATE INDEX "idx_professional_documents_profile_id" ON "public"."professional_documents" USING "btree" ("profile_id");



CREATE INDEX "idx_professional_full_name_trgm" ON "public"."professional_profiles" USING "gin" ("full_name" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_professional_portfolio" ON "public"."professional_profiles" USING "gin" ("portfolio_images");



CREATE INDEX "idx_professional_profiles_active" ON "public"."professional_profiles" USING "btree" ("status", "created_at" DESC) WHERE ("status" = 'active'::"text");



COMMENT ON INDEX "public"."idx_professional_profiles_active" IS 'Optimizes professionals directory listing for active professionals.';



CREATE INDEX "idx_professional_profiles_avatar_url" ON "public"."professional_profiles" USING "btree" ("avatar_url") WHERE ("avatar_url" IS NOT NULL);



CREATE INDEX "idx_professional_profiles_balance" ON "public"."professional_profiles" USING "btree" ("available_balance_cop" DESC) WHERE ("available_balance_cop" > 0);



CREATE INDEX "idx_professional_profiles_location" ON "public"."professional_profiles" USING "btree" ("location_latitude", "location_longitude") WHERE ("location_latitude" IS NOT NULL);



CREATE INDEX "idx_professional_profiles_profile_id_rls" ON "public"."professional_profiles" USING "btree" ("profile_id");



CREATE INDEX "idx_professional_profiles_status" ON "public"."professional_profiles" USING "btree" ("status");



CREATE INDEX "idx_professional_profiles_verification" ON "public"."professional_profiles" USING "btree" ("verification_level");



CREATE INDEX "idx_professional_reviews_avg_score" ON "public"."admin_professional_reviews" USING "btree" ("interview_average_score") WHERE ("interview_average_score" IS NOT NULL);



CREATE INDEX "idx_professional_reviews_by_customer" ON "public"."professional_reviews" USING "btree" ("customer_id", "created_at" DESC);



CREATE INDEX "idx_professional_reviews_customer_id" ON "public"."professional_reviews" USING "btree" ("customer_id");



CREATE INDEX "idx_professional_reviews_pro_created" ON "public"."professional_reviews" USING "btree" ("professional_id", "created_at" DESC);



COMMENT ON INDEX "public"."idx_professional_reviews_pro_created" IS 'Optimizes review display on professional profiles';



CREATE INDEX "idx_professional_reviews_professional_id" ON "public"."professional_reviews" USING "btree" ("professional_id");



CREATE INDEX "idx_professional_reviews_rating" ON "public"."professional_reviews" USING "btree" ("rating");



CREATE INDEX "idx_professional_reviews_recommendation" ON "public"."admin_professional_reviews" USING "btree" ("recommendation") WHERE ("recommendation" IS NOT NULL);



CREATE INDEX "idx_professional_search_vector" ON "public"."professional_profiles" USING "gin" ("search_vector");



CREATE INDEX "idx_professional_services_active" ON "public"."professional_services" USING "btree" ("is_active", "is_featured") WHERE ("is_active" = true);



CREATE INDEX "idx_professional_services_category" ON "public"."professional_services" USING "btree" ("category_id") WHERE ("category_id" IS NOT NULL);



CREATE INDEX "idx_professional_services_profile" ON "public"."professional_services" USING "btree" ("profile_id");



CREATE INDEX "idx_professional_services_rating" ON "public"."professional_services" USING "btree" ("average_rating" DESC) WHERE ("average_rating" > (0)::numeric);



CREATE INDEX "idx_professional_services_type" ON "public"."professional_services" USING "btree" ("service_type");



CREATE INDEX "idx_profiles_account_status" ON "public"."profiles" USING "btree" ("account_status");



CREATE INDEX "idx_profiles_can_accept_bookings" ON "public"."profiles" USING "btree" ("can_accept_bookings") WHERE ("role" = 'professional'::"text");



CREATE INDEX "idx_profiles_city" ON "public"."profiles" USING "btree" ("city");



CREATE INDEX "idx_profiles_city_role_status" ON "public"."profiles" USING "btree" ("city", "role", "account_status");



CREATE INDEX "idx_profiles_city_trgm" ON "public"."profiles" USING "gin" ("city" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_profiles_full_name" ON "public"."profiles" USING "btree" ("full_name");



CREATE INDEX "idx_profiles_full_name_trgm" ON "public"."profiles" USING "gin" ("full_name" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_profiles_id_role" ON "public"."profiles" USING "btree" ("id", "role");



CREATE INDEX "idx_profiles_marketing_consent" ON "public"."profiles" USING "btree" ("marketing_consent") WHERE ("marketing_consent" = true);



CREATE INDEX "idx_profiles_onboarding_checklist" ON "public"."profiles" USING "gin" ("onboarding_checklist");



CREATE INDEX "idx_profiles_onboarding_pending" ON "public"."profiles" USING "btree" ("onboarding_status", "created_at") WHERE (("role" = 'professional'::"text") AND ("onboarding_status" = 'pending'::"text"));



CREATE INDEX "idx_profiles_onboarding_status" ON "public"."profiles" USING "btree" ("onboarding_status");



CREATE INDEX "idx_profiles_phone" ON "public"."profiles" USING "btree" ("phone");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_rebook_nudge_customer" ON "public"."rebook_nudge_experiments" USING "btree" ("customer_id");



CREATE INDEX "idx_rebook_nudge_rebooked" ON "public"."rebook_nudge_experiments" USING "btree" ("rebooked") WHERE ("rebooked" = true);



CREATE INDEX "idx_rebook_nudge_sent" ON "public"."rebook_nudge_experiments" USING "btree" ("email_sent_at") WHERE ("email_sent_at" IS NOT NULL);



CREATE INDEX "idx_rebook_nudge_variant" ON "public"."rebook_nudge_experiments" USING "btree" ("variant");



CREATE INDEX "idx_referral_codes_active" ON "public"."referral_codes" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_referral_codes_code" ON "public"."referral_codes" USING "btree" ("code") WHERE ("is_active" = true);



CREATE INDEX "idx_referral_codes_user_id" ON "public"."referral_codes" USING "btree" ("user_id");



CREATE INDEX "idx_referrals_code_id" ON "public"."referrals" USING "btree" ("referral_code_id");



CREATE INDEX "idx_referrals_referee_id" ON "public"."referrals" USING "btree" ("referee_id");



CREATE INDEX "idx_referrals_referrer_id" ON "public"."referrals" USING "btree" ("referrer_id");



CREATE INDEX "idx_referrals_status" ON "public"."referrals" USING "btree" ("status");



CREATE INDEX "idx_roadmap_comments_approved" ON "public"."roadmap_comments" USING "btree" ("is_approved");



CREATE INDEX "idx_roadmap_comments_roadmap_item_id" ON "public"."roadmap_comments" USING "btree" ("roadmap_item_id");



CREATE INDEX "idx_roadmap_comments_user_id" ON "public"."roadmap_comments" USING "btree" ("user_id");



CREATE INDEX "idx_roadmap_items_category" ON "public"."roadmap_items" USING "btree" ("category");



CREATE INDEX "idx_roadmap_items_changelog_id" ON "public"."roadmap_items" USING "btree" ("changelog_id");



CREATE INDEX "idx_roadmap_items_created_by" ON "public"."roadmap_items" USING "btree" ("created_by");



CREATE INDEX "idx_roadmap_items_published_at" ON "public"."roadmap_items" USING "btree" ("published_at" DESC) WHERE ("visibility" = 'published'::"text");



CREATE INDEX "idx_roadmap_items_slug" ON "public"."roadmap_items" USING "btree" ("slug");



CREATE INDEX "idx_roadmap_items_status" ON "public"."roadmap_items" USING "btree" ("status") WHERE ("visibility" = 'published'::"text");



CREATE INDEX "idx_roadmap_items_visibility" ON "public"."roadmap_items" USING "btree" ("visibility");



CREATE INDEX "idx_roadmap_items_vote_count" ON "public"."roadmap_items" USING "btree" ("vote_count" DESC);



CREATE INDEX "idx_roadmap_votes_roadmap_item_id" ON "public"."roadmap_votes" USING "btree" ("roadmap_item_id");



CREATE INDEX "idx_roadmap_votes_user_id" ON "public"."roadmap_votes" USING "btree" ("user_id");



CREATE INDEX "idx_search_analytics_clicked" ON "public"."help_search_analytics" USING "btree" ("clicked_article_id") WHERE ("clicked_article_id" IS NOT NULL);



CREATE INDEX "idx_search_analytics_created" ON "public"."help_search_analytics" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_search_analytics_locale" ON "public"."help_search_analytics" USING "btree" ("locale");



CREATE INDEX "idx_search_analytics_no_results" ON "public"."help_search_analytics" USING "btree" ("result_count") WHERE ("result_count" = 0);



CREATE INDEX "idx_search_analytics_query" ON "public"."help_search_analytics" USING "btree" ("query");



CREATE INDEX "idx_service_addons_active" ON "public"."service_addons" USING "btree" ("is_active", "display_order") WHERE ("is_active" = true);



CREATE INDEX "idx_service_addons_service" ON "public"."service_addons" USING "btree" ("service_id");



CREATE INDEX "idx_service_bundles_active" ON "public"."service_bundles" USING "btree" ("profile_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_service_bundles_profile" ON "public"."service_bundles" USING "btree" ("profile_id");



CREATE INDEX "idx_service_bundles_services" ON "public"."service_bundles" USING "gin" ("services");



CREATE INDEX "idx_service_categories_active" ON "public"."service_categories" USING "btree" ("is_active", "display_order") WHERE ("is_active" = true);



CREATE INDEX "idx_service_categories_parent" ON "public"."service_categories" USING "btree" ("parent_category_id") WHERE ("parent_category_id" IS NOT NULL);



CREATE INDEX "idx_service_categories_slug" ON "public"."service_categories" USING "btree" ("slug");



CREATE INDEX "idx_sms_logs_sent_at" ON "public"."sms_logs" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_sms_logs_status" ON "public"."sms_logs" USING "btree" ("status");



CREATE INDEX "idx_sms_logs_user" ON "public"."sms_logs" USING "btree" ("user_id");



CREATE INDEX "idx_status_history_booking" ON "public"."booking_status_history" USING "btree" ("booking_id", "created_at" DESC);



CREATE INDEX "idx_travel_buffers_location" ON "public"."professional_travel_buffers" USING "gist" ("service_location");



CREATE INDEX "idx_travel_buffers_radius" ON "public"."professional_travel_buffers" USING "btree" ("profile_id", "service_radius_km");



CREATE INDEX "idx_trial_credits_customer_id" ON "public"."trial_credits" USING "btree" ("customer_id");



CREATE INDEX "idx_trial_credits_has_credit" ON "public"."trial_credits" USING "btree" ("credit_remaining_cop") WHERE ("credit_remaining_cop" > 0);



CREATE INDEX "idx_trial_credits_last_booking_at" ON "public"."trial_credits" USING "btree" ("last_booking_at" DESC);



CREATE INDEX "idx_trial_credits_professional_id" ON "public"."trial_credits" USING "btree" ("professional_id");



CREATE UNIQUE INDEX "idx_unique_active_code_per_user" ON "public"."referral_codes" USING "btree" ("user_id") WHERE ("is_active" = true);



CREATE INDEX "idx_user_suspensions_active" ON "public"."user_suspensions" USING "btree" ("user_id", "expires_at") WHERE ("lifted_at" IS NULL);



CREATE INDEX "idx_user_suspensions_expires_at" ON "public"."user_suspensions" USING "btree" ("expires_at");



CREATE INDEX "idx_user_suspensions_is_active" ON "public"."user_suspensions" USING "btree" ("is_active");



CREATE INDEX "idx_user_suspensions_user_id" ON "public"."user_suspensions" USING "btree" ("user_id");



CREATE INDEX "idx_working_hours_available" ON "public"."professional_working_hours" USING "btree" ("profile_id", "is_available") WHERE ("is_available" = true);



CREATE INDEX "idx_working_hours_day" ON "public"."professional_working_hours" USING "btree" ("day_of_week");



CREATE INDEX "idx_working_hours_profile" ON "public"."professional_working_hours" USING "btree" ("profile_id");



CREATE INDEX "mobile_push_tokens_user_idx" ON "public"."mobile_push_tokens" USING "btree" ("user_id");



CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "notifications_user_read_idx" ON "public"."notifications" USING "btree" ("user_id", "read_at");



CREATE INDEX "professional_profiles_location_idx" ON "public"."professional_profiles" USING "btree" ("city", "country") WHERE ("city" IS NOT NULL);



CREATE INDEX "professional_profiles_public_visibility_idx" ON "public"."professional_profiles" USING "btree" ("profile_visibility", "status", "verification_level") WHERE ("profile_visibility" = 'public'::"text");



CREATE UNIQUE INDEX "professional_profiles_slug_unique_idx" ON "public"."professional_profiles" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE INDEX "profiles_created_at_idx" ON "public"."profiles" USING "btree" ("created_at" DESC);



CREATE INDEX "profiles_stripe_customer_id_idx" ON "public"."profiles" USING "btree" ("stripe_customer_id");



CREATE INDEX "profiles_updated_at_idx" ON "public"."profiles" USING "btree" ("updated_at" DESC);



CREATE INDEX "recurring_plan_holidays_plan_id_idx" ON "public"."recurring_plan_holidays" USING "btree" ("recurring_plan_id");



CREATE INDEX "recurring_plan_holidays_skip_date_idx" ON "public"."recurring_plan_holidays" USING "btree" ("skip_date");



CREATE INDEX "recurring_plans_customer_id_idx" ON "public"."recurring_plans" USING "btree" ("customer_id");



CREATE INDEX "recurring_plans_next_booking_date_idx" ON "public"."recurring_plans" USING "btree" ("next_booking_date") WHERE ("status" = 'active'::"text");



CREATE INDEX "recurring_plans_professional_id_idx" ON "public"."recurring_plans" USING "btree" ("professional_id");



CREATE INDEX "recurring_plans_status_idx" ON "public"."recurring_plans" USING "btree" ("status");



CREATE UNIQUE INDEX "unique_active_rule" ON "public"."pricing_controls" USING "btree" ("service_category", "city", "effective_from") NULLS NOT DISTINCT WHERE ("is_active" = true);



CREATE OR REPLACE TRIGGER "admin_professional_reviews_set_updated_at" BEFORE UPDATE ON "public"."admin_professional_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_admin_professional_reviews_updated_at"();



CREATE OR REPLACE TRIGGER "audit_booking_status" AFTER UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."audit_booking_status_change"();



CREATE OR REPLACE TRIGGER "auto_generate_slug_trigger" BEFORE INSERT OR UPDATE OF "full_name" ON "public"."professional_profiles" FOR EACH ROW WHEN ((("new"."slug" IS NULL) AND ("new"."full_name" IS NOT NULL))) EXECUTE FUNCTION "public"."auto_generate_slug_on_insert"();



CREATE OR REPLACE TRIGGER "changelogs_set_updated_at" BEFORE UPDATE ON "public"."changelogs" FOR EACH ROW EXECUTE FUNCTION "public"."set_changelog_updated_at"();



CREATE OR REPLACE TRIGGER "customer_reviews_set_updated_at" BEFORE UPDATE ON "public"."customer_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_customer_review_updated_at"();



CREATE OR REPLACE TRIGGER "disputes_set_updated_at" BEFORE UPDATE ON "public"."disputes" FOR EACH ROW EXECUTE FUNCTION "public"."set_disputes_updated_at"();



CREATE OR REPLACE TRIGGER "feedback_set_updated_at" BEFORE UPDATE ON "public"."feedback_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."set_feedback_updated_at"();



CREATE OR REPLACE TRIGGER "payout_batches_updated_at" BEFORE UPDATE ON "public"."payout_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_payout_batches_updated_at"();



CREATE OR REPLACE TRIGGER "payout_transfers_updated_at" BEFORE UPDATE ON "public"."payout_transfers" FOR EACH ROW EXECUTE FUNCTION "public"."update_payout_transfers_updated_at"();



CREATE OR REPLACE TRIGGER "payouts_set_updated_at" BEFORE UPDATE ON "public"."payouts" FOR EACH ROW EXECUTE FUNCTION "public"."set_payouts_updated_at"();



CREATE OR REPLACE TRIGGER "prevent_role_change_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_change"();



CREATE OR REPLACE TRIGGER "professional_search_vector_update" BEFORE INSERT OR UPDATE OF "full_name", "bio", "primary_services" ON "public"."professional_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_professional_search_vector"();



CREATE OR REPLACE TRIGGER "profile_location_update" AFTER UPDATE OF "city", "country" ON "public"."profiles" FOR EACH ROW WHEN ((("new"."city" IS DISTINCT FROM "old"."city") OR ("new"."country" IS DISTINCT FROM "old"."country"))) EXECUTE FUNCTION "public"."update_professional_search_on_profile_change"();



CREATE OR REPLACE TRIGGER "protect_required_consents_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."protect_required_consents"();



CREATE OR REPLACE TRIGGER "set_amara_conversations_updated_at" BEFORE UPDATE ON "public"."amara_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_background_checks_updated_at" BEFORE UPDATE ON "public"."background_checks" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_customer_profiles_updated_at" BEFORE UPDATE ON "public"."customer_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_help_article_tags_updated_at" BEFORE UPDATE ON "public"."help_article_tags" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_insurance_claims_updated_at" BEFORE UPDATE ON "public"."insurance_claims" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_interview_slots_updated_at" BEFORE UPDATE ON "public"."interview_slots" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_platform_settings_updated_at" BEFORE UPDATE ON "public"."platform_settings" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_pricing_plans_updated_at" BEFORE UPDATE ON "public"."pricing_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_pricing_plans_updated_at"();



CREATE OR REPLACE TRIGGER "set_professional_profiles_updated_at" BEFORE UPDATE ON "public"."professional_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_roadmap_comments_updated_at" BEFORE UPDATE ON "public"."roadmap_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_comments_updated_at"();



CREATE OR REPLACE TRIGGER "set_roadmap_items_updated_at" BEFORE UPDATE ON "public"."roadmap_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_items_updated_at"();



CREATE OR REPLACE TRIGGER "tr_mobile_push_tokens_updated_at" BEFORE UPDATE ON "public"."mobile_push_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."set_mobile_push_tokens_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_auto_init_performance_metrics" AFTER INSERT ON "public"."profiles" FOR EACH ROW WHEN (("new"."role" = 'professional'::"text")) EXECUTE FUNCTION "public"."auto_initialize_performance_metrics"();



CREATE OR REPLACE TRIGGER "trigger_briefs_updated_at" BEFORE UPDATE ON "public"."briefs" FOR EACH ROW EXECUTE FUNCTION "public"."update_briefs_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_calculate_bundle_price" BEFORE INSERT OR UPDATE ON "public"."service_bundles" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_bundle_final_price"();



CREATE OR REPLACE TRIGGER "trigger_log_balance_changes" AFTER UPDATE OF "pending_balance_cop", "available_balance_cop" ON "public"."professional_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_balance_change"();



CREATE OR REPLACE TRIGGER "trigger_message_read" AFTER UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_message_read"();



CREATE OR REPLACE TRIGGER "trigger_new_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_message"();



CREATE OR REPLACE TRIGGER "trigger_refresh_cache_on_profile" AFTER UPDATE OF "can_accept_bookings", "onboarding_completion_percentage" ON "public"."profiles" FOR EACH STATEMENT EXECUTE FUNCTION "public"."refresh_availability_cache"();



CREATE OR REPLACE TRIGGER "trigger_refresh_cache_on_travel_buffers" AFTER INSERT OR DELETE OR UPDATE ON "public"."professional_travel_buffers" FOR EACH STATEMENT EXECUTE FUNCTION "public"."refresh_availability_cache"();



CREATE OR REPLACE TRIGGER "trigger_refresh_cache_on_working_hours" AFTER INSERT OR DELETE OR UPDATE ON "public"."professional_working_hours" FOR EACH STATEMENT EXECUTE FUNCTION "public"."refresh_availability_cache"();



CREATE OR REPLACE TRIGGER "trigger_set_claim_participants" BEFORE INSERT ON "public"."insurance_claims" FOR EACH ROW EXECUTE FUNCTION "public"."set_claim_participants"();



CREATE OR REPLACE TRIGGER "trigger_set_message_participants" BEFORE INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_message_participants"();



CREATE OR REPLACE TRIGGER "trigger_update_onboarding_completion" BEFORE INSERT OR UPDATE OF "onboarding_checklist" ON "public"."profiles" FOR EACH ROW WHEN (("new"."role" = 'professional'::"text")) EXECUTE FUNCTION "public"."update_onboarding_completion"();



CREATE OR REPLACE TRIGGER "trigger_update_pricing_rule" BEFORE UPDATE ON "public"."pricing_controls" FOR EACH ROW EXECUTE FUNCTION "public"."update_pricing_rule"();



CREATE OR REPLACE TRIGGER "trigger_update_pricing_tiers_updated_at" BEFORE UPDATE ON "public"."service_pricing_tiers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_professional_services_updated_at" BEFORE UPDATE ON "public"."professional_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_service_addons_updated_at" BEFORE UPDATE ON "public"."service_addons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_service_categories_updated_at" BEFORE UPDATE ON "public"."service_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_trial_credit_on_booking_completion" AFTER UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_trial_credit_on_booking_completion"();



CREATE OR REPLACE TRIGGER "update_article_feedback_counts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."help_article_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_article_feedback_counts"();



CREATE OR REPLACE TRIGGER "update_comment_count_on_delete" AFTER DELETE ON "public"."roadmap_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_comment_count"();



CREATE OR REPLACE TRIGGER "update_comment_count_on_insert" AFTER INSERT ON "public"."roadmap_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_comment_count"();



CREATE OR REPLACE TRIGGER "update_help_articles_updated_at" BEFORE UPDATE ON "public"."help_articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_help_categories_updated_at" BEFORE UPDATE ON "public"."help_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_subscriptions_updated_at" BEFORE UPDATE ON "public"."notification_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_subscriptions_updated_at"();



CREATE OR REPLACE TRIGGER "update_recurring_plan_metadata_trigger" BEFORE INSERT OR UPDATE ON "public"."recurring_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_recurring_plan_metadata"();



CREATE OR REPLACE TRIGGER "update_referral_codes_updated_at" BEFORE UPDATE ON "public"."referral_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_referral_updated_at"();



CREATE OR REPLACE TRIGGER "update_referrals_updated_at" BEFORE UPDATE ON "public"."referrals" FOR EACH ROW EXECUTE FUNCTION "public"."update_referral_updated_at"();



CREATE OR REPLACE TRIGGER "update_vote_count_on_delete" AFTER DELETE ON "public"."roadmap_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_vote_count"();



CREATE OR REPLACE TRIGGER "update_vote_count_on_insert" AFTER INSERT ON "public"."roadmap_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_roadmap_vote_count"();



CREATE OR REPLACE TRIGGER "user_suspensions_set_updated_at" BEFORE UPDATE ON "public"."user_suspensions" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_suspensions_updated_at"();



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_professional_reviews"
    ADD CONSTRAINT "admin_professional_reviews_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_professional_reviews"
    ADD CONSTRAINT "admin_professional_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."amara_conversations"
    ADD CONSTRAINT "amara_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."amara_messages"
    ADD CONSTRAINT "amara_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."amara_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."amara_tool_runs"
    ADD CONSTRAINT "amara_tool_runs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."amara_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."amara_tool_runs"
    ADD CONSTRAINT "amara_tool_runs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."amara_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."amara_tool_runs"
    ADD CONSTRAINT "amara_tool_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."background_checks"
    ADD CONSTRAINT "background_checks_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."balance_audit_log"
    ADD CONSTRAINT "balance_audit_log_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."balance_audit_log"
    ADD CONSTRAINT "balance_audit_log_payout_transfer_id_fkey" FOREIGN KEY ("payout_transfer_id") REFERENCES "public"."payout_transfers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."balance_audit_log"
    ADD CONSTRAINT "balance_audit_log_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."balance_clearance_queue"
    ADD CONSTRAINT "balance_clearance_queue_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."balance_clearance_queue"
    ADD CONSTRAINT "balance_clearance_queue_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_addons"
    ADD CONSTRAINT "booking_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "public"."service_addons"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."booking_disputes"
    ADD CONSTRAINT "booking_disputes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_disputes"
    ADD CONSTRAINT "booking_disputes_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_disputes"
    ADD CONSTRAINT "booking_disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."booking_status_history"
    ADD CONSTRAINT "booking_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_guest_session_id_fkey" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_included_in_payout_id_fkey" FOREIGN KEY ("included_in_payout_id") REFERENCES "public"."payouts"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."changelog_views"
    ADD CONSTRAINT "changelog_views_changelog_id_fkey" FOREIGN KEY ("changelog_id") REFERENCES "public"."changelogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."changelog_views"
    ADD CONSTRAINT "changelog_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."changelogs"
    ADD CONSTRAINT "changelogs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_reviews"
    ADD CONSTRAINT "customer_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_reviews"
    ADD CONSTRAINT "customer_reviews_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."help_article_feedback"
    ADD CONSTRAINT "help_article_feedback_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_article_feedback"
    ADD CONSTRAINT "help_article_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."help_article_relations"
    ADD CONSTRAINT "help_article_relations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_article_relations"
    ADD CONSTRAINT "help_article_relations_related_article_id_fkey" FOREIGN KEY ("related_article_id") REFERENCES "public"."help_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_article_tags_relation"
    ADD CONSTRAINT "help_article_tags_relation_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_article_tags_relation"
    ADD CONSTRAINT "help_article_tags_relation_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."help_article_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_search_analytics"
    ADD CONSTRAINT "help_search_analytics_clicked_article_id_fkey" FOREIGN KEY ("clicked_article_id") REFERENCES "public"."help_articles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."help_search_analytics"
    ADD CONSTRAINT "help_search_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."insurance_claims"
    ADD CONSTRAINT "insurance_claims_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insurance_claims"
    ADD CONSTRAINT "insurance_claims_filed_by_fkey" FOREIGN KEY ("filed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."insurance_claims"
    ADD CONSTRAINT "insurance_claims_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mobile_push_tokens"
    ADD CONSTRAINT "mobile_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_flags"
    ADD CONSTRAINT "moderation_flags_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."moderation_flags"
    ADD CONSTRAINT "moderation_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_subscriptions"
    ADD CONSTRAINT "notification_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payout_rate_limits"
    ADD CONSTRAINT "payout_rate_limits_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payout_transfers"
    ADD CONSTRAINT "payout_transfers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."payout_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payout_transfers"
    ADD CONSTRAINT "payout_transfers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payout_transfers"
    ADD CONSTRAINT "payout_transfers_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_events"
    ADD CONSTRAINT "platform_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pricing_controls"
    ADD CONSTRAINT "pricing_controls_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."professional_documents"
    ADD CONSTRAINT "professional_documents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_performance_metrics"
    ADD CONSTRAINT "professional_performance_metrics_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_profiles"
    ADD CONSTRAINT "professional_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_revenue_snapshots"
    ADD CONSTRAINT "professional_revenue_snapshots_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_reviews"
    ADD CONSTRAINT "professional_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_reviews"
    ADD CONSTRAINT "professional_reviews_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("profile_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_services"
    ADD CONSTRAINT "professional_services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."professional_services"
    ADD CONSTRAINT "professional_services_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_travel_buffers"
    ADD CONSTRAINT "professional_travel_buffers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_working_hours"
    ADD CONSTRAINT "professional_working_hours_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rebook_nudge_experiments"
    ADD CONSTRAINT "rebook_nudge_experiments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_plan_holidays"
    ADD CONSTRAINT "recurring_plan_holidays_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "public"."recurring_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_plans"
    ADD CONSTRAINT "recurring_plans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_plans"
    ADD CONSTRAINT "recurring_plans_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referee_id_fkey" FOREIGN KEY ("referee_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_comments"
    ADD CONSTRAINT "roadmap_comments_roadmap_item_id_fkey" FOREIGN KEY ("roadmap_item_id") REFERENCES "public"."roadmap_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_comments"
    ADD CONSTRAINT "roadmap_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_items"
    ADD CONSTRAINT "roadmap_items_changelog_id_fkey" FOREIGN KEY ("changelog_id") REFERENCES "public"."changelogs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."roadmap_items"
    ADD CONSTRAINT "roadmap_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_roadmap_item_id_fkey" FOREIGN KEY ("roadmap_item_id") REFERENCES "public"."roadmap_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_addons"
    ADD CONSTRAINT "service_addons_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."professional_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_bundles"
    ADD CONSTRAINT "service_bundles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."service_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_pricing_tiers"
    ADD CONSTRAINT "service_pricing_tiers_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."professional_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sms_logs"
    ADD CONSTRAINT "sms_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_credit_applied_to_booking_id_fkey" FOREIGN KEY ("credit_applied_to_booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_last_booking_id_fkey" FOREIGN KEY ("last_booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."trial_credits"
    ADD CONSTRAINT "trial_credits_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_suspensions"
    ADD CONSTRAINT "user_suspensions_lifted_by_fkey" FOREIGN KEY ("lifted_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_suspensions"
    ADD CONSTRAINT "user_suspensions_suspended_by_fkey" FOREIGN KEY ("suspended_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_suspensions"
    ADD CONSTRAINT "user_suspensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create changelogs" ON "public"."changelogs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create moderation flags" ON "public"."moderation_flags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create pricing plans" ON "public"."pricing_plans" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create roadmap items" ON "public"."roadmap_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can create user suspensions" ON "public"."user_suspensions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete changelogs" ON "public"."changelogs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete pricing plans" ON "public"."pricing_plans" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete roadmap items" ON "public"."roadmap_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can insert audit logs" ON "public"."admin_audit_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can insert platform settings" ON "public"."platform_settings" FOR INSERT TO "authenticated" WITH CHECK ("private"."user_has_role"('admin'::"text"));



CREATE POLICY "Admins can manage admin reviews" ON "public"."admin_professional_reviews" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



COMMENT ON POLICY "Admins can manage admin reviews" ON "public"."admin_professional_reviews" IS 'Admins have full access (SELECT/INSERT/UPDATE/DELETE) to all admin reviews';



CREATE POLICY "Admins can manage all disputes" ON "public"."disputes" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



COMMENT ON POLICY "Admins can manage all disputes" ON "public"."disputes" IS 'Admins have full access (SELECT/INSERT/UPDATE/DELETE) to all disputes';



CREATE POLICY "Admins can manage all rate limits" ON "public"."payout_rate_limits" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can manage all recurring plans" ON "public"."recurring_plans" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage articles" ON "public"."help_articles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage categories" ON "public"."help_categories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage clearance queue" ON "public"."balance_clearance_queue" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage platform settings" ON "public"."platform_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage pricing controls" ON "public"."pricing_controls" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage suspensions" ON "public"."user_suspensions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage tag relations" ON "public"."help_article_tags_relation" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage tags" ON "public"."help_article_tags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update briefs" ON "public"."briefs" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update changelogs" ON "public"."changelogs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update disputes" ON "public"."booking_disputes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update moderation flags" ON "public"."moderation_flags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update platform settings" ON "public"."platform_settings" FOR UPDATE TO "authenticated" USING ("private"."user_has_role"('admin'::"text")) WITH CHECK ("private"."user_has_role"('admin'::"text"));



CREATE POLICY "Admins can update pricing plans" ON "public"."pricing_plans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update roadmap items" ON "public"."roadmap_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update user suspensions" ON "public"."user_suspensions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all articles" ON "public"."help_articles" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))) OR ("is_published" = true)));



CREATE POLICY "Admins can view all audit logs" ON "public"."admin_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all balance audit logs" ON "public"."balance_audit_log" FOR SELECT USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can view all briefs" ON "public"."briefs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all categories" ON "public"."help_categories" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))) OR ("is_active" = true)));



CREATE POLICY "Admins can view all disputes" ON "public"."booking_disputes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all moderation flags" ON "public"."moderation_flags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all platform events" ON "public"."platform_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all pricing plans" ON "public"."pricing_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all rebook nudge experiments" ON "public"."rebook_nudge_experiments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all suspensions" ON "public"."user_suspensions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all user suspensions" ON "public"."user_suspensions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view payout_batches" ON "public"."payout_batches" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view payout_transfers" ON "public"."payout_transfers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view platform settings" ON "public"."platform_settings" FOR SELECT TO "authenticated" USING ("private"."user_has_role"('admin'::"text"));



CREATE POLICY "Admins can view search analytics" ON "public"."help_search_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins delete feedback" ON "public"."feedback_submissions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins have full access to booking addons" ON "public"."booking_addons" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins have full access to bookings" ON "public"."bookings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins have full access to status history" ON "public"."booking_status_history" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins update feedback" ON "public"."feedback_submissions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Anonymous users can insert platform events" ON "public"."platform_events" FOR INSERT TO "anon" WITH CHECK (("user_id" IS NULL));



CREATE POLICY "Anyone can create guest sessions" ON "public"."guest_sessions" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can submit feedback" ON "public"."help_article_feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view article relations" ON "public"."help_article_relations" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tag relations" ON "public"."help_article_tags_relation" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tags" ON "public"."help_article_tags" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create comments" ON "public"."roadmap_comments" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can view votes" ON "public"."roadmap_votes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users submit feedback" ON "public"."feedback_submissions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Customers can add holidays to own plans" ON "public"."recurring_plan_holidays" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."recurring_plans"
  WHERE (("recurring_plans"."id" = "recurring_plan_holidays"."recurring_plan_id") AND ("recurring_plans"."customer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Customers can create recurring plans" ON "public"."recurring_plans" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Customers can delete own recurring plans" ON "public"."recurring_plans" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Customers can insert their own reviews" ON "public"."professional_reviews" FOR INSERT WITH CHECK (("customer_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Customers can remove holidays from own plans" ON "public"."recurring_plan_holidays" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."recurring_plans"
  WHERE (("recurring_plans"."id" = "recurring_plan_holidays"."recurring_plan_id") AND ("recurring_plans"."customer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Customers can update own recurring plans" ON "public"."recurring_plans" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Customers can view holidays for own plans" ON "public"."recurring_plan_holidays" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."recurring_plans"
  WHERE (("recurring_plans"."id" = "recurring_plan_holidays"."recurring_plan_id") AND ("recurring_plans"."customer_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Customers can view own rebook nudge experiments" ON "public"."rebook_nudge_experiments" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Customers can view their direct hire bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING ((("booking_type" = 'direct_hire'::"text") AND ("customer_id" = "auth"."uid"())));



CREATE POLICY "Guests can create bookings" ON "public"."bookings" FOR INSERT TO "anon" WITH CHECK ((("guest_session_id" IS NOT NULL) AND ("customer_id" IS NOT NULL)));



CREATE POLICY "Guests can view their own bookings" ON "public"."bookings" FOR SELECT TO "anon" USING (("guest_session_id" IN ( SELECT "guest_sessions"."id"
   FROM "public"."guest_sessions")));



CREATE POLICY "Only service role can read cron config" ON "public"."cron_config" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Only service role can update cron config" ON "public"."cron_config" FOR UPDATE USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Professional documents are visible to owner" ON "public"."professional_documents" FOR SELECT USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professional documents can be deleted by owner" ON "public"."professional_documents" FOR DELETE USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professional documents can be inserted by owner" ON "public"."professional_documents" FOR INSERT WITH CHECK (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can manage their own add-ons" ON "public"."service_addons" TO "authenticated" USING ("public"."check_service_ownership"("service_id"));



CREATE POLICY "Professionals can manage their own bundles" ON "public"."service_bundles" USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Professionals can manage their own pricing tiers" ON "public"."service_pricing_tiers" TO "authenticated" USING ("public"."check_service_ownership"("service_id"));



CREATE POLICY "Professionals can manage their own services" ON "public"."professional_services" USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can manage their own travel buffers" ON "public"."professional_travel_buffers" USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Professionals can manage their own working hours" ON "public"."professional_working_hours" USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Professionals can reschedule their pending interviews" ON "public"."interview_slots" FOR UPDATE TO "authenticated" USING ((("professional_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("status" = 'scheduled'::"public"."interview_status"))) WITH CHECK (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can update their assigned bookings" ON "public"."bookings" FOR UPDATE USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can update their own reviews" ON "public"."customer_reviews" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "professional_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "professional_id"));



CREATE POLICY "Professionals can view addons for their bookings" ON "public"."booking_addons" FOR SELECT USING (("booking_id" IN ( SELECT "bookings"."id"
   FROM "public"."bookings"
  WHERE ("bookings"."professional_id" = "auth"."uid"()))));



COMMENT ON POLICY "Professionals can view addons for their bookings" ON "public"."booking_addons" IS 'Allows professionals to view addons for bookings assigned to them';



CREATE POLICY "Professionals can view direct hire requests for their profile" ON "public"."bookings" FOR SELECT TO "authenticated" USING ((("booking_type" = 'direct_hire'::"text") AND ("professional_id" = "auth"."uid"())));



CREATE POLICY "Professionals can view own balance audit log" ON "public"."balance_audit_log" FOR SELECT USING (("professional_id" = "auth"."uid"()));



CREATE POLICY "Professionals can view own clearance queue" ON "public"."balance_clearance_queue" FOR SELECT USING (("professional_id" = "auth"."uid"()));



CREATE POLICY "Professionals can view own rate limits" ON "public"."payout_rate_limits" FOR SELECT USING (("professional_id" = "auth"."uid"()));



CREATE POLICY "Professionals can view platform settings" ON "public"."platform_settings" FOR SELECT USING (true);



CREATE POLICY "Professionals can view their assigned bookings" ON "public"."bookings" FOR SELECT USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can view their booking history" ON "public"."booking_status_history" FOR SELECT USING (("booking_id" IN ( SELECT "bookings"."id"
   FROM "public"."bookings"
  WHERE ("bookings"."professional_id" = "auth"."uid"()))));



COMMENT ON POLICY "Professionals can view their booking history" ON "public"."booking_status_history" IS 'Allows professionals to view status history for bookings assigned to them';



CREATE POLICY "Professionals can view their own admin reviews" ON "public"."admin_professional_reviews" FOR SELECT USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



COMMENT ON POLICY "Professionals can view their own admin reviews" ON "public"."admin_professional_reviews" IS 'Professionals can view admin reviews about themselves';



CREATE POLICY "Professionals can view their own background checks" ON "public"."background_checks" FOR SELECT TO "authenticated" USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can view their own interview slots" ON "public"."interview_slots" FOR SELECT TO "authenticated" USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can view their own metrics" ON "public"."professional_performance_metrics" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Professionals can view their own payout_transfers" ON "public"."payout_transfers" FOR SELECT TO "authenticated" USING (("professional_id" = "auth"."uid"()));



CREATE POLICY "Professionals can view their own payouts" ON "public"."payouts" FOR SELECT USING (("professional_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Professionals can view their own revenue snapshots" ON "public"."professional_revenue_snapshots" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Public can view active categories" ON "public"."help_categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view active pricing tiers" ON "public"."service_pricing_tiers" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view active service add-ons" ON "public"."service_addons" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view active service bundles" ON "public"."service_bundles" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view active service categories" ON "public"."service_categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view active services" ON "public"."professional_services" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view performance metrics" ON "public"."professional_performance_metrics" FOR SELECT USING (true);



CREATE POLICY "Public can view published articles" ON "public"."help_articles" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can view travel buffers for radius filtering" ON "public"."professional_travel_buffers" FOR SELECT USING (true);



CREATE POLICY "Public can view visible pricing plans" ON "public"."pricing_plans" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "Public can view working hours" ON "public"."professional_working_hours" FOR SELECT USING (true);



CREATE POLICY "Reviews are readable by anyone" ON "public"."professional_reviews" FOR SELECT USING (true);



CREATE POLICY "Service role can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Service role can manage all SMS logs" ON "public"."sms_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all background checks" ON "public"."background_checks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all blocks" ON "public"."user_blocks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all insurance claims" ON "public"."insurance_claims" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all interview slots" ON "public"."interview_slots" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all payouts" ON "public"."payouts" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Service role can manage all platform events" ON "public"."platform_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all platform settings" ON "public"."platform_settings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage guest sessions" ON "public"."guest_sessions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage rebook nudge experiments" ON "public"."rebook_nudge_experiments" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access to payout_batches" ON "public"."payout_batches" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access to payout_transfers" ON "public"."payout_transfers" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role has full access to briefs" ON "public"."briefs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "System can insert status history" ON "public"."booking_status_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create blocks" ON "public"."user_blocks" FOR INSERT TO "authenticated" WITH CHECK (("blocker_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can create conversations for their bookings" ON "public"."conversations" FOR INSERT WITH CHECK ((("customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("professional_id" = ( SELECT "auth"."uid"() AS "uid"))));



COMMENT ON POLICY "Users can create conversations for their bookings" ON "public"."conversations" IS 'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';



CREATE POLICY "Users can create insurance claims" ON "public"."insurance_claims" FOR INSERT TO "authenticated" WITH CHECK (("filed_by" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can create messages in their own conversations" ON "public"."amara_messages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."amara_conversations"
  WHERE (("amara_conversations"."id" = "amara_messages"."conversation_id") AND ("amara_conversations"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can create their own Amara conversations" ON "public"."amara_conversations" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can create their own briefs" ON "public"."briefs" FOR INSERT TO "authenticated" WITH CHECK (("email" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Users can create their own referral codes" ON "public"."referral_codes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can create their own votes" ON "public"."roadmap_votes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own subscriptions" ON "public"."notification_subscriptions" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own Amara conversations" ON "public"."amara_conversations" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own Amara messages" ON "public"."amara_messages" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."amara_conversations"
  WHERE (("amara_conversations"."id" = "amara_messages"."conversation_id") AND ("amara_conversations"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can delete their own blocks" ON "public"."user_blocks" FOR DELETE TO "authenticated" USING (("blocker_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own votes" ON "public"."roadmap_votes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own changelog views" ON "public"."changelog_views" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own subscriptions" ON "public"."notification_subscriptions" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own booking addons" ON "public"."booking_addons" FOR INSERT WITH CHECK (("booking_id" IN ( SELECT "bookings"."id"
   FROM "public"."bookings"
  WHERE ("bookings"."customer_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("customer_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own platform events" ON "public"."platform_events" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("user_id" IS NULL)));



CREATE POLICY "Users can manage their own mobile push tokens" ON "public"."mobile_push_tokens" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read their own guest session by token" ON "public"."guest_sessions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can send messages in their conversations" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = ANY ("participant_ids")) AND ("sender_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users can update messages to mark as read" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("conversations"."professional_id" = ( SELECT "auth"."uid"() AS "uid")))))));



COMMENT ON POLICY "Users can update messages to mark as read" ON "public"."messages" IS 'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';



CREATE POLICY "Users can update own changelog views" ON "public"."changelog_views" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own subscriptions" ON "public"."notification_subscriptions" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own Amara conversations" ON "public"."amara_conversations" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own Amara messages" ON "public"."amara_messages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."amara_conversations"
  WHERE (("amara_conversations"."id" = "amara_messages"."conversation_id") AND ("amara_conversations"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."amara_conversations"
  WHERE (("amara_conversations"."id" = "amara_messages"."conversation_id") AND ("amara_conversations"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can update their own bookings" ON "public"."bookings" FOR UPDATE USING (("customer_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own conversations" ON "public"."conversations" FOR UPDATE USING ((("customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("professional_id" = ( SELECT "auth"."uid"() AS "uid"))));



COMMENT ON POLICY "Users can update their own conversations" ON "public"."conversations" IS 'Optimized with (SELECT auth.uid()) to prevent auth_rls_initplan performance warnings';



CREATE POLICY "Users can update their own referral codes" ON "public"."referral_codes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view active pricing rules" ON "public"."pricing_controls" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can view disputes they opened" ON "public"."disputes" FOR SELECT USING (("opened_by" = ( SELECT "auth"."uid"() AS "uid")));



COMMENT ON POLICY "Users can view disputes they opened" ON "public"."disputes" IS 'Users can view disputes they opened';



CREATE POLICY "Users can view insurance claims for their bookings" ON "public"."insurance_claims" FOR SELECT TO "authenticated" USING ((("customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("professional_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users can view messages in their conversations" ON "public"."messages" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ANY ("participant_ids")));



COMMENT ON POLICY "Users can view messages in their conversations" ON "public"."messages" IS 'Users view messages in their conversations - already optimal, no consolidation needed';



CREATE POLICY "Users can view own feedback" ON "public"."help_article_feedback" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own subscriptions" ON "public"."notification_subscriptions" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view rebook nudge experiments" ON "public"."rebook_nudge_experiments" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view referrals they're involved in" ON "public"."referrals" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "referrer_id") OR (( SELECT "auth"."uid"() AS "uid") = "referee_id")));



CREATE POLICY "Users can view their booking history" ON "public"."booking_status_history" FOR SELECT USING (("booking_id" IN ( SELECT "bookings"."id"
   FROM "public"."bookings"
  WHERE ("bookings"."customer_id" = "auth"."uid"()))));



COMMENT ON POLICY "Users can view their booking history" ON "public"."booking_status_history" IS 'Allows customers to view status history for their bookings';



CREATE POLICY "Users can view their own Amara conversations" ON "public"."amara_conversations" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own Amara messages" ON "public"."amara_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."amara_conversations"
  WHERE (("amara_conversations"."id" = "amara_messages"."conversation_id") AND ("amara_conversations"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can view their own SMS logs" ON "public"."sms_logs" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own blocks" ON "public"."user_blocks" FOR SELECT TO "authenticated" USING ((("blocker_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("blocked_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users can view their own booking addons" ON "public"."booking_addons" FOR SELECT USING (("booking_id" IN ( SELECT "bookings"."id"
   FROM "public"."bookings"
  WHERE ("bookings"."customer_id" = "auth"."uid"()))));



COMMENT ON POLICY "Users can view their own booking addons" ON "public"."booking_addons" IS 'Allows customers to view addons for bookings they created';



CREATE POLICY "Users can view their own bookings" ON "public"."bookings" FOR SELECT USING (("customer_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own briefs" ON "public"."briefs" FOR SELECT TO "authenticated" USING (("email" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Users can view their own conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = ANY ("participant_ids")));



COMMENT ON POLICY "Users can view their own conversations" ON "public"."conversations" IS 'Users view conversations they participate in - already optimal, no consolidation needed';



CREATE POLICY "Users can view their own referral codes" ON "public"."referral_codes" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own suspensions" ON "public"."user_suspensions" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users insert their Amara tool runs" ON "public"."amara_tool_runs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users view their Amara tool runs" ON "public"."amara_tool_runs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_professional_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."amara_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."amara_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."amara_tool_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."background_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."balance_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."balance_clearance_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_addons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_disputes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bookings_select_consolidated" ON "public"."bookings" FOR SELECT TO "authenticated" USING ((("customer_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("professional_id" = ( SELECT "auth"."uid"() AS "uid"))));



COMMENT ON POLICY "bookings_select_consolidated" ON "public"."bookings" IS 'Consolidated SELECT policy: customers view own bookings, professionals view assigned bookings';



ALTER TABLE "public"."briefs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."changelog_views" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "changelog_views_select_consolidated" ON "public"."changelog_views" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "changelog_views_select_consolidated" ON "public"."changelog_views" IS 'Consolidated SELECT: Users view own changelog views, admins view all';



ALTER TABLE "public"."changelogs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "changelogs_select_consolidated" ON "public"."changelogs" FOR SELECT USING ((("visibility" = 'published'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "changelogs_select_consolidated" ON "public"."changelogs" IS 'Consolidated SELECT: Public views published changelogs, admins view all (including drafts)';



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cron_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_profiles_insert_consolidated" ON "public"."customer_profiles" FOR INSERT TO "authenticated" WITH CHECK ((("profile_id" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'customer'::"text"))))));



COMMENT ON POLICY "customer_profiles_insert_consolidated" ON "public"."customer_profiles" IS 'Consolidated INSERT policy: Customers can create their own profile only';



CREATE POLICY "customer_profiles_select_consolidated" ON "public"."customer_profiles" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "profile_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "customer_profiles_select_consolidated" ON "public"."customer_profiles" IS 'Consolidated SELECT policy for customer_profiles table. Customers can view their own profile, admins can view all.';



CREATE POLICY "customer_profiles_update_consolidated" ON "public"."customer_profiles" FOR UPDATE TO "authenticated" USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



COMMENT ON POLICY "customer_profiles_update_consolidated" ON "public"."customer_profiles" IS 'Consolidated UPDATE policy: Customers can update their own profile only';



ALTER TABLE "public"."customer_reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_reviews_select_consolidated" ON "public"."customer_reviews" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (( SELECT "auth"."uid"() AS "uid") = "professional_id")));



COMMENT ON POLICY "customer_reviews_select_consolidated" ON "public"."customer_reviews" IS 'Consolidated SELECT policy: customers view reviews about them, professionals view reviews they wrote';



ALTER TABLE "public"."disputes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_submissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "feedback_submissions_select_consolidated" ON "public"."feedback_submissions" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "feedback_submissions_select_consolidated" ON "public"."feedback_submissions" IS 'Consolidated SELECT: Users view own feedback, admins view all';



ALTER TABLE "public"."guest_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_article_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_article_relations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_article_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_article_tags_relation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_search_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mobile_push_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payout_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payout_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payout_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payouts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_controls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_performance_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "professional_profiles_insert_consolidated" ON "public"."professional_profiles" FOR INSERT TO "authenticated" WITH CHECK ((("profile_id" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'professional'::"text"))))));



COMMENT ON POLICY "professional_profiles_insert_consolidated" ON "public"."professional_profiles" IS 'Consolidated INSERT policy: Professionals can create their own profile only';



CREATE POLICY "professional_profiles_select_consolidated" ON "public"."professional_profiles" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "profile_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "professional_profiles_select_consolidated" ON "public"."professional_profiles" IS 'Consolidated SELECT policy for professional_profiles table. Professionals can view their own profile, admins can view all.';



CREATE POLICY "professional_profiles_update_consolidated" ON "public"."professional_profiles" FOR UPDATE TO "authenticated" USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));



COMMENT ON POLICY "professional_profiles_update_consolidated" ON "public"."professional_profiles" IS 'Consolidated UPDATE policy: Professionals can update their own profile only';



ALTER TABLE "public"."professional_revenue_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_travel_buffers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_working_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_policy" ON "public"."profiles" FOR DELETE TO "authenticated" USING ("private"."user_has_role"('admin'::"text"));



COMMENT ON POLICY "profiles_delete_policy" ON "public"."profiles" IS 'Only admins can delete profiles';



CREATE POLICY "profiles_insert_policy" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_select_policy" ON "public"."profiles" FOR SELECT USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "profiles_update_policy" ON "public"."profiles" FOR UPDATE USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."rebook_nudge_experiments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_plan_holidays" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recurring_plans_select_consolidated" ON "public"."recurring_plans" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (( SELECT "auth"."uid"() AS "uid") = "professional_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "recurring_plans_select_consolidated" ON "public"."recurring_plans" IS 'Consolidated SELECT: Customers view own plans, professionals view assigned plans, admins view all';



ALTER TABLE "public"."referral_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roadmap_comments_delete_consolidated" ON "public"."roadmap_comments" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "roadmap_comments_delete_consolidated" ON "public"."roadmap_comments" IS 'Consolidated DELETE: Users delete own comments, admins delete any comment';



CREATE POLICY "roadmap_comments_select_consolidated" ON "public"."roadmap_comments" FOR SELECT USING ((("is_approved" = true) OR (( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "roadmap_comments_select_consolidated" ON "public"."roadmap_comments" IS 'Consolidated SELECT: Public views approved comments, users view own comments, admins view all';



CREATE POLICY "roadmap_comments_update_consolidated" ON "public"."roadmap_comments" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "roadmap_comments_update_consolidated" ON "public"."roadmap_comments" IS 'Consolidated UPDATE: Users update own comments, admins update any comment';



ALTER TABLE "public"."roadmap_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roadmap_items_select_consolidated" ON "public"."roadmap_items" FOR SELECT USING ((("visibility" = 'published'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"text"))))));



COMMENT ON POLICY "roadmap_items_select_consolidated" ON "public"."roadmap_items" IS 'Consolidated SELECT: Public views published roadmap items, admins view all (including drafts)';



ALTER TABLE "public"."roadmap_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_addons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_bundles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_pricing_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sms_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trial_credits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trial_credits_insert_service" ON "public"."trial_credits" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "trial_credits_select_own" ON "public"."trial_credits" FOR SELECT USING (("customer_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "trial_credits_update_service" ON "public"."trial_credits" FOR UPDATE TO "service_role" USING (true);



ALTER TABLE "public"."user_blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_suspensions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_to_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."are_users_blocked"("user1_id" "uuid", "user2_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_booking_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_booking_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_booking_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_slug_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_slug_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_slug_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_initialize_performance_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_initialize_performance_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_initialize_performance_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_referral_credits"("p_referral_id" "uuid", "p_booking_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_bundle_final_price"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_bundle_final_price"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_bundle_final_price"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_deposit_amount"("booking_total" integer, "deposit_percentage" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_next_booking_date"("start_date" "date", "frequency_type" "text", "day_of_week" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_next_booking_date"("start_date" "date", "frequency_type" "text", "day_of_week" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_next_booking_date"("start_date" "date", "frequency_type" "text", "day_of_week" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_professional_metrics"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_professional_metrics"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_professional_metrics"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_refund_amount"("booking_id" "uuid", "cancellation_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_service_price"("service_id_param" "uuid", "tier_id_param" "uuid", "addon_ids_param" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_service_price"("service_id_param" "uuid", "tier_id_param" "uuid", "addon_ids_param" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_service_price"("service_id_param" "uuid", "tier_id_param" "uuid", "addon_ids_param" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_booking_availability"("professional_profile_id" "uuid", "booking_date" "date", "start_time" time without time zone, "end_time" time without time zone, "exclude_booking_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_booking_availability"("professional_profile_id" "uuid", "booking_date" "date", "start_time" time without time zone, "end_time" time without time zone, "exclude_booking_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_booking_availability"("professional_profile_id" "uuid", "booking_date" "date", "start_time" time without time zone, "end_time" time without time zone, "exclude_booking_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_instant_payout_rate_limit"("p_professional_id" "uuid", "p_max_daily_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_service_ownership"("p_service_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_service_ownership"("p_service_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_service_ownership"("p_service_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_guest_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_platform_events"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_platform_events"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_platform_events"() TO "service_role";



GRANT ALL ON FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_pending_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_guest_to_user"("p_guest_session_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."diagnose_help_center"() TO "anon";
GRANT ALL ON FUNCTION "public"."diagnose_help_center"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."diagnose_help_center"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_booking_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_booking_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_booking_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_daily_revenue_snapshot"("professional_profile_id" "uuid", "snapshot_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_daily_revenue_snapshot"("professional_profile_id" "uuid", "snapshot_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_daily_revenue_snapshot"("professional_profile_id" "uuid", "snapshot_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_professional_slug"("p_full_name" "text", "p_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_suspension"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_suspension"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_suspension"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_articles_by_tag"("tag_slug_filter" "text", "locale_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversion_funnel"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_booking_summary"("customer_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_booking_summary"("customer_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_booking_summary"("customer_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_counts_by_type"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_feedback_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_feedback_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_feedback_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_message_participants"("msg_conversation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_message_participants"("msg_conversation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_message_participants"("msg_conversation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moderation_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_moderation_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moderation_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_no_result_searches"("days_back" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_no_result_searches"("days_back" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_no_result_searches"("days_back" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_onboarding_progress"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_onboarding_progress"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_onboarding_progress"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_performance_summary"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_performance_summary"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_performance_summary"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_popular_tags"("limit_count" integer, "locale_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_popular_tags"("limit_count" integer, "locale_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_popular_tags"("limit_count" integer, "locale_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pricing_rule"("p_service_category" "text", "p_city" "text", "p_effective_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pricing_rule"("p_service_category" "text", "p_city" "text", "p_effective_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pricing_rule"("p_service_category" "text", "p_city" "text", "p_effective_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_professional_booking_summary"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_professional_booking_summary"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_professional_booking_summary"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_professional_profile"("p_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_professional_services_summary"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_professional_services_summary"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_professional_services_summary"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_revenue_trend"("professional_profile_id" "uuid", "days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_revenue_trend"("professional_profile_id" "uuid", "days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_revenue_trend"("professional_profile_id" "uuid", "days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_professionals_by_completion_rate"("limit_count" integer, "min_bookings" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_professionals_by_completion_rate"("limit_count" integer, "min_bookings" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_professionals_by_completion_rate"("limit_count" integer, "min_bookings" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_searches"("days_back" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_searches"("days_back" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_searches"("days_back" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trial_credit_info"("p_customer_id" "uuid", "p_professional_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_changelog_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_changelog_count"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_changelog_count"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_referral_credits"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roadmap_vote_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roadmap_vote_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roadmap_vote_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_message_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_message_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_message_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_voted"("item_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_voted"("item_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_voted"("item_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_article_view_count"("article_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_article_view_count"("article_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_article_view_count"("article_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_professional_stats"("p_professional_id" "uuid", "p_earnings_cop" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_performance_metrics"("professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_performance_metrics"("professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_performance_metrics"("professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_authorization_expired"("auth_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_within_service_radius"("professional_profile_id" "uuid", "customer_location" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."is_within_service_radius"("professional_profile_id" "uuid", "customer_location" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_within_service_radius"("professional_profile_id" "uuid", "customer_location" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."list_active_professionals"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_active_professionals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_active_professionals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_balance_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_balance_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_balance_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_onboarding_item_completed"("professional_profile_id" "uuid", "item_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_onboarding_item_completed"("professional_profile_id" "uuid", "item_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_onboarding_item_completed"("professional_profile_id" "uuid", "item_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."professional_search_vector"("full_name" "text", "bio" "text", "primary_services" "text"[], "city" "text", "country" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."professional_search_vector"("full_name" "text", "bio" "text", "primary_services" "text"[], "city" "text", "country" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."professional_search_vector"("full_name" "text", "bio" "text", "primary_services" "text"[], "city" "text", "country" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_required_consents"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_required_consents"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_required_consents"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_availability_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_availability_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_availability_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."refund_available_balance"("p_professional_id" "uuid", "p_amount_cop" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_help_articles"("search_query" "text", "locale" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_professionals"("search_query" "text", "result_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_admin_by_email"("user_email" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_admin_by_email"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_admin_by_email"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_by_email"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_admin_professional_reviews_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_admin_professional_reviews_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_professional_reviews_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_authorization_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_authorization_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_authorization_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_booking_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_booking_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_booking_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_booking_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_booking_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_booking_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_changelog_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_changelog_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_changelog_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_claim_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_claim_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_claim_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_completed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_completed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_completed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_conversations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_conversations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_conversations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_customer_review_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_customer_review_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_customer_review_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_disputes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_disputes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_disputes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_feedback_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_feedback_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_feedback_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_message_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_message_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_message_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_mobile_push_tokens_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_mobile_push_tokens_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_mobile_push_tokens_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_payouts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_payouts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_payouts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_service_addons_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_service_addons_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_service_addons_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_suspensions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_suspensions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_suspensions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_booking_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_booking_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_booking_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_rebook_conversion"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_rebook_conversion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_rebook_conversion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_auto_decline_cron"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_auto_decline_cron"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_auto_decline_cron"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_article_feedback_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_article_feedback_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_article_feedback_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_briefs_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_briefs_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_briefs_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_last_message_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_etta_conversations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_etta_conversations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_etta_conversations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notification_subscriptions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notification_subscriptions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notification_subscriptions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_onboarding_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_onboarding_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_onboarding_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payout_batches_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_payout_batches_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payout_batches_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payout_transfers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_payout_transfers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payout_transfers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pricing_faqs_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pricing_faqs_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pricing_faqs_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pricing_plans_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pricing_plans_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pricing_plans_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pricing_rule"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pricing_rule"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pricing_rule"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_professional_search_on_profile_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_professional_search_on_profile_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_professional_search_on_profile_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_professional_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_professional_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_professional_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_recurring_plan_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_recurring_plan_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_recurring_plan_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_referral_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_referral_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_referral_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roadmap_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roadmap_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roadmap_comment_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roadmap_comments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roadmap_comments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roadmap_comments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roadmap_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roadmap_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roadmap_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roadmap_vote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roadmap_vote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roadmap_vote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_trial_credit_on_booking_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_trial_credit_on_booking_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_trial_credit_on_booking_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_consent"("p_user_id" "uuid", "p_consent_type" "text", "p_accepted" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_consent"("p_user_id" "uuid", "p_consent_type" "text", "p_accepted" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_consent"("p_user_id" "uuid", "p_consent_type" "text", "p_accepted" boolean) TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_professional_reviews" TO "anon";
GRANT ALL ON TABLE "public"."admin_professional_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_professional_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."amara_conversations" TO "anon";
GRANT ALL ON TABLE "public"."amara_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."amara_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."amara_messages" TO "anon";
GRANT ALL ON TABLE "public"."amara_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."amara_messages" TO "service_role";



GRANT ALL ON TABLE "public"."amara_tool_runs" TO "anon";
GRANT ALL ON TABLE "public"."amara_tool_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."amara_tool_runs" TO "service_role";



GRANT ALL ON TABLE "public"."background_checks" TO "anon";
GRANT ALL ON TABLE "public"."background_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."background_checks" TO "service_role";



GRANT ALL ON TABLE "public"."balance_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."balance_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."balance_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."balance_clearance_queue" TO "anon";
GRANT ALL ON TABLE "public"."balance_clearance_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."balance_clearance_queue" TO "service_role";



GRANT ALL ON TABLE "public"."booking_addons" TO "anon";
GRANT ALL ON TABLE "public"."booking_addons" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_addons" TO "service_role";



GRANT ALL ON TABLE "public"."booking_disputes" TO "anon";
GRANT ALL ON TABLE "public"."booking_disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_disputes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."booking_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."booking_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."booking_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."booking_source_analytics" TO "anon";
GRANT ALL ON TABLE "public"."booking_source_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_source_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."booking_status_history" TO "anon";
GRANT ALL ON TABLE "public"."booking_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."briefs" TO "anon";
GRANT ALL ON TABLE "public"."briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."briefs" TO "service_role";



GRANT ALL ON TABLE "public"."changelog_views" TO "anon";
GRANT ALL ON TABLE "public"."changelog_views" TO "authenticated";
GRANT ALL ON TABLE "public"."changelog_views" TO "service_role";



GRANT ALL ON TABLE "public"."changelogs" TO "anon";
GRANT ALL ON TABLE "public"."changelogs" TO "authenticated";
GRANT ALL ON TABLE "public"."changelogs" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."cron_config" TO "anon";
GRANT ALL ON TABLE "public"."cron_config" TO "authenticated";
GRANT ALL ON TABLE "public"."cron_config" TO "service_role";



GRANT ALL ON TABLE "public"."customer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."customer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."customer_reviews" TO "anon";
GRANT ALL ON TABLE "public"."customer_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."disputes" TO "anon";
GRANT ALL ON TABLE "public"."disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."disputes" TO "service_role";



GRANT ALL ON TABLE "public"."feedback_submissions" TO "anon";
GRANT ALL ON TABLE "public"."feedback_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."guest_sessions" TO "anon";
GRANT ALL ON TABLE "public"."guest_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."help_article_feedback" TO "anon";
GRANT ALL ON TABLE "public"."help_article_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."help_article_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."help_article_relations" TO "anon";
GRANT ALL ON TABLE "public"."help_article_relations" TO "authenticated";
GRANT ALL ON TABLE "public"."help_article_relations" TO "service_role";



GRANT ALL ON TABLE "public"."help_article_tags" TO "anon";
GRANT ALL ON TABLE "public"."help_article_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."help_article_tags" TO "service_role";



GRANT ALL ON TABLE "public"."help_article_tags_relation" TO "anon";
GRANT ALL ON TABLE "public"."help_article_tags_relation" TO "authenticated";
GRANT ALL ON TABLE "public"."help_article_tags_relation" TO "service_role";



GRANT ALL ON TABLE "public"."help_articles" TO "anon";
GRANT ALL ON TABLE "public"."help_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."help_articles" TO "service_role";



GRANT ALL ON TABLE "public"."help_categories" TO "anon";
GRANT ALL ON TABLE "public"."help_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."help_categories" TO "service_role";



GRANT ALL ON TABLE "public"."help_search_analytics" TO "anon";
GRANT ALL ON TABLE "public"."help_search_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."help_search_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_claims" TO "anon";
GRANT ALL ON TABLE "public"."insurance_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_claims" TO "service_role";



GRANT ALL ON TABLE "public"."interview_slots" TO "anon";
GRANT ALL ON TABLE "public"."interview_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_slots" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."mobile_push_tokens" TO "anon";
GRANT ALL ON TABLE "public"."mobile_push_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."mobile_push_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_flags" TO "anon";
GRANT ALL ON TABLE "public"."moderation_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_flags" TO "service_role";



GRANT ALL ON TABLE "public"."notification_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."notification_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payout_batches" TO "anon";
GRANT ALL ON TABLE "public"."payout_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_batches" TO "service_role";



GRANT ALL ON TABLE "public"."payout_rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."payout_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."payout_transfers" TO "anon";
GRANT ALL ON TABLE "public"."payout_transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_transfers" TO "service_role";



GRANT ALL ON TABLE "public"."payouts" TO "anon";
GRANT ALL ON TABLE "public"."payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."payouts" TO "service_role";



GRANT ALL ON TABLE "public"."platform_events" TO "anon";
GRANT ALL ON TABLE "public"."platform_events" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_events" TO "service_role";



GRANT ALL ON TABLE "public"."platform_settings" TO "anon";
GRANT ALL ON TABLE "public"."platform_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_settings" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_controls" TO "anon";
GRANT ALL ON TABLE "public"."pricing_controls" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_controls" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_plans" TO "anon";
GRANT ALL ON TABLE "public"."pricing_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_plans" TO "service_role";



GRANT ALL ON TABLE "public"."professional_documents" TO "anon";
GRANT ALL ON TABLE "public"."professional_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_documents" TO "service_role";



GRANT ALL ON TABLE "public"."professional_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."professional_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."professional_profiles" TO "anon";
GRANT ALL ON TABLE "public"."professional_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_profiles" TO "service_role";



GRANT UPDATE("portfolio_images") ON TABLE "public"."professional_profiles" TO "authenticated";



GRANT UPDATE("featured_work") ON TABLE "public"."professional_profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."professional_revenue_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."professional_revenue_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_revenue_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."professional_reviews" TO "anon";
GRANT ALL ON TABLE "public"."professional_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."professional_services" TO "anon";
GRANT ALL ON TABLE "public"."professional_services" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_services" TO "service_role";



GRANT ALL ON TABLE "public"."professional_travel_buffers" TO "anon";
GRANT ALL ON TABLE "public"."professional_travel_buffers" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_travel_buffers" TO "service_role";



GRANT ALL ON TABLE "public"."professional_working_hours" TO "anon";
GRANT ALL ON TABLE "public"."professional_working_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_working_hours" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rebook_nudge_experiments" TO "anon";
GRANT ALL ON TABLE "public"."rebook_nudge_experiments" TO "authenticated";
GRANT ALL ON TABLE "public"."rebook_nudge_experiments" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_plan_holidays" TO "anon";
GRANT ALL ON TABLE "public"."recurring_plan_holidays" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_plan_holidays" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_plans" TO "anon";
GRANT ALL ON TABLE "public"."recurring_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_plans" TO "service_role";



GRANT ALL ON TABLE "public"."referral_codes" TO "anon";
GRANT ALL ON TABLE "public"."referral_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_codes" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_comments" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_comments" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_items" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_items" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_items" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_votes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "service_role";



GRANT ALL ON TABLE "public"."service_addons" TO "anon";
GRANT ALL ON TABLE "public"."service_addons" TO "authenticated";
GRANT ALL ON TABLE "public"."service_addons" TO "service_role";



GRANT ALL ON TABLE "public"."service_bundles" TO "anon";
GRANT ALL ON TABLE "public"."service_bundles" TO "authenticated";
GRANT ALL ON TABLE "public"."service_bundles" TO "service_role";



GRANT ALL ON TABLE "public"."service_categories" TO "anon";
GRANT ALL ON TABLE "public"."service_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."service_categories" TO "service_role";



GRANT ALL ON TABLE "public"."service_pricing_tiers" TO "anon";
GRANT ALL ON TABLE "public"."service_pricing_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."service_pricing_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."sms_logs" TO "anon";
GRANT ALL ON TABLE "public"."sms_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sms_logs" TO "service_role";



GRANT ALL ON TABLE "public"."trial_credits" TO "anon";
GRANT ALL ON TABLE "public"."trial_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."trial_credits" TO "service_role";



GRANT ALL ON TABLE "public"."user_blocks" TO "anon";
GRANT ALL ON TABLE "public"."user_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."user_suspensions" TO "anon";
GRANT ALL ON TABLE "public"."user_suspensions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_suspensions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







