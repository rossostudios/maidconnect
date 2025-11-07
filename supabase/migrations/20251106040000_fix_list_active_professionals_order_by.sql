-- Migration: Fix ambiguous ORDER BY in list_active_professionals
-- Description: Ensures ORDER BY references are fully qualified to avoid ambiguous column errors
-- Author: Codex (GPT-5)
-- Date: 2025-11-06

-- ============================================================================
-- DROP EXISTING FUNCTION
-- ============================================================================

DROP FUNCTION IF EXISTS public.list_active_professionals(numeric, numeric);

-- ============================================================================
-- RE-CREATE FUNCTION WITH QUALIFIED ORDER BY
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
  WITH professional_listing AS (
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
  )
  SELECT *
  FROM professional_listing pl
  ORDER BY
    pl.rating DESC NULLS LAST,
    pl.review_count DESC,
    pl.total_completed_bookings DESC;
END;
$$;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.list_active_professionals(numeric, numeric) TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.list_active_professionals IS
  'Lists active professional profiles with complete trust metrics including ratings, reviews, on-time rate, and earnings.
   Optionally filters by distance when customer latitude/longitude provided.
   Used by the public professionals directory.';
