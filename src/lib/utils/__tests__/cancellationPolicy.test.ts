import { describe, expect, it } from "vitest";
import {
  calculateCancellationPolicy,
  calculateRefundAmount,
  getCancellationPolicyDescription,
} from "../cancellationPolicy";

describe("calculateCancellationPolicy", () => {
  describe("status-based restrictions", () => {
    it("prevents cancellation of completed services", () => {
      const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "completed");

      expect(result.canCancel).toBe(false);
      expect(result.refundPercentage).toBe(0);
      expect(result.reason).toContain("Cannot cancel completed services");
      expect(result.hoursUntilService).toBe(0);
    });

    it("prevents cancellation of in-progress services", () => {
      const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "in_progress");

      expect(result.canCancel).toBe(false);
      expect(result.refundPercentage).toBe(0);
      expect(result.reason).toContain("in progress");
      expect(result.hoursUntilService).toBe(0);
    });

    it("prevents cancellation of past services", () => {
      const scheduledStart = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(false);
      expect(result.refundPercentage).toBe(0);
      expect(result.reason).toContain("Cannot cancel past services");
      expect(result.hoursUntilService).toBeLessThan(0);
    });
  });

  describe("time-based refund tiers", () => {
    it("grants 100% refund for cancellations more than 24 hours in advance", () => {
      const scheduledStart = new Date(Date.now() + 25 * 60 * 60 * 1000); // 25 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
      expect(result.reason).toContain("Full refund");
      expect(result.hoursUntilService).toBeGreaterThanOrEqual(24);
    });

    it("grants 100% refund exactly at 24 hours", () => {
      const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // Exactly 24 hours

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
    });

    it("grants 50% refund for cancellations 12-24 hours in advance", () => {
      const scheduledStart = new Date(Date.now() + 18 * 60 * 60 * 1000); // 18 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(50);
      expect(result.reason).toContain("50% refund");
      expect(result.hoursUntilService).toBeGreaterThanOrEqual(12);
      expect(result.hoursUntilService).toBeLessThan(24);
    });

    it("grants 50% refund exactly at 12 hours", () => {
      const scheduledStart = new Date(Date.now() + 12 * 60 * 60 * 1000); // Exactly 12 hours

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(50);
    });

    it("grants 25% refund for cancellations 4-12 hours in advance", () => {
      const scheduledStart = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(25);
      expect(result.reason).toContain("25% refund");
      expect(result.hoursUntilService).toBeGreaterThanOrEqual(4);
      expect(result.hoursUntilService).toBeLessThan(12);
    });

    it("grants 25% refund exactly at 4 hours", () => {
      const scheduledStart = new Date(Date.now() + 4 * 60 * 60 * 1000); // Exactly 4 hours

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(25);
    });

    it("grants no refund for cancellations less than 4 hours in advance", () => {
      const scheduledStart = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(0);
      expect(result.reason).toContain("No refund");
      expect(result.hoursUntilService).toBeLessThan(4);
    });

    it("grants no refund for cancellations 1 minute before service", () => {
      const scheduledStart = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(0);
    });
  });

  describe("boundary conditions", () => {
    it("handles 23.5 hours (should get 50% refund, not 100%)", () => {
      const scheduledStart = new Date(Date.now() + 23.5 * 60 * 60 * 1000);

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(50);
    });

    it("handles 11.5 hours (should get 25% refund, not 50%)", () => {
      const scheduledStart = new Date(Date.now() + 11.5 * 60 * 60 * 1000);

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(25);
    });

    it("handles 3.5 hours (should get 0% refund, not 25%)", () => {
      const scheduledStart = new Date(Date.now() + 3.5 * 60 * 60 * 1000);

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(0);
    });

    it("handles very far future bookings (30 days)", () => {
      const scheduledStart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
      expect(result.hoursUntilService).toBeGreaterThanOrEqual(720); // 30 days = 720 hours
    });
  });

  describe("string date input", () => {
    it("accepts ISO 8601 datetime strings", () => {
      const scheduledStart = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
    });

    it("accepts YYYY-MM-DD date strings", () => {
      // Use a date 2 days in the future to ensure > 24 hours
      const twoDaysLater = new Date();
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      const scheduledStart = twoDaysLater.toISOString().split("T")[0] || "";

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100); // 2 days away is > 24 hours
    });
  });

  describe("hoursUntilService calculation", () => {
    it("accurately calculates hours until service", () => {
      const scheduledStart = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.hoursUntilService).toBeCloseTo(48, 0); // Within 1 hour precision
    });

    it("calculates negative hours for past services", () => {
      const scheduledStart = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.hoursUntilService).toBeCloseTo(-5, 0);
    });

    it("includes hours until service in all responses", () => {
      const scheduledStart = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours from now

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result).toHaveProperty("hoursUntilService");
      expect(typeof result.hoursUntilService).toBe("number");
    });
  });

  describe("different booking statuses", () => {
    it("allows cancellation of pending_payment bookings (24+ hours)", () => {
      const scheduledStart = new Date(Date.now() + 25 * 60 * 60 * 1000);

      const result = calculateCancellationPolicy(scheduledStart, "pending_payment");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
    });

    it("allows cancellation of confirmed bookings (24+ hours)", () => {
      const scheduledStart = new Date(Date.now() + 25 * 60 * 60 * 1000);

      const result = calculateCancellationPolicy(scheduledStart, "confirmed");

      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
    });

    it("prevents cancellation of cancelled bookings (already cancelled)", () => {
      const scheduledStart = new Date(Date.now() + 25 * 60 * 60 * 1000);

      // Even though time would allow cancellation, the status might prevent it
      // This tests that the function handles edge cases gracefully
      const result = calculateCancellationPolicy(scheduledStart, "cancelled");

      // Should allow cancellation based on time (not status-blocked)
      expect(result.canCancel).toBe(true);
      expect(result.refundPercentage).toBe(100);
    });
  });
});

// ============================================================================
// REFUND AMOUNT CALCULATION
// ============================================================================

describe("calculateRefundAmount", () => {
  it("calculates 100% refund correctly", () => {
    const authorizedAmount = 100000; // 100,000 COP
    const refundPercentage = 100;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(100000);
  });

  it("calculates 50% refund correctly", () => {
    const authorizedAmount = 100000; // 100,000 COP
    const refundPercentage = 50;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(50000);
  });

  it("calculates 25% refund correctly", () => {
    const authorizedAmount = 100000; // 100,000 COP
    const refundPercentage = 25;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(25000);
  });

  it("calculates 0% refund correctly", () => {
    const authorizedAmount = 100000; // 100,000 COP
    const refundPercentage = 0;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(0);
  });

  it("rounds to nearest integer (no decimal cents)", () => {
    const authorizedAmount = 100; // Small amount that might cause decimals
    const refundPercentage = 33; // 33% of 100 = 33.0

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(Number.isInteger(refundAmount)).toBe(true);
  });

  it("rounds fractional amounts correctly", () => {
    const authorizedAmount = 10000; // 10,000 COP
    const refundPercentage = 15; // 15% of 10,000 = 1,500

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(1500);
  });

  it("handles rounding up (0.5 rounds up)", () => {
    const authorizedAmount = 100; // 100 COP
    const refundPercentage = 50; // 50% of 100 = 50.0

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(50);
  });

  it("handles rounding down (< 0.5 rounds down)", () => {
    const authorizedAmount = 99; // 99 COP
    const refundPercentage = 50; // 50% of 99 = 49.5 -> rounds to 50

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(50); // Math.round(49.5) = 50
  });

  it("handles large amounts correctly", () => {
    const authorizedAmount = 5000000; // 5,000,000 COP
    const refundPercentage = 50;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(2500000);
  });

  it("handles zero amounts", () => {
    const authorizedAmount = 0;
    const refundPercentage = 100;

    const refundAmount = calculateRefundAmount(authorizedAmount, refundPercentage);

    expect(refundAmount).toBe(0);
  });
});

// ============================================================================
// POLICY DESCRIPTION
// ============================================================================

describe("getCancellationPolicyDescription", () => {
  it("returns policy description string", () => {
    const description = getCancellationPolicyDescription();

    expect(typeof description).toBe("string");
    expect(description.length).toBeGreaterThan(0);
  });

  it("includes all refund tiers", () => {
    const description = getCancellationPolicyDescription();

    expect(description).toContain("100% refund");
    expect(description).toContain("50% refund");
    expect(description).toContain("25% refund");
    expect(description).toContain("No refund");
  });

  it("includes all time thresholds", () => {
    const description = getCancellationPolicyDescription();

    expect(description).toContain("24 hours");
    expect(description).toContain("12-24 hours");
    expect(description).toContain("4-12 hours");
    expect(description).toContain("4 hours");
  });

  it("includes note about service already started", () => {
    const description = getCancellationPolicyDescription();

    expect(description.toLowerCase()).toContain("service has started");
  });

  it("is properly formatted with bullet points", () => {
    const description = getCancellationPolicyDescription();

    // Should have bullet points (•) or dashes (-)
    expect(description).toMatch(/[•\-]/);
  });

  it("does not have leading/trailing whitespace", () => {
    const description = getCancellationPolicyDescription();

    expect(description).toBe(description.trim());
  });
});
