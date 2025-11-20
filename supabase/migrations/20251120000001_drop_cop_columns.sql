-- =====================================================
-- Migration: Drop legacy _cop currency columns
-- Purpose: Complete multi-currency migration by removing Colombia-specific columns
-- =====================================================
-- After validating the new _cents + currency_code columns work correctly,
-- we can safely remove the old _cop columns that were specific to Colombia.
--
-- Tables affected:
-- - professional_profiles (balances, earnings, direct hire fee)
-- - bookings (trial credits, original price)
-- - payout_batches (total amount)
-- - payout_transfers (amount, fee)
-- - professional_services (hourly rate)
--
-- ⚠️ IMPORTANT: Only run this migration AFTER verifying:
-- 1. All _cents columns are populated correctly
-- 2. All currency_code columns are set
-- 3. Application code is using the new columns
-- 4. No queries reference _cop columns
-- =====================================================

-- =====================================================
-- Part 0: Update triggers to use new column names
-- =====================================================

-- Drop old trigger that references _cop columns
DROP TRIGGER IF EXISTS trigger_log_balance_changes ON professional_profiles;

-- Recreate trigger with new _cents column names
CREATE OR REPLACE TRIGGER trigger_log_balance_changes
  AFTER UPDATE OF pending_balance_cents, available_balance_cents
  ON professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_balance_change();

-- =====================================================
-- Part 1: Drop _cop columns from professional_profiles
-- =====================================================

-- Drop balance columns (replaced by _cents + currency_code)
ALTER TABLE professional_profiles
  DROP COLUMN IF EXISTS available_balance_cop,
  DROP COLUMN IF EXISTS pending_balance_cop,
  DROP COLUMN IF EXISTS total_earnings_cop,
  DROP COLUMN IF EXISTS direct_hire_fee_cop;

COMMENT ON TABLE professional_profiles IS
  'Professional profile data. All monetary amounts now use _cents columns with currency_code for multi-currency support.';

-- =====================================================
-- Part 2: Drop _cop columns from bookings
-- =====================================================

-- Drop trial credit and pricing columns (replaced by _cents + currency_code)
ALTER TABLE bookings
  DROP COLUMN IF EXISTS trial_credit_applied_cop,
  DROP COLUMN IF EXISTS original_price_cop;

COMMENT ON TABLE bookings IS
  'Booking records. All monetary amounts now use _cents columns with currency_code for multi-currency support.';

-- =====================================================
-- Part 3: Drop _cop columns from payout_batches
-- =====================================================

-- Drop total amount column (replaced by total_amount_cents + currency_code)
ALTER TABLE payout_batches
  DROP COLUMN IF EXISTS total_amount_cop;

COMMENT ON TABLE payout_batches IS
  'Payout batch tracking. All monetary amounts now use _cents columns with currency_code for multi-currency support.';

-- =====================================================
-- Part 4: Drop _cop columns from payout_transfers
-- =====================================================

-- Drop amount and fee columns (replaced by _cents + currency_code)
ALTER TABLE payout_transfers
  DROP COLUMN IF EXISTS amount_cop,
  DROP COLUMN IF EXISTS fee_amount_cop;

COMMENT ON TABLE payout_transfers IS
  'Individual payout transfers. All monetary amounts now use _cents columns with currency_code for multi-currency support.';

-- =====================================================
-- Part 5: Drop _cop columns from professional_services
-- =====================================================

-- Drop hourly rate column (replaced by service_hourly_rate_cents + currency_code)
ALTER TABLE professional_services
  DROP COLUMN IF EXISTS service_hourly_rate_cop;

COMMENT ON TABLE professional_services IS
  'Professional service offerings. All monetary amounts now use _cents columns with currency_code for multi-currency support.';

-- =====================================================
-- Success message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: All legacy _cop columns removed';
  RAISE NOTICE '   - professional_profiles: available_balance_cop, pending_balance_cop, total_earnings_cop, direct_hire_fee_cop';
  RAISE NOTICE '   - bookings: trial_credit_applied_cop, original_price_cop';
  RAISE NOTICE '   - payout_batches: total_amount_cop';
  RAISE NOTICE '   - payout_transfers: amount_cop, fee_amount_cop';
  RAISE NOTICE '   - professional_services: service_hourly_rate_cop';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Multi-currency migration complete! All tables now use _cents + currency_code';
  RAISE NOTICE '   Supported currencies: COP, PYG, UYU, ARS';
END $$;
