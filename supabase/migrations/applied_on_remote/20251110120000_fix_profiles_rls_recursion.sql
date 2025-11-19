-- Migration: Fix infinite recursion in profiles RLS policies
-- Description: Replace recursive policy checks with SECURITY DEFINER helper function
-- Author: Claude
-- Date: 2025-11-10

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS)
-- ============================================================================

-- Create private schema for internal helper functions
CREATE SCHEMA IF NOT EXISTS private;

-- Helper function to check user role (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION private.user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = check_role
  );
$$;

COMMENT ON FUNCTION private.user_has_role(text) IS
  'Checks if current user has specified role. Uses SECURITY DEFINER to avoid RLS recursion.';

-- ============================================================================
-- DROP EXISTING POLICIES (to recreate without recursion)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_consolidated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_consolidated" ON public.profiles;

-- ============================================================================
-- RECREATE POLICIES WITHOUT RECURSION
-- ============================================================================

-- SELECT policy: Users can view their own profile, admins can view all
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO public
  USING (
    auth.uid() = id
    OR private.user_has_role('admin')
  );

-- UPDATE policy: Users can update their own profile, admins can update all
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR private.user_has_role('admin')
  )
  WITH CHECK (
    auth.uid() = id
    OR private.user_has_role('admin')
  );

-- INSERT policy: Allow new user profile creation
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- DELETE policy: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (private.user_has_role('admin'));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "profiles_select_policy" ON public.profiles IS
  'Users can view their own profile, admins can view all profiles';

COMMENT ON POLICY "profiles_update_policy" ON public.profiles IS
  'Users can update their own profile, admins can update all profiles. Uses SECURITY DEFINER function to avoid recursion.';

COMMENT ON POLICY "profiles_insert_policy" ON public.profiles IS
  'Allow authenticated users to create their own profile';

COMMENT ON POLICY "profiles_delete_policy" ON public.profiles IS
  'Only admins can delete profiles';
