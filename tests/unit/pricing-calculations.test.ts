import { describe, expect, it } from "@jest/globals";
import {
  calculateSubscriptionPricing,
  estimateBookingsCount,
  formatCOP,
  getRecommendedTier,
  getTierBenefits,
  getTierDescription,
  getTierDiscountLabel,
  type SubscriptionTier,
  shouldRecommendSubscription,
} from "@/lib/subscription-pricing";

/**
 * Unit Tests for Pricing Calculations
 *
 * Tests the subscription pricing system that provides discounts
 * for recurring bookings based on frequency.
 */

describe("Pricing Calculations", () => {
  describe("calculateSubscriptionPricing", () => {
    it("should calculate correct discount for weekly tier", () => {
      const basePrice = 100_000; // 100k COP
      const result = calculateSubscriptionPricing(basePrice, "weekly");

      expect(result.basePrice).toBe(100_000);
      expect(result.discountPercent).toBe(15); // Weekly = 15% off
      expect(result.discountAmount).toBe(15_000);
      expect(result.finalPrice).toBe(85_000);
      expect(result.savingsPerBooking).toBe(15_000);
    });

    it("should calculate correct discount for biweekly tier", () => {
      const basePrice = 100_000;
      const result = calculateSubscriptionPricing(basePrice, "biweekly");

      expect(result.discountPercent).toBe(10); // Biweekly = 10% off
      expect(result.discountAmount).toBe(10_000);
      expect(result.finalPrice).toBe(90_000);
    });

    it("should calculate correct discount for monthly tier", () => {
      const basePrice = 100_000;
      const result = calculateSubscriptionPricing(basePrice, "monthly");

      expect(result.discountPercent).toBe(5); // Monthly = 5% off
      expect(result.discountAmount).toBe(5000);
      expect(result.finalPrice).toBe(95_000);
    });

    it("should have zero discount for one-time booking", () => {
      const basePrice = 100_000;
      const result = calculateSubscriptionPricing(basePrice, "none");

      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100_000);
    });

    it("should estimate total savings for 3 months (default)", () => {
      const basePrice = 100_000;
      const result = calculateSubscriptionPricing(basePrice, "weekly");

      // Weekly = 4 bookings/month × 3 months = 12 bookings
      // 15k savings per booking × 12 = 180k total savings
      expect(result.totalSavingsEstimate).toBe(180_000);
    });

    it("should estimate total savings for custom months", () => {
      const basePrice = 100_000;
      const result = calculateSubscriptionPricing(basePrice, "biweekly", 6);

      // Biweekly = 2 bookings/month × 6 months = 12 bookings
      // 10k savings per booking × 12 = 120k total savings
      expect(result.totalSavingsEstimate).toBe(120_000);
    });

    it("should round discount amounts correctly", () => {
      const basePrice = 99_999; // Odd number to test rounding
      const result = calculateSubscriptionPricing(basePrice, "weekly");

      // 15% of 99,999 = 14,999.85 → should round to 15,000
      expect(result.discountAmount).toBe(15_000);
      expect(result.finalPrice).toBe(84_999);
    });

    it("should handle zero base price", () => {
      const result = calculateSubscriptionPricing(0, "weekly");

      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(0);
      expect(result.totalSavingsEstimate).toBe(0);
    });

    it("should handle large base price", () => {
      const basePrice = 1_000_000; // 1 million COP
      const result = calculateSubscriptionPricing(basePrice, "weekly");

      expect(result.discountAmount).toBe(150_000); // 15% of 1M
      expect(result.finalPrice).toBe(850_000);
    });
  });

  describe("estimateBookingsCount", () => {
    it("should estimate weekly bookings correctly", () => {
      const count = estimateBookingsCount("weekly", 3);
      expect(count).toBe(12); // 4 per month × 3 months
    });

    it("should estimate biweekly bookings correctly", () => {
      const count = estimateBookingsCount("biweekly", 3);
      expect(count).toBe(6); // 2 per month × 3 months
    });

    it("should estimate monthly bookings correctly", () => {
      const count = estimateBookingsCount("monthly", 3);
      expect(count).toBe(3); // 1 per month × 3 months
    });

    it("should return 1 for one-time booking", () => {
      const count = estimateBookingsCount("none", 3);
      expect(count).toBe(1);
    });

    it("should handle custom month values", () => {
      const count = estimateBookingsCount("weekly", 12);
      expect(count).toBe(48); // 4 per month × 12 months
    });
  });

  describe("getTierDescription", () => {
    it("should return correct descriptions for all tiers", () => {
      expect(getTierDescription("none")).toBe("One-time booking");
      expect(getTierDescription("monthly")).toBe("Monthly recurring");
      expect(getTierDescription("biweekly")).toBe("Every 2 weeks");
      expect(getTierDescription("weekly")).toBe("Weekly recurring");
    });
  });

  describe("getTierDiscountLabel", () => {
    it("should return discount labels for subscription tiers", () => {
      expect(getTierDiscountLabel("weekly")).toBe("15% off");
      expect(getTierDiscountLabel("biweekly")).toBe("10% off");
      expect(getTierDiscountLabel("monthly")).toBe("5% off");
    });

    it("should return null for one-time booking", () => {
      expect(getTierDiscountLabel("none")).toBe(null);
    });
  });

  describe("getTierBenefits", () => {
    it("should return empty array for one-time booking", () => {
      const benefits = getTierBenefits("none");
      expect(benefits).toEqual([]);
    });

    it("should include base benefits for monthly tier", () => {
      const benefits = getTierBenefits("monthly");
      expect(benefits).toContain("Guaranteed time slot");
      expect(benefits).toContain("Priority support");
      expect(benefits).toContain("Same professional");
      expect(benefits).toContain("5% discount");
    });

    it("should include more benefits for higher tiers", () => {
      const monthlyBenefits = getTierBenefits("monthly");
      const weeklyBenefits = getTierBenefits("weekly");

      expect(weeklyBenefits.length).toBeGreaterThan(monthlyBenefits.length);
      expect(weeklyBenefits).toContain("Premium support");
      expect(weeklyBenefits).toContain("15% discount");
    });

    it("should include vacation pause for biweekly and weekly", () => {
      const biweeklyBenefits = getTierBenefits("biweekly");
      const weeklyBenefits = getTierBenefits("weekly");

      expect(biweeklyBenefits).toContain("Vacation pause");
      expect(weeklyBenefits).toContain("Vacation pause");
    });
  });

  describe("shouldRecommendSubscription", () => {
    it("should recommend subscription for high savings", () => {
      const basePrice = 200_000; // Weekly: 30k/booking × 12 = 360k savings
      const result = shouldRecommendSubscription(basePrice);
      expect(result).toBe(true);
    });

    it("should not recommend for low savings", () => {
      const basePrice = 50_000; // Weekly: 7.5k/booking × 12 = 90k savings
      const result = shouldRecommendSubscription(basePrice);
      expect(result).toBe(false); // Below 20k threshold
    });

    it("should use 20k threshold correctly", () => {
      // Find the minimum base price that gives >20k savings
      // Weekly: 15% × 4/month × 3 months = 1.8x base price savings
      // 20k / 1.8 = ~11,111 COP minimum base price
      const justAboveThreshold = 12_000;
      const justBelowThreshold = 11_000;

      expect(shouldRecommendSubscription(justAboveThreshold)).toBe(true);
      expect(shouldRecommendSubscription(justBelowThreshold)).toBe(false);
    });
  });

  describe("getRecommendedTier", () => {
    it("should recommend weekly for 8+ previous bookings", () => {
      const result = getRecommendedTier(100_000, 10);
      expect(result).toBe("weekly");
    });

    it("should recommend biweekly for 5-7 previous bookings", () => {
      const result = getRecommendedTier(100_000, 6);
      expect(result).toBe("biweekly");
    });

    it("should recommend monthly for 3-4 previous bookings", () => {
      const result = getRecommendedTier(100_000, 3);
      expect(result).toBe("monthly");
    });

    it("should not recommend for less than 3 bookings", () => {
      const result = getRecommendedTier(100_000, 2);
      expect(result).toBe(null);
    });

    it("should recommend weekly for high-value bookings", () => {
      const result = getRecommendedTier(200_000, 0);
      expect(result).toBe("weekly");
    });

    it("should not recommend for low-value new customers", () => {
      const result = getRecommendedTier(80_000, 1);
      expect(result).toBe(null);
    });

    it("should prioritize booking history over price", () => {
      // High value but low history - should still recommend based on value
      const highValue = getRecommendedTier(200_000, 2);
      expect(highValue).toBe("weekly");

      // Low value but high history - should recommend based on history
      const highHistory = getRecommendedTier(50_000, 8);
      expect(highHistory).toBe("weekly");
    });
  });

  describe("formatCOP", () => {
    it("should format Colombian Pesos correctly", () => {
      const formatted = formatCOP(100_000);
      // Colombian Peso format: $ 100.000
      expect(formatted).toMatch(/100/);
      expect(formatted).toContain("$");
    });

    it("should not include decimal places", () => {
      const formatted = formatCOP(100_500);
      // Should round or show no decimals
      expect(formatted).not.toContain(",5");
      expect(formatted).not.toContain(".5");
    });

    it("should handle zero", () => {
      const formatted = formatCOP(0);
      expect(formatted).toContain("0");
      expect(formatted).toContain("$");
    });

    it("should handle large numbers", () => {
      const formatted = formatCOP(1_000_000);
      expect(formatted).toMatch(/1/);
      expect(formatted).toContain("$");
    });
  });

  describe("Edge Cases", () => {
    it("should handle all tier types correctly", () => {
      const tiers: SubscriptionTier[] = ["none", "monthly", "biweekly", "weekly"];

      for (const tier of tiers) {
        const result = calculateSubscriptionPricing(100_000, tier);
        expect(result.tier).toBe(tier);
        expect(result.basePrice).toBe(100_000);
        expect(result.finalPrice).toBeGreaterThanOrEqual(0);
      }
    });

    it("should maintain pricing consistency across calculations", () => {
      const basePrice = 150_000;

      // Calculate twice, should get same result
      const calc1 = calculateSubscriptionPricing(basePrice, "weekly");
      const calc2 = calculateSubscriptionPricing(basePrice, "weekly");

      expect(calc1).toEqual(calc2);
    });

    it("should ensure finalPrice never exceeds basePrice", () => {
      const tiers: SubscriptionTier[] = ["none", "monthly", "biweekly", "weekly"];
      const basePrice = 200_000;

      for (const tier of tiers) {
        const result = calculateSubscriptionPricing(basePrice, tier);
        expect(result.finalPrice).toBeLessThanOrEqual(result.basePrice);
      }
    });

    it("should handle negative base price gracefully", () => {
      // Although invalid, should not crash
      const result = calculateSubscriptionPricing(-100_000, "weekly");
      expect(result.basePrice).toBe(-100_000);
      expect(result.finalPrice).toBeLessThanOrEqual(result.basePrice);
    });
  });
});
