/**
 * Tests for Booking Workflow Service
 * Covers accept/decline workflows, status validation, payment cancellation, and notifications
 */

import { beforeEach, describe, expect, test as it, mock } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cancelPaymentIntent,
  formatAddress,
  formatAmount,
  formatDuration,
  formatScheduledDate,
  formatScheduledTime,
  updateBookingToConfirmed,
  updateBookingToDeclined,
  validateAcceptEligibility,
  validateDeclineEligibility,
} from "../bookingWorkflowService";

// Mock dependencies
const mockSupabase = {
  from: mock(() => ({
    update: mock(() => ({
      eq: mock(() => ({
        select: mock(() => ({
          single: mock(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
    select: mock(() => ({
      eq: mock(() => ({
        single: mock(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
  })),
} as unknown as SupabaseClient;

const mockStripe = {
  paymentIntents: {
    cancel: mock(() => Promise.resolve({ id: "pi_123", status: "canceled" })),
  },
};

// Mock Stripe module
mock.module("@/lib/integrations/stripe/client", () => ({
  stripe: mockStripe,
}));

describe("Booking Workflow Service - Status Validation", () => {
  describe("validateAcceptEligibility", () => {
    it("should allow accepting booking with authorized status", () => {
      const result = validateAcceptEligibility("authorized");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject accepting booking with pending_payment status", () => {
      const result = validateAcceptEligibility("pending_payment");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot accept booking with status: pending_payment");
    });

    it("should reject accepting booking with confirmed status", () => {
      const result = validateAcceptEligibility("confirmed");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot accept booking");
    });

    it("should reject accepting booking with canceled status", () => {
      const result = validateAcceptEligibility("canceled");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot accept booking");
    });

    it("should reject accepting booking with completed status", () => {
      const result = validateAcceptEligibility("completed");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot accept booking");
    });
  });

  describe("validateDeclineEligibility", () => {
    it("should allow declining booking with authorized status", () => {
      const result = validateDeclineEligibility("authorized");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should allow declining booking with pending_payment status", () => {
      const result = validateDeclineEligibility("pending_payment");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject declining booking with confirmed status", () => {
      const result = validateDeclineEligibility("confirmed");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot decline booking with status: confirmed");
    });

    it("should reject declining booking with canceled status", () => {
      const result = validateDeclineEligibility("canceled");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot decline booking");
    });

    it("should reject declining booking with completed status", () => {
      const result = validateDeclineEligibility("completed");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot decline booking");
    });
  });
});

describe("Booking Workflow Service - Database Updates", () => {
  beforeEach(() => {
    // Reset all mocks
    mock.restore();
  });

  describe("updateBookingToConfirmed", () => {
    it("should successfully update booking to confirmed status", async () => {
      const mockUpdate = mock(() => ({
        eq: mock(() => Promise.resolve({ error: null })),
      }));

      const mockFrom = mock(() => ({
        update: mockUpdate,
      }));

      const supabase = { from: mockFrom } as unknown as SupabaseClient;

      const result = await updateBookingToConfirmed(supabase, "booking-123");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFrom).toHaveBeenCalledWith("bookings");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
          updated_at: expect.any(String),
        })
      );
    });

    it("should handle database errors when updating to confirmed", async () => {
      const mockUpdate = mock(() => ({
        eq: mock(() => Promise.resolve({ error: { message: "Database connection failed" } })),
      }));

      const mockFrom = mock(() => ({
        update: mockUpdate,
      }));

      const supabase = { from: mockFrom } as unknown as SupabaseClient;

      const result = await updateBookingToConfirmed(supabase, "booking-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database connection failed");
    });

    it("should handle generic errors when error message is undefined", async () => {
      const mockUpdate = mock(() => ({
        eq: mock(() => Promise.resolve({ error: {} })),
      }));

      const mockFrom = mock(() => ({
        update: mockUpdate,
      }));

      const supabase = { from: mockFrom } as unknown as SupabaseClient;

      const result = await updateBookingToConfirmed(supabase, "booking-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update booking status");
    });
  });

  describe("updateBookingToDeclined", () => {
    it("should successfully update booking to declined status", async () => {
      const mockUpdate = mock(() => ({
        eq: mock(() => Promise.resolve({ error: null })),
      }));

      const mockFrom = mock(() => ({
        update: mockUpdate,
      }));

      const supabase = { from: mockFrom } as unknown as SupabaseClient;

      const result = await updateBookingToDeclined(supabase, "booking-456");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFrom).toHaveBeenCalledWith("bookings");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "declined",
          updated_at: expect.any(String),
        })
      );
    });

    it("should handle database errors when updating to declined", async () => {
      const mockUpdate = mock(() => ({
        eq: mock(() => Promise.resolve({ error: { message: "Permission denied" } })),
      }));

      const mockFrom = mock(() => ({
        update: mockUpdate,
      }));

      const supabase = { from: mockFrom } as unknown as SupabaseClient;

      const result = await updateBookingToDeclined(supabase, "booking-456");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Permission denied");
    });
  });
});

describe("Booking Workflow Service - Payment Cancellation", () => {
  beforeEach(() => {
    mock.restore();
  });

  describe("cancelPaymentIntent", () => {
    it("should return success when no payment intent ID provided", async () => {
      const result = await cancelPaymentIntent(null);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return success when payment intent ID is undefined", async () => {
      const result = await cancelPaymentIntent(undefined);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should successfully cancel payment intent", async () => {
      const mockCancel = mock(() => Promise.resolve({ id: "pi_123", status: "canceled" }));

      mock.module("@/lib/integrations/stripe/client", () => ({
        stripe: {
          paymentIntents: { cancel: mockCancel },
        },
      }));

      const result = await cancelPaymentIntent("pi_123");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    // Note: Error handling tests for cancelPaymentIntent require complex
    // Stripe mock setup and are better tested in integration tests
  });
});

describe("Booking Workflow Service - Formatting Utilities", () => {
  describe("formatScheduledDate", () => {
    it("should format valid date string", () => {
      const result = formatScheduledDate("2025-03-15T14:30:00Z");

      expect(result).toMatch(/3\/15\/2025|15\/3\/2025/); // Different locale formats
    });

    it("should return TBD for null date", () => {
      const result = formatScheduledDate(null);

      expect(result).toBe("TBD");
    });

    it("should return TBD for undefined date", () => {
      const result = formatScheduledDate(undefined);

      expect(result).toBe("TBD");
    });

    it("should handle empty string", () => {
      const result = formatScheduledDate("");

      expect(result).toBe("TBD");
    });
  });

  describe("formatScheduledTime", () => {
    it("should format valid time string", () => {
      const result = formatScheduledTime("2025-03-15T14:30:00Z");

      // Should contain time components (format may vary by locale)
      expect(result).toBeTruthy();
      expect(result).not.toBe("TBD");
    });

    it("should return TBD for null time", () => {
      const result = formatScheduledTime(null);

      expect(result).toBe("TBD");
    });

    it("should return TBD for undefined time", () => {
      const result = formatScheduledTime(undefined);

      expect(result).toBe("TBD");
    });
  });

  describe("formatDuration", () => {
    it("should format duration in minutes", () => {
      const result = formatDuration(90);

      expect(result).toBe("90 minutes");
    });

    it("should format duration with 120 minutes", () => {
      const result = formatDuration(120);

      expect(result).toBe("120 minutes");
    });

    it("should format duration with 45 minutes", () => {
      const result = formatDuration(45);

      expect(result).toBe("45 minutes");
    });

    it("should return TBD for null duration", () => {
      const result = formatDuration(null);

      expect(result).toBe("TBD");
    });

    it("should return TBD for undefined duration", () => {
      const result = formatDuration(undefined);

      expect(result).toBe("TBD");
    });

    it("should return TBD for zero duration", () => {
      const result = formatDuration(0);

      expect(result).toBe("TBD");
    });
  });

  describe("formatAddress", () => {
    it("should format address object with formatted property", () => {
      const address = {
        formatted: "123 Main St, Bogotá, Colombia",
      };

      const result = formatAddress(address);

      expect(result).toBe("123 Main St, Bogotá, Colombia");
    });

    it("should format plain string address", () => {
      const result = formatAddress("456 Park Ave, Medellín");

      expect(result).toBe("456 Park Ave, Medellín");
    });

    it("should return Not specified for null address", () => {
      const result = formatAddress(null);

      expect(result).toBe("Not specified");
    });

    it("should return Not specified for undefined address", () => {
      const result = formatAddress(undefined);

      expect(result).toBe("Not specified");
    });

    it("should handle address object without formatted property", () => {
      const address = { street: "Main St", city: "Bogotá" };

      const result = formatAddress(address);

      expect(result).toContain("street");
      expect(result).toContain("city");
    });
  });

  describe("formatAmount", () => {
    it("should format amount in COP currency", () => {
      const result = formatAmount(5_000_000, "cop"); // 50,000 COP

      expect(result).toContain("50");
      expect(result).toContain("000");
    });

    it("should format amount in USD currency", () => {
      const result = formatAmount(10_000, "usd"); // $100.00

      expect(result).toContain("100");
    });

    it("should default to COP when currency is null", () => {
      const result = formatAmount(2_000_000, null);

      expect(result).toBeTruthy();
    });

    it("should return undefined for null amount", () => {
      const result = formatAmount(null, "cop");

      expect(result).toBeUndefined();
    });

    it("should return undefined for undefined amount", () => {
      const result = formatAmount(undefined, "usd");

      expect(result).toBeUndefined();
    });

    it("should handle zero amount", () => {
      const result = formatAmount(0, "cop");

      expect(result).toBeUndefined();
    });
  });
});

describe("Booking Workflow Service - Notification Handling", () => {
  beforeEach(() => {
    mock.restore();
  });

  // Note: fetchNotificationDetails, sendAcceptanceNotifications, and sendDeclineNotifications
  // are integration functions that require complex Supabase auth mocking.
  // They are better tested in E2E tests.
});
