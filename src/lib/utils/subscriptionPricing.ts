/**
 * Subscription Pricing System
 *
 * Provides discount tiers for recurring bookings based on frequency and commitment.
 * Encourages long-term recurring bookings with better pricing.
 */

import { formatCOP as formatCOPCurrency } from "@/lib/utils/format";

export type SubscriptionTier = "none" | "weekly" | "biweekly" | "monthly";

export type PricingCalculation = {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  tier: SubscriptionTier;
  savingsPerBooking: number;
  totalSavingsEstimate?: number; // For 3 months
};

/**
 * Discount tiers for recurring bookings
 * More frequent bookings = higher discount
 */
const DISCOUNT_TIERS: Record<SubscriptionTier, number> = {
  none: 0, // One-time booking
  monthly: 5, // 5% off
  biweekly: 10, // 10% off
  weekly: 15, // 15% off
};

/**
 * Calculate subscription pricing with discount
 *
 * @param basePrice - Original booking price (COP)
 * @param frequency - Booking frequency
 * @param estimateMonths - Number of months to estimate total savings (default: 3)
 * @returns Pricing calculation with discount details
 */
export function calculateSubscriptionPricing(
  basePrice: number,
  frequency: SubscriptionTier,
  estimateMonths = 3
): PricingCalculation {
  // Validate input: negative prices don't make sense
  if (basePrice < 0) {
    throw new Error("Base price cannot be negative");
  }

  const discountPercent = DISCOUNT_TIERS[frequency];
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = basePrice - discountAmount;
  const savingsPerBooking = discountAmount;

  // Estimate total savings based on frequency
  let totalSavingsEstimate = 0;
  if (frequency !== "none") {
    const bookingsPerMonth = {
      monthly: 1,
      biweekly: 2,
      weekly: 4,
    }[frequency];

    totalSavingsEstimate = savingsPerBooking * bookingsPerMonth * estimateMonths;
  }

  return {
    basePrice,
    discountPercent,
    discountAmount,
    finalPrice,
    tier: frequency,
    savingsPerBooking,
    totalSavingsEstimate,
  };
}

/**
 * Get human-readable tier description
 */
export function getTierDescription(tier: SubscriptionTier): string {
  const descriptions: Record<SubscriptionTier, string> = {
    none: "One-time booking",
    monthly: "Monthly recurring",
    biweekly: "Every 2 weeks",
    weekly: "Weekly recurring",
  };

  return descriptions[tier];
}

/**
 * Get tier discount label
 */
export function getTierDiscountLabel(tier: SubscriptionTier): string | null {
  const discount = DISCOUNT_TIERS[tier];
  return discount > 0 ? `${discount}% off` : null;
}

/**
 * Calculate estimated bookings for a time period
 */
export function estimateBookingsCount(frequency: SubscriptionTier, months = 3): number {
  if (frequency === "none") {
    return 1;
  }

  const bookingsPerMonth = {
    monthly: 1,
    biweekly: 2,
    weekly: 4,
  }[frequency];

  return bookingsPerMonth * months;
}

/**
 * Format currency in Colombian Pesos
 * @deprecated Use formatCOP from @/lib/utils/format instead
 */
export function formatCOP(amount: number): string {
  return formatCOPCurrency(amount);
}

/**
 * Get subscription tier benefits
 */
export function getTierBenefits(tier: SubscriptionTier): string[] {
  const baseBenefits = ["Guaranteed time slot", "Priority support", "Same professional"];

  const tierSpecificBenefits: Record<SubscriptionTier, string[]> = {
    none: [],
    monthly: [...baseBenefits, "5% discount", "Easy cancellation"],
    biweekly: [...baseBenefits, "10% discount", "Free reschedule", "Vacation pause"],
    weekly: [
      ...baseBenefits,
      "15% discount",
      "2 free reschedules/month",
      "Vacation pause",
      "Premium support",
    ],
  };

  return tierSpecificBenefits[tier];
}

/**
 * Determine if subscription is worth recommending
 * Recommends subscription if customer would save >20k COP over 3 months
 */
export function shouldRecommendSubscription(basePrice: number): boolean {
  const weeklyPricing = calculateSubscriptionPricing(basePrice, "weekly", 3);
  return (weeklyPricing.totalSavingsEstimate || 0) > 20_000;
}

/**
 * Get recommended tier based on usage patterns
 */
export function getRecommendedTier(
  basePrice: number,
  previousBookingsCount?: number
): SubscriptionTier | null {
  // If user has 3+ previous bookings, recommend subscription
  if (previousBookingsCount && previousBookingsCount >= 3) {
    if (previousBookingsCount >= 8) {
      return "weekly";
    }
    if (previousBookingsCount >= 5) {
      return "biweekly";
    }
    return "monthly";
  }

  // If high-value booking, recommend subscription
  if (basePrice > 150_000) {
    return "weekly"; // High-value customers likely to book frequently
  }

  return null;
}
