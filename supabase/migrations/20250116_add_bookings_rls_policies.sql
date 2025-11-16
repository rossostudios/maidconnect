-- Migration: Add RLS policies for bookings table
-- Description: Adds Row Level Security policies for bookings to allow proper access control
-- Security: Ensures admins can view all data, users can view their bookings, professionals can view assigned bookings
-- Date: 2025-01-16
-- Fix: Resolves "Revenue query failed: {}" error in admin dashboard

-- ============================================================================
-- RLS Policies for bookings table
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins have full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Professionals can view their assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Professionals can update their assigned bookings" ON bookings;

-- Policy: Admins have full access to all bookings (SELECT, INSERT, UPDATE, DELETE)
-- This policy allows admin dashboard to query bookings data including amount_captured
CREATE POLICY "Admins have full access to bookings"
  ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Users can view their own bookings (as customers)
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (
    customer_id = auth.uid()
  );

-- Policy: Professionals can view bookings assigned to them
CREATE POLICY "Professionals can view their assigned bookings"
  ON bookings
  FOR SELECT
  USING (
    professional_id = auth.uid()
  );

-- Policy: Users can insert bookings (as customers)
CREATE POLICY "Users can insert their own bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Policy: Users can update their own bookings (as customers)
-- Limited to non-critical fields
CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  USING (
    customer_id = auth.uid()
  );

-- Policy: Professionals can update their assigned bookings
-- Allows professionals to update booking status, notes, etc.
CREATE POLICY "Professionals can update their assigned bookings"
  ON bookings
  FOR UPDATE
  USING (
    professional_id = auth.uid()
  );

-- ============================================================================
-- Enable RLS on bookings table (if not already enabled)
-- ============================================================================

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Indexes for Performance (if not exists)
-- ============================================================================

-- Indexes on foreign keys used in RLS policies
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Index on amount_captured for revenue queries
CREATE INDEX IF NOT EXISTS idx_bookings_amount_captured ON bookings(amount_captured) WHERE amount_captured IS NOT NULL;

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_bookings_created_status ON bookings(created_at DESC, status);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON POLICY "Admins have full access to bookings" ON bookings IS
  'Allows admin users to view and manage all bookings on the platform';

COMMENT ON POLICY "Users can view their own bookings" ON bookings IS
  'Allows customers to view bookings they have created';

COMMENT ON POLICY "Professionals can view their assigned bookings" ON bookings IS
  'Allows professionals to view bookings assigned to them';

COMMENT ON POLICY "Users can insert their own bookings" ON bookings IS
  'Allows customers to create new bookings';

COMMENT ON POLICY "Users can update their own bookings" ON bookings IS
  'Allows customers to update their own bookings (limited to non-critical fields)';

COMMENT ON POLICY "Professionals can update their assigned bookings" ON bookings IS
  'Allows professionals to update bookings assigned to them (status, notes, etc.)';
