-- =====================================================
-- Migration: Fix payout tables for multi-currency support
-- Purpose: Multi-country data model Phase 3
-- =====================================================
-- This migration renames COP-specific columns to currency-agnostic names
-- and adds country/currency tracking for multi-market payouts.

-- =====================================================
-- Part 1: professional_profiles balance columns
-- =====================================================

-- Add new currency-agnostic columns
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS available_balance_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_earnings_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS direct_hire_fee_cents integer;

-- Backfill from COP columns
UPDATE professional_profiles
SET
  available_balance_cents = COALESCE(available_balance_cop, 0),
  pending_balance_cents = COALESCE(pending_balance_cop, 0),
  total_earnings_cents = COALESCE(total_earnings_cop, 0),
  direct_hire_fee_cents = COALESCE(direct_hire_fee_cop, 1196000)
WHERE
  available_balance_cents IS NULL
  OR pending_balance_cents IS NULL
  OR total_earnings_cents IS NULL
  OR direct_hire_fee_cents IS NULL;

-- Make new columns NOT NULL
ALTER TABLE professional_profiles
  ALTER COLUMN available_balance_cents SET NOT NULL,
  ALTER COLUMN pending_balance_cents SET NOT NULL,
  ALTER COLUMN total_earnings_cents SET NOT NULL,
  ALTER COLUMN direct_hire_fee_cents SET NOT NULL;

-- Add check constraints
ALTER TABLE professional_profiles
  DROP CONSTRAINT IF EXISTS professional_profiles_available_balance_cop_check,
  DROP CONSTRAINT IF EXISTS professional_profiles_pending_balance_cop_check,
  ADD CONSTRAINT professional_profiles_available_balance_cents_check
    CHECK (available_balance_cents >= 0),
  ADD CONSTRAINT professional_profiles_pending_balance_cents_check
    CHECK (pending_balance_cents >= 0),
  ADD CONSTRAINT professional_profiles_total_earnings_cents_check
    CHECK (total_earnings_cents >= 0);

-- Drop old COP columns (after validation)
-- NOTE: Commented out for safety - uncomment after validating migration
-- ALTER TABLE professional_profiles
--   DROP COLUMN IF EXISTS available_balance_cop,
--   DROP COLUMN IF EXISTS pending_balance_cop,
--   DROP COLUMN IF EXISTS total_earnings_cop,
--   DROP COLUMN IF EXISTS direct_hire_fee_cop;

-- Add comments
COMMENT ON COLUMN professional_profiles.available_balance_cents IS
  'Available balance in currency minor units (cents). Currency determined by country_code.';

COMMENT ON COLUMN professional_profiles.pending_balance_cents IS
  'Pending balance in currency minor units (cents). Currency determined by country_code.';

COMMENT ON COLUMN professional_profiles.total_earnings_cents IS
  'Lifetime earnings in currency minor units (cents). Currency determined by country_code.';

COMMENT ON COLUMN professional_profiles.direct_hire_fee_cents IS
  'Direct hire fee in currency minor units (cents). Currency determined by country_code.';

-- =====================================================
-- Part 2: bookings trial credit columns
-- =====================================================

-- Add new currency-agnostic columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS trial_credit_applied_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_price_cents bigint;

-- Backfill from COP columns
UPDATE bookings
SET
  trial_credit_applied_cents = COALESCE(trial_credit_applied_cop, 0),
  original_price_cents = original_price_cop
WHERE
  trial_credit_applied_cents IS NULL
  OR (original_price_cop IS NOT NULL AND original_price_cents IS NULL);

-- Make trial_credit_applied_cents NOT NULL
ALTER TABLE bookings
  ALTER COLUMN trial_credit_applied_cents SET NOT NULL;

-- Drop old COP columns (after validation)
-- NOTE: Commented out for safety - uncomment after validating migration
-- ALTER TABLE bookings
--   DROP COLUMN IF EXISTS trial_credit_applied_cop,
--   DROP COLUMN IF EXISTS original_price_cop;

-- Add comments
COMMENT ON COLUMN bookings.trial_credit_applied_cents IS
  'Trial credit applied to this booking in currency minor units (cents). Currency matches country_code.';

COMMENT ON COLUMN bookings.original_price_cents IS
  'Original price before trial credit in currency minor units (cents). Currency matches country_code.';

-- =====================================================
-- Part 3: payout_batches
-- =====================================================

-- Add new columns
ALTER TABLE payout_batches
  ADD COLUMN IF NOT EXISTS total_amount_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS currency_code text;

-- Backfill total_amount_cents from total_amount_cop
UPDATE payout_batches
SET
  total_amount_cents = COALESCE(total_amount_cop, 0),
  country_code = 'CO',  -- All existing batches are Colombian
  currency_code = 'COP'
WHERE total_amount_cents IS NULL;

-- Make columns NOT NULL
ALTER TABLE payout_batches
  ALTER COLUMN total_amount_cents SET NOT NULL,
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN currency_code SET NOT NULL;

-- Add FK constraint to countries
ALTER TABLE payout_batches
  ADD CONSTRAINT payout_batches_country_code_fkey
    FOREIGN KEY (country_code)
    REFERENCES countries(code)
    ON DELETE RESTRICT;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_payout_batches_country_code
  ON payout_batches(country_code);

-- Drop old COP column (after validation)
-- ALTER TABLE payout_batches DROP COLUMN IF EXISTS total_amount_cop;

-- Add comments
COMMENT ON COLUMN payout_batches.total_amount_cents IS
  'Total amount in currency minor units (cents). Currency determined by currency_code.';

COMMENT ON COLUMN payout_batches.country_code IS
  'ISO 3166-1 alpha-2 country code (CO, PY, UY, AR). Determines batch market.';

COMMENT ON COLUMN payout_batches.currency_code IS
  'ISO 4217 currency code (COP, PYG, UYU, ARS). Must match country_code.';

-- =====================================================
-- Part 4: payout_transfers
-- =====================================================

-- Add new columns
ALTER TABLE payout_transfers
  ADD COLUMN IF NOT EXISTS amount_cents bigint,
  ADD COLUMN IF NOT EXISTS fee_amount_cents bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS currency_code text;

-- Backfill from professional's country via booking
UPDATE payout_transfers pt
SET
  amount_cents = pt.amount_cop,
  fee_amount_cents = COALESCE(pt.fee_amount_cop, 0),
  country_code = b.country_code,
  currency_code = b.currency
FROM bookings b
WHERE
  pt.booking_id = b.id
  AND pt.amount_cents IS NULL;

-- Make columns NOT NULL
ALTER TABLE payout_transfers
  ALTER COLUMN amount_cents SET NOT NULL,
  ALTER COLUMN fee_amount_cents SET NOT NULL,
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN currency_code SET NOT NULL;

-- Add FK constraint to countries
ALTER TABLE payout_transfers
  ADD CONSTRAINT payout_transfers_country_code_fkey
    FOREIGN KEY (country_code)
    REFERENCES countries(code)
    ON DELETE RESTRICT;

-- Update check constraints
ALTER TABLE payout_transfers
  DROP CONSTRAINT IF EXISTS payout_transfers_fee_amount_cop_check,
  ADD CONSTRAINT payout_transfers_amount_cents_check
    CHECK (amount_cents > 0),
  ADD CONSTRAINT payout_transfers_fee_amount_cents_check
    CHECK (fee_amount_cents >= 0);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_payout_transfers_country_code
  ON payout_transfers(country_code);

-- Drop old COP columns (after validation)
-- ALTER TABLE payout_transfers
--   DROP COLUMN IF EXISTS amount_cop,
--   DROP COLUMN IF EXISTS fee_amount_cop;

-- Add comments
COMMENT ON COLUMN payout_transfers.amount_cents IS
  'Payout amount in currency minor units (cents). Currency determined by currency_code.';

COMMENT ON COLUMN payout_transfers.fee_amount_cents IS
  'Fee charged for instant payout in currency minor units (cents). Zero for batch payouts.';

COMMENT ON COLUMN payout_transfers.country_code IS
  'ISO 3166-1 alpha-2 country code (CO, PY, UY, AR). Inherited from booking.';

COMMENT ON COLUMN payout_transfers.currency_code IS
  'ISO 4217 currency code (COP, PYG, UYU, ARS). Must match country_code and booking.';

-- =====================================================
-- Part 5: Cross-table currency validation
-- =====================================================

-- Ensure payout_batches currency matches country
ALTER TABLE payout_batches
  ADD CONSTRAINT payout_batches_currency_country_match_check
    CHECK (
      (country_code = 'CO' AND currency_code = 'COP') OR
      (country_code = 'PY' AND currency_code = 'PYG') OR
      (country_code = 'UY' AND currency_code = 'UYU') OR
      (country_code = 'AR' AND currency_code = 'ARS')
    );

-- Ensure payout_transfers currency matches country
ALTER TABLE payout_transfers
  ADD CONSTRAINT payout_transfers_currency_country_match_check
    CHECK (
      (country_code = 'CO' AND currency_code = 'COP') OR
      (country_code = 'PY' AND currency_code = 'PYG') OR
      (country_code = 'UY' AND currency_code = 'UYU') OR
      (country_code = 'AR' AND currency_code = 'ARS')
    );
