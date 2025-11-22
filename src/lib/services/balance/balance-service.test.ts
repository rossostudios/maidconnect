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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { BalanceService } from "./balance-service";

// Mock Supabase client
vi.mock("@/lib/integrations/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
  })),
}));

describe("BalanceService", () => {
  let service: BalanceService;

  beforeEach(() => {
    service = new BalanceService();
    vi.clearAllMocks();
  });

  // ========================================
  // Balance Calculation Tests
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
  // Fee Configuration Tests
  // ========================================

  describe("getInstantPayoutFeePercentage", () => {
    it("should return default fee (1.5%) if platform setting fails", async () => {
      const mockSupabase = service["supabase"] as any;
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: "Not found" } })),
          })),
        })),
      }));

      const fee = await service.getInstantPayoutFeePercentage();

      expect(fee).toBe(1.5);
    });

    it("should parse numeric setting value", async () => {
      const mockSupabase = service["supabase"] as any;
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { setting_value: 2.0 }, error: null })),
          })),
        })),
      }));

      const fee = await service.getInstantPayoutFeePercentage();

      expect(fee).toBe(2.0);
    });

    it("should parse string setting value", async () => {
      const mockSupabase = service["supabase"] as any;
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { setting_value: "1.75" }, error: null })),
          })),
        })),
      }));

      const fee = await service.getInstantPayoutFeePercentage();

      expect(fee).toBe(1.75);
    });
  });

  describe("getMinimumPayoutAmount", () => {
    it("should return default minimum (50,000 COP) if platform setting fails", async () => {
      const mockSupabase = service["supabase"] as any;
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: "Not found" } })),
          })),
        })),
      }));

      const minimum = await service.getMinimumPayoutAmount();

      expect(minimum).toBe(50_000);
    });

    it("should parse numeric setting value", async () => {
      const mockSupabase = service["supabase"] as any;
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { setting_value: 100_000 }, error: null })),
          })),
        })),
      }));

      const minimum = await service.getMinimumPayoutAmount();

      expect(minimum).toBe(100_000);
    });
  });

  // ========================================
  // Instant Payout Validation Tests
  // ========================================

  describe("validateInstantPayout", () => {
    it("should reject payout below minimum threshold", async () => {
      const mockSupabase = service["supabase"] as any;

      // Mock professional profile with sufficient balance
      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 100_000,
                      instant_payout_enabled: true,
                      stripe_connect_account_id: "acct_123",
                      stripe_connect_onboarding_status: "complete",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({ data: { instant_payout_count: 0 }, error: null })
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { setting_value: 50_000 }, error: null })
                ),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const result = await service.validateInstantPayout("prof-123", 30_000); // Below 50k minimum

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining("Minimum instant payout is 50,000 COP")
      );
    });

    it("should reject payout if available balance is insufficient", async () => {
      const mockSupabase = service["supabase"] as any;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 40_000, // Only 40k available
                      instant_payout_enabled: true,
                      stripe_connect_account_id: "acct_123",
                      stripe_connect_onboarding_status: "complete",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { setting_value: 50_000 }, error: null })
                ),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const result = await service.validateInstantPayout("prof-123", 60_000); // Requesting 60k

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining("Insufficient balance"));
    });

    it("should reject if Stripe Connect is not set up", async () => {
      const mockSupabase = service["supabase"] as any;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 100_000,
                      instant_payout_enabled: true,
                      stripe_connect_account_id: null, // No Stripe account
                      stripe_connect_onboarding_status: "pending",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { setting_value: 50_000 }, error: null })
                ),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const result = await service.validateInstantPayout("prof-123", 60_000);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining("Please complete your payout setup"));
    });

    it("should reject if daily rate limit is reached", async () => {
      const mockSupabase = service["supabase"] as any;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 100_000,
                      instant_payout_enabled: true,
                      stripe_connect_account_id: "acct_123",
                      stripe_connect_onboarding_status: "complete",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(
                    () => Promise.resolve({ data: { instant_payout_count: 3 }, error: null }) // Already at limit
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { setting_value: 50_000 }, error: null })
                ),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const result = await service.validateInstantPayout("prof-123", 60_000);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining("Daily limit reached"));
    });

    it("should calculate fee correctly (1.5% default)", async () => {
      const mockSupabase = service["supabase"] as any;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 200_000,
                      instant_payout_enabled: true,
                      stripe_connect_account_id: "acct_123",
                      stripe_connect_onboarding_status: "complete",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({ data: { instant_payout_count: 0 }, error: null })
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((key: string) => ({
                single: vi.fn(() => {
                  if (key === "instant_payout_fee_percentage") {
                    return Promise.resolve({ data: { setting_value: 1.5 }, error: null });
                  }
                  if (key === "minimum_instant_payout_cop") {
                    return Promise.resolve({ data: { setting_value: 50_000 }, error: null });
                  }
                  return Promise.resolve({ data: null, error: null });
                }),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const requestedAmount = 100_000; // 100,000 COP
      const expectedFee = 1500; // 1.5% = 1,500 COP
      const expectedNet = 98_500; // 98,500 COP

      const result = await service.validateInstantPayout("prof-123", requestedAmount);

      expect(result.isValid).toBe(true);
      expect(result.requestedAmount).toBe(requestedAmount);
      expect(result.feeAmount).toBe(expectedFee);
      expect(result.netAmount).toBe(expectedNet);
    });

    it("should pass validation for valid payout request", async () => {
      const mockSupabase = service["supabase"] as any;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "professional_profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      available_balance_cop: 150_000,
                      instant_payout_enabled: true,
                      stripe_connect_account_id: "acct_123",
                      stripe_connect_onboarding_status: "complete",
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }
        if (table === "payout_rate_limits") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({ data: { instant_payout_count: 1 }, error: null })
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "platform_settings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((key: string) => ({
                single: vi.fn(() => {
                  if (key === "instant_payout_fee_percentage") {
                    return Promise.resolve({ data: { setting_value: 1.5 }, error: null });
                  }
                  if (key === "minimum_instant_payout_cop") {
                    return Promise.resolve({ data: { setting_value: 50_000 }, error: null });
                  }
                  return Promise.resolve({ data: null, error: null });
                }),
              })),
            })),
          };
        }
        return { select: vi.fn() };
      });

      const result = await service.validateInstantPayout("prof-123", 100_000);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.availableBalance).toBe(150_000);
    });
  });
});
