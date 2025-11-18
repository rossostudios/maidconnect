-- Migration: Add Direct Hire Fee System
-- Description: Enables professionals to be hired off-platform via a finder's fee
-- Date: 2025-11-18

-- Add direct hire fee to professional profiles
-- Default: 2,000,000 COP (~$500 USD at ~4,000 COP/USD)
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS direct_hire_fee_cop INTEGER DEFAULT 2000000;

COMMENT ON COLUMN professional_profiles.direct_hire_fee_cop IS
'One-time finder fee (in COP) charged to customers who want to hire this professional directly off-platform for full-time employment. Default ~$500 USD.';

-- Add booking type tracking to differentiate marketplace vs direct hire bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'hourly'
CHECK (booking_type IN ('hourly', 'direct_hire'));

COMMENT ON COLUMN bookings.booking_type IS
'Type of booking: "hourly" for standard marketplace bookings, "direct_hire" for finder fee bookings';

-- Track whether direct hire fee has been paid
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS direct_hire_fee_paid BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN bookings.direct_hire_fee_paid IS
'True if the direct hire finder fee has been successfully paid via Stripe';

-- Add timestamp for when direct hire was completed
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS direct_hire_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN bookings.direct_hire_completed_at IS
'Timestamp when the direct hire transaction was completed and contact information was released';

-- Create index for querying direct hire bookings
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type
ON bookings(booking_type)
WHERE booking_type = 'direct_hire';

-- Create index for analytics queries on direct hire revenue
CREATE INDEX IF NOT EXISTS idx_bookings_direct_hire_paid
ON bookings(direct_hire_fee_paid, created_at)
WHERE booking_type = 'direct_hire';

-- Add RLS policy for direct hire bookings (customers can see their own)
CREATE POLICY "Customers can view their direct hire bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  booking_type = 'direct_hire'
  AND customer_id = auth.uid()
);

-- Add RLS policy for professionals to see incoming direct hire requests
CREATE POLICY "Professionals can view direct hire requests for their profile"
ON bookings
FOR SELECT
TO authenticated
USING (
  booking_type = 'direct_hire'
  AND professional_id = auth.uid()
);
