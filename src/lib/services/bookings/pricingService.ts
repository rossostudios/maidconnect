// Booking pricing calculation service - extracts pricing logic from server actions

import type { SupabaseClient } from "@supabase/supabase-js";

export type PricingData = {
  basePrice: number;
  tierPrice: number;
  addonsPrice: number;
  totalPrice: number;
};

type PricingCalculationResult =
  | { success: true; pricing: PricingData }
  | { success: false; error: string };

/**
 * Fetch base service price from database (never trust client input)
 */
async function fetchServicePrice(
  supabase: SupabaseClient,
  serviceId: string
): Promise<{ success: true; price: number } | { success: false; error: string }> {
  const { data: service, error } = await supabase
    .from("professional_services")
    .select("base_price_cop")
    .eq("id", serviceId)
    .single();

  if (error || !service) {
    return { success: false, error: "Service not found" };
  }

  return { success: true, price: service.base_price_cop };
}

/**
 * Fetch tier price from database if tier is selected
 */
async function fetchTierPrice(
  supabase: SupabaseClient,
  tierId: string | null | undefined
): Promise<{ success: true; price: number } | { success: false; error: string }> {
  if (!tierId) {
    return { success: true, price: 0 };
  }

  const { data: tier, error } = await supabase
    .from("service_pricing_tiers")
    .select("price_cop")
    .eq("id", tierId)
    .single();

  if (error || !tier) {
    return { success: false, error: "Pricing tier not found" };
  }

  return { success: true, price: tier.price_cop };
}

/**
 * Calculate total addons price from database
 */
async function fetchAddonsPrice(
  supabase: SupabaseClient,
  addonIds: string[] | null | undefined
): Promise<number> {
  if (!addonIds || addonIds.length === 0) {
    return 0;
  }

  const { data: addons } = await supabase
    .from("service_addons")
    .select("price_cop")
    .in("id", addonIds);

  if (!addons || addons.length === 0) {
    return 0;
  }

  return addons.reduce((sum, addon) => sum + addon.price_cop, 0);
}

/**
 * Calculate complete booking pricing from database (server-side validation)
 * This ensures pricing integrity by never trusting client input
 */
export async function calculateBookingPricing(
  supabase: SupabaseClient,
  serviceId: string,
  pricingTierId: string | null | undefined,
  addonIds: string[] | null | undefined
): Promise<PricingCalculationResult> {
  // Fetch service base price
  const servicePriceResult = await fetchServicePrice(supabase, serviceId);
  if (!servicePriceResult.success) {
    return { success: false, error: servicePriceResult.error };
  }

  // Fetch tier price (if applicable)
  const tierPriceResult = await fetchTierPrice(supabase, pricingTierId);
  if (!tierPriceResult.success) {
    return { success: false, error: tierPriceResult.error };
  }

  // Fetch and calculate addons price
  const addonsPrice = await fetchAddonsPrice(supabase, addonIds);

  // Calculate total price from server-side data
  const pricing: PricingData = {
    basePrice: servicePriceResult.price,
    tierPrice: tierPriceResult.price,
    addonsPrice,
    totalPrice: servicePriceResult.price + tierPriceResult.price + addonsPrice,
  };

  return { success: true, pricing };
}

/**
 * Direct Hire Fee Types
 */
export type DirectHireFeeData = {
  feeCOP: number;
  feeUSD: number;
  professionalName: string;
  professionalId: string;
};

type DirectHireFeeResult =
  | { success: true; feeData: DirectHireFeeData }
  | { success: false; error: string };

/**
 * Fetch direct hire fee for a professional (server-side only, never trust client)
 * Default fee: 2,000,000 COP (~$500 USD at ~4,000 COP/USD)
 */
export async function calculateDirectHireFee(
  supabase: SupabaseClient,
  professionalId: string
): Promise<DirectHireFeeResult> {
  // Fetch professional profile with direct hire fee
  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("direct_hire_fee_cop, full_name, profile_id")
    .eq("profile_id", professionalId)
    .single();

  if (error || !profile) {
    return { success: false, error: "Professional profile not found" };
  }

  const feeCOP = profile.direct_hire_fee_cop ?? 2000000; // Default 2M COP
  const feeUSD = Math.round(feeCOP / 4000); // Approximate USD conversion

  return {
    success: true,
    feeData: {
      feeCOP,
      feeUSD,
      professionalName: profile.full_name ?? "Professional",
      professionalId: profile.profile_id,
    },
  };
}

/**
 * Verify if a professional has direct hire enabled
 */
export async function isDirectHireEnabled(
  supabase: SupabaseClient,
  professionalId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("direct_hire_fee_cop")
    .eq("profile_id", professionalId)
    .single();

  // Direct hire is enabled if fee is set and greater than 0
  return (profile?.direct_hire_fee_cop ?? 0) > 0;
}
