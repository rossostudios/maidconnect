-- Add avatar_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile avatar image (stored in Supabase Storage)';
