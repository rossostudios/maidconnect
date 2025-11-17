/**
 * Tests for subscription pricing calculations
 *
 * Critical business logic that affects revenue and customer pricing.
 * Tests ensure discount calculations are accurate and consistent.
 */

import { describe, expect, it } from "vitest";
import {
  calculateSubscriptionPricing,
  estimateBookingsCount,
  getRecommendedTier,
  getTierBenefits,
  getTierDescription,
  getTierDiscountLabel,
  shouldRecommendSubscription,
  type SubscriptionTier,
} from "../subscriptionPricing";

// ============================================================================
// CORE PRICING CALCULATIONS
// ============================================================================

describe("calculateSubscriptionPricing", () => {
  describe("discount calculations", () => {
    it("applies 0% discount for one-time bookings", () => {
      const result = calculateSubscriptionPricing(100_000, "none");

      expect(result.basePrice).toBe(100_000);
      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100_000);
      expect(result.tier).toBe("none");
      expect(result.savingsPerBooking).toBe(0);
      expect(result.totalSavingsEstimate).toBe(0);
    });

    it("applies 5% discount for monthly subscriptions", () => {
      const result = calculateSubscriptionPricing(100_000, "monthly");

      expect(result.basePrice).toBe(100_000);
      expect(result.discountPercent).toBe(5);
      expect(result.discountAmount).toBe(5_000);
      expect(result.finalPrice).toBe(95_000);
      expect(result.tier).toBe("monthly");
      expect(result.savingsPerBooking).toBe(5_000);
      // 1 booking/month × 3 months × 5,000 savings = 15,000
      expect(result.totalSavingsEstimate).toBe(15_000);
    });

    it("applies 10% discount for biweekly subscriptions", () => {
      const result = calculateSubscriptionPricing(100_000, "biweekly");

      expect(result.basePrice).toBe(100_000);
      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(10_000);
      expect(result.finalPrice).toBe(90_000);
      expect(result.tier).toBe("biweekly");
      expect(result.savingsPerBooking).toBe(10_000);
      // 2 bookings/month × 3 months × 10,000 savings = 60,000
      expect(result.totalSavingsEstimate).toBe(60_000);
    });

    it("applies 15% discount for weekly subscriptions", () => {
      const result = calculateSubscriptionPricing(100_000, "weekly");

      expect(result.basePrice).toBe(100_000);
      expect(result.discountPercent).toBe(15);
      expect(result.discountAmount).toBe(15_000);
      expect(result.finalPrice).toBe(85_000);
      expect(result.tier).toBe("weekly");
      expect(result.savingsPerBooking).toBe(15_000);
      // 4 bookings/month × 3 months × 15,000 savings = 180,000
      expect(result.totalSavingsEstimate).toBe(180_000);
    });
  });

  describe("rounding behavior", () => {
    it("rounds discount amounts correctly", () => {
      // 5% of 50,123 = 2,506.15 → should round to 2,506
      const result = calculateSubscriptionPricing(50_123, "monthly");
      expect(result.discountAmount).toBe(2_506);
      expect(result.finalPrice).toBe(47_617);
    });

    it("handles fractional discounts consistently", () => {
      // 15% of 333 = 49.95 → should round to 50
      const result = calculateSubscriptionPricing(333, "weekly");
      expect(result.discountAmount).toBe(50);
      expect(result.finalPrice).toBe(283);
    });
  });

  describe("edge cases", () => {
    it("handles zero price", () => {
      const result = calculateSubscriptionPricing(0, "weekly");
      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(0);
    });

    it("throws error for negative prices", () => {
      expect(() => calculateSubscriptionPricing(-1000, "weekly")).toThrow(
        "Base price cannot be negative"
      );
    });

    it("handles very large prices", () => {
      const result = calculateSubscriptionPricing(10_000_000, "weekly");
      expect(result.discountPercent).toBe(15);
      expect(result.discountAmount).toBe(1_500_000);
      expect(result.finalPrice).toBe(8_500_000);
    });

    it("handles small prices", () => {
      const result = calculateSubscriptionPricing(100, "weekly");
      expect(result.discountAmount).toBe(15); // 15% of 100
      expect(result.finalPrice).toBe(85);
    });
  });

  describe("custom time periods", () => {
    it("calculates savings for custom months (6 months)", () => {
      const result = calculateSubscriptionPricing(100_000, "weekly", 6);
      // 4 bookings/month × 6 months × 15,000 = 360,000
      expect(result.totalSavingsEstimate).toBe(360_000);
    });

    it("calculates savings for 1 month", () => {
      const result = calculateSubscriptionPricing(100_000, "biweekly", 1);
      // 2 bookings/month × 1 month × 10,000 = 20,000
      expect(result.totalSavingsEstimate).toBe(20_000);
    });

    it("handles 12-month estimates", () => {
      const result = calculateSubscriptionPricing(100_000, "monthly", 12);
      // 1 booking/month × 12 months × 5,000 = 60,000
      expect(result.totalSavingsEstimate).toBe(60_000);
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe("getTierDescription", () => {
  it("returns correct descriptions for all tiers", () => {
    expect(getTierDescription("none")).toBe("One-time booking");
    expect(getTierDescription("monthly")).toBe("Monthly recurring");
    expect(getTierDescription("biweekly")).toBe("Every 2 weeks");
    expect(getTierDescription("weekly")).toBe("Weekly recurring");
  });
});

describe("getTierDiscountLabel", () => {
  it("returns null for no discount", () => {
    expect(getTierDiscountLabel("none")).toBeNull();
  });

  it("returns discount labels for subscription tiers", () => {
    expect(getTierDiscountLabel("monthly")).toBe("5% off");
    expect(getTierDiscountLabel("biweekly")).toBe("10% off");
    expect(getTierDiscountLabel("weekly")).toBe("15% off");
  });
});

describe("getTierBenefits", () => {
  it("returns empty array for one-time bookings", () => {
    expect(getTierBenefits("none")).toEqual([]);
  });

  it("returns benefits for monthly tier", () => {
    const benefits = getTierBenefits("monthly");
    expect(benefits).toContain("Guaranteed time slot");
    expect(benefits).toContain("5% discount");
    expect(benefits).toContain("Easy cancellation");
  });

  it("returns more benefits for higher tiers", () => {
    const monthlyBenefits = getTierBenefits("monthly");
    const weeklyBenefits = getTierBenefits("weekly");

    expect(weeklyBenefits.length).toBeGreaterThan(monthlyBenefits.length);
    expect(weeklyBenefits).toContain("15% discount");
    expect(weeklyBenefits).toContain("Premium support");
  });
});

describe("estimateBookingsCount", () => {
  it("returns 1 for one-time bookings", () => {
    expect(estimateBookingsCount("none", 3)).toBe(1);
  });

  it("calculates monthly bookings correctly", () => {
    expect(estimateBookingsCount("monthly", 3)).toBe(3); // 1/month × 3 = 3
    expect(estimateBookingsCount("monthly", 6)).toBe(6); // 1/month × 6 = 6
  });

  it("calculates biweekly bookings correctly", () => {
    expect(estimateBookingsCount("biweekly", 3)).toBe(6); // 2/month × 3 = 6
    expect(estimateBookingsCount("biweekly", 1)).toBe(2); // 2/month × 1 = 2
  });

  it("calculates weekly bookings correctly", () => {
    expect(estimateBookingsCount("weekly", 3)).toBe(12); // 4/month × 3 = 12
    expect(estimateBookingsCount("weekly", 1)).toBe(4); // 4/month × 1 = 4
  });
});

// ============================================================================
// BUSINESS LOGIC - RECOMMENDATIONS
// ============================================================================

describe("shouldRecommendSubscription", () => {
  it("recommends subscription when savings exceed 20k COP", () => {
    // Weekly tier with 100k base: 15k/booking × 4 bookings/month × 3 months = 180k
    expect(shouldRecommendSubscription(100_000)).toBe(true);
  });

  it("does not recommend for low-value bookings", () => {
    // Weekly tier with 10k base: 1.5k/booking × 4 × 3 = 18k (< 20k threshold)
    expect(shouldRecommendSubscription(10_000)).toBe(false);
  });

  it("recommends for medium-value bookings", () => {
    // 50k base: 7.5k/booking × 4 × 3 = 90k savings
    expect(shouldRecommendSubscription(50_000)).toBe(true);
  });

  it("edge case: exactly at threshold", () => {
    // Find price where savings = exactly 20k
    // 15% discount, 4 bookings/month, 3 months = 12x discount
    // 20,000 / 12 = 1,666.67 discount per booking
    // 1,666.67 / 0.15 = 11,111.11 base price
    // Due to rounding: Math.round(11,111 × 0.15) = 1,667 → 1,667 × 12 = 20,004 (> 20k)
    expect(shouldRecommendSubscription(11_000)).toBe(false); // Under threshold
    expect(shouldRecommendSubscription(11_111)).toBe(true); // Just over due to rounding
  });
});

describe("getRecommendedTier", () => {
  describe("based on previous bookings", () => {
    it("recommends weekly for 8+ previous bookings", () => {
      expect(getRecommendedTier(50_000, 8)).toBe("weekly");
      expect(getRecommendedTier(50_000, 10)).toBe("weekly");
    });

    it("recommends biweekly for 5-7 previous bookings", () => {
      expect(getRecommendedTier(50_000, 5)).toBe("biweekly");
      expect(getRecommendedTier(50_000, 7)).toBe("biweekly");
    });

    it("recommends monthly for 3-4 previous bookings", () => {
      expect(getRecommendedTier(50_000, 3)).toBe("monthly");
      expect(getRecommendedTier(50_000, 4)).toBe("monthly");
    });

    it("returns null for fewer than 3 bookings", () => {
      expect(getRecommendedTier(50_000, 0)).toBeNull();
      expect(getRecommendedTier(50_000, 1)).toBeNull();
      expect(getRecommendedTier(50_000, 2)).toBeNull();
    });
  });

  describe("based on booking value", () => {
    it("recommends weekly for high-value bookings (>150k)", () => {
      expect(getRecommendedTier(200_000)).toBe("weekly");
      expect(getRecommendedTier(500_000)).toBe("weekly");
    });

    it("returns null for lower-value bookings with no history", () => {
      expect(getRecommendedTier(50_000)).toBeNull();
      expect(getRecommendedTier(100_000)).toBeNull();
      expect(getRecommendedTier(150_000)).toBeNull(); // Exactly at threshold
    });
  });

  describe("precedence", () => {
    it("previous bookings take precedence over value", () => {
      // Even with high value, if few bookings, use booking count logic
      expect(getRecommendedTier(200_000, 3)).toBe("monthly"); // Not weekly!
      expect(getRecommendedTier(200_000, 8)).toBe("weekly");
    });

    it("handles edge case: high value + no booking history", () => {
      expect(getRecommendedTier(200_000, 0)).toBe("weekly"); // Falls back to value
      expect(getRecommendedTier(200_000, undefined)).toBe("weekly");
    });
  });
});

// ============================================================================
// INTEGRATION TESTS - REALISTIC SCENARIOS
// ============================================================================

describe("realistic pricing scenarios", () => {
  it("scenario: standard cleaning service", () => {
    const basePrice = 80_000; // COP
    const pricing = calculateSubscriptionPricing(basePrice, "biweekly");

    expect(pricing.finalPrice).toBe(72_000); // 10% off
    expect(pricing.totalSavingsEstimate).toBe(48_000); // Over 3 months
    expect(shouldRecommendSubscription(basePrice)).toBe(true);
  });

  it("scenario: premium service with weekly bookings", () => {
    const basePrice = 250_000; // High-value service
    const pricing = calculateSubscriptionPricing(basePrice, "weekly");

    expect(pricing.finalPrice).toBe(212_500); // 15% off = 37.5k savings/booking
    expect(pricing.savingsPerBooking).toBe(37_500);
    expect(pricing.totalSavingsEstimate).toBe(450_000); // 12 bookings × 37.5k
  });

  it("scenario: occasional user (no subscription)", () => {
    const basePrice = 50_000;
    const pricing = calculateSubscriptionPricing(basePrice, "none");

    expect(pricing.finalPrice).toBe(basePrice);
    expect(pricing.totalSavingsEstimate).toBe(0);
    expect(getRecommendedTier(basePrice, 1)).toBeNull();
  });

  it("scenario: loyal customer progression", () => {
    const basePrice = 100_000;

    // New customer: no recommendation
    expect(getRecommendedTier(basePrice, 1)).toBeNull();

    // After 3 bookings: monthly recommended
    expect(getRecommendedTier(basePrice, 3)).toBe("monthly");

    // After 5 bookings: biweekly recommended
    expect(getRecommendedTier(basePrice, 5)).toBe("biweekly");

    // After 8 bookings: weekly recommended
    expect(getRecommendedTier(basePrice, 8)).toBe("weekly");
  });
});
