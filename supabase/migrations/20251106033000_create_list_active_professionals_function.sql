-- Migration: Create list_active_professionals RPC function
-- Description: Public function to list active professional profiles with trust metrics
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- DROP EXISTING FUNCTIONS (if any)
-- ============================================================================

DROP FUNCTION IF EXISTS public.list_active_professionals(numeric, numeric);
DROP FUNCTION IF EXISTS public.list_active_professionals();

-- ============================================================================
-- CREATE RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.list_active_professionals(
  p_customer_lat numeric DEFAULT NULL,
  p_customer_lon numeric DEFAULT NULL
)
RETURNS TABLE (
  profile_id uuid,
  full_name text,
  bio text,
  experience_years integer,
  languages text[],
  services jsonb,
  primary_services text[],
  city text,
  country text,
  availability jsonb,
  professional_status text,
  verification_level text,
  rating numeric,
  review_count bigint,
  on_time_rate numeric,
  total_completed_bookings bigint,
  total_earnings numeric,
  favorites_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    COALESCE(pp.languages, ARRAY[]::text[]) AS languages,
    COALESCE(pp.services, '[]'::jsonb) AS services,
    COALESCE(pp.primary_services, ARRAY[]::text[]) AS primary_services,
    pp.city,
    pp.country,
    COALESCE(pp.availability, '{}'::jsonb) AS availability,
    p.onboarding_status AS professional_status,
    COALESCE(pp.verification_level, 'none') AS verification_level,

    -- Rating calculation (average of all reviews)
    COALESCE(
      (SELECT AVG(rating)::numeric(3,2)
       FROM public.reviews
       WHERE professional_id = pp.profile_id),
      0
    ) AS rating,

    -- Review count
    COALESCE(
      (SELECT COUNT(*)
       FROM public.reviews
       WHERE professional_id = pp.profile_id),
      0
    ) AS review_count,

    -- On-time rate calculation (percentage of bookings checked in within 15 minutes)
    ROUND(COALESCE(
      (SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (
            WHERE checked_in_at <= scheduled_start + INTERVAL '15 minutes'
          )::numeric / COUNT(*)::numeric) * 100
        END
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'
         AND checked_in_at IS NOT NULL
         AND scheduled_start IS NOT NULL
      ),
      0
    ), 0) AS on_time_rate,

    -- Total completed bookings
    COALESCE(
      (SELECT COUNT(*)
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'),
      0
    ) AS total_completed_bookings,

    -- Total earnings (sum of completed booking amounts)
    COALESCE(
      (SELECT SUM(total_amount)::numeric / 100.0
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'
         AND total_amount IS NOT NULL),
      0
    ) AS total_earnings,

    -- Favorites count (placeholder - will be implemented with favorites feature)
    0::bigint AS favorites_count

  FROM public.professional_profiles pp
  INNER JOIN public.profiles p ON pp.profile_id = p.id
  WHERE p.account_status = 'active'
    AND p.onboarding_status = 'active'
    AND p.role = 'professional'
  ORDER BY 13 DESC NULLS LAST, 14 DESC, 16 DESC;  -- Order by: rating, review_count, total_completed_bookings
END;
$$;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permission to both anonymous and authenticated users
-- (public directory should be accessible to everyone)
GRANT EXECUTE ON FUNCTION public.list_active_professionals(numeric, numeric) TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.list_active_professionals IS
  'Lists active professional profiles with complete trust metrics including ratings, reviews, on-time rate, and earnings.
   Optionally filters by distance when customer latitude/longitude provided.
   Used by the public professionals directory.';

-- ============================================================================
-- CREATE GET SINGLE PROFESSIONAL FUNCTION
-- ============================================================================

-- Drop existing function first (it may have different return type)
DROP FUNCTION IF EXISTS public.get_professional_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_professional_profile(
  p_profile_id uuid
)
RETURNS TABLE (
  profile_id uuid,
  full_name text,
  bio text,
  experience_years integer,
  languages text[],
  services jsonb,
  primary_services text[],
  availability jsonb,
  references_data jsonb,
  portfolio_images jsonb,
  city text,
  country text,
  onboarding_status text,
  professional_status text,
  verification_level text,
  rating numeric,
  review_count bigint,
  on_time_rate numeric,
  total_completed_bookings bigint,
  total_earnings numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    COALESCE(pp.languages, ARRAY[]::text[]) AS languages,
    COALESCE(pp.services, '[]'::jsonb) AS services,
    COALESCE(pp.primary_services, ARRAY[]::text[]) AS primary_services,
    COALESCE(pp.availability, '{}'::jsonb) AS availability,
    COALESCE(pp.references_data, '[]'::jsonb) AS references_data,
    COALESCE(pp.portfolio_images, '[]'::jsonb) AS portfolio_images,
    pp.city,
    pp.country,
    p.onboarding_status,
    p.onboarding_status AS professional_status,
    COALESCE(pp.verification_level, 'none') AS verification_level,

    -- Rating calculation
    COALESCE(
      (SELECT AVG(rating)::numeric(3,2)
       FROM public.reviews
       WHERE professional_id = pp.profile_id),
      0
    ) AS rating,

    -- Review count
    COALESCE(
      (SELECT COUNT(*)
       FROM public.reviews
       WHERE professional_id = pp.profile_id),
      0
    ) AS review_count,

    -- On-time rate calculation
    ROUND(COALESCE(
      (SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (
            WHERE checked_in_at <= scheduled_start + INTERVAL '15 minutes'
          )::numeric / COUNT(*)::numeric) * 100
        END
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'
         AND checked_in_at IS NOT NULL
         AND scheduled_start IS NOT NULL
      ),
      0
    ), 0) AS on_time_rate,

    -- Total completed bookings
    COALESCE(
      (SELECT COUNT(*)
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'),
      0
    ) AS total_completed_bookings,

    -- Total earnings
    COALESCE(
      (SELECT SUM(total_amount)::numeric / 100.0
       FROM public.bookings
       WHERE professional_id = pp.profile_id
         AND status = 'completed'
         AND total_amount IS NOT NULL),
      0
    ) AS total_earnings

  FROM public.professional_profiles pp
  INNER JOIN public.profiles p ON pp.profile_id = p.id
  WHERE pp.profile_id = p_profile_id
    AND p.account_status = 'active'
    AND p.role = 'professional';
END;
$$;

-- Grant execute permission for get_professional_profile
GRANT EXECUTE ON FUNCTION public.get_professional_profile(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.get_professional_profile IS
  'Gets a single professional profile by ID with complete trust metrics.
   Used by the individual professional profile page.';
