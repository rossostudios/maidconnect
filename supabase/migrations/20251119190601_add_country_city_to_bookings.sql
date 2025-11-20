-- =====================================================
-- Migration: Add country_code and city_id to bookings
-- Purpose: Multi-country data model Phase 2
-- =====================================================
-- This migration adds foreign key references to the countries and cities tables,
-- enabling proper country-based filtering and currency validation for bookings.

-- Step 1: Add new columns (nullable for backfill)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city_id uuid;

-- Step 2: Backfill country_code and city_id from professional's location
-- Bookings inherit the professional's country and city since services are delivered there
UPDATE bookings b
SET
  country_code = pp.country_code,
  city_id = pp.city_id
FROM professional_profiles pp
WHERE
  b.professional_id = pp.profile_id
  AND b.country_code IS NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE bookings
  ADD CONSTRAINT bookings_country_code_fkey
    FOREIGN KEY (country_code)
    REFERENCES countries(code)
    ON DELETE RESTRICT,
  ADD CONSTRAINT bookings_city_id_fkey
    FOREIGN KEY (city_id)
    REFERENCES cities(id)
    ON DELETE RESTRICT;

-- Step 4: Make columns NOT NULL (after backfill)
ALTER TABLE bookings
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN city_id SET NOT NULL;

-- Step 5: Create indexes for filtering (admin dashboard, analytics)
CREATE INDEX IF NOT EXISTS idx_bookings_country_code
  ON bookings(country_code);

CREATE INDEX IF NOT EXISTS idx_bookings_city_id
  ON bookings(city_id);

-- Composite index for country + status filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_bookings_country_status
  ON bookings(country_code, status);

-- Step 6: Add check constraint to ensure currency matches country
-- This prevents data inconsistencies like a Colombian booking with PYG currency
ALTER TABLE bookings
  ADD CONSTRAINT bookings_currency_country_match_check
    CHECK (
      (country_code = 'CO' AND currency = 'COP') OR
      (country_code = 'PY' AND currency = 'PYG') OR
      (country_code = 'UY' AND currency = 'UYU') OR
      (country_code = 'AR' AND currency = 'ARS')
    );

-- Step 7: Create trigger function to ensure customer and professional are in same country
-- Multi-country operations require same-market transactions
CREATE OR REPLACE FUNCTION private.validate_booking_same_country()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow guest bookings (no customer_id)
  IF NEW.customer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verify customer's country matches booking's country
  IF NOT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = NEW.customer_id
      AND p.country_code = NEW.country_code
  ) THEN
    RAISE EXCEPTION 'Customer and professional must be in the same country. Customer is in %, booking is in %',
      (SELECT country_code FROM profiles WHERE id = NEW.customer_id),
      NEW.country_code
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER validate_booking_same_country_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_booking_same_country();

COMMENT ON FUNCTION private.validate_booking_same_country() IS
  'Validates that customer and professional are in the same country for cross-border transaction prevention.';

-- Step 8: Add comments for documentation
COMMENT ON COLUMN bookings.country_code IS
  'ISO 3166-1 alpha-2 country code (CO, PY, UY, AR). Foreign key to countries.code. Determines booking market and validates currency.';

COMMENT ON COLUMN bookings.city_id IS
  'UUID reference to cities table. Inherited from professional''s city. Determines service delivery location.';

COMMENT ON CONSTRAINT bookings_currency_country_match_check ON bookings IS
  'Ensures currency matches country: CO→COP, PY→PYG, UY→UYU, AR→ARS. Prevents cross-currency errors.';
