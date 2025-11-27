/**
 * Pricing Controls Service
 *
 * Data mutations for admin pricing control management
 * Extracts Supabase mutations from pricing-controls-manager.tsx component
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

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

export type ToggleResult = {
  success: boolean;
  newState?: boolean;
  error?: string;
};

export type CreateRuleInput = {
  service_category: string | null;
  city: string | null;
  country: string;
  commission_rate: number;
  background_check_fee_cop: number;
  min_price_cop?: number | null;
  max_price_cop?: number | null;
  deposit_percentage?: number | null;
  late_cancel_hours: number;
  late_cancel_fee_percentage: number;
  effective_from: string;
  effective_until?: string | null;
  notes?: string | null;
};

export type UpdateRuleInput = Partial<CreateRuleInput> & {
  is_active?: boolean;
};

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch all pricing rules
 */
export async function fetchPricingRules(supabase: SupabaseClient): Promise<PricingRule[]> {
  const { data, error } = await supabase
    .from("pricing_controls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pricing rules:", error);
    return [];
  }

  return (data || []) as PricingRule[];
}

/**
 * Fetch single pricing rule by ID
 */
export async function fetchPricingRule(
  supabase: SupabaseClient,
  ruleId: string
): Promise<PricingRule | null> {
  const { data, error } = await supabase
    .from("pricing_controls")
    .select("*")
    .eq("id", ruleId)
    .single();

  if (error) {
    console.error("Error fetching pricing rule:", error);
    return null;
  }

  return data as PricingRule;
}

/**
 * Fetch active pricing rules only
 */
export async function fetchActivePricingRules(supabase: SupabaseClient): Promise<PricingRule[]> {
  const { data, error } = await supabase
    .from("pricing_controls")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active pricing rules:", error);
    return [];
  }

  return (data || []) as PricingRule[];
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Toggle pricing rule active state
 */
export async function togglePricingRuleActive(
  supabase: SupabaseClient,
  ruleId: string,
  currentState: boolean
): Promise<ToggleResult> {
  const newState = !currentState;

  const { error } = await supabase
    .from("pricing_controls")
    .update({ is_active: newState, updated_at: new Date().toISOString() })
    .eq("id", ruleId);

  if (error) {
    console.error("Error toggling pricing rule:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    newState,
  };
}

/**
 * Create new pricing rule
 */
export async function createPricingRule(
  supabase: SupabaseClient,
  input: CreateRuleInput
): Promise<{ success: true; rule: PricingRule } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("pricing_controls")
    .insert({
      service_category: input.service_category,
      city: input.city,
      country: input.country,
      commission_rate: input.commission_rate,
      background_check_fee_cop: input.background_check_fee_cop,
      min_price_cop: input.min_price_cop,
      max_price_cop: input.max_price_cop,
      deposit_percentage: input.deposit_percentage,
      late_cancel_hours: input.late_cancel_hours,
      late_cancel_fee_percentage: input.late_cancel_fee_percentage,
      effective_from: input.effective_from,
      effective_until: input.effective_until,
      notes: input.notes,
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating pricing rule:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    rule: data as PricingRule,
  };
}

/**
 * Update existing pricing rule
 */
export async function updatePricingRule(
  supabase: SupabaseClient,
  ruleId: string,
  input: UpdateRuleInput
): Promise<{ success: true; rule: PricingRule } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("pricing_controls")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ruleId)
    .select()
    .single();

  if (error) {
    console.error("Error updating pricing rule:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    rule: data as PricingRule,
  };
}

/**
 * Delete pricing rule
 */
export async function deletePricingRule(
  supabase: SupabaseClient,
  ruleId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("pricing_controls").delete().eq("id", ruleId);

  if (error) {
    console.error("Error deleting pricing rule:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate pricing rule input
 */
export function validatePricingRuleInput(
  input: CreateRuleInput
): { valid: true } | { valid: false; error: string } {
  // Required field: country
  if (!input.country || input.country.trim().length === 0) {
    return { valid: false, error: "Country is required" };
  }

  // Validate commission rate (0-100%)
  if (input.commission_rate < 0 || input.commission_rate > 100) {
    return { valid: false, error: "Commission rate must be between 0 and 100" };
  }

  // Validate background check fee (non-negative)
  if (input.background_check_fee_cop < 0) {
    return { valid: false, error: "Background check fee must be non-negative" };
  }

  // Validate late cancel hours (non-negative)
  if (input.late_cancel_hours < 0) {
    return { valid: false, error: "Late cancel hours must be non-negative" };
  }

  // Validate late cancel fee percentage (0-100%)
  if (input.late_cancel_fee_percentage < 0 || input.late_cancel_fee_percentage > 100) {
    return { valid: false, error: "Late cancel fee percentage must be between 0 and 100" };
  }

  // Validate deposit percentage if provided (0-100%)
  if (
    input.deposit_percentage !== undefined &&
    input.deposit_percentage !== null &&
    (input.deposit_percentage < 0 || input.deposit_percentage > 100)
  ) {
    return { valid: false, error: "Deposit percentage must be between 0 and 100" };
  }

  // Validate price range if both provided
  if (
    input.min_price_cop !== undefined &&
    input.min_price_cop !== null &&
    input.max_price_cop !== undefined &&
    input.max_price_cop !== null &&
    input.min_price_cop > input.max_price_cop
  ) {
    return { valid: false, error: "Minimum price cannot be greater than maximum price" };
  }

  // Validate effective date range if end date provided
  if (input.effective_until) {
    if (new Date(input.effective_from) > new Date(input.effective_until)) {
      return { valid: false, error: "Effective from date must be before effective until date" };
    }
  }

  return { valid: true };
}
