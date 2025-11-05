-- Create admin account for Christopher
-- This migration sets a specific user as admin based on their email

-- Add account_status column if it doesn't exist (referenced in list_active_professionals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN account_status text NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'banned'));
  END IF;
END $$;

-- Function to set admin role by email
-- This is a one-time operation to grant admin access
CREATE OR REPLACE FUNCTION public.set_admin_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update the user's role to admin
  UPDATE public.profiles
  SET
    role = 'admin',
    onboarding_status = 'active',
    account_status = 'active',
    updated_at = now()
  WHERE id = target_user_id;

  RAISE NOTICE 'Successfully set user % (%) as admin', user_email, target_user_id;
END;
$$;

-- Grant execute permission to postgres role only (security)
REVOKE EXECUTE ON FUNCTION public.set_admin_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_admin_by_email(text) TO postgres;

COMMENT ON FUNCTION public.set_admin_by_email IS
  'Security-sensitive function to grant admin role. Only callable by database admins.';

-- Instructions (run in Supabase SQL Editor):
-- SELECT public.set_admin_by_email('your-email@example.com');
