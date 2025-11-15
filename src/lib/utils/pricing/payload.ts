/**
 * Pricing Rule Payload Utilities
 *
 * Data transformation logic for converting form data to database payload.
 * Handles percentage conversion, null handling, and field mapping.
 */

import type { PricingRuleFormData } from "@/types/pricing";

/**
 * Build database payload from form data
 *
 * Transforms form data (percentages as whole numbers) to database format
 * (percentages as decimals, empty strings as null, etc.)
 *
 * @param formData - Form data to transform
 * @returns Database-ready payload object
 */
export function buildPricingPayload(formData: PricingRuleFormData) {
  return {
    service_category: formData.service_category || null,
    city: formData.city || null,
    commission_rate: formData.commission_rate / 100, // 18% → 0.18
    background_check_fee_cop: formData.background_check_fee_cop,
    min_price_cop: formData.min_price_cop,
    max_price_cop: formData.max_price_cop,
    deposit_percentage: formData.deposit_percentage ? formData.deposit_percentage / 100 : null, // 20% → 0.2
    late_cancel_hours: formData.late_cancel_hours,
    late_cancel_fee_percentage: formData.late_cancel_fee_percentage / 100, // 50% → 0.5
    effective_from: formData.effective_from,
    effective_until: formData.effective_until || null,
    notes: formData.notes || null,
    is_active: true,
  };
}

/**
 * Convert percentage from whole number to decimal
 */
export function percentageToDecimal(percentage: number): number {
  return percentage / 100;
}

/**
 * Convert percentage from decimal to whole number
 */
export function decimalToPercentage(decimal: number): number {
  return decimal * 100;
}

/**
 * Convert empty string to null (for optional fields)
 */
export function emptyToNull(value: string): string | null {
  return value.trim() === "" ? null : value;
}

/**
 * Get modal footer button label based on state
 */
export function getModalFooterLabel(isLoading: boolean, isEditing: boolean): string {
  if (isLoading) {
    return "Saving...";
  }
  return isEditing ? "Save Changes" : "Create Rule";
}
