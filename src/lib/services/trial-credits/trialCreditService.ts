/**
 * Trial Credit Service
 *
 * Manages trial credit system for Direct Hire conversion.
 * Strategy: Offer 50% credit on completed bookings (up to 3) toward $299 direct hire fee.
 * Goal: De-risk the placement fee and gamify gig-to-employee transition.
 *
 * Key Rules:
 * - Credit = 50% of total completed booking fees
 * - Capped at 50% of direct hire fee (~$150 USD / 598,000 COP)
 * - Per-professional scope (separate credits with different pros)
 * - Any booking source counts (Amara, web, etc.)
 * - Partial credit allowed (can direct hire after 1, 2, or 3 bookings)
 *
 * @module services/trial-credits
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// =====================================================
// Types
// =====================================================

export type TrialCreditInfo = {
  /** Whether customer has available credit */
  hasCredit: boolean;
  /** Available credit amount in COP cents */
  creditAvailableCOP: number;
  /** Available credit amount in USD */
  creditAvailableUSD: number;
  /** Number of completed bookings with this professional */
  bookingsCompleted: number;
  /** Total value of all completed bookings in COP cents */
  totalBookingsValueCOP: number;
  /** Maximum credit allowed (50% of direct hire fee) */
  maxCreditCOP: number;
  /** Percentage of max credit earned (0-100) */
  percentageEarned: number;
};

export type AppliedCreditResult = {
  /** Final price after discount in COP cents */
  finalPriceCOP: number;
  /** Discount amount applied in COP cents */
  discountAppliedCOP: number;
  /** Remaining credit after application in COP cents */
  creditRemainingCOP: number;
};

export type CustomerTrialCreditSummary = TrialCreditInfo & {
  professionalId: string;
  professionalName: string | null;
};

// =====================================================
// Constants
// =====================================================

const DEFAULT_DIRECT_HIRE_FEE_COP = 1_196_000; // $299 USD at 4,000 COP/USD
const COP_TO_USD_EXCHANGE_RATE = 4000;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Converts COP cents to USD (rounded)
 * @param copCents - Amount in COP cents
 * @returns Amount in USD (rounded to nearest dollar)
 */
function copCentsToUSD(copCents: number): number {
  return Math.round(copCents / COP_TO_USD_EXCHANGE_RATE);
}

/**
 * Calculate maximum allowed credit (50% of direct hire fee)
 * @param directHireFeeCOP - Direct hire fee in COP cents
 * @returns Maximum credit in COP cents
 */
function calculateMaxCredit(directHireFeeCOP: number): number {
  return Math.round(directHireFeeCOP * 0.5);
}

// =====================================================
// Public API
// =====================================================

/**
 * Get trial credit information for a customer-professional pair
 *
 * IMPORTANT: This is a server-side function. Never trust client-side credit calculations.
 *
 * @param supabase - Supabase client with proper auth context
 * @param customerId - Customer's profile ID
 * @param professionalId - Professional's profile ID
 * @returns Trial credit information
 *
 * @example
 * const creditInfo = await getTrialCreditInfo(supabase, 'customer-uuid', 'pro-uuid');
 * if (creditInfo.hasCredit) {
 *   console.log(`You have $${creditInfo.creditAvailableUSD} credit available!`);
 * }
 */
export async function getTrialCreditInfo(
  supabase: SupabaseClient<Database>,
  customerId: string,
  professionalId: string
): Promise<TrialCreditInfo> {
  // Call database function (uses SQL logic from migration)
  const { data, error } = await supabase.rpc("get_trial_credit_info", {
    p_customer_id: customerId,
    p_professional_id: professionalId,
  });

  if (error) {
    console.error("[trialCreditService] Error fetching credit info:", error);
    // Return empty state on error (fail gracefully)
    return {
      hasCredit: false,
      creditAvailableCOP: 0,
      creditAvailableUSD: 0,
      bookingsCompleted: 0,
      totalBookingsValueCOP: 0,
      maxCreditCOP: 0,
      percentageEarned: 0,
    };
  }

  // Database function returns array with single result
  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    // No credit record exists yet
    const defaultMaxCredit = calculateMaxCredit(DEFAULT_DIRECT_HIRE_FEE_COP);
    return {
      hasCredit: false,
      creditAvailableCOP: 0,
      creditAvailableUSD: 0,
      bookingsCompleted: 0,
      totalBookingsValueCOP: 0,
      maxCreditCOP: defaultMaxCredit,
      percentageEarned: 0,
    };
  }

  return {
    hasCredit: result.has_credit ?? false,
    creditAvailableCOP: result.credit_available_cop ?? 0,
    creditAvailableUSD: result.credit_available_usd ?? 0,
    bookingsCompleted: result.bookings_completed ?? 0,
    totalBookingsValueCOP: result.total_bookings_value_cop ?? 0,
    maxCreditCOP: result.max_credit_cop ?? 0,
    percentageEarned: Number(result.percentage_earned ?? 0),
  };
}

/**
 * Apply trial credit to direct hire pricing
 *
 * Calculates final price after applying available trial credit discount.
 * Server-side validation ensures credit cannot exceed direct hire fee.
 *
 * @param supabase - Supabase client
 * @param customerId - Customer's profile ID
 * @param professionalId - Professional's profile ID
 * @param directHireFeeCOP - Original direct hire fee in COP cents
 * @returns Final pricing with discount applied
 *
 * @example
 * const pricing = await applyTrialCredit(
 *   supabase,
 *   'customer-uuid',
 *   'pro-uuid',
 *   1196000  // $299 USD
 * );
 * // If customer has 200,000 COP credit:
 * // => { finalPriceCOP: 996000, discountAppliedCOP: 200000, creditRemainingCOP: 0 }
 */
export async function applyTrialCredit(
  supabase: SupabaseClient<Database>,
  customerId: string,
  professionalId: string,
  directHireFeeCOP: number
): Promise<AppliedCreditResult> {
  // Fetch current credit info (server-side validation)
  const creditInfo = await getTrialCreditInfo(supabase, customerId, professionalId);

  if (!creditInfo.hasCredit || creditInfo.creditAvailableCOP === 0) {
    // No credit available - return full price
    return {
      finalPriceCOP: directHireFeeCOP,
      discountAppliedCOP: 0,
      creditRemainingCOP: 0,
    };
  }

  // Calculate discount (cannot exceed direct hire fee)
  const discountAppliedCOP = Math.min(creditInfo.creditAvailableCOP, directHireFeeCOP);

  // Calculate final price (cannot go below zero)
  const finalPriceCOP = Math.max(directHireFeeCOP - discountAppliedCOP, 0);

  // Calculate remaining credit after this application
  const creditRemainingCOP = creditInfo.creditAvailableCOP - discountAppliedCOP;

  return {
    finalPriceCOP,
    discountAppliedCOP,
    creditRemainingCOP,
  };
}

/**
 * Mark trial credit as used after successful direct hire payment
 *
 * IMPORTANT: Only call this AFTER Stripe payment succeeds.
 * This is typically called from the Stripe webhook handler.
 *
 * @param supabase - Supabase client (should use service role for webhook)
 * @param customerId - Customer's profile ID
 * @param professionalId - Professional's profile ID
 * @param bookingId - Direct hire booking ID
 * @param creditUsedCOP - Amount of credit applied in COP cents
 *
 * @example
 * // In Stripe webhook handler (payment_intent.succeeded):
 * if (metadata.has_trial_discount === 'true') {
 *   await markTrialCreditUsed(
 *     serviceRoleSupabase,
 *     metadata.customer_id,
 *     metadata.professional_id,
 *     bookingId,
 *     parseInt(metadata.trial_credit_applied_cop)
 *   );
 * }
 */
export async function markTrialCreditUsed(
  supabase: SupabaseClient<Database>,
  customerId: string,
  professionalId: string,
  bookingId: string,
  creditUsedCOP: number
): Promise<void> {
  const { error } = await supabase
    .from("trial_credits")
    .update({
      credit_used_cop: creditUsedCOP,
      credit_remaining_cop: 0, // Credit is fully consumed
      credit_applied_to_booking_id: bookingId,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId)
    .eq("professional_id", professionalId);

  if (error) {
    console.error("[trialCreditService] Error marking credit as used:", error);
    throw new Error(`Failed to mark trial credit as used: ${error.message}`);
  }

  console.log(
    `[trialCreditService] Trial credit marked as used: ${copCentsToUSD(creditUsedCOP)} USD for customer ${customerId} with pro ${professionalId}`
  );
}

/**
 * Get trial credit summary for customer dashboard
 *
 * Fetches all trial credits for a customer across all professionals.
 * Useful for displaying "My Trial Credits" section in dashboard.
 *
 * @param supabase - Supabase client
 * @param customerId - Customer's profile ID
 * @returns Array of trial credit info for each professional
 *
 * @example
 * const credits = await getCustomerTrialCredits(supabase, 'customer-uuid');
 * credits.forEach(credit => {
 *   console.log(`${credit.professionalName}: $${credit.creditAvailableUSD}`);
 * });
 */
export async function getCustomerTrialCredits(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<CustomerTrialCreditSummary[]> {
  // Fetch all trial credit records for this customer
  const { data: credits, error } = await supabase
    .from("trial_credits")
    .select(
      `
      *,
      professional:profiles!professional_id(
        id,
        full_name
      )
    `
    )
    .eq("customer_id", customerId)
    .order("last_booking_at", { ascending: false });

  if (error) {
    console.error("[trialCreditService] Error fetching customer credits:", error);
    return [];
  }

  if (!credits) {
    return [];
  }

  // Transform to TrialCreditInfo format
  return credits.map((credit) => {
    const professional = Array.isArray(credit.professional)
      ? credit.professional[0]
      : credit.professional;

    return {
      hasCredit: credit.credit_remaining_cop > 0,
      creditAvailableCOP: credit.credit_remaining_cop,
      creditAvailableUSD: copCentsToUSD(credit.credit_remaining_cop),
      bookingsCompleted: credit.total_bookings_count,
      totalBookingsValueCOP: credit.total_bookings_value_cop,
      maxCreditCOP: calculateMaxCredit(DEFAULT_DIRECT_HIRE_FEE_COP),
      percentageEarned: Math.min(
        (credit.credit_earned_cop / calculateMaxCredit(DEFAULT_DIRECT_HIRE_FEE_COP)) * 100,
        100
      ),
      professionalId: credit.professional_id,
      professionalName: professional?.full_name ?? null,
    };
  });
}
