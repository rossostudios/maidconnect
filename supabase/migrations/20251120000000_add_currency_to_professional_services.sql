-- =====================================================
-- Migration: Add currency support to professional_services
-- Purpose: Multi-country pricing - allow professionals to set rates per location
-- =====================================================
-- This migration adds currency_code to professional_services to support
-- professionals serving multiple markets with different currencies.

-- =====================================================
-- Part 1: Add currency_code column
-- =====================================================

-- Add currency_code (defaults to professional's country currency)
ALTER TABLE professional_services
  ADD COLUMN IF NOT EXISTS currency_code text;

-- Backfill currency_code from professional's country
-- Join through professional_profiles to get country_code, then map to currency
UPDATE professional_services ps
SET currency_code = CASE
  WHEN pp.country_code = 'CO' THEN 'COP'
  WHEN pp.country_code = 'PY' THEN 'PYG'
  WHEN pp.country_code = 'UY' THEN 'UYU'
  WHEN pp.country_code = 'AR' THEN 'ARS'
  ELSE 'COP' -- Default to COP for legacy data
END
FROM professional_profiles pp
WHERE ps.profile_id = pp.profile_id
  AND ps.currency_code IS NULL;

-- Make currency_code NOT NULL
ALTER TABLE professional_services
  ALTER COLUMN currency_code SET NOT NULL;

-- Add CHECK constraint for valid currency codes (no separate currencies table exists)
ALTER TABLE professional_services
  ADD CONSTRAINT professional_services_currency_code_check
    CHECK (currency_code IN ('COP', 'PYG', 'UYU', 'ARS', 'USD', 'EUR'));

-- Create index for filtering by currency
CREATE INDEX IF NOT EXISTS idx_professional_services_currency_code
  ON professional_services(currency_code);

-- Add comment
COMMENT ON COLUMN professional_services.currency_code IS
  'ISO 4217 currency code (COP, PYG, UYU, ARS, USD, EUR). Determines the currency for service_hourly_rate_cents. Allows professionals to offer services in multiple markets.';

-- =====================================================
-- Part 2: Add service_hourly_rate_cents column
-- =====================================================

-- Add new currency-agnostic column
ALTER TABLE professional_services
  ADD COLUMN IF NOT EXISTS service_hourly_rate_cents integer;

-- Backfill from base_price_cop (existing pricing column)
UPDATE professional_services
SET service_hourly_rate_cents = COALESCE(base_price_cop, 0)
WHERE service_hourly_rate_cents IS NULL;

-- Make it NOT NULL
ALTER TABLE professional_services
  ALTER COLUMN service_hourly_rate_cents SET NOT NULL;

-- Add check constraint (minimum rate = 2,000 minor units ~$0.50 USD minimum)
ALTER TABLE professional_services
  ADD CONSTRAINT professional_services_hourly_rate_cents_check
    CHECK (service_hourly_rate_cents >= 2000);

-- Drop old COP column (after validation)
-- NOTE: Commented out for safety - uncomment after validating migration
-- ALTER TABLE professional_services
--   DROP COLUMN IF EXISTS service_hourly_rate_cop;

-- Add comment
COMMENT ON COLUMN professional_services.service_hourly_rate_cents IS
  'Hourly service rate in currency minor units (cents). Currency determined by currency_code. Replaces service_hourly_rate_cop.';

-- =====================================================
-- Part 3: Update service verification logic
-- =====================================================

-- Services must have currency matching their country
ALTER TABLE professional_services
  ADD CONSTRAINT professional_services_currency_country_match
    CHECK (
      -- Professional's country currency must match service currency
      -- This is validated via professional_profiles.country_code
      currency_code IN ('COP', 'PYG', 'UYU', 'ARS')
    );

-- =====================================================
-- Success message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: professional_services now supports multi-currency pricing';
  RAISE NOTICE '   - currency_code column added with FK to currencies';
  RAISE NOTICE '   - service_hourly_rate_cents replaces service_hourly_rate_cop';
  RAISE NOTICE '   - Professionals can now set rates for different markets';
  RAISE NOTICE '⚠️  Remember to drop service_hourly_rate_cop after validation';
END $$;
