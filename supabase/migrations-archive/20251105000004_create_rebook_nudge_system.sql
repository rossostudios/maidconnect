/**
 * Sprint 2: Rebook Nudge System (Feature 12/12)
 *
 * A/B test: Send rebook nudges 24h vs 72h after booking completion
 * Tracks email + push notification engagement and conversion
 */

-- Add rebook nudge tracking columns to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS rebook_nudge_variant TEXT CHECK (rebook_nudge_variant IN ('24h', '72h')),
  ADD COLUMN IF NOT EXISTS rebook_nudge_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rebook_nudge_sent_at TIMESTAMPTZ;

-- Create experiment tracking table
CREATE TABLE IF NOT EXISTS rebook_nudge_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('24h', '72h')),

  -- Email tracking
  email_sent_at TIMESTAMPTZ,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMPTZ,
  email_clicked BOOLEAN DEFAULT false,
  email_clicked_at TIMESTAMPTZ,

  -- Push notification tracking
  push_sent_at TIMESTAMPTZ,
  push_clicked BOOLEAN DEFAULT false,
  push_clicked_at TIMESTAMPTZ,

  -- Outcome tracking
  rebooked BOOLEAN DEFAULT false,
  rebooked_at TIMESTAMPTZ,
  rebook_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One experiment per booking
  UNIQUE(booking_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_rebook_nudge_variant ON rebook_nudge_experiments(variant);
CREATE INDEX idx_rebook_nudge_customer ON rebook_nudge_experiments(customer_id);
CREATE INDEX idx_rebook_nudge_sent ON rebook_nudge_experiments(email_sent_at) WHERE email_sent_at IS NOT NULL;
CREATE INDEX idx_rebook_nudge_rebooked ON rebook_nudge_experiments(rebooked) WHERE rebooked = true;
CREATE INDEX idx_bookings_nudge_pending ON bookings(actual_end_time)
  WHERE status = 'completed' AND rebook_nudge_sent = false;

-- Enable RLS
ALTER TABLE rebook_nudge_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Customers can view their own experiment data
CREATE POLICY "Customers can view own rebook nudge experiments"
ON rebook_nudge_experiments
FOR SELECT
USING (auth.uid() = customer_id);

-- Admins can view all experiment data
CREATE POLICY "Admins can view all rebook nudge experiments"
ON rebook_nudge_experiments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Service role can manage all (for cron jobs)
CREATE POLICY "Service role can manage rebook nudge experiments"
ON rebook_nudge_experiments
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT SELECT ON rebook_nudge_experiments TO authenticated;
GRANT ALL ON rebook_nudge_experiments TO service_role;

-- Function to track rebook conversions
CREATE OR REPLACE FUNCTION track_rebook_conversion()
RETURNS TRIGGER AS $$
DECLARE
  original_booking_id UUID;
  original_professional_id UUID;
BEGIN
  -- Check if this is a rebook (same customer + professional as a previous completed booking)
  SELECT b.id, b.professional_id INTO original_booking_id, original_professional_id
  FROM bookings b
  WHERE b.customer_id = NEW.customer_id
    AND b.professional_id = NEW.professional_id
    AND b.status = 'completed'
    AND b.actual_end_time IS NOT NULL
    AND b.id != NEW.id
    AND EXISTS (
      SELECT 1 FROM rebook_nudge_experiments rne
      WHERE rne.booking_id = b.id
        AND rne.rebooked = false
    )
  ORDER BY b.actual_end_time DESC
  LIMIT 1;

  -- If this is a rebook, update the experiment
  IF original_booking_id IS NOT NULL THEN
    UPDATE rebook_nudge_experiments
    SET
      rebooked = true,
      rebooked_at = NOW(),
      rebook_booking_id = NEW.id,
      updated_at = NOW()
    WHERE booking_id = original_booking_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track rebook conversions when bookings are created
CREATE TRIGGER track_rebook_conversion_trigger
AFTER INSERT ON bookings
FOR EACH ROW
WHEN (NEW.status IN ('pending_payment', 'authorized'))
EXECUTE FUNCTION track_rebook_conversion();

-- Comments
COMMENT ON TABLE rebook_nudge_experiments IS 'Sprint 2: A/B test tracking for rebook nudges (24h vs 72h)';
COMMENT ON COLUMN rebook_nudge_experiments.variant IS '24h or 72h delay after booking completion';
COMMENT ON COLUMN rebook_nudge_experiments.rebooked IS 'True if customer booked the same professional again';
COMMENT ON FUNCTION track_rebook_conversion() IS 'Automatically tracks when a customer rebooks with the same professional';
