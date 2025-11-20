-- Migration: Create intro-videos storage bucket with RLS policies
-- Purpose: Private bucket for professional intro videos with signed URL access
-- Phase: 1.2 - Intro Video Foundation (Storage Bucket)

-- Create intro-videos bucket (private - requires signed URLs for playback)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intro-videos',
  'intro-videos',
  false,  -- Private bucket (use signed URLs for playback)
  104857600,  -- 100MB limit (supports 60s @ 1080p)
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy 1: Professionals can upload their own intro videos
CREATE POLICY "Professionals can upload own intro videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'intro-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND private.user_has_role('professional')
  );

-- RLS Policy 2: Professionals can update/delete their own intro videos
CREATE POLICY "Professionals can update own intro videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'intro-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND private.user_has_role('professional')
  );

CREATE POLICY "Professionals can delete own intro videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'intro-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND private.user_has_role('professional')
  );

-- RLS Policy 3: Authenticated users can view approved intro videos
-- Note: This policy checks the professional_profiles table for approval status
CREATE POLICY "Users can view approved intro videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'intro-videos'
    AND EXISTS (
      SELECT 1
      FROM professional_profiles pp
      WHERE pp.intro_video_path = name
      AND pp.intro_video_status = 'approved'
    )
  );

-- RLS Policy 4: Admins can view all intro videos (including pending/rejected)
CREATE POLICY "Admins can view all intro videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'intro-videos'
    AND private.user_has_role('admin')
  );

-- RLS Policy 5: Admins can manage all intro videos (for moderation/cleanup)
CREATE POLICY "Admins can delete intro videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'intro-videos'
    AND private.user_has_role('admin')
  );
