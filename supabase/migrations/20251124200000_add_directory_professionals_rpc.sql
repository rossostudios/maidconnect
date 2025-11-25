-- ============================================================================
-- Directory Professionals RPC Function
-- ============================================================================
-- Fixes N+1 query pattern by joining professional_profiles with metrics
-- and sorting/filtering at the database level for proper pagination.
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_directory_professionals;

-- Create the optimized directory query function
CREATE OR REPLACE FUNCTION public.get_directory_professionals(
  p_country_code TEXT DEFAULT NULL,
  p_city_id TEXT DEFAULT NULL,
  p_service TEXT DEFAULT NULL,
  p_min_experience INT DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'rating',
  p_page INT DEFAULT 1,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  city TEXT,
  country_code TEXT,
  city_id UUID,
  primary_services TEXT[],
  rate_expectations JSONB,
  experience_years INT,
  languages TEXT[],
  verification_level TEXT,
  background_check_status TEXT,
  interview_completed BOOLEAN,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  status TEXT,
  city_name TEXT,
  country_name_en TEXT,
  country_name_es TEXT,
  currency_code TEXT,
  average_rating NUMERIC,
  total_reviews INT,
  total_bookings INT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_offset INT;
  v_total BIGINT;
  v_city_id UUID;
BEGIN
  -- Calculate offset
  v_offset := (GREATEST(p_page, 1) - 1) * p_limit;

  -- Cast city_id to UUID if provided (p_city_id is TEXT for API compatibility)
  IF p_city_id IS NOT NULL AND p_city_id != '' THEN
    v_city_id := p_city_id::UUID;
  ELSE
    v_city_id := NULL;
  END IF;

  -- Get total count first (for pagination metadata)
  SELECT COUNT(*)
  INTO v_total
  FROM professional_profiles pp
  LEFT JOIN professional_performance_metrics ppm ON pp.profile_id = ppm.profile_id
  WHERE pp.status = 'active'
    AND pp.background_check_status = 'approved'
    AND (p_country_code IS NULL OR pp.country_code = UPPER(p_country_code))
    AND (v_city_id IS NULL OR pp.city_id = v_city_id)
    AND (p_service IS NULL OR p_service = ANY(pp.primary_services))
    AND (p_min_experience IS NULL OR pp.experience_years >= p_min_experience)
    AND (p_min_rating IS NULL OR COALESCE(ppm.average_rating, 0) >= p_min_rating)
    AND (NOT p_verified_only OR pp.verification_level IN ('standard', 'premium', 'elite'))
    AND (p_search_query IS NULL OR (
      pp.full_name ILIKE '%' || p_search_query || '%' OR
      pp.bio ILIKE '%' || p_search_query || '%'
    ));

  -- Return the results with metrics joined
  RETURN QUERY
  SELECT
    pp.profile_id,
    pp.full_name,
    pp.avatar_url,
    pp.bio,
    pp.country,
    pp.city,
    pp.country_code,
    pp.city_id,
    pp.primary_services,
    pp.rate_expectations,
    pp.experience_years,
    pp.languages,
    pp.verification_level,
    pp.background_check_status,
    pp.interview_completed,
    pp.location_latitude,
    pp.location_longitude,
    pp.status,
    c.name AS city_name,
    co.name_en AS country_name_en,
    co.name_es AS country_name_es,
    co.currency_code,
    ppm.average_rating,
    COALESCE(ppm.total_reviews, 0)::INT AS total_reviews,
    COALESCE(ppm.total_bookings, 0)::INT AS total_bookings,
    v_total AS total_count
  FROM professional_profiles pp
  LEFT JOIN professional_performance_metrics ppm ON pp.profile_id = ppm.profile_id
  LEFT JOIN cities c ON pp.city_id = c.id
  LEFT JOIN countries co ON pp.country_code = co.code
  WHERE pp.status = 'active'
    AND pp.background_check_status = 'approved'
    AND (p_country_code IS NULL OR pp.country_code = UPPER(p_country_code))
    AND (v_city_id IS NULL OR pp.city_id = v_city_id)
    AND (p_service IS NULL OR p_service = ANY(pp.primary_services))
    AND (p_min_experience IS NULL OR pp.experience_years >= p_min_experience)
    AND (p_min_rating IS NULL OR COALESCE(ppm.average_rating, 0) >= p_min_rating)
    AND (NOT p_verified_only OR pp.verification_level IN ('standard', 'premium', 'elite'))
    AND (p_search_query IS NULL OR (
      pp.full_name ILIKE '%' || p_search_query || '%' OR
      pp.bio ILIKE '%' || p_search_query || '%'
    ))
  ORDER BY
    CASE WHEN p_sort_by = 'rating' THEN COALESCE(ppm.average_rating, 0) END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'reviews' THEN COALESCE(ppm.total_reviews, 0) END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'experience' THEN pp.experience_years END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'price-asc' THEN (pp.rate_expectations->>'min')::NUMERIC END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price-desc' THEN (pp.rate_expectations->>'min')::NUMERIC END DESC NULLS LAST,
    pp.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_directory_professionals TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_directory_professionals TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_directory_professionals IS
'Optimized directory query that joins professionals with metrics for proper DB-level sorting and pagination. Eliminates N+1 pattern and JavaScript post-query sorting.';
