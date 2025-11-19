-- Migration: Add verification data to professional profile queries
-- Created: 2025-11-18
-- Description: Updates RPC functions to include verification data from admin_professional_reviews

-- Drop existing functions if they exist (CASCADE to remove any dependent objects)
-- Note: Omitting argument list to drop all overloads of these functions
DROP FUNCTION IF EXISTS get_professional_profile CASCADE;
DROP FUNCTION IF EXISTS list_active_professionals CASCADE;

-- Create get_professional_profile function with verification data
CREATE OR REPLACE FUNCTION get_professional_profile(p_profile_id UUID)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  bio TEXT,
  experience_years INTEGER,
  languages TEXT[],
  services JSONB,
  primary_services TEXT[],
  availability JSONB,
  references_data JSONB,
  portfolio_images JSONB,
  city TEXT,
  country TEXT,
  verification_level TEXT,
  interview_completed BOOLEAN,
  direct_hire_fee_cop INTEGER,
  -- Verification data from admin_professional_reviews
  background_check_passed BOOLEAN,
  documents_verified BOOLEAN,
  references_verified BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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

-- Create list_active_professionals function with verification data
CREATE OR REPLACE FUNCTION list_active_professionals()
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  bio TEXT,
  experience_years INTEGER,
  languages TEXT[],
  services JSONB,
  primary_services TEXT[],
  availability JSONB,
  references_data JSONB,
  portfolio_images JSONB,
  city TEXT,
  country TEXT,
  verification_level TEXT,
  interview_completed BOOLEAN,
  direct_hire_fee_cop INTEGER,
  -- Verification data from admin_professional_reviews
  background_check_passed BOOLEAN,
  documents_verified BOOLEAN,
  references_verified BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_professional_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_professional_profile(UUID) TO anon;
GRANT EXECUTE ON FUNCTION list_active_professionals() TO authenticated;
GRANT EXECUTE ON FUNCTION list_active_professionals() TO anon;

-- Add comments
COMMENT ON FUNCTION get_professional_profile IS 'Retrieves a professional profile with verification data from admin_professional_reviews (latest review)';
COMMENT ON FUNCTION list_active_professionals IS 'Lists all active professional profiles with verification data from admin_professional_reviews';
