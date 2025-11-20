-- =====================================================
-- Migration: Rename *_cop columns to *_cents for multi-currency support
-- Purpose: Multi-country data model Phase 2.3 - Pricing & currencies
-- =====================================================
-- This migration renames all currency-specific columns (*_cop) to generic names (*_cents)
-- to support multi-currency operations across CO, PY, UY, AR markets.
-- All monetary values are stored in minor currency units (cents/centavos) for precision.

-- =====================================================
-- Part 1: balance_audit_log
-- =====================================================

ALTER TABLE balance_audit_log
  RENAME COLUMN amount_cop TO amount_cents;

ALTER TABLE balance_audit_log
  RENAME COLUMN balance_before_cop TO balance_before_cents;

ALTER TABLE balance_audit_log
  RENAME COLUMN balance_after_cop TO balance_after_cents;

COMMENT ON COLUMN balance_audit_log.amount_cents IS
  'Amount changed in minor currency units (cents/centavos). Positive for credits, negative for debits. Use with currency_code for display.';

COMMENT ON COLUMN balance_audit_log.balance_before_cents IS
  'Professional balance before this transaction in minor currency units.';

COMMENT ON COLUMN balance_audit_log.balance_after_cents IS
  'Professional balance after this transaction in minor currency units.';

-- =====================================================
-- Part 2: balance_clearance_queue
-- =====================================================

ALTER TABLE balance_clearance_queue
  RENAME COLUMN amount_cop TO amount_cents;

COMMENT ON COLUMN balance_clearance_queue.amount_cents IS
  'Amount to clear in minor currency units (cents/centavos). Use with currency_code for display.';

-- =====================================================
-- Part 3: booking_addons
-- =====================================================

ALTER TABLE booking_addons
  RENAME COLUMN addon_price_cop TO addon_price_cents;

COMMENT ON COLUMN booking_addons.addon_price_cents IS
  'Addon price in minor currency units. Currency determined by parent booking.';

-- =====================================================
-- Part 4: booking_source_analytics
-- =====================================================

ALTER TABLE booking_source_analytics
  RENAME COLUMN avg_booking_value_cop TO avg_booking_value_cents;

ALTER TABLE booking_source_analytics
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

COMMENT ON COLUMN booking_source_analytics.avg_booking_value_cents IS
  'Average booking value in minor currency units for this source.';

COMMENT ON COLUMN booking_source_analytics.total_revenue_cents IS
  'Total revenue in minor currency units for this source.';

-- =====================================================
-- Part 5: bookings
-- =====================================================

ALTER TABLE bookings
  RENAME COLUMN original_price_cop TO original_price_cents;

ALTER TABLE bookings
  RENAME COLUMN trial_credit_applied_cop TO trial_credit_applied_cents;

COMMENT ON COLUMN bookings.original_price_cents IS
  'Original price before discounts/credits in minor currency units. Use with currency column.';

COMMENT ON COLUMN bookings.trial_credit_applied_cents IS
  'Trial credit discount applied in minor currency units.';

-- =====================================================
-- Part 6: payout_batches
-- =====================================================

ALTER TABLE payout_batches
  RENAME COLUMN total_amount_cop TO total_amount_cents;

COMMENT ON COLUMN payout_batches.total_amount_cents IS
  'Total payout amount in minor currency units. Use with currency_code column.';

-- =====================================================
-- Part 7: payout_transfers
-- =====================================================

ALTER TABLE payout_transfers
  RENAME COLUMN amount_cop TO amount_cents;

ALTER TABLE payout_transfers
  RENAME COLUMN fee_amount_cop TO fee_amount_cents;

COMMENT ON COLUMN payout_transfers.amount_cents IS
  'Payout amount in minor currency units. Use with currency_code column.';

COMMENT ON COLUMN payout_transfers.fee_amount_cents IS
  'Platform fee in minor currency units.';

-- =====================================================
-- Part 8: pricing_controls
-- =====================================================

ALTER TABLE pricing_controls
  RENAME COLUMN background_check_fee_cop TO background_check_fee_cents;

ALTER TABLE pricing_controls
  RENAME COLUMN min_price_cop TO min_price_cents;

ALTER TABLE pricing_controls
  RENAME COLUMN max_price_cop TO max_price_cents;

COMMENT ON COLUMN pricing_controls.background_check_fee_cents IS
  'Background check fee in minor currency units. Country-specific pricing.';

COMMENT ON COLUMN pricing_controls.min_price_cents IS
  'Minimum service price in minor currency units for this market.';

COMMENT ON COLUMN pricing_controls.max_price_cents IS
  'Maximum service price in minor currency units for this market.';

-- =====================================================
-- Part 9: professional_performance_metrics
-- =====================================================

ALTER TABLE professional_performance_metrics
  RENAME COLUMN average_booking_value_cop TO average_booking_value_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN revenue_last_7_days_cop TO revenue_last_7_days_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN revenue_last_30_days_cop TO revenue_last_30_days_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

COMMENT ON COLUMN professional_performance_metrics.average_booking_value_cents IS
  'Average booking value in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.revenue_last_7_days_cents IS
  'Revenue in last 7 days in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.revenue_last_30_days_cents IS
  'Revenue in last 30 days in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.total_revenue_cents IS
  'Total lifetime revenue in minor currency units.';

-- =====================================================
-- Part 10: professional_profiles
-- =====================================================

ALTER TABLE professional_profiles
  RENAME COLUMN available_balance_cop TO available_balance_cents;

ALTER TABLE professional_profiles
  RENAME COLUMN pending_balance_cop TO pending_balance_cents;

ALTER TABLE professional_profiles
  RENAME COLUMN total_earnings_cop TO total_earnings_cents;

ALTER TABLE professional_profiles
  RENAME COLUMN direct_hire_fee_cop TO direct_hire_fee_cents;

COMMENT ON COLUMN professional_profiles.available_balance_cents IS
  'Available balance for withdrawal in minor currency units. Use with country_code to determine currency.';

COMMENT ON COLUMN professional_profiles.pending_balance_cents IS
  'Pending balance (not yet available) in minor currency units.';

COMMENT ON COLUMN professional_profiles.total_earnings_cents IS
  'Total lifetime earnings in minor currency units.';

COMMENT ON COLUMN professional_profiles.direct_hire_fee_cents IS
  'Direct hire fee amount in minor currency units. Varies by market.';

-- =====================================================
-- Part 11: professional_revenue_snapshots
-- =====================================================

ALTER TABLE professional_revenue_snapshots
  RENAME COLUMN average_booking_value_cop TO average_booking_value_cents;

ALTER TABLE professional_revenue_snapshots
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

COMMENT ON COLUMN professional_revenue_snapshots.average_booking_value_cents IS
  'Average booking value for this period in minor currency units.';

COMMENT ON COLUMN professional_revenue_snapshots.total_revenue_cents IS
  'Total revenue for this period in minor currency units.';

-- =====================================================
-- Part 12: professional_services
-- =====================================================

ALTER TABLE professional_services
  RENAME COLUMN base_price_cop TO base_price_cents;

COMMENT ON COLUMN professional_services.base_price_cents IS
  'Service base price in minor currency units. Use with professional country_code to determine currency.';

-- =====================================================
-- Part 13: service_addons
-- =====================================================

ALTER TABLE service_addons
  RENAME COLUMN price_cop TO price_cents;

COMMENT ON COLUMN service_addons.price_cents IS
  'Addon price in minor currency units.';

-- =====================================================
-- Part 14: service_bundles
-- =====================================================

ALTER TABLE service_bundles
  RENAME COLUMN base_price_cop TO base_price_cents;

ALTER TABLE service_bundles
  RENAME COLUMN final_price_cop TO final_price_cents;

COMMENT ON COLUMN service_bundles.base_price_cents IS
  'Bundle base price in minor currency units.';

COMMENT ON COLUMN service_bundles.final_price_cents IS
  'Bundle final price (after discounts) in minor currency units.';

-- =====================================================
-- Part 15: service_pricing_tiers
-- =====================================================

ALTER TABLE service_pricing_tiers
  RENAME COLUMN price_cop TO price_cents;

COMMENT ON COLUMN service_pricing_tiers.price_cents IS
  'Tier price in minor currency units.';

-- =====================================================
-- Part 16: trial_credits
-- =====================================================

ALTER TABLE trial_credits
  RENAME COLUMN credit_earned_cop TO credit_earned_cents;

ALTER TABLE trial_credits
  RENAME COLUMN credit_remaining_cop TO credit_remaining_cents;

ALTER TABLE trial_credits
  RENAME COLUMN credit_used_cop TO credit_used_cents;

ALTER TABLE trial_credits
  RENAME COLUMN total_bookings_value_cop TO total_bookings_value_cents;

COMMENT ON COLUMN trial_credits.credit_earned_cents IS
  'Total trial credit earned in minor currency units.';

COMMENT ON COLUMN trial_credits.credit_remaining_cents IS
  'Remaining trial credit in minor currency units.';

COMMENT ON COLUMN trial_credits.credit_used_cents IS
  'Trial credit used in minor currency units.';

COMMENT ON COLUMN trial_credits.total_bookings_value_cents IS
  'Total value of bookings made with trial credit in minor currency units.';

-- =====================================================
-- Part 17: Update function references (if any)
-- =====================================================

-- Note: If you have functions that reference these columns by name,
-- they will need to be updated in a separate migration or manually.
-- Use: SELECT routine_name FROM information_schema.routines WHERE routine_definition LIKE '%_cop%';

-- =====================================================
-- Part 18: Currency reference data
-- =====================================================

COMMENT ON DATABASE postgres IS
  'Multi-currency support: All monetary values stored in minor currency units (cents/centavos).
   - Colombia (CO): COP, 1 COP = 100 centavos
   - Paraguay (PY): PYG, 1 PYG = 100 céntimos
   - Uruguay (UY): UYU, 1 UYU = 100 centésimos
   - Argentina (AR): ARS, 1 ARS = 100 centavos

  Example conversions:
   - $50,000 COP = 5,000,000 centavos (multiply by 100)
   - ₲100,000 PYG = 10,000,000 céntimos (multiply by 100)
   - $U 2,000 UYU = 200,000 centésimos (multiply by 100)
   - $5,000 ARS = 500,000 centavos (multiply by 100)';
