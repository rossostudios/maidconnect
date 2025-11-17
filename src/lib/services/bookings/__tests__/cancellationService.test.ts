/**
 * Tests for Cancellation Service
 * Covers booking cancellation workflow, policy validation, refund processing, and notifications
 */

import { beforeEach, describe, expect, test as it, mock } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
	validateCancellationEligibility,
	validateCancellationPolicy,
	processStripeRefund,
	cancelBookingInDatabase,
	prepareCancellationNotificationData,
	sendCancellationNotifications,
	formatRefundAmount,
} from "../cancellationService";

// Mock Stripe
const mockStripe = {
	paymentIntents: {
		retrieve: mock(() =>
			Promise.resolve({ id: "pi_123", status: "requires_capture" }),
		),
		cancel: mock(() => Promise.resolve({ id: "pi_123", status: "canceled" })),
	},
	refunds: {
		create: mock(() => Promise.resolve({ id: "re_123", status: "succeeded" })),
	},
};

mock.module("@/lib/integrations/stripe/client", () => ({
	stripe: mockStripe,
}));

// Mock calculateCancellationPolicy
mock.module("@/lib/utils/bookings/cancellation-policy", () => ({
	calculateCancellationPolicy: mock((scheduledStart: string, status: string) => ({
		canCancel: true,
		refundPercentage: 100,
		reason: null,
	})),
}));

describe("Cancellation Service - Eligibility Validation", () => {
	describe("validateCancellationEligibility", () => {
		it("should allow canceling booking with pending_payment status", () => {
			const booking = {
				id: "booking-123",
				status: "pending_payment",
				scheduled_start: "2025-03-15T14:30:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.errorCode).toBeUndefined();
		});

		it("should allow canceling booking with authorized status", () => {
			const booking = {
				id: "booking-456",
				status: "authorized",
				scheduled_start: "2025-03-20T10:00:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(true);
		});

		it("should allow canceling booking with confirmed status", () => {
			const booking = {
				id: "booking-789",
				status: "confirmed",
				scheduled_start: "2025-03-25T16:00:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(true);
		});

		it("should reject canceling booking with completed status", () => {
			const booking = {
				id: "booking-999",
				status: "completed",
				scheduled_start: "2025-03-10T14:30:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Cannot cancel booking with status: completed");
			expect(result.errorCode).toBe("INVALID_BOOKING_STATUS");
		});

		it("should reject canceling booking with canceled status", () => {
			const booking = {
				id: "booking-888",
				status: "canceled",
				scheduled_start: "2025-03-12T14:30:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(false);
			expect(result.error).toContain("Cannot cancel booking");
			expect(result.errorCode).toBe("INVALID_BOOKING_STATUS");
		});

		it("should reject canceling booking with declined status", () => {
			const booking = {
				id: "booking-777",
				status: "declined",
				scheduled_start: "2025-03-15T14:30:00Z",
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(false);
			expect(result.errorCode).toBe("INVALID_BOOKING_STATUS");
		});

		it("should reject canceling booking without scheduled_start", () => {
			const booking = {
				id: "booking-666",
				status: "confirmed",
				scheduled_start: null,
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(false);
			expect(result.error).toBe(
				"Cannot calculate cancellation policy without scheduled start time",
			);
		});

		it("should reject canceling booking with undefined scheduled_start", () => {
			const booking = {
				id: "booking-555",
				status: "authorized",
				scheduled_start: undefined,
			};

			const result = validateCancellationEligibility(booking);

			expect(result.success).toBe(false);
			expect(result.error).toContain("scheduled start time");
		});
	});
});

describe("Cancellation Service - Policy Validation", () => {
	beforeEach(() => {
		mock.restore();
	});

	describe("validateCancellationPolicy", () => {
		it("should allow cancellation when more than 24 hours before service", () => {
			// Use a date far in the future (3 days from now)
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 3);

			const result = validateCancellationPolicy(
				futureDate.toISOString(),
				"confirmed",
			);

			expect(result.success).toBe(true);
			expect(result.policy.canCancel).toBe(true);
			expect(result.policy.refundPercentage).toBe(100);
			expect(result.error).toBeUndefined();
		});

		it("should reject cancellation for past services", () => {
			// Use a past date
			const pastDate = new Date("2024-01-15T10:00:00Z");

			const result = validateCancellationPolicy(
				pastDate.toISOString(),
				"confirmed",
			);

			expect(result.success).toBe(false);
			expect(result.policy.canCancel).toBe(false);
			expect(result.error).toBe("Cannot cancel past services");
		});

		it("should allow partial refund for 12-24 hours before service", () => {
			// Use a date 18 hours from now
			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 18);

			const result = validateCancellationPolicy(
				futureDate.toISOString(),
				"confirmed",
			);

			expect(result.success).toBe(true);
			expect(result.policy.refundPercentage).toBe(50);
		});

		it("should reject cancellation for completed bookings", () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 2);

			const result = validateCancellationPolicy(
				futureDate.toISOString(),
				"completed",
			);

			expect(result.success).toBe(false);
			expect(result.policy.canCancel).toBe(false);
		});
	});
});

describe("Cancellation Service - Stripe Refund Processing", () => {
	beforeEach(() => {
		mock.restore();
	});

	describe("processStripeRefund", () => {
		it("should return success when no payment intent provided", async () => {
			const result = await processStripeRefund(null, 5000000);

			expect(result.success).toBe(true);
			expect(result.stripeStatus).toBe("no_payment_required");
			expect(result.error).toBeUndefined();
		});

		it("should cancel payment intent with requires_capture status", async () => {
			const mockRetrieve = mock(() =>
				Promise.resolve({ id: "pi_123", status: "requires_capture" }),
			);
			const mockCancel = mock(() =>
				Promise.resolve({ id: "pi_123", status: "canceled" }),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
						cancel: mockCancel,
					},
				},
			}));

			const result = await processStripeRefund("pi_123", 5000000);

			expect(result.success).toBe(true);
			expect(result.stripeStatus).toBe("canceled");
			expect(mockCancel).toHaveBeenCalledWith("pi_123");
		});

		it("should refund payment intent with succeeded status", async () => {
			const mockRetrieve = mock(() =>
				Promise.resolve({ id: "pi_456", status: "succeeded" }),
			);
			const mockRefundCreate = mock(() =>
				Promise.resolve({ id: "re_123", status: "succeeded" }),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
					},
					refunds: {
						create: mockRefundCreate,
					},
				},
			}));

			const result = await processStripeRefund("pi_456", 2500000);

			expect(result.success).toBe(true);
			expect(result.stripeStatus).toBe("refunded");
			expect(mockRefundCreate).toHaveBeenCalledWith({
				payment_intent: "pi_456",
				amount: 2500000,
			});
		});

		it("should skip refund when amount is zero", async () => {
			const mockRetrieve = mock(() =>
				Promise.resolve({ id: "pi_789", status: "succeeded" }),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
					},
				},
			}));

			const result = await processStripeRefund("pi_789", 0);

			expect(result.success).toBe(true);
			expect(result.stripeStatus).toBe("no_refund_needed");
		});

		it("should handle Stripe retrieval errors", async () => {
			const mockRetrieve = mock(() =>
				Promise.reject(new Error("Payment intent not found")),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
					},
				},
			}));

			const result = await processStripeRefund("pi_invalid", 1000000);

			expect(result.success).toBe(false);
			expect(result.stripeStatus).toBe("error");
			expect(result.error).toBe("Payment intent not found");
		});

		it("should handle Stripe cancellation errors", async () => {
			const mockRetrieve = mock(() =>
				Promise.resolve({ id: "pi_999", status: "requires_capture" }),
			);
			const mockCancel = mock(() =>
				Promise.reject(new Error("Already canceled")),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
						cancel: mockCancel,
					},
				},
			}));

			const result = await processStripeRefund("pi_999", 1000000);

			expect(result.success).toBe(false);
			expect(result.stripeStatus).toBe("error");
			expect(result.error).toBe("Already canceled");
		});

		it("should handle Stripe refund creation errors", async () => {
			const mockRetrieve = mock(() =>
				Promise.resolve({ id: "pi_888", status: "succeeded" }),
			);
			const mockRefundCreate = mock(() =>
				Promise.reject(new Error("Insufficient funds")),
			);

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
					},
					refunds: {
						create: mockRefundCreate,
					},
				},
			}));

			const result = await processStripeRefund("pi_888", 5000000);

			expect(result.success).toBe(false);
			expect(result.stripeStatus).toBe("error");
			expect(result.error).toBe("Insufficient funds");
		});

		it("should handle non-Error exceptions", async () => {
			const mockRetrieve = mock(() => Promise.reject("Unknown error"));

			mock.module("@/lib/integrations/stripe/client", () => ({
				stripe: {
					paymentIntents: {
						retrieve: mockRetrieve,
					},
				},
			}));

			const result = await processStripeRefund("pi_777", 1000000);

			expect(result.success).toBe(false);
			expect(result.stripeStatus).toBe("error");
			expect(result.error).toBe("Failed to process refund");
		});
	});
});

describe("Cancellation Service - Database Updates", () => {
	beforeEach(() => {
		mock.restore();
	});

	describe("cancelBookingInDatabase", () => {
		it("should successfully cancel booking in database", async () => {
			const mockBooking = {
				id: "booking-123",
				status: "canceled",
				canceled_at: expect.any(String),
				canceled_by: "user-456",
				canceled_reason: "Change of plans",
			};

			const mockUpdate = mock(() => ({
				eq: mock(() => ({
					select: mock(() => ({
						single: mock(() =>
							Promise.resolve({ data: mockBooking, error: null }),
						),
					})),
				})),
			}));

			const mockFrom = mock(() => ({
				update: mockUpdate,
			}));

			const supabase = { from: mockFrom } as unknown as SupabaseClient;

			const result = await cancelBookingInDatabase(
				supabase,
				"booking-123",
				"user-456",
				"Change of plans",
			);

			expect(result.success).toBe(true);
			expect(result.booking).toEqual(mockBooking);
			expect(result.error).toBeUndefined();
			expect(mockUpdate).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "canceled",
					canceled_reason: "Change of plans",
					canceled_by: "user-456",
					canceled_at: expect.any(String),
					updated_at: expect.any(String),
				}),
			);
		});

		it("should use default reason when not provided", async () => {
			const mockBooking = {
				id: "booking-456",
				status: "canceled",
				canceled_reason: "Customer canceled",
			};

			const mockUpdate = mock(() => ({
				eq: mock(() => ({
					select: mock(() => ({
						single: mock(() =>
							Promise.resolve({ data: mockBooking, error: null }),
						),
					})),
				})),
			}));

			const mockFrom = mock(() => ({
				update: mockUpdate,
			}));

			const supabase = { from: mockFrom } as unknown as SupabaseClient;

			const result = await cancelBookingInDatabase(
				supabase,
				"booking-456",
				"user-789",
			);

			expect(result.success).toBe(true);
			expect(mockUpdate).toHaveBeenCalledWith(
				expect.objectContaining({
					canceled_reason: "Customer canceled",
				}),
			);
		});

		it("should handle database update errors", async () => {
			const mockUpdate = mock(() => ({
				eq: mock(() => ({
					select: mock(() => ({
						single: mock(() =>
							Promise.resolve({
								data: null,
								error: { message: "Database connection failed" },
							}),
						),
					})),
				})),
			}));

			const mockFrom = mock(() => ({
				update: mockUpdate,
			}));

			const supabase = { from: mockFrom } as unknown as SupabaseClient;

			const result = await cancelBookingInDatabase(
				supabase,
				"booking-999",
				"user-123",
				"Error test",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to cancel booking in database");
			expect(result.booking).toBeUndefined();
		});

		it("should handle null booking data", async () => {
			const mockUpdate = mock(() => ({
				eq: mock(() => ({
					select: mock(() => ({
						single: mock(() => Promise.resolve({ data: null, error: null })),
					})),
				})),
			}));

			const mockFrom = mock(() => ({
				update: mockUpdate,
			}));

			const supabase = { from: mockFrom } as unknown as SupabaseClient;

			const result = await cancelBookingInDatabase(
				supabase,
				"booking-888",
				"user-456",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to cancel booking in database");
		});
	});
});

describe("Cancellation Service - Notification Handling", () => {
	describe("prepareCancellationNotificationData", () => {
		it("should prepare notification data with all fields", () => {
			const booking = {
				id: "booking-123",
				scheduled_start: "2026-03-15T14:30:00Z",
				service_name: "House Cleaning",
			};

			const result = prepareCancellationNotificationData(
				booking,
				"John Doe",
				"Jane Smith",
			);

			expect(result.customerName).toBe("John Doe");
			expect(result.professionalName).toBe("Jane Smith");
			expect(result.serviceName).toBe("House Cleaning");
			expect(result.scheduledDate).toBeTruthy();
			expect(result.scheduledTime).toBeTruthy();
			expect(result.bookingId).toBe("booking-123");
		});

		it("should handle missing scheduled_start", () => {
			const booking = {
				id: "booking-456",
				scheduled_start: null,
				service_name: "Laundry Service",
			};

			const result = prepareCancellationNotificationData(
				booking,
				"John Doe",
				"Jane Smith",
			);

			expect(result.scheduledDate).toBe("TBD");
			expect(result.scheduledTime).toBe("TBD");
		});

		it("should handle missing service_name", () => {
			const booking = {
				id: "booking-789",
				scheduled_start: "2026-03-25T16:00:00Z",
				service_name: null,
			};

			const result = prepareCancellationNotificationData(
				booking,
				"John Doe",
				"Jane Smith",
			);

			expect(result.serviceName).toBe("Service");
		});

		it("should include duration and address as TBD", () => {
			const booking = {
				id: "booking-999",
				scheduled_start: "2026-03-30T12:00:00Z",
			};

			const result = prepareCancellationNotificationData(
				booking,
				"Customer",
				"Professional",
			);

			expect(result.duration).toBe("TBD");
			expect(result.address).toBe("TBD");
		});
	});

	// Note: sendCancellationNotifications is an integration function that requires
	// complex Supabase auth mocking. It returns void and is better tested in E2E tests.
});

describe("Cancellation Service - Formatting Utilities", () => {
	describe("formatRefundAmount", () => {
		it("should format refund amount in COP", () => {
			const result = formatRefundAmount(5000000, "cop");

			expect(result).toContain("50");
			expect(result).toContain("000");
		});

		it("should format refund amount in USD", () => {
			const result = formatRefundAmount(10000, "usd");

			expect(result).toContain("100");
		});

		it("should default to COP when currency is null", () => {
			const result = formatRefundAmount(2000000, null);

			expect(result).toBeTruthy();
		});

		it("should format zero amount", () => {
			const result = formatRefundAmount(0, "cop");

			expect(result).toBeTruthy();
			expect(result).toContain("0");
		});

		it("should handle null amount as zero", () => {
			const result = formatRefundAmount(null, "usd");

			expect(result).toBeTruthy();
		});

		it("should handle undefined amount", () => {
			const result = formatRefundAmount(undefined, "cop");

			expect(result).toBeTruthy();
		});
	});
});
