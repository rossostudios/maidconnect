/**
 * BalanceService Unit Tests
 *
 * Tests core balance operations:
 * - Balance calculations with platform fee (18%)
 * - Instant payout fee calculations (1.5%)
 * - Minimum threshold enforcement (50,000 COP)
 * - Rate limiting (3/day max)
 * - Validation logic
 */

import { beforeEach, describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { BalanceService } from "./balance-service";

// ========================================
// Mock Supabase Client Factory
// ========================================

type MockFromResult = {
  select: () => MockSelectResult;
};

type MockSelectResult = {
  eq: (key: string, value: string | number) => MockEqResult;
};

type MockEqResult = {
  eq: (key: string, value: string | number) => MockFinalResult;
  single: () => Promise<{ data: unknown; error: unknown }>;
};

type MockFinalResult = {
  single: () => Promise<{ data: unknown; error: unknown }>;
};

type MockFromHandler = (table: string) => MockFromResult;

function createMockSupabase(fromHandler: MockFromHandler): SupabaseClient<Database> {
  return {
    from: fromHandler,
  } as unknown as SupabaseClient<Database>;
}

// Default mock that returns errors (for tests that don't need supabase)
const defaultFromHandler: MockFromHandler = () => ({
  select: () => ({
    eq: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: "Not mocked" } }),
      }),
      single: () => Promise.resolve({ data: null, error: { message: "Not mocked" } }),
    }),
  }),
});

describe("BalanceService", () => {
  let service: BalanceService;
  let mockFromHandler: MockFromHandler;

  beforeEach(() => {
    // Reset to default mock - individual tests can override
    mockFromHandler = defaultFromHandler;
    service = new BalanceService(createMockSupabase(mockFromHandler));
  });

  // ========================================
  // Balance Calculation Tests (Sync - No Supabase)
  // ========================================

  describe("calculateProfessionalEarnings", () => {
    it("should deduct 18% platform fee from booking amount", () => {
      const bookingAmount = 100_000; // 100,000 COP
      const expectedEarnings = 82_000; // 82,000 COP (after 18% fee)

      const result = service.calculateProfessionalEarnings(bookingAmount);

      expect(result).toBe(expectedEarnings);
    });

    it("should round earnings to nearest integer", () => {
      const bookingAmount = 100_001; // Results in 82,000.82
      const expectedEarnings = 82_001; // Rounded

      const result = service.calculateProfessionalEarnings(bookingAmount);

      expect(result).toBe(expectedEarnings);
    });

    it("should handle zero amount", () => {
      const result = service.calculateProfessionalEarnings(0);
      expect(result).toBe(0);
    });

    it("should calculate correctly for typical booking amounts", () => {
      // Typical 4-hour cleaning: 60,000 COP
      expect(service.calculateProfessionalEarnings(60_000)).toBe(49_200);

      // Typical 8-hour deep clean: 120,000 COP
      expect(service.calculateProfessionalEarnings(120_000)).toBe(98_400);

      // Large booking: 500,000 COP
      expect(service.calculateProfessionalEarnings(500_000)).toBe(410_000);
    });
  });

  // ========================================
  // Fee Configuration Tests (Async - Need Supabase)
  // ========================================

  describe("getInstantPayoutFeePercentage", () => {
    it("should return default fee (1.5%) if platform setting fails", async () => {
      // Create service with error-returning mock
      const errorHandler: MockFromHandler = () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
            }),
            single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });
      const testService = new BalanceService(createMockSupabase(errorHandler));

      const fee = await testService.getInstantPayoutFeePercentage();

      expect(fee).toBe(1.5);
    });

    it("should parse numeric setting value", async () => {
      const handler: MockFromHandler = () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { setting_value: 2.0 }, error: null }),
            }),
            single: () => Promise.resolve({ data: { setting_value: 2.0 }, error: null }),
          }),
        }),
      });
      const testService = new BalanceService(createMockSupabase(handler));

      const fee = await testService.getInstantPayoutFeePercentage();

      expect(fee).toBe(2.0);
    });

    it("should parse string setting value", async () => {
      const handler: MockFromHandler = () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { setting_value: "1.75" }, error: null }),
            }),
            single: () => Promise.resolve({ data: { setting_value: "1.75" }, error: null }),
          }),
        }),
      });
      const testService = new BalanceService(createMockSupabase(handler));

      const fee = await testService.getInstantPayoutFeePercentage();

      expect(fee).toBe(1.75);
    });
  });

  describe("getMinimumPayoutAmount", () => {
    it("should return default minimum (50,000 COP) if platform setting fails", async () => {
      const errorHandler: MockFromHandler = () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
            }),
            single: () => Promise.resolve({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });
      const testService = new BalanceService(createMockSupabase(errorHandler));

      const minimum = await testService.getMinimumPayoutAmount();

      expect(minimum).toBe(50_000);
    });

    it("should parse numeric setting value", async () => {
      const handler: MockFromHandler = () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { setting_value: 100_000 }, error: null }),
            }),
            single: () => Promise.resolve({ data: { setting_value: 100_000 }, error: null }),
          }),
        }),
      });
      const testService = new BalanceService(createMockSupabase(handler));

      const minimum = await testService.getMinimumPayoutAmount();

      expect(minimum).toBe(100_000);
    });
  });

  // ========================================
  // Instant Payout Validation Tests
  // ========================================

  describe("validateInstantPayout", () => {
    // Helper to create a mock that responds differently per table
    function createTableMock(tableResponses: Record<string, unknown>): MockFromHandler {
      return (table: string) => ({
        select: () => ({
          eq: (_key: string, value: string | number) => ({
            eq: (_key2: string, _value2: string | number) => ({
              single: () => {
                const response = tableResponses[table];
                return Promise.resolve(
                  response
                    ? { data: response, error: null }
                    : { data: null, error: { message: "Not found" } }
                );
              },
            }),
            single: () => {
              const response = tableResponses[table];
              // Handle platform_settings which needs key-based lookup
              if (
                table === "platform_settings" &&
                typeof tableResponses.platform_settings === "function"
              ) {
                return Promise.resolve(
                  (tableResponses.platform_settings as (key: string) => unknown)(String(value))
                );
              }
              return Promise.resolve(
                response
                  ? { data: response, error: null }
                  : { data: null, error: { message: "Not found" } }
              );
            },
          }),
        }),
      });
    }

    it("should reject payout below minimum threshold", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 100_000,
              instant_payout_enabled: true,
              stripe_connect_account_id: "acct_123",
              stripe_connect_onboarding_status: "complete",
            },
            payout_rate_limits: { instant_payout_count: 0 },
            platform_settings: (key: string) => {
              if (key === "minimum_instant_payout_cop") {
                return { data: { setting_value: 50_000 }, error: null };
              }
              return { data: { setting_value: 1.5 }, error: null };
            },
          })
        )
      );

      const result = await testService.validateInstantPayout("prof-123", 30_000); // Below 50k minimum

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: string) => e.includes("Minimum instant payout is 50,000 COP"))
      ).toBe(true);
    });

    it("should reject payout if available balance is insufficient", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 40_000, // Only 40k available
              instant_payout_enabled: true,
              stripe_connect_account_id: "acct_123",
              stripe_connect_onboarding_status: "complete",
            },
            payout_rate_limits: null,
            platform_settings: { setting_value: 50_000 },
          })
        )
      );

      const result = await testService.validateInstantPayout("prof-123", 60_000); // Requesting 60k

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes("Insufficient balance"))).toBe(true);
    });

    it("should reject if Stripe Connect is not set up", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 100_000,
              instant_payout_enabled: true,
              stripe_connect_account_id: null, // No Stripe account
              stripe_connect_onboarding_status: "pending",
            },
            payout_rate_limits: null,
            platform_settings: { setting_value: 50_000 },
          })
        )
      );

      const result = await testService.validateInstantPayout("prof-123", 60_000);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e: string) => e.includes("Please complete your payout setup"))
      ).toBe(true);
    });

    it("should reject if daily rate limit is reached", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 100_000,
              instant_payout_enabled: true,
              stripe_connect_account_id: "acct_123",
              stripe_connect_onboarding_status: "complete",
            },
            payout_rate_limits: { instant_payout_count: 3 }, // Already at limit
            platform_settings: { setting_value: 50_000 },
          })
        )
      );

      const result = await testService.validateInstantPayout("prof-123", 60_000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes("Daily limit reached"))).toBe(true);
    });

    it("should calculate fee correctly (1.5% default)", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 200_000,
              instant_payout_enabled: true,
              stripe_connect_account_id: "acct_123",
              stripe_connect_onboarding_status: "complete",
            },
            payout_rate_limits: { instant_payout_count: 0 },
            platform_settings: (key: string) => {
              if (key === "instant_payout_fee_percentage") {
                return { data: { setting_value: 1.5 }, error: null };
              }
              if (key === "minimum_instant_payout_cop") {
                return { data: { setting_value: 50_000 }, error: null };
              }
              return { data: null, error: null };
            },
          })
        )
      );

      const requestedAmount = 100_000; // 100,000 COP
      const expectedFee = 1500; // 1.5% = 1,500 COP
      const expectedNet = 98_500; // 98,500 COP

      const result = await testService.validateInstantPayout("prof-123", requestedAmount);

      expect(result.isValid).toBe(true);
      expect(result.requestedAmount).toBe(requestedAmount);
      expect(result.feeAmount).toBe(expectedFee);
      expect(result.netAmount).toBe(expectedNet);
    });

    it("should pass validation for valid payout request", async () => {
      const testService = new BalanceService(
        createMockSupabase(
          createTableMock({
            professional_profiles: {
              available_balance_cop: 150_000,
              instant_payout_enabled: true,
              stripe_connect_account_id: "acct_123",
              stripe_connect_onboarding_status: "complete",
            },
            payout_rate_limits: { instant_payout_count: 1 },
            platform_settings: (key: string) => {
              if (key === "instant_payout_fee_percentage") {
                return { data: { setting_value: 1.5 }, error: null };
              }
              if (key === "minimum_instant_payout_cop") {
                return { data: { setting_value: 50_000 }, error: null };
              }
              return { data: null, error: null };
            },
          })
        )
      );

      const result = await testService.validateInstantPayout("prof-123", 100_000);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.availableBalance).toBe(150_000);
    });
  });
});
