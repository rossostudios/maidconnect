-- =====================================================
-- Migration: Add timezone tracking to bookings
-- Purpose: Multi-country data model Phase 2.2 - Time zones & scheduling
-- =====================================================
-- This migration adds explicit timezone tracking for customers and professionals
-- to handle cross-timezone booking scenarios (e.g., customer in Uruguay, professional in Paraguay).
-- All booking times are stored in UTC, with explicit timezone context for display.

-- =====================================================
-- Part 1: Add timezone columns to bookings
-- =====================================================

-- Add customer_tz and professional_tz for explicit timezone tracking
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_tz text,
  ADD COLUMN IF NOT EXISTS professional_tz text;

-- Backfill: Set timezones based on country_code
UPDATE bookings
SET
  customer_tz = CASE country_code
    WHEN 'CO' THEN 'America/Bogota'
    WHEN 'PY' THEN 'America/Asuncion'
    WHEN 'UY' THEN 'America/Montevideo'
    WHEN 'AR' THEN 'America/Argentina/Buenos_Aires'
  END,
  professional_tz = CASE country_code
    WHEN 'CO' THEN 'America/Bogota'
    WHEN 'PY' THEN 'America/Asuncion'
    WHEN 'UY' THEN 'America/Montevideo'
    WHEN 'AR' THEN 'America/Argentina/Buenos_Aires'
  END
WHERE customer_tz IS NULL OR professional_tz IS NULL;

-- Make columns NOT NULL after backfill
ALTER TABLE bookings
  ALTER COLUMN customer_tz SET NOT NULL,
  ALTER COLUMN professional_tz SET NOT NULL;

-- =====================================================
-- Part 2: Add check constraints for valid timezones
-- =====================================================

-- Ensure timezones match expected country timezones
ALTER TABLE bookings
  ADD CONSTRAINT bookings_customer_tz_valid_check
    CHECK (
      customer_tz IN (
        'America/Bogota',        -- Colombia (COT, UTC-5, no DST)
        'America/Asuncion',      -- Paraguay (PYT, UTC-4, has DST)
        'America/Montevideo',    -- Uruguay (UYT, UTC-3, no DST since 2015)
        'America/Argentina/Buenos_Aires'  -- Argentina (ART, UTC-3, no DST since 2009)
      )
    );

ALTER TABLE bookings
  ADD CONSTRAINT bookings_professional_tz_valid_check
    CHECK (
      professional_tz IN (
        'America/Bogota',
        'America/Asuncion',
        'America/Montevideo',
        'America/Argentina/Buenos_Aires'
      )
    );

-- =====================================================
-- Part 3: Create indexes for timezone-based queries
-- =====================================================

-- Index for filtering bookings by customer timezone
CREATE INDEX IF NOT EXISTS idx_bookings_customer_tz
  ON bookings(customer_tz);

-- Index for filtering bookings by professional timezone
CREATE INDEX IF NOT EXISTS idx_bookings_professional_tz
  ON bookings(professional_tz);

-- =====================================================
-- Part 4: Add helper function for timezone conversion
-- =====================================================

-- Function to convert UTC timestamp to local timezone
CREATE OR REPLACE FUNCTION private.utc_to_local_tz(
  utc_timestamp timestamptz,
  target_tz text
)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT utc_timestamp AT TIME ZONE target_tz;
$$;

COMMENT ON FUNCTION private.utc_to_local_tz(timestamptz, text) IS
  'Converts UTC timestamp to local timezone. Example: utc_to_local_tz(''2025-01-20 10:00:00+00'', ''America/Asuncion'') → 2025-01-20 06:00:00-04';

-- Function to convert local timestamp to UTC
CREATE OR REPLACE FUNCTION private.local_to_utc_tz(
  local_timestamp timestamp,
  source_tz text
)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (local_timestamp || ' ' || source_tz)::timestamptz;
$$;

COMMENT ON FUNCTION private.local_to_utc_tz(timestamp, text) IS
  'Converts local timestamp to UTC. Example: local_to_utc_tz(''2025-01-20 10:00:00'', ''America/Asuncion'') → 2025-01-20 14:00:00+00 (during DST)';

-- =====================================================
-- Part 5: Add comments for documentation
-- =====================================================

COMMENT ON COLUMN bookings.customer_tz IS
  'IANA timezone identifier for customer''s local time (e.g., America/Asuncion). Used to display booking times in customer''s local timezone. Prevents confusion when customer and professional are in different timezones.';

COMMENT ON COLUMN bookings.professional_tz IS
  'IANA timezone identifier for professional''s local time (e.g., America/Bogota). Used to display booking times in professional''s local timezone. Ensures professional sees correct local appointment time.';

-- =====================================================
-- Part 6: Timezone reference data
-- =====================================================

COMMENT ON CONSTRAINT bookings_customer_tz_valid_check ON bookings IS
  'Valid timezones:
   - America/Bogota: Colombia (COT, UTC-5, no DST)
   - America/Asuncion: Paraguay (PYT, UTC-4 standard, UTC-3 DST, Oct-Mar)
   - America/Montevideo: Uruguay (UYT, UTC-3, no DST since 2015)
   - America/Argentina/Buenos_Aires: Argentina (ART, UTC-3, no DST since 2009)

  Note: Paraguay has DST (first Sunday of October to fourth Sunday of March).
  Uruguay and Argentina do NOT observe DST (discontinued in 2015 and 2009).';
