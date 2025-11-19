/**
 * Pricing Types & Constants
 *
 * Centralized type definitions and constants for pricing rules management.
 * Used across admin pricing controls, validation, and data transformation.
 */

/**
 * Database pricing rule entity
 */
export type PricingRule = {
  id: string;
  service_category: string | null;
  city: string | null;
  country: string;
  commission_rate: number;
  background_check_fee_cop: number;
  min_price_cop: number | null;
  max_price_cop: number | null;
  deposit_percentage: number | null;
  late_cancel_hours: number;
  late_cancel_fee_percentage: number;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

/**
 * Form data structure for creating/editing pricing rules
 */
export type PricingRuleFormData = {
  service_category: string;
  city: string;
  commission_rate: number;
  background_check_fee_cop: number;
  min_price_cop: number | null;
  max_price_cop: number | null;
  deposit_percentage: number | null;
  late_cancel_hours: number;
  late_cancel_fee_percentage: number;
  effective_from: string;
  effective_until: string;
  notes: string;
};

/**
 * Field update helper type for form state management
 */
export type FieldUpdateFn = <K extends keyof PricingRuleFormData>(
  field: K,
  value: PricingRuleFormData[K]
) => void;

/**
 * Available service categories for pricing rules
 */
export const SERVICE_CATEGORIES = [
  "cleaning",
  "cooking",
  "childcare",
  "elderly_care",
  "pet_care",
  "gardening",
  "laundry",
] as const;

/**
 * Service category type (union of all possible values)
 */
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/**
 * Available cities for pricing rules
 * @deprecated Import from @/lib/shared/config/territories instead
 * This is kept for backward compatibility but now sources from centralized config
 */
export { CITIES } from "@/lib/shared/config/territories";

/**
 * City type (union of all possible values)
 */
export type City = (typeof CITIES)[number];

/**
 * Pricing rule scope (for display/filtering)
 */
export type PricingRuleScope = {
  category: string | null;
  city: string | null;
};

/**
 * Form validation error structure
 */
export type PricingRuleValidationErrors = {
  commission_rate?: string;
  background_check_fee_cop?: string;
  min_price_cop?: string;
  max_price_cop?: string;
  deposit_percentage?: string;
  late_cancel_hours?: string;
  late_cancel_fee_percentage?: string;
  effective_from?: string;
  effective_until?: string;
};
