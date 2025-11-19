-- Migration: Create profile-images storage bucket
-- Description: Storage bucket for user profile avatars with RLS policies
-- Author: Claude
-- Date: 2025-11-10

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Create profile-images bucket (public = true for direct access to avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,  -- Public bucket so avatars can be viewed without auth
  5242880,  -- 5MB limit (5 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Allow authenticated users to view all profile images (public bucket)
CREATE POLICY "Anyone can view profile images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND storage.filename(name) LIKE auth.uid()::text || '%'
  );

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '-', 1)
  );

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '-', 1)
  );

-- Allow admins full access to all profile images
CREATE POLICY "Admins can manage all profile images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND private.user_has_role('admin')
  )
  WITH CHECK (
    bucket_id = 'profile-images'
    AND private.user_has_role('admin')
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anyone can view profile images" ON storage.objects IS
  'Public access to view all profile images (avatars are public)';

COMMENT ON POLICY "Users can upload their own profile images" ON storage.objects IS
  'Users can upload profile images with their UUID as the filename prefix';

COMMENT ON POLICY "Users can update their own profile images" ON storage.objects IS
  'Users can update their own profile images (identified by UUID prefix)';

COMMENT ON POLICY "Users can delete their own profile images" ON storage.objects IS
  'Users can delete their own profile images (identified by UUID prefix)';

COMMENT ON POLICY "Admins can manage all profile images" ON storage.objects IS
  'Admins have full access to all profile images';
