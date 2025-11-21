-- Migration: Add Payment Processor Fields for Multi-Country Support
--
-- This migration adds PayPal-related columns to professional_profiles and
-- a unified payment_processor field to support both Stripe (CO) and PayPal (PY/UY/AR).
--
-- Payment Processor Routing:
--   - Colombia (CO): Stripe Connect
--   - Paraguay (PY): PayPal Partner Referrals
--   - Uruguay (UY): PayPal Partner Referrals
--   - Argentina (AR): PayPal Partner Referrals

-- ============================================================================
-- 1. Add payment processor type and PayPal fields to professional_profiles
-- ============================================================================

-- Add payment_processor column (stripe or paypal)
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS payment_processor TEXT DEFAULT 'stripe'
CHECK (payment_processor IN ('stripe', 'paypal'));

COMMENT ON COLUMN professional_profiles.payment_processor IS
  'Payment processor used by this professional: stripe (CO) or paypal (PY/UY/AR)';

-- Add PayPal merchant credentials
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_merchant_id TEXT;

COMMENT ON COLUMN professional_profiles.paypal_merchant_id IS
  'PayPal Merchant ID from Partner Referrals API (for PY/UY/AR professionals)';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_email TEXT;

COMMENT ON COLUMN professional_profiles.paypal_email IS
  'PayPal account email address for payouts';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN professional_profiles.paypal_verified IS
  'Whether PayPal account has been verified and is ready for payouts';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_onboarding_status TEXT DEFAULT 'not_started'
CHECK (paypal_onboarding_status IN ('not_started', 'pending', 'completed', 'failed'));

COMMENT ON COLUMN professional_profiles.paypal_onboarding_status IS
  'PayPal Partner Referrals onboarding status';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_onboarding_link TEXT;

COMMENT ON COLUMN professional_profiles.paypal_onboarding_link IS
  'PayPal Partner Referrals onboarding action URL';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_last_refresh TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN professional_profiles.paypal_last_refresh IS
  'Last time PayPal merchant status was refreshed';

-- Add paypal_status for simple status tracking (used by routes)
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_status TEXT DEFAULT 'not_configured'
CHECK (paypal_status IN ('not_configured', 'active', 'disconnected'));

COMMENT ON COLUMN professional_profiles.paypal_status IS
  'Simple PayPal account status: not_configured, active, or disconnected';

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS paypal_last_updated TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN professional_profiles.paypal_last_updated IS
  'Last time PayPal configuration was updated';

-- ============================================================================
-- 2. Backfill existing Colombian professionals to use Stripe
-- ============================================================================

-- Set payment_processor based on country_code
UPDATE professional_profiles
SET payment_processor = CASE
  WHEN country_code = 'CO' THEN 'stripe'
  WHEN country_code IN ('PY', 'UY', 'AR') THEN 'paypal'
  ELSE 'stripe' -- Default to Stripe for any existing records without country
END
WHERE payment_processor IS NULL OR payment_processor = 'stripe';

-- ============================================================================
-- 3. Create index for payment processor queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_professional_profiles_payment_processor
ON professional_profiles(payment_processor);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_paypal_merchant_id
ON professional_profiles(paypal_merchant_id)
WHERE paypal_merchant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_professional_profiles_paypal_status
ON professional_profiles(paypal_status)
WHERE paypal_status IS NOT NULL;

-- ============================================================================
-- 4. Create helper function to get payment processor by country
-- ============================================================================

CREATE OR REPLACE FUNCTION get_payment_processor_by_country(p_country_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN CASE
    WHEN p_country_code = 'CO' THEN 'stripe'
    WHEN p_country_code IN ('PY', 'UY', 'AR') THEN 'paypal'
    ELSE 'stripe' -- Default to Stripe
  END;
END;
$$;

COMMENT ON FUNCTION get_payment_processor_by_country(TEXT) IS
  'Returns the payment processor (stripe/paypal) for a given country code';

-- ============================================================================
-- 5. Update get_professional_profile function to include payment processor info
-- ============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS get_professional_profile(UUID);

-- Recreate with payment processor fields
CREATE OR REPLACE FUNCTION get_professional_profile(p_profile_id UUID)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT,
  verification_level TEXT,
  city TEXT,
  country TEXT,
  country_code TEXT,
  services JSONB,
  primary_services TEXT[],
  experience_years INTEGER,
  languages TEXT[],
  featured_work TEXT,
  portfolio_images JSONB,
  availability JSONB,
  availability_settings JSONB,
  blocked_dates JSONB,
  instant_booking_enabled BOOLEAN,
  instant_booking_settings JSONB,
  total_earnings_cents BIGINT,
  pending_balance_cents BIGINT,
  available_balance_cents BIGINT,
  total_bookings_completed INTEGER,
  stripe_connect_account_id TEXT,
  stripe_connect_onboarding_status TEXT,
  payment_processor TEXT,
  paypal_merchant_id TEXT,
  paypal_email TEXT,
  paypal_verified BOOLEAN,
  paypal_onboarding_status TEXT,
  paypal_status TEXT,
  paypal_last_updated TIMESTAMP WITH TIME ZONE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  rating NUMERIC,
  review_count BIGINT,
  slug TEXT,
  intro_video_url TEXT,
  intro_video_thumbnail_url TEXT,
  intro_video_status TEXT,
  intro_video_duration_seconds INTEGER,
  intro_video_uploaded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.avatar_url,
    pp.bio,
    pp.status,
    pp.verification_level,
    pp.city,
    pp.country,
    pp.country_code,
    pp.services,
    pp.primary_services,
    pp.experience_years,
    pp.languages,
    pp.featured_work,
    pp.portfolio_images,
    pp.availability,
    pp.availability_settings,
    pp.blocked_dates,
    pp.instant_booking_enabled,
    pp.instant_booking_settings,
    pp.total_earnings_cents,
    pp.pending_balance_cents,
    pp.available_balance_cents,
    pp.total_bookings_completed,
    pp.stripe_connect_account_id,
    pp.stripe_connect_onboarding_status,
    pp.payment_processor,
    pp.paypal_merchant_id,
    pp.paypal_email,
    pp.paypal_verified,
    pp.paypal_onboarding_status,
    pp.paypal_status,
    pp.paypal_last_updated,
    pp.onboarding_completed_at,
    pp.created_at,
    pp.updated_at,
    COALESCE(rs.avg_rating, 0) AS rating,
    COALESCE(rs.review_count, 0) AS review_count,
    pp.slug,
    iv.video_url AS intro_video_url,
    iv.thumbnail_url AS intro_video_thumbnail_url,
    iv.status AS intro_video_status,
    iv.duration_seconds AS intro_video_duration_seconds,
    iv.uploaded_at AS intro_video_uploaded_at
  FROM professional_profiles pp
  LEFT JOIN LATERAL (
    SELECT
      AVG(r.rating)::NUMERIC AS avg_rating,
      COUNT(*)::BIGINT AS review_count
    FROM reviews r
    WHERE r.professional_id = pp.profile_id
  ) rs ON TRUE
  LEFT JOIN intro_videos iv ON iv.professional_id = pp.profile_id AND iv.is_active = TRUE
  WHERE pp.profile_id = p_profile_id;
END;
$$;

COMMENT ON FUNCTION get_professional_profile(UUID) IS
  'Get professional profile with payment processor info, rating stats, and intro video';

-- ============================================================================
-- 6. Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_payment_processor_by_country(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_processor_by_country(TEXT) TO service_role;

-- ============================================================================
-- Verification Queries (Run after migration)
-- ============================================================================
--
-- -- Check payment processor distribution
-- SELECT payment_processor, country_code, COUNT(*)
-- FROM professional_profiles
-- GROUP BY payment_processor, country_code;
--
-- -- Verify PayPal columns exist
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'professional_profiles'
--   AND column_name LIKE 'paypal%'
-- ORDER BY ordinal_position;
