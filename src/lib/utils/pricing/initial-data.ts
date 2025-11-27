/**
 * Pricing Rule Initial Data Utilities
 *
 * Default values and initial state creation for pricing rule forms.
 * Handles both creating new rules and editing existing ones.
 */

import type { PricingRule, PricingRuleFormData } from "@/types/pricing";

/**
 * Default values for new pricing rules
 */
export const DEFAULT_VALUES = {
  commission_rate: 18, // 18%
  background_check_fee_cop: 0,
  late_cancel_hours: 24,
  late_cancel_fee_percentage: 50, // 50%
} as const;

/**
 * Create initial form data from existing rule or defaults
 *
 * Converts database format (decimals) to form format (whole numbers for percentages).
 * If rule is null, returns default values for creating a new rule.
 *
 * @param rule - Existing pricing rule to edit, or null for new rule
 * @returns Form data with initial values
 */
export function createInitialFormData(rule: PricingRule | null): PricingRuleFormData {
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0]!;

  return {
    service_category: rule?.service_category || "",
    city: rule?.city || "",
    commission_rate: rule ? rule.commission_rate * 100 : DEFAULT_VALUES.commission_rate, // 0.18 → 18%
    background_check_fee_cop:
      rule?.background_check_fee_cop || DEFAULT_VALUES.background_check_fee_cop,
    min_price_cop: rule?.min_price_cop ?? null,
    max_price_cop: rule?.max_price_cop ?? null,
    deposit_percentage: rule?.deposit_percentage ? rule.deposit_percentage * 100 : null, // 0.2 → 20%
    late_cancel_hours: rule?.late_cancel_hours || DEFAULT_VALUES.late_cancel_hours,
    late_cancel_fee_percentage: rule
      ? rule.late_cancel_fee_percentage * 100
      : DEFAULT_VALUES.late_cancel_fee_percentage, // 0.5 → 50%
    effective_from: rule?.effective_from || today,
    effective_until: rule?.effective_until || "",
    notes: rule?.notes || "",
  };
}

/**
 * Get default effective start date (today)
 */
function getDefaultEffectiveDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

/**
 * Check if rule is currently effective (within date range and active)
 */
function isRuleEffective(rule: PricingRule): boolean {
  if (!rule.is_active) {
    return false;
  }

  const now = new Date();
  const effectiveFrom = new Date(rule.effective_from);

  if (now < effectiveFrom) {
    return false;
  }

  if (rule.effective_until) {
    const effectiveUntil = new Date(rule.effective_until);
    if (now > effectiveUntil) {
      return false;
    }
  }

  return true;
}
