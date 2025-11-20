-- Migration: Add intro video fields to professional_profiles table
-- Purpose: Enable professionals to upload 60-second intro videos for customer trust
-- Phase: 1.2 - Intro Video Foundation (Database Schema)

-- Add intro video fields to professional_profiles
ALTER TABLE professional_profiles
  ADD COLUMN intro_video_path text,
  ADD COLUMN intro_video_status text DEFAULT 'none' CHECK (intro_video_status IN ('none', 'pending_review', 'approved', 'rejected')),
  ADD COLUMN intro_video_duration_seconds int CHECK (intro_video_duration_seconds BETWEEN 1 AND 60),
  ADD COLUMN intro_video_thumbnail_path text,
  ADD COLUMN intro_video_uploaded_at timestamptz,
  ADD COLUMN intro_video_reviewed_at timestamptz,
  ADD COLUMN intro_video_reviewed_by uuid REFERENCES profiles(id),
  ADD COLUMN intro_video_rejection_reason text;

-- Add indexes for admin review queue (filter by pending/rejected status)
CREATE INDEX idx_professional_profiles_intro_video_status
  ON professional_profiles(intro_video_status)
  WHERE intro_video_status IN ('pending_review', 'rejected');

-- Add index for finding professionals with approved videos
CREATE INDEX idx_professional_profiles_intro_video_approved
  ON professional_profiles(intro_video_status, country_code, city_id)
  WHERE intro_video_status = 'approved';

-- Add comments for documentation
COMMENT ON COLUMN professional_profiles.intro_video_path IS
  'Storage path to 60-second intro video in Supabase Storage intro-videos bucket. Format: {professional_id}/intro.mp4';

COMMENT ON COLUMN professional_profiles.intro_video_status IS
  'Review status: none (no video), pending_review (awaiting admin review), approved (live on profile), rejected (failed review)';

COMMENT ON COLUMN professional_profiles.intro_video_duration_seconds IS
  'Actual video duration in seconds. Must be between 1-60 seconds. Enforced client-side and server-side.';

COMMENT ON COLUMN professional_profiles.intro_video_thumbnail_path IS
  'Storage path to video thumbnail image (auto-generated from first frame). Format: {professional_id}/intro-thumbnail.jpg';

COMMENT ON COLUMN professional_profiles.intro_video_uploaded_at IS
  'Timestamp when video was uploaded by professional';

COMMENT ON COLUMN professional_profiles.intro_video_reviewed_at IS
  'Timestamp when video was reviewed by admin/concierge team';

COMMENT ON COLUMN professional_profiles.intro_video_reviewed_by IS
  'Profile ID of admin who reviewed the video (for audit trail)';

COMMENT ON COLUMN professional_profiles.intro_video_rejection_reason IS
  'Explanation provided to professional when video is rejected (e.g., "Background too noisy, please record indoors")';
