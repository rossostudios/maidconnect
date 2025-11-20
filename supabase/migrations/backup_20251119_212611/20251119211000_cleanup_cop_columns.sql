-- =====================================================
-- Migration: Clean up *_cop columns and rename remaining ones
-- Purpose: Multi-country data model Phase 2.3 - Complete currency migration
-- =====================================================
-- Previous migration (20251119190656) added *_cents columns alongside *_cop.
-- This migration:
-- 1. Drops old *_cop columns where *_cents equivalents exist
-- 2. Renames remaining *_cop columns to *_cents
-- 3. Ensures all monetary values are currency-agnostic

-- =====================================================
-- Part 1: Drop duplicate *_cop columns (where *_cents exists)
-- =====================================================

-- Drop professional_profiles COP columns
ALTER TABLE professional_profiles
  DROP COLUMN IF EXISTS available_balance_cop,
  DROP COLUMN IF EXISTS pending_balance_cop,
  DROP COLUMN IF EXISTS total_earnings_cop,
  DROP COLUMN IF EXISTS direct_hire_fee_cop;

-- Drop bookings COP columns
ALTER TABLE bookings
  DROP COLUMN IF EXISTS trial_credit_applied_cop,
  DROP COLUMN IF EXISTS original_price_cop;

-- Drop payout_batches COP column
ALTER TABLE payout_batches
  DROP COLUMN IF EXISTS total_amount_cop;

-- Drop payout_transfers COP columns
ALTER TABLE payout_transfers
  DROP COLUMN IF EXISTS amount_cop,
  DROP COLUMN IF EXISTS fee_amount_cop;

-- =====================================================
-- Part 2: Rename remaining *_cop columns to *_cents
-- =====================================================

-- balance_audit_log
ALTER TABLE balance_audit_log
  RENAME COLUMN amount_cop TO amount_cents;

ALTER TABLE balance_audit_log
  RENAME COLUMN balance_before_cop TO balance_before_cents;

ALTER TABLE balance_audit_log
  RENAME COLUMN balance_after_cop TO balance_after_cents;

-- balance_clearance_queue
ALTER TABLE balance_clearance_queue
  RENAME COLUMN amount_cop TO amount_cents;

-- booking_addons
ALTER TABLE booking_addons
  RENAME COLUMN addon_price_cop TO addon_price_cents;

-- booking_source_analytics
ALTER TABLE booking_source_analytics
  RENAME COLUMN avg_booking_value_cop TO avg_booking_value_cents;

ALTER TABLE booking_source_analytics
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

-- pricing_controls
ALTER TABLE pricing_controls
  RENAME COLUMN background_check_fee_cop TO background_check_fee_cents;

ALTER TABLE pricing_controls
  RENAME COLUMN min_price_cop TO min_price_cents;

ALTER TABLE pricing_controls
  RENAME COLUMN max_price_cop TO max_price_cents;

-- professional_performance_metrics
ALTER TABLE professional_performance_metrics
  RENAME COLUMN average_booking_value_cop TO average_booking_value_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN revenue_last_7_days_cop TO revenue_last_7_days_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN revenue_last_30_days_cop TO revenue_last_30_days_cents;

ALTER TABLE professional_performance_metrics
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

-- professional_revenue_snapshots
ALTER TABLE professional_revenue_snapshots
  RENAME COLUMN average_booking_value_cop TO average_booking_value_cents;

ALTER TABLE professional_revenue_snapshots
  RENAME COLUMN total_revenue_cop TO total_revenue_cents;

-- professional_services
ALTER TABLE professional_services
  RENAME COLUMN base_price_cop TO base_price_cents;

-- service_addons
ALTER TABLE service_addons
  RENAME COLUMN price_cop TO price_cents;

-- service_bundles
ALTER TABLE service_bundles
  RENAME COLUMN base_price_cop TO base_price_cents;

ALTER TABLE service_bundles
  RENAME COLUMN final_price_cop TO final_price_cents;

-- service_pricing_tiers
ALTER TABLE service_pricing_tiers
  RENAME COLUMN price_cop TO price_cents;

-- trial_credits
ALTER TABLE trial_credits
  RENAME COLUMN credit_earned_cop TO credit_earned_cents;

ALTER TABLE trial_credits
  RENAME COLUMN credit_remaining_cop TO credit_remaining_cents;

ALTER TABLE trial_credits
  RENAME COLUMN credit_used_cop TO credit_used_cents;

ALTER TABLE trial_credits
  RENAME COLUMN total_bookings_value_cop TO total_bookings_value_cents;

-- =====================================================
-- Part 3: Add column comments for all renamed columns
-- =====================================================

COMMENT ON COLUMN balance_audit_log.amount_cents IS
  'Amount changed in minor currency units. Currency determined by professional country_code.';

COMMENT ON COLUMN balance_clearance_queue.amount_cents IS
  'Amount to clear in minor currency units. Currency determined by professional country_code.';

COMMENT ON COLUMN booking_addons.addon_price_cents IS
  'Addon price in minor currency units. Currency from parent booking.';

COMMENT ON COLUMN booking_source_analytics.avg_booking_value_cents IS
  'Average booking value in minor currency units for this source.';

COMMENT ON COLUMN booking_source_analytics.total_revenue_cents IS
  'Total revenue in minor currency units for this source.';

COMMENT ON COLUMN pricing_controls.background_check_fee_cents IS
  'Background check fee in minor currency units. Country-specific.';

COMMENT ON COLUMN pricing_controls.min_price_cents IS
  'Minimum service price in minor currency units for this market.';

COMMENT ON COLUMN pricing_controls.max_price_cents IS
  'Maximum service price in minor currency units for this market.';

COMMENT ON COLUMN professional_performance_metrics.average_booking_value_cents IS
  'Average booking value in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.revenue_last_7_days_cents IS
  'Revenue in last 7 days in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.revenue_last_30_days_cents IS
  'Revenue in last 30 days in minor currency units.';

COMMENT ON COLUMN professional_performance_metrics.total_revenue_cents IS
  'Total lifetime revenue in minor currency units.';

COMMENT ON COLUMN professional_revenue_snapshots.average_booking_value_cents IS
  'Average booking value for this period in minor currency units.';

COMMENT ON COLUMN professional_revenue_snapshots.total_revenue_cents IS
  'Total revenue for this period in minor currency units.';

COMMENT ON COLUMN professional_services.base_price_cents IS
  'Service base price in minor currency units. Currency from professional country_code.';

COMMENT ON COLUMN service_addons.price_cents IS
  'Addon price in minor currency units.';

COMMENT ON COLUMN service_bundles.base_price_cents IS
  'Bundle base price in minor currency units.';

COMMENT ON COLUMN service_bundles.final_price_cents IS
  'Bundle final price (after discounts) in minor currency units.';

COMMENT ON COLUMN service_pricing_tiers.price_cents IS
  'Tier price in minor currency units.';

COMMENT ON COLUMN trial_credits.credit_earned_cents IS
  'Total trial credit earned in minor currency units.';

COMMENT ON COLUMN trial_credits.credit_remaining_cents IS
  'Remaining trial credit in minor currency units.';

COMMENT ON COLUMN trial_credits.credit_used_cents IS
  'Trial credit used in minor currency units.';

COMMENT ON COLUMN trial_credits.total_bookings_value_cents IS
  'Total value of bookings made with trial credit in minor currency units.';
