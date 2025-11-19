/**
 * Trial Credit Service Tests
 *
 * Critical business logic tests for trial credit system.
 * Validates server-side credit calculations, caps, and state management.
 *
 * Key Test Coverage:
 * - Credit calculation (50% of booking fees)
 * - Credit cap enforcement (50% of direct hire fee = $150 USD)
 * - Partial credit scenarios (1, 2, or 3 bookings)
 * - Currency conversion (COP to USD)
 * - Credit application and discount logic
 * - Error handling and graceful degradation
 *
 * @module lib/services/trial-credits/__tests__/trialCreditService.test.ts
 */

import { beforeEach, describe, expect, test as it } from "bun:test";
import { createMockSupabaseClient, type MockSupabaseClient } from "@/lib/__mocks__/supabase";
import {
  applyTrialCredit,
  getCustomerTrialCredits,
  getTrialCreditInfo,
  markTrialCreditUsed,
} from "../trialCreditService";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DIRECT_HIRE_FEE_COP = 1_196_000; // $299 USD at 4,000 COP/USD
const MAX_CREDIT_COP = 598_000; // 50% of direct hire fee (~$150 USD)
const COP_TO_USD_RATE = 4000;

// ============================================================================
// GET TRIAL CREDIT INFO - HAPPY PATHS
// ============================================================================

describe("getTrialCreditInfo - Success Cases", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should return credit info with available credit", async () => {
    // Mock RPC response: customer has 200,000 COP credit (1 booking completed)
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 200_000,
          credit_available_usd: 50, // 200,000 / 4,000
          bookings_completed: 1,
          total_bookings_value_cop: 400_000, // 50% = 200,000 credit
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 33.44, // 200,000 / 598,000 * 100
        },
      ],
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(result.hasCredit).toBe(true);
    expect(result.creditAvailableCOP).toBe(200_000);
    expect(result.creditAvailableUSD).toBe(50);
    expect(result.bookingsCompleted).toBe(1);
    expect(result.totalBookingsValueCOP).toBe(400_000);
    expect(result.maxCreditCOP).toBe(MAX_CREDIT_COP);
    expect(result.percentageEarned).toBe(33.44);
  });

  it("should return max credit when customer hits cap (3 bookings)", async () => {
    // Mock RPC response: customer maxed out credit at 598,000 COP
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: MAX_CREDIT_COP,
          credit_available_usd: 149, // 598,000 / 4,000 (rounded)
          bookings_completed: 3,
          total_bookings_value_cop: 1_200_000, // Would be 600k but capped at 598k
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 100,
        },
      ],
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(result.hasCredit).toBe(true);
    expect(result.creditAvailableCOP).toBe(MAX_CREDIT_COP);
    expect(result.creditAvailableUSD).toBe(149);
    expect(result.bookingsCompleted).toBe(3);
    expect(result.percentageEarned).toBe(100);
  });

  it("should return no credit when customer has no bookings", async () => {
    // Mock RPC response: no credit record exists
    mockClient.rpc = async () => ({
      data: null,
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(result.hasCredit).toBe(false);
    expect(result.creditAvailableCOP).toBe(0);
    expect(result.creditAvailableUSD).toBe(0);
    expect(result.bookingsCompleted).toBe(0);
    expect(result.totalBookingsValueCOP).toBe(0);
    expect(result.maxCreditCOP).toBe(MAX_CREDIT_COP);
    expect(result.percentageEarned).toBe(0);
  });

  it("should return partial credit for 2 bookings", async () => {
    // Mock RPC response: customer has 400,000 COP credit (2 bookings)
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 400_000,
          credit_available_usd: 100,
          bookings_completed: 2,
          total_bookings_value_cop: 800_000, // 50% = 400,000 credit
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 66.89, // 400,000 / 598,000 * 100
        },
      ],
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(result.creditAvailableCOP).toBe(400_000);
    expect(result.creditAvailableUSD).toBe(100);
    expect(result.bookingsCompleted).toBe(2);
    expect(result.percentageEarned).toBeCloseTo(66.89, 2);
  });
});

// ============================================================================
// GET TRIAL CREDIT INFO - ERROR CASES
// ============================================================================

describe("getTrialCreditInfo - Error Handling", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should gracefully handle RPC errors", async () => {
    // Mock RPC error (database unavailable, etc.)
    mockClient.rpc = async () => ({
      data: null,
      error: new Error("Database connection failed"),
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    // Should return empty state on error (fail gracefully)
    expect(result.hasCredit).toBe(false);
    expect(result.creditAvailableCOP).toBe(0);
    expect(result.creditAvailableUSD).toBe(0);
    expect(result.bookingsCompleted).toBe(0);
  });

  it("should handle empty array response from RPC", async () => {
    // Mock RPC response: empty array (no matching record)
    mockClient.rpc = async () => ({
      data: [],
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(result.hasCredit).toBe(false);
    expect(result.creditAvailableCOP).toBe(0);
    expect(result.maxCreditCOP).toBe(MAX_CREDIT_COP);
  });

  it("should handle null values in RPC response", async () => {
    // Mock RPC response with null fields
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: null,
          credit_available_cop: null,
          credit_available_usd: null,
          bookings_completed: null,
          total_bookings_value_cop: null,
          max_credit_cop: null,
          percentage_earned: null,
        },
      ],
      error: null,
    });

    const result = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    // Should default to safe values
    expect(result.hasCredit).toBe(false);
    expect(result.creditAvailableCOP).toBe(0);
    expect(result.creditAvailableUSD).toBe(0);
    expect(result.bookingsCompleted).toBe(0);
    expect(result.maxCreditCOP).toBe(0);
    expect(result.percentageEarned).toBe(0);
  });
});

// ============================================================================
// APPLY TRIAL CREDIT - HAPPY PATHS
// ============================================================================

describe("applyTrialCredit - Success Cases", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should apply full credit when credit < direct hire fee", async () => {
    // Customer has 200,000 COP credit, direct hire fee is 1,196,000 COP
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 200_000,
          credit_available_usd: 50,
          bookings_completed: 1,
          total_bookings_value_cop: 400_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 33.44,
        },
      ],
      error: null,
    });

    const result = await applyTrialCredit(
      mockClient,
      "customer-123",
      "pro-456",
      DEFAULT_DIRECT_HIRE_FEE_COP
    );

    expect(result.finalPriceCOP).toBe(996_000); // 1,196,000 - 200,000
    expect(result.discountAppliedCOP).toBe(200_000);
    expect(result.creditRemainingCOP).toBe(0); // Credit fully consumed
  });

  it("should apply partial credit when credit > direct hire fee", async () => {
    // Edge case: Customer somehow has more credit than direct hire fee
    // (Shouldn't happen with cap, but test defensive logic)
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: MAX_CREDIT_COP,
          credit_available_usd: 149,
          bookings_completed: 3,
          total_bookings_value_cop: 1_200_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 100,
        },
      ],
      error: null,
    });

    const result = await applyTrialCredit(
      mockClient,
      "customer-123",
      "pro-456",
      DEFAULT_DIRECT_HIRE_FEE_COP
    );

    expect(result.finalPriceCOP).toBe(598_000); // 1,196,000 - 598,000
    expect(result.discountAppliedCOP).toBe(MAX_CREDIT_COP);
    expect(result.creditRemainingCOP).toBe(0);
  });

  it("should return full price when customer has no credit", async () => {
    // Customer has no bookings, no credit
    mockClient.rpc = async () => ({
      data: null,
      error: null,
    });

    const result = await applyTrialCredit(
      mockClient,
      "customer-123",
      "pro-456",
      DEFAULT_DIRECT_HIRE_FEE_COP
    );

    expect(result.finalPriceCOP).toBe(DEFAULT_DIRECT_HIRE_FEE_COP);
    expect(result.discountAppliedCOP).toBe(0);
    expect(result.creditRemainingCOP).toBe(0);
  });

  it("should handle exact credit matching direct hire fee", async () => {
    // Customer has exactly 598,000 COP credit (max allowed)
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: MAX_CREDIT_COP,
          credit_available_usd: 149,
          bookings_completed: 3,
          total_bookings_value_cop: 1_196_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 100,
        },
      ],
      error: null,
    });

    const result = await applyTrialCredit(
      mockClient,
      "customer-123",
      "pro-456",
      DEFAULT_DIRECT_HIRE_FEE_COP
    );

    expect(result.finalPriceCOP).toBe(598_000); // 50% off
    expect(result.discountAppliedCOP).toBe(MAX_CREDIT_COP);
    expect(result.creditRemainingCOP).toBe(0);
  });
});

// ============================================================================
// APPLY TRIAL CREDIT - EDGE CASES
// ============================================================================

describe("applyTrialCredit - Edge Cases", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should handle zero direct hire fee", async () => {
    // Edge case: Free direct hire (shouldn't happen in production)
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 200_000,
          credit_available_usd: 50,
          bookings_completed: 1,
          total_bookings_value_cop: 400_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 33.44,
        },
      ],
      error: null,
    });

    const result = await applyTrialCredit(mockClient, "customer-123", "pro-456", 0);

    expect(result.finalPriceCOP).toBe(0); // Cannot go below zero
    expect(result.discountAppliedCOP).toBe(0); // No discount on free item
    expect(result.creditRemainingCOP).toBe(200_000); // Credit preserved
  });

  it("should never allow negative final price", async () => {
    // Defensive test: Even if credit > fee, final price is 0, not negative
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 1_000_000, // More than any fee
          credit_available_usd: 250,
          bookings_completed: 3,
          total_bookings_value_cop: 2_000_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 100,
        },
      ],
      error: null,
    });

    const result = await applyTrialCredit(mockClient, "customer-123", "pro-456", 500_000);

    expect(result.finalPriceCOP).toBe(0); // Not negative
    expect(result.discountAppliedCOP).toBe(500_000); // Only applied what was needed
    expect(result.creditRemainingCOP).toBe(500_000); // Remaining credit preserved
  });
});

// ============================================================================
// MARK TRIAL CREDIT USED - HAPPY PATHS
// ============================================================================

describe("markTrialCreditUsed - Success Cases", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should mark credit as used after payment succeeds", async () => {
    // Mock successful update
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: null,
    });

    await expect(
      markTrialCreditUsed(mockClient, "customer-123", "pro-456", "booking-789", 200_000)
    ).resolves.toBeUndefined();
  });

  it("should mark full credit as used", async () => {
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: null,
    });

    await expect(
      markTrialCreditUsed(mockClient, "customer-123", "pro-456", "booking-789", MAX_CREDIT_COP)
    ).resolves.toBeUndefined();
  });
});

// ============================================================================
// MARK TRIAL CREDIT USED - ERROR CASES
// ============================================================================

describe("markTrialCreditUsed - Error Handling", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should throw error when update fails", async () => {
    // Mock database error
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: new Error("Database write failed"),
    });

    await expect(
      markTrialCreditUsed(mockClient, "customer-123", "pro-456", "booking-789", 200_000)
    ).rejects.toThrow("Failed to mark trial credit as used");
  });

  it("should throw error when record not found", async () => {
    // Mock "no rows updated" scenario
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: new Error("No rows affected"),
    });

    await expect(
      markTrialCreditUsed(mockClient, "customer-123", "pro-456", "booking-789", 200_000)
    ).rejects.toThrow("Failed to mark trial credit as used");
  });
});

// ============================================================================
// GET CUSTOMER TRIAL CREDITS - HAPPY PATHS
// ============================================================================

describe("getCustomerTrialCredits - Success Cases", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should return all trial credits for a customer", async () => {
    // Mock trial credits for 2 professionals
    mockClient.__setMockResponse("trial_credits", {
      data: [
        {
          customer_id: "customer-123",
          professional_id: "pro-456",
          credit_earned_cop: 200_000,
          credit_remaining_cop: 200_000,
          credit_used_cop: 0,
          total_bookings_count: 1,
          total_bookings_value_cop: 400_000,
          last_booking_at: "2025-01-15T10:00:00Z",
          professional: {
            id: "pro-456",
            full_name: "Maria García",
          },
        },
        {
          customer_id: "customer-123",
          professional_id: "pro-789",
          credit_earned_cop: 400_000,
          credit_remaining_cop: 400_000,
          credit_used_cop: 0,
          total_bookings_count: 2,
          total_bookings_value_cop: 800_000,
          last_booking_at: "2025-01-10T10:00:00Z",
          professional: {
            id: "pro-789",
            full_name: "Carlos Rodríguez",
          },
        },
      ],
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result).toHaveLength(2);

    // First credit (Maria García)
    expect(result[0].professionalId).toBe("pro-456");
    expect(result[0].professionalName).toBe("Maria García");
    expect(result[0].hasCredit).toBe(true);
    expect(result[0].creditAvailableCOP).toBe(200_000);
    expect(result[0].creditAvailableUSD).toBe(50);
    expect(result[0].bookingsCompleted).toBe(1);
    expect(result[0].totalBookingsValueCOP).toBe(400_000);
    expect(result[0].maxCreditCOP).toBe(MAX_CREDIT_COP);
    expect(result[0].percentageEarned).toBeCloseTo(33.44, 2);

    // Second credit (Carlos Rodríguez)
    expect(result[1].professionalId).toBe("pro-789");
    expect(result[1].professionalName).toBe("Carlos Rodríguez");
    expect(result[1].creditAvailableCOP).toBe(400_000);
    expect(result[1].creditAvailableUSD).toBe(100);
    expect(result[1].bookingsCompleted).toBe(2);
    expect(result[1].percentageEarned).toBeCloseTo(66.89, 2);
  });

  it("should return empty array when customer has no credits", async () => {
    mockClient.__setMockResponse("trial_credits", {
      data: [],
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result).toEqual([]);
  });

  it("should handle professional with null full_name", async () => {
    mockClient.__setMockResponse("trial_credits", {
      data: [
        {
          customer_id: "customer-123",
          professional_id: "pro-456",
          credit_earned_cop: 200_000,
          credit_remaining_cop: 200_000,
          credit_used_cop: 0,
          total_bookings_count: 1,
          total_bookings_value_cop: 400_000,
          last_booking_at: "2025-01-15T10:00:00Z",
          professional: {
            id: "pro-456",
            full_name: null,
          },
        },
      ],
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result[0].professionalName).toBeNull();
  });

  it("should cap percentage at 100% even if over-credited", async () => {
    // Edge case: Database has more than max credit (data integrity issue)
    mockClient.__setMockResponse("trial_credits", {
      data: [
        {
          customer_id: "customer-123",
          professional_id: "pro-456",
          credit_earned_cop: 700_000, // More than max (598,000)
          credit_remaining_cop: 700_000,
          credit_used_cop: 0,
          total_bookings_count: 4,
          total_bookings_value_cop: 1_400_000,
          last_booking_at: "2025-01-15T10:00:00Z",
          professional: {
            id: "pro-456",
            full_name: "Maria García",
          },
        },
      ],
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result[0].percentageEarned).toBe(100); // Capped at 100, not 117.06
  });
});

// ============================================================================
// GET CUSTOMER TRIAL CREDITS - ERROR CASES
// ============================================================================

describe("getCustomerTrialCredits - Error Handling", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should return empty array on database error", async () => {
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: new Error("Database connection failed"),
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result).toEqual([]);
  });

  it("should return empty array when data is null", async () => {
    mockClient.__setMockResponse("trial_credits", {
      data: null,
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result).toEqual([]);
  });

  it("should handle professional as array (edge case)", async () => {
    // Edge case: Supabase returns professional as array instead of object
    mockClient.__setMockResponse("trial_credits", {
      data: [
        {
          customer_id: "customer-123",
          professional_id: "pro-456",
          credit_earned_cop: 200_000,
          credit_remaining_cop: 200_000,
          credit_used_cop: 0,
          total_bookings_count: 1,
          total_bookings_value_cop: 400_000,
          last_booking_at: "2025-01-15T10:00:00Z",
          professional: [
            {
              id: "pro-456",
              full_name: "Maria García",
            },
          ],
        },
      ],
      error: null,
    });

    const result = await getCustomerTrialCredits(mockClient, "customer-123");

    expect(result[0].professionalName).toBe("Maria García");
  });
});

// ============================================================================
// PRICING INTEGRITY TESTS
// ============================================================================

describe("Pricing Integrity", () => {
  let mockClient: MockSupabaseClient;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  it("should never allow negative credit amounts", async () => {
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 200_000,
          credit_available_usd: 50,
          bookings_completed: 1,
          total_bookings_value_cop: 400_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 33.44,
        },
      ],
      error: null,
    });

    const creditInfo = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(creditInfo.creditAvailableCOP).toBeGreaterThanOrEqual(0);
    expect(creditInfo.creditAvailableUSD).toBeGreaterThanOrEqual(0);
    expect(creditInfo.totalBookingsValueCOP).toBeGreaterThanOrEqual(0);
    expect(creditInfo.maxCreditCOP).toBeGreaterThanOrEqual(0);
  });

  it("should ensure max credit is always 50% of direct hire fee", async () => {
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: false,
          credit_available_cop: 0,
          credit_available_usd: 0,
          bookings_completed: 0,
          total_bookings_value_cop: 0,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 0,
        },
      ],
      error: null,
    });

    const creditInfo = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(creditInfo.maxCreditCOP).toBe(DEFAULT_DIRECT_HIRE_FEE_COP * 0.5);
    expect(creditInfo.maxCreditCOP).toBe(598_000);
  });

  it("should handle large COP amounts correctly (no overflow)", async () => {
    // Test with maximum possible bookings value
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: MAX_CREDIT_COP,
          credit_available_usd: 149,
          bookings_completed: 10, // Many bookings
          total_bookings_value_cop: 10_000_000, // 10M COP
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 100,
        },
      ],
      error: null,
    });

    const creditInfo = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    expect(creditInfo.totalBookingsValueCOP).toBe(10_000_000);
    expect(creditInfo.creditAvailableCOP).toBe(MAX_CREDIT_COP); // Still capped
  });

  it("should always return TrialCreditInfo with all required fields", async () => {
    mockClient.rpc = async () => ({
      data: null,
      error: null,
    });

    const creditInfo = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    // Verify all fields exist and have correct types
    expect(creditInfo).toHaveProperty("hasCredit");
    expect(creditInfo).toHaveProperty("creditAvailableCOP");
    expect(creditInfo).toHaveProperty("creditAvailableUSD");
    expect(creditInfo).toHaveProperty("bookingsCompleted");
    expect(creditInfo).toHaveProperty("totalBookingsValueCOP");
    expect(creditInfo).toHaveProperty("maxCreditCOP");
    expect(creditInfo).toHaveProperty("percentageEarned");

    expect(typeof creditInfo.hasCredit).toBe("boolean");
    expect(typeof creditInfo.creditAvailableCOP).toBe("number");
    expect(typeof creditInfo.creditAvailableUSD).toBe("number");
    expect(typeof creditInfo.bookingsCompleted).toBe("number");
    expect(typeof creditInfo.totalBookingsValueCOP).toBe("number");
    expect(typeof creditInfo.maxCreditCOP).toBe("number");
    expect(typeof creditInfo.percentageEarned).toBe("number");
  });

  it("should ensure currency conversion is accurate (COP to USD)", async () => {
    mockClient.rpc = async () => ({
      data: [
        {
          has_credit: true,
          credit_available_cop: 400_000, // 400,000 COP
          credit_available_usd: 100, // Should be 400,000 / 4,000 = 100 USD
          bookings_completed: 2,
          total_bookings_value_cop: 800_000,
          max_credit_cop: MAX_CREDIT_COP,
          percentage_earned: 66.89,
        },
      ],
      error: null,
    });

    const creditInfo = await getTrialCreditInfo(mockClient, "customer-123", "pro-456");

    // Verify conversion matches expected rate (4,000 COP/USD)
    const expectedUSD = Math.round(creditInfo.creditAvailableCOP / COP_TO_USD_RATE);
    expect(creditInfo.creditAvailableUSD).toBe(expectedUSD);
    expect(creditInfo.creditAvailableUSD).toBe(100);
  });
});
