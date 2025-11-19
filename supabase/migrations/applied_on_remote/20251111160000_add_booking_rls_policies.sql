-- Migration: Add RLS policies for booking-related tables
-- Description: Adds Row Level Security policies for booking_addons and booking_status_history
-- Security: Ensures users can only access their own booking data
-- Date: 2025-01-11

-- ============================================================================
-- RLS Policies for booking_addons
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own booking addons" ON booking_addons;
DROP POLICY IF EXISTS "Users can insert their own booking addons" ON booking_addons;
DROP POLICY IF EXISTS "Professionals can view addons for their bookings" ON booking_addons;
DROP POLICY IF EXISTS "Admins have full access to booking addons" ON booking_addons;

-- Policy: Users can view addons for their own bookings
CREATE POLICY "Users can view their own booking addons"
  ON booking_addons
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid()
    )
  );

-- Policy: Users can insert addons when creating bookings
CREATE POLICY "Users can insert their own booking addons"
  ON booking_addons
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid()
    )
  );

-- Policy: Professionals can view addons for bookings assigned to them
CREATE POLICY "Professionals can view addons for their bookings"
  ON booking_addons
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE professional_id = auth.uid()
    )
  );

-- Policy: Admins have full access to booking addons
CREATE POLICY "Admins have full access to booking addons"
  ON booking_addons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for booking_status_history
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their booking history" ON booking_status_history;
DROP POLICY IF EXISTS "Professionals can view their booking history" ON booking_status_history;
DROP POLICY IF EXISTS "System can insert status history" ON booking_status_history;
DROP POLICY IF EXISTS "Admins have full access to status history" ON booking_status_history;

-- Policy: Users can view status history for their own bookings
CREATE POLICY "Users can view their booking history"
  ON booking_status_history
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid()
    )
  );

-- Policy: Professionals can view status history for their bookings
CREATE POLICY "Professionals can view their booking history"
  ON booking_status_history
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE professional_id = auth.uid()
    )
  );

-- Policy: System/authenticated users can insert status changes
-- This allows the booking service to create status history entries
CREATE POLICY "System can insert status history"
  ON booking_status_history
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid()
      OR professional_id = auth.uid()
    )
  );

-- Policy: Admins have full access to status history
CREATE POLICY "Admins have full access to status history"
  ON booking_status_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- Enable RLS on spatial_ref_sys (PostGIS table)
-- ============================================================================

-- Enable RLS on spatial_ref_sys table (required for PostGIS in public schema)
ALTER TABLE IF EXISTS spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow public read access to spatial_ref_sys (standard PostGIS requirement)
DROP POLICY IF EXISTS "Public read access to spatial reference systems" ON spatial_ref_sys;
CREATE POLICY "Public read access to spatial reference systems"
  ON spatial_ref_sys
  FOR SELECT
  TO public
  USING (true);

-- Only allow service role to modify spatial_ref_sys
DROP POLICY IF EXISTS "Service role can modify spatial reference systems" ON spatial_ref_sys;
CREATE POLICY "Service role can modify spatial reference systems"
  ON spatial_ref_sys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Add indexes on foreign keys used in RLS policies (if not exists)
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking_id ON booking_addons(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON POLICY "Users can view their own booking addons" ON booking_addons IS
  'Allows customers to view addons for bookings they created';

COMMENT ON POLICY "Professionals can view addons for their bookings" ON booking_addons IS
  'Allows professionals to view addons for bookings assigned to them';

COMMENT ON POLICY "Users can view their booking history" ON booking_status_history IS
  'Allows customers to view status history for their bookings';

COMMENT ON POLICY "Professionals can view their booking history" ON booking_status_history IS
  'Allows professionals to view status history for bookings assigned to them';

COMMENT ON POLICY "Public read access to spatial reference systems" ON spatial_ref_sys IS
  'Required for PostGIS functionality - allows read-only access to spatial reference data';
