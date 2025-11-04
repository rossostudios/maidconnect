-- Add onboarding checklist columns to professional profiles
-- Tracks completion % and blocks booking acceptance until 100% complete

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('id', 'profile_photo', 'label', 'Upload profile photo', 'required', true, 'completed', false),
    jsonb_build_object('id', 'services', 'label', 'Add at least one service', 'required', true, 'completed', false),
    jsonb_build_object('id', 'availability', 'label', 'Set your working hours', 'required', true, 'completed', false),
    jsonb_build_object('id', 'service_radius', 'label', 'Define service area', 'required', true, 'completed', false),
    jsonb_build_object('id', 'bio', 'label', 'Write a bio (min 100 chars)', 'required', true, 'completed', false),
    jsonb_build_object('id', 'background_check', 'label', 'Complete background check', 'required', true, 'completed', false),
    jsonb_build_object('id', 'portfolio', 'label', 'Add portfolio photos', 'required', false, 'completed', false),
    jsonb_build_object('id', 'certifications', 'label', 'Upload certifications', 'required', false, 'completed', false)
  ),
  'lastUpdated', NOW()
),
ADD COLUMN IF NOT EXISTS onboarding_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_accept_bookings BOOLEAN DEFAULT false;

-- Create index for querying checklist items
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_checklist
ON profiles USING GIN (onboarding_checklist);

-- Create index for filtering by completion status
CREATE INDEX IF NOT EXISTS idx_profiles_can_accept_bookings
ON profiles (can_accept_bookings)
WHERE user_type = 'professional';

COMMENT ON COLUMN profiles.onboarding_checklist IS 'JSONB array of onboarding tasks with completion status';
COMMENT ON COLUMN profiles.onboarding_completion_percentage IS 'Auto-calculated percentage (0-100) of required tasks completed';
COMMENT ON COLUMN profiles.can_accept_bookings IS 'Auto-set to true when onboarding_completion_percentage = 100';
