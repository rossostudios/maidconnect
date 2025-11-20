-- =====================================================
-- Migration: Add country-aware RLS policies
-- Purpose: Multi-country data model Phase 4
-- =====================================================
-- This migration adds assigned_countries to profiles and updates RLS policies
-- to enforce country-based data isolation for multi-market operations.

-- =====================================================
-- Part 1: Add assigned_countries to profiles
-- =====================================================

-- Add assigned_countries column for admin country assignment
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS assigned_countries text[] DEFAULT NULL;

-- Backfill: Admins get all countries by default
UPDATE profiles
SET assigned_countries = ARRAY['CO', 'PY', 'UY', 'AR']
WHERE role = 'admin' AND assigned_countries IS NULL;

-- Create index for array containment queries
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_countries
  ON profiles USING GIN (assigned_countries);

-- Add check constraint (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_assigned_countries_valid_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_assigned_countries_valid_check
        CHECK (
          assigned_countries IS NULL OR
          (assigned_countries <@ ARRAY['CO', 'PY', 'UY', 'AR'])
        );
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN profiles.assigned_countries IS
  'ISO 3166-1 alpha-2 country codes this admin can access (NULL for non-admin roles). Example: {CO,PY} for admin managing Colombia and Paraguay.';

-- =====================================================
-- Part 2: Helper function for country-aware admin check
-- =====================================================

-- Create function to check if user can access a country (replaces if exists)
CREATE OR REPLACE FUNCTION private.user_can_access_country(target_country_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE
    -- Non-authenticated users cannot access any country
    WHEN auth.uid() IS NULL THEN false

    -- Get user's role and assigned countries
    ELSE (
      SELECT CASE
        -- Admin users: check assigned_countries array
        WHEN p.role = 'admin' THEN
          p.assigned_countries IS NOT NULL AND
          target_country_code = ANY(p.assigned_countries)

        -- Professional/Customer users: check their own country_code
        WHEN p.role IN ('professional', 'customer') THEN
          p.country_code = target_country_code

        -- Other roles: no access
        ELSE false
      END
      FROM profiles p
      WHERE p.id = auth.uid()
    )
  END;
$$;

COMMENT ON FUNCTION private.user_can_access_country(text) IS
  'Checks if authenticated user can access data for a specific country. Admins check assigned_countries array, professionals/customers check their own country_code.';

-- =====================================================
-- Part 3: Update profiles RLS policies
-- =====================================================

-- Drop existing admin-related policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_country_aware" ON profiles;

-- Create new country-aware SELECT policy
CREATE POLICY "profiles_select_country_aware" ON profiles
  FOR SELECT
  USING (
    -- Users can always see their own profile
    id = auth.uid()
    OR
    -- Admins can see profiles in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- =====================================================
-- Part 4: Update professional_profiles RLS policies
-- =====================================================

-- Drop existing admin-related policies
DROP POLICY IF EXISTS "Admins can manage all professional profiles" ON professional_profiles;
DROP POLICY IF EXISTS "Admins can update professional profiles" ON professional_profiles;
DROP POLICY IF EXISTS "professional_profiles_admin_select_country_aware" ON professional_profiles;
DROP POLICY IF EXISTS "professional_profiles_admin_update_country_aware" ON professional_profiles;

-- Create new country-aware SELECT policy for admins
CREATE POLICY "professional_profiles_admin_select_country_aware" ON professional_profiles
  FOR SELECT
  USING (
    -- Professionals can see their own profile
    profile_id = auth.uid()
    OR
    -- Admins can see profiles in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- Create new country-aware UPDATE policy for admins
CREATE POLICY "professional_profiles_admin_update_country_aware" ON professional_profiles
  FOR UPDATE
  USING (
    -- Professionals can update their own profile
    profile_id = auth.uid()
    OR
    -- Admins can update profiles in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- =====================================================
-- Part 5: Update bookings RLS policies
-- =====================================================

-- Drop existing admin full access policy
DROP POLICY IF EXISTS "Admins have full access to bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_select_country_aware" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_update_country_aware" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_delete_country_aware" ON bookings;

-- Create new country-aware SELECT policy for admins
CREATE POLICY "bookings_admin_select_country_aware" ON bookings
  FOR SELECT
  USING (
    -- Customers can see their bookings
    customer_id = auth.uid()
    OR
    -- Professionals can see their bookings
    professional_id = auth.uid()
    OR
    -- Guests can see their bookings
    guest_session_id IN (SELECT id FROM guest_sessions)
    OR
    -- Admins can see bookings in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- Create new country-aware UPDATE policy for admins
CREATE POLICY "bookings_admin_update_country_aware" ON bookings
  FOR UPDATE
  USING (
    -- Customers can update their bookings
    customer_id = auth.uid()
    OR
    -- Professionals can update their bookings
    professional_id = auth.uid()
    OR
    -- Admins can update bookings in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- Create new country-aware DELETE policy for admins
CREATE POLICY "bookings_admin_delete_country_aware" ON bookings
  FOR DELETE
  USING (
    -- Only admins can delete bookings, in their assigned countries
    private.user_has_role('admin') AND
    private.user_can_access_country(country_code)
  );

-- =====================================================
-- Part 6: Update payout_batches RLS policies
-- =====================================================

-- Drop existing admin view policy
DROP POLICY IF EXISTS "Admins can view payout_batches" ON payout_batches;
DROP POLICY IF EXISTS "payout_batches_admin_select_country_aware" ON payout_batches;

-- Create new country-aware SELECT policy
CREATE POLICY "payout_batches_admin_select_country_aware" ON payout_batches
  FOR SELECT
  USING (
    -- Admins can see batches in their assigned countries
    private.user_has_role('admin') AND
    private.user_can_access_country(country_code)
  );

-- =====================================================
-- Part 7: Update payout_transfers RLS policies
-- =====================================================

-- Drop existing admin view policy
DROP POLICY IF EXISTS "Admins can view payout_transfers" ON payout_transfers;
DROP POLICY IF EXISTS "payout_transfers_admin_select_country_aware" ON payout_transfers;
DROP POLICY IF EXISTS "payout_transfers_admin_update_country_aware" ON payout_transfers;

-- Create new country-aware SELECT policy for admins
CREATE POLICY "payout_transfers_admin_select_country_aware" ON payout_transfers
  FOR SELECT
  USING (
    -- Professionals can see their own transfers
    professional_id = auth.uid()
    OR
    -- Admins can see transfers in their assigned countries
    (
      private.user_has_role('admin') AND
      private.user_can_access_country(country_code)
    )
  );

-- Create new country-aware UPDATE policy for admins
CREATE POLICY "payout_transfers_admin_update_country_aware" ON payout_transfers
  FOR UPDATE
  USING (
    -- Admins can update transfers in their assigned countries
    private.user_has_role('admin') AND
    private.user_can_access_country(country_code)
  );

-- =====================================================
-- Part 8: Add comments and documentation
-- =====================================================

COMMENT ON POLICY "profiles_select_country_aware" ON profiles IS
  'Users see own profile. Admins see profiles in their assigned_countries array. Prevents cross-country admin access.';

COMMENT ON POLICY "professional_profiles_admin_select_country_aware" ON professional_profiles IS
  'Professionals see own profile. Admins see profiles in their assigned_countries array.';

COMMENT ON POLICY "bookings_admin_select_country_aware" ON bookings IS
  'Customers/professionals see own bookings. Admins see bookings in their assigned_countries array.';

COMMENT ON POLICY "payout_batches_admin_select_country_aware" ON payout_batches IS
  'Admins see batches in their assigned_countries array. Prevents cross-country payout access.';

COMMENT ON POLICY "payout_transfers_admin_select_country_aware" ON payout_transfers IS
  'Professionals see own transfers. Admins see transfers in their assigned_countries array.';
