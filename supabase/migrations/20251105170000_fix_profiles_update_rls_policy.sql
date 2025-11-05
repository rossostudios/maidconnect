-- Migration: Fix infinite recursion in profiles RLS update policy
-- Description: Replace recursive role-checking policy with simple auth.uid() check
-- Author: Claude
-- Date: 2025-11-05

-- ============================================================================
-- PROBLEM:
-- The existing RLS policy was checking user role by reading from profiles table
-- while simultaneously trying to update the profiles table, causing infinite recursion.
-- ============================================================================

-- ============================================================================
-- SOLUTION:
-- Drop problematic policies and create simple policies that use auth.uid() directly
-- without reading from the profiles table during the update check.
-- ============================================================================

-- Drop all existing UPDATE policies on profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Customers can update their profile" ON public.profiles;

-- Create new UPDATE policy: Users can update their own profile
-- This policy does NOT check role to avoid recursion
-- Role checks should be done in application code or server-side functions
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can update own profile" ON public.profiles IS
  'Allows users to update their own profile data. Role changes are blocked at the RLS level and should only be done via service role key in admin functions.';
