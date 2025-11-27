/**
 * Pricing Rule Validation Utilities
 *
 * Form validation logic for pricing rule creation/editing.
 * Ensures data integrity before submission to database.
 */

import type { PricingRuleFormData } from "@/types/pricing";

/**
 * Validate pricing rule form data
 *
 * @param formData - Form data to validate
 * @returns Error message string if validation fails, null if valid
 */
export function validatePricingRuleForm(formData: PricingRuleFormData): string | null {
  // Commission rate must be between 10% and 30%
  if (formData.commission_rate < 10 || formData.commission_rate > 30) {
    return "Commission rate must be between 10% and 30%";
  }

  // Min price cannot exceed max price (if both are set)
  if (
    formData.min_price_cop !== null &&
    formData.max_price_cop !== null &&
    formData.min_price_cop > formData.max_price_cop
  ) {
    return "Minimum price cannot exceed maximum price";
  }

  // Deposit percentage must be between 0% and 100% (if set)
  if (
    formData.deposit_percentage !== null &&
    (formData.deposit_percentage < 0 || formData.deposit_percentage > 100)
  ) {
    return "Deposit percentage must be between 0% and 100%";
  }

  // Late cancel hours must be positive
  if (formData.late_cancel_hours < 0) {
    return "Late cancellation hours must be positive";
  }

  // Late cancel fee percentage must be between 0% and 100%
  if (formData.late_cancel_fee_percentage < 0 || formData.late_cancel_fee_percentage > 100) {
    return "Late cancellation fee must be between 0% and 100%";
  }

  return null;
}

/**
 * Validate commission rate (10-30%)
 */
function validateCommissionRate(rate: number): boolean {
  return rate >= 10 && rate <= 30;
}

/**
 * Validate deposit percentage (0-100%)
 */
function validateDepositPercentage(percentage: number | null): boolean {
  if (percentage === null) {
    return true;
  }
  return percentage >= 0 && percentage <= 100;
}

/**
 * Validate price range (min <= max)
 */
function validatePriceRange(min: number | null, max: number | null): boolean {
  if (min === null || max === null) {
    return true;
  }
  return min <= max;
}
