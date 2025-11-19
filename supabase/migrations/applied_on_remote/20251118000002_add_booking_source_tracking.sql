-- Migration: Add booking source tracking for Amara vs Concierge analytics
-- Created: 2025-11-18
-- Description: Tracks whether bookings originated from Amara AI chat, Concierge service, or direct browse

-- Add booking_source column to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_source TEXT
    CHECK (booking_source IN ('amara', 'concierge', 'direct', 'phone', 'email'))
    DEFAULT 'direct';

-- Add source_details JSONB for additional context
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS source_details JSONB DEFAULT NULL;

-- Add conversion tracking fields
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS first_touch_source TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_touch_source TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS touch_points INTEGER DEFAULT 1;

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_bookings_booking_source
  ON bookings(booking_source);

CREATE INDEX IF NOT EXISTS idx_bookings_first_touch_source
  ON bookings(first_touch_source);

CREATE INDEX IF NOT EXISTS idx_bookings_created_booking_source
  ON bookings(created_at, booking_source);

-- Add comments
COMMENT ON COLUMN bookings.booking_source IS
  'Primary channel where booking was initiated: amara (AI chat), concierge (human service), direct (browse), phone, email';

COMMENT ON COLUMN bookings.source_details IS
  'Additional source metadata: chat_session_id, concierge_agent_id, referral_code, utm_params, etc.';

COMMENT ON COLUMN bookings.first_touch_source IS
  'First channel where customer interacted with Casaora (for attribution analysis)';

COMMENT ON COLUMN bookings.last_touch_source IS
  'Last channel before booking conversion (for attribution analysis)';

COMMENT ON COLUMN bookings.touch_points IS
  'Number of interactions customer had before booking (journey complexity)';

-- Add RLS policies for booking_source (inherits from existing bookings policies)
-- No additional RLS needed - existing policies cover new fields

-- Create analytics view for source performance
CREATE OR REPLACE VIEW booking_source_analytics AS
SELECT
  booking_source,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings,
  COUNT(*) FILTER (WHERE status = 'disputed') AS disputed_bookings,
  ROUND(AVG(final_amount_captured / 100.0), 2) AS avg_booking_value_cop,
  ROUND(SUM(final_amount_captured / 100.0), 2) AS total_revenue_cop,
  ROUND(AVG(touch_points), 1) AS avg_touch_points,
  MIN(created_at) AS first_booking_date,
  MAX(created_at) AS last_booking_date
FROM bookings
WHERE booking_source IS NOT NULL
GROUP BY booking_source;

-- Grant permissions
GRANT SELECT ON booking_source_analytics TO authenticated;
GRANT SELECT ON booking_source_analytics TO service_role;

-- Add comments
COMMENT ON VIEW booking_source_analytics IS
  'Analytics view for comparing booking performance across Amara, Concierge, and Direct channels';
