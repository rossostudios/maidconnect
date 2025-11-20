-- Add intro video fields to get_professional_profile RPC function
-- This allows the professional detail page to display approved intro videos

DROP FUNCTION IF EXISTS get_professional_profile(UUID) CASCADE;

CREATE OR REPLACE FUNCTION get_professional_profile(p_profile_id UUID)
RETURNS TABLE(
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
  direct_hire_fee_cents INTEGER,
  background_check_passed BOOLEAN,
  documents_verified BOOLEAN,
  references_verified BOOLEAN,
  -- Intro video fields (Phase 2.3)
  intro_video_path TEXT,
  intro_video_status TEXT,
  intro_video_duration_seconds INTEGER
)
LANGUAGE SQL STABLE SECURITY DEFINER
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
    pp.direct_hire_fee_cents,
    -- Verification data from admin_professional_reviews (latest review)
    apr.background_check_passed,
    apr.documents_verified,
    apr.references_verified,
    -- Intro video fields (only show if approved)
    CASE
      WHEN pp.intro_video_status = 'approved' THEN pp.intro_video_path
      ELSE NULL
    END AS intro_video_path,
    CASE
      WHEN pp.intro_video_status = 'approved' THEN pp.intro_video_status
      ELSE 'none'
    END AS intro_video_status,
    CASE
      WHEN pp.intro_video_status = 'approved' THEN pp.intro_video_duration_seconds
      ELSE NULL
    END AS intro_video_duration_seconds
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_professional_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_professional_profile(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION get_professional_profile IS 'Retrieves a professional profile with verification data and approved intro video (Phase 2.3)';
