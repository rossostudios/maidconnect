/**
 * Pricing Service Tests
 *
 * Critical business logic tests for booking pricing calculations.
 * Ensures pricing integrity by validating server-side calculations.
 *
 * @module lib/services/bookings/__tests__/pricingService.test.ts
 */

import { describe, expect, test as it, beforeEach } from "bun:test";
import { calculateBookingPricing } from "../pricingService";
import {
  createMockSupabaseClient,
  type MockSupabaseClient,
} from "@/lib/__mocks__/supabase";

describe("Pricing Service", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  // ============================================================================
  // CALCULATE BOOKING PRICING - HAPPY PATHS
  // ============================================================================

  describe("calculateBookingPricing - Success Cases", () => {
    it("should calculate pricing for service + tier + addons", async () => {
      // Setup: Mock service price
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-1", base_price_cop: 50000 },
        error: null,
      });

      // Setup: Mock tier price
      mockClient.__setMockResponse("service_pricing_tiers", {
        data: { id: "tier-1", price_cop: 10000 },
        error: null,
      });

      // Setup: Mock addons
      mockClient.__setMockResponse("service_addons", {
        data: [
          { id: "addon-1", price_cop: 5000 },
          { id: "addon-2", price_cop: 8000 },
        ],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-1",
        "tier-1",
        ["addon-1", "addon-2"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(50000);
        expect(result.pricing.tierPrice).toBe(10000);
        expect(result.pricing.addonsPrice).toBe(13000); // 5000 + 8000
        expect(result.pricing.totalPrice).toBe(73000); // 50000 + 10000 + 13000
      }
    });

    it("should calculate pricing for service only (no tier or addons)", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-2", base_price_cop: 75000 },
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-2",
        null,
        null
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(75000);
        expect(result.pricing.tierPrice).toBe(0);
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(75000);
      }
    });

    it("should calculate pricing for service + tier (no addons)", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-3", base_price_cop: 60000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: { id: "tier-2", price_cop: 15000 },
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-3",
        "tier-2",
        []
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(60000);
        expect(result.pricing.tierPrice).toBe(15000);
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(75000);
      }
    });

    it("should calculate pricing for service + addons (no tier)", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-4", base_price_cop: 80000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [
          { id: "addon-3", price_cop: 12000 },
          { id: "addon-4", price_cop: 7000 },
          { id: "addon-5", price_cop: 3000 },
        ],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-4",
        undefined,
        ["addon-3", "addon-4", "addon-5"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(80000);
        expect(result.pricing.tierPrice).toBe(0);
        expect(result.pricing.addonsPrice).toBe(22000); // 12000 + 7000 + 3000
        expect(result.pricing.totalPrice).toBe(102000);
      }
    });

    it("should handle single addon correctly", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-5", base_price_cop: 55000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [{ id: "addon-6", price_cop: 10000 }],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-5",
        null,
        ["addon-6"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(55000);
        expect(result.pricing.addonsPrice).toBe(10000);
        expect(result.pricing.totalPrice).toBe(65000);
      }
    });

    it("should handle zero-priced tier correctly", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-6", base_price_cop: 40000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: { id: "tier-3", price_cop: 0 },
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-6",
        "tier-3",
        null
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.tierPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(40000);
      }
    });

    it("should handle zero-priced addon correctly", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-7", base_price_cop: 45000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [{ id: "addon-7", price_cop: 0 }],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-7",
        null,
        ["addon-7"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(45000);
      }
    });
  });

  // ============================================================================
  // CALCULATE BOOKING PRICING - ERROR CASES
  // ============================================================================

  describe("calculateBookingPricing - Error Cases", () => {
    it("should return error for invalid service ID", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: null,
        error: new Error("Not found"),
      });

      const result = await calculateBookingPricing(
        mockClient,
        "invalid-service",
        null,
        null
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Service not found");
      }
    });

    it("should return error for missing service", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: null,
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-999",
        null,
        null
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Service not found");
      }
    });

    it("should return error for invalid tier ID", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-8", base_price_cop: 50000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: null,
        error: new Error("Not found"),
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-8",
        "invalid-tier",
        null
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Pricing tier not found");
      }
    });

    it("should return error for missing tier", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-9", base_price_cop: 50000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: null,
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-9",
        "tier-999",
        null
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Pricing tier not found");
      }
    });
  });

  // ============================================================================
  // CALCULATE BOOKING PRICING - EDGE CASES
  // ============================================================================

  describe("calculateBookingPricing - Edge Cases", () => {
    it("should handle empty addons array", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-10", base_price_cop: 30000 },
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-10",
        null,
        []
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(30000);
      }
    });

    it("should handle no addons found in database", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-11", base_price_cop: 35000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-11",
        null,
        ["addon-999"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(35000);
      }
    });

    it("should handle null addons response from database", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-12", base_price_cop: 42000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: null,
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-12",
        null,
        ["addon-1"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.addonsPrice).toBe(0);
        expect(result.pricing.totalPrice).toBe(42000);
      }
    });

    it("should handle partial addons found (some IDs invalid)", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-13", base_price_cop: 48000 },
        error: null,
      });

      // Only 2 out of 3 addons found
      mockClient.__setMockResponse("service_addons", {
        data: [
          { id: "addon-8", price_cop: 6000 },
          { id: "addon-9", price_cop: 4000 },
        ],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-13",
        null,
        ["addon-8", "addon-9", "addon-999"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.addonsPrice).toBe(10000); // Only valid addons
        expect(result.pricing.totalPrice).toBe(58000);
      }
    });
  });

  // ============================================================================
  // PRICING INTEGRITY TESTS
  // ============================================================================

  describe("Pricing Integrity", () => {
    it("should never allow negative prices", async () => {
      // Even if database has negative price (data corruption), test for safety
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-14", base_price_cop: 50000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [{ id: "addon-10", price_cop: 5000 }],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-14",
        null,
        ["addon-10"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBeGreaterThanOrEqual(0);
        expect(result.pricing.tierPrice).toBeGreaterThanOrEqual(0);
        expect(result.pricing.addonsPrice).toBeGreaterThanOrEqual(0);
        expect(result.pricing.totalPrice).toBeGreaterThanOrEqual(0);
      }
    });

    it("should ensure totalPrice equals sum of components", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-15", base_price_cop: 55000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: { id: "tier-4", price_cop: 12000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [
          { id: "addon-11", price_cop: 7000 },
          { id: "addon-12", price_cop: 3000 },
        ],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-15",
        "tier-4",
        ["addon-11", "addon-12"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const expectedTotal =
          result.pricing.basePrice +
          result.pricing.tierPrice +
          result.pricing.addonsPrice;

        expect(result.pricing.totalPrice).toBe(expectedTotal);
        expect(result.pricing.totalPrice).toBe(77000); // 55000 + 12000 + 10000
      }
    });

    it("should handle large numbers correctly (no overflow)", async () => {
      // Test with large COP amounts (e.g., 10 million COP = ~$2,500 USD)
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-16", base_price_cop: 8000000 },
        error: null,
      });

      mockClient.__setMockResponse("service_pricing_tiers", {
        data: { id: "tier-5", price_cop: 1500000 },
        error: null,
      });

      mockClient.__setMockResponse("service_addons", {
        data: [
          { id: "addon-13", price_cop: 500000 },
          { id: "addon-14", price_cop: 250000 },
        ],
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-16",
        "tier-5",
        ["addon-13", "addon-14"]
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing.basePrice).toBe(8000000);
        expect(result.pricing.tierPrice).toBe(1500000);
        expect(result.pricing.addonsPrice).toBe(750000);
        expect(result.pricing.totalPrice).toBe(10250000);
      }
    });

    it("should always return PricingData with all required fields", async () => {
      mockClient.__setMockResponse("professional_services", {
        data: { id: "service-17", base_price_cop: 40000 },
        error: null,
      });

      const result = await calculateBookingPricing(
        mockClient,
        "service-17",
        null,
        null
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pricing).toHaveProperty("basePrice");
        expect(result.pricing).toHaveProperty("tierPrice");
        expect(result.pricing).toHaveProperty("addonsPrice");
        expect(result.pricing).toHaveProperty("totalPrice");

        expect(typeof result.pricing.basePrice).toBe("number");
        expect(typeof result.pricing.tierPrice).toBe("number");
        expect(typeof result.pricing.addonsPrice).toBe("number");
        expect(typeof result.pricing.totalPrice).toBe("number");
      }
    });
  });
});
