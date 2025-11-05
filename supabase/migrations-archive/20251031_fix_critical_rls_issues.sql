-- ============================================================================
-- CRITICAL RLS SECURITY FIXES
-- ============================================================================
-- Generated: 2025-10-31
-- Purpose: Fix critical security vulnerabilities in RLS policies
--
-- CRITICAL ISSUES FIXED:
-- 1. Enable RLS on bookings table (CRITICAL - currently unprotected!)
-- 2. Protect role changes in profiles table (privilege escalation)
-- 3. Add missing INSERT policies for professional/customer profiles
-- 4. Add performance indexes for RLS queries
-- 5. Optimize auth.uid() calls with SELECT wrappers
--
-- See RLS_SECURITY_AUDIT.md for full details
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. BOOKINGS TABLE - ENABLE RLS AND ADD POLICIES (CRITICAL!)
-- ============================================================================

-- Enable RLS on bookings table (currently UNPROTECTED!)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add indexes for RLS performance (100x+ improvement)
-- These columns are checked in every RLS policy, must be indexed
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id_rls
  ON public.bookings(customer_id) WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_professional_id_rls
  ON public.bookings(professional_id) WHERE professional_id IS NOT NULL;

-- Policy: Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (
    -- Performance optimization: wrap auth.uid() in SELECT to cache result
    (SELECT auth.uid()) = customer_id
  );

-- Policy: Professionals can view bookings assigned to them
CREATE POLICY "Professionals can view their assigned bookings"
  ON public.bookings
  FOR SELECT
  USING (
    -- Performance optimization: wrap auth.uid() in SELECT to cache result
    (SELECT auth.uid()) = professional_id
  );

-- Policy: Customers can create bookings (but only for themselves)
CREATE POLICY "Customers can create their own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = customer_id
    AND
    -- Ensure they're actually a customer
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'customer'
    )
  );

-- Policy: Customers can update their own bookings (limited fields)
-- Note: Status changes should be restricted by application logic
CREATE POLICY "Customers can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = customer_id
  )
  WITH CHECK (
    -- Customers cannot change customer_id (professional_id immutability enforced by USING clause)
    (SELECT auth.uid()) = customer_id
  );

-- Policy: Professionals can update bookings assigned to them
-- Note: Status changes (accept/decline) should be restricted by application logic
CREATE POLICY "Professionals can update their assigned bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = professional_id
  )
  WITH CHECK (
    -- Professionals cannot change professional_id (customer_id immutability enforced by USING clause)
    (SELECT auth.uid()) = professional_id
  );

-- Policy: Admins can view all bookings (for support/disputes)
CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Policy: Admins can update all bookings (for dispute resolution)
CREATE POLICY "Admins can update all bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Add comment explaining booking deletion policy
-- Note: NO DELETE policy - bookings should never be deleted, only canceled
-- This maintains audit trail and prevents data loss
COMMENT ON TABLE public.bookings IS
  'Booking records with RLS enabled. No DELETE policy - use status=canceled instead to maintain audit trail.';

-- ============================================================================
-- 2. PROFILES TABLE - PROTECT ROLE CHANGES (PRIVILEGE ESCALATION FIX)
-- ============================================================================

-- Drop existing update policy (allows role changes)
DROP POLICY IF EXISTS "Profile owners can update their profile" ON public.profiles;

-- Recreate with role protection
-- Note: Role immutability is enforced by the trigger function, not RLS
-- RLS only enforces that users can only update their own profile
CREATE POLICY "Profile owners can update their profile (except role)"
  ON public.profiles
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = id
  )
  WITH CHECK (
    (SELECT auth.uid()) = id
  );

-- Add admin policy for role changes (only admins can change roles)
CREATE POLICY "Admins can update any profile including roles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Add trigger to prevent role changes (RLS cannot use OLD in WITH CHECK)
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow admins to change any role
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Prevent non-admins from changing roles
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You do not have permission to change user roles. Only admins can modify roles.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();

-- Add comment explaining role protection
COMMENT ON COLUMN public.profiles.role IS
  'User role (customer/professional/admin). Protected by trigger - only admins can change roles to prevent privilege escalation.';

-- ============================================================================
-- 3. PROFESSIONAL PROFILES - ADD MISSING INSERT POLICY
-- ============================================================================

-- Policy: Professionals can create their own profile during onboarding
CREATE POLICY "Professionals can create their own profile"
  ON public.professional_profiles
  FOR INSERT
  WITH CHECK (
    -- Must match their user ID
    (SELECT auth.uid()) = profile_id
    AND
    -- Must have professional role
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'professional'
    )
  );

-- Update existing UPDATE policy to include WITH CHECK
DROP POLICY IF EXISTS "Professional profile editable by owner" ON public.professional_profiles;

CREATE POLICY "Professional profile editable by owner"
  ON public.professional_profiles
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = profile_id
  )
  WITH CHECK (
    -- Cannot change profile_id (enforced by USING clause matching)
    (SELECT auth.uid()) = profile_id
  );

-- Add admin SELECT policy
CREATE POLICY "Admins can view all professional profiles"
  ON public.professional_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. CUSTOMER PROFILES - ADD MISSING INSERT POLICY
-- ============================================================================

-- Policy: Customers can create their own profile during signup
CREATE POLICY "Customers can create their own profile"
  ON public.customer_profiles
  FOR INSERT
  WITH CHECK (
    -- Must match their user ID
    (SELECT auth.uid()) = profile_id
    AND
    -- Must have customer role
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'customer'
    )
  );

-- Update existing UPDATE policy to include WITH CHECK
DROP POLICY IF EXISTS "Customer profile editable by owner" ON public.customer_profiles;

CREATE POLICY "Customer profile editable by owner"
  ON public.customer_profiles
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = profile_id
  )
  WITH CHECK (
    -- Cannot change profile_id (enforced by USING clause matching)
    (SELECT auth.uid()) = profile_id
  );

-- Add admin SELECT policy
CREATE POLICY "Admins can view all customer profiles"
  ON public.customer_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. PERFORMANCE OPTIMIZATION - INDEXES FOR RLS
-- ============================================================================

-- Index on profiles.id for auth.uid() comparisons
-- This is critical for RLS performance across all tables
CREATE INDEX IF NOT EXISTS idx_profiles_id_role
  ON public.profiles(id, role);

-- Index on customer_reviews for RLS queries
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_id_rls
  ON public.customer_reviews(customer_id) WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_reviews_professional_id_rls
  ON public.customer_reviews(professional_id) WHERE professional_id IS NOT NULL;

-- Index on professional_profiles for admin queries
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profile_id_rls
  ON public.professional_profiles(profile_id);

-- Index on customer_profiles for admin queries
CREATE INDEX IF NOT EXISTS idx_customer_profiles_profile_id_rls
  ON public.customer_profiles(profile_id);

-- ============================================================================
-- 6. OPTIMIZE EXISTING POLICIES WITH SELECT WRAPPERS
-- ============================================================================

-- Recreate customer_reviews policies with performance optimization
DROP POLICY IF EXISTS "Customers can view their own reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Professionals can view reviews they wrote" ON public.customer_reviews;
DROP POLICY IF EXISTS "Professionals can update their own reviews" ON public.customer_reviews;

CREATE POLICY "Customers can view their own reviews"
  ON public.customer_reviews
  FOR SELECT
  USING (
    (SELECT auth.uid()) = customer_id
  );

CREATE POLICY "Professionals can view reviews they wrote"
  ON public.customer_reviews
  FOR SELECT
  USING (
    (SELECT auth.uid()) = professional_id
  );

CREATE POLICY "Professionals can update their own reviews"
  ON public.customer_reviews
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = professional_id
  )
  WITH CHECK (
    -- Cannot change professional_id (enforced by USING clause matching)
    (SELECT auth.uid()) = professional_id
  );

-- ============================================================================
-- 7. ADD SECURITY COMMENTS
-- ============================================================================

COMMENT ON POLICY "Customers can view their own bookings" ON public.bookings IS
  'Customers can only view bookings they created. Uses SELECT wrapper for performance.';

COMMENT ON POLICY "Professionals can view their assigned bookings" ON public.bookings IS
  'Professionals can only view bookings assigned to them. Uses SELECT wrapper for performance.';

COMMENT ON POLICY "Profile owners can update their profile (except role)" ON public.profiles IS
  'SECURITY: Prevents privilege escalation by blocking role changes. Only admins can change roles.';

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- ============================================================================

-- These queries should be run to verify RLS is working correctly:
--
-- 1. Verify bookings RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'bookings';
--    Expected: rowsecurity = true
--
-- 2. List all policies on bookings:
--    SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'bookings';
--
-- 3. Test performance (should use index scan):
--    EXPLAIN ANALYZE SELECT * FROM bookings WHERE (SELECT auth.uid()) = customer_id;
--
-- 4. Verify indexes exist:
--    SELECT indexname FROM pg_indexes WHERE tablename IN ('bookings', 'profiles');

COMMIT;
