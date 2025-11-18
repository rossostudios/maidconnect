/**
 * Booking Validation Tests
 *
 * Tests Zod validation schemas for booking-related operations.
 * Ensures data integrity and proper error messages for invalid inputs.
 *
 * @module lib/shared/validations/__tests__/booking.test.ts
 */

import { describe, expect, test as it } from "bun:test";
import {
  addressSchema,
  bookingFilterSchema,
  bookingStatusSchema,
  cancelBookingSchema,
  completeBookingSchema,
  createBookingSchema,
  createReviewSchema,
  updateBookingSchema,
} from "../booking";

// ============================================================================
// BOOKING STATUS SCHEMA
// ============================================================================

describe("bookingStatusSchema", () => {
  it("should accept valid booking statuses", () => {
    const validStatuses = [
      "pending_payment",
      "payment_authorized",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "refunded",
    ];

    validStatuses.forEach((status) => {
      const result = bookingStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid booking statuses", () => {
    const invalidStatuses = ["pending", "active", "invalid", "", null, undefined, 123];

    invalidStatuses.forEach((status) => {
      const result = bookingStatusSchema.safeParse(status);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// ADDRESS SCHEMA
// ============================================================================

describe("addressSchema", () => {
  const validAddress = {
    street: "Calle 123 #45-67",
    city: "Bogotá",
    state: "Cundinamarca",
    postalCode: "110111",
    country: "CO",
    latitude: 4.711,
    longitude: -74.0721,
    additionalInfo: "Apartamento 501, Torre B",
  };

  it("should accept valid address", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("should accept minimal address (street, city, country only)", () => {
    const minimalAddress = {
      street: "Carrera 15 #85-20",
      city: "Medellín",
    };

    const result = addressSchema.safeParse(minimalAddress);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("CO"); // Default value
    }
  });

  it("should reject empty street", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      street: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty city", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      city: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject street longer than 200 characters", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      street: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid country code (not ISO 3166-1 alpha-2)", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      country: "COL", // Should be "CO"
    });
    expect(result.success).toBe(false);
  });

  it("should reject latitude out of range", () => {
    const tooHigh = addressSchema.safeParse({
      ...validAddress,
      latitude: 91,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = addressSchema.safeParse({
      ...validAddress,
      latitude: -91,
    });
    expect(tooLow.success).toBe(false);
  });

  it("should reject longitude out of range", () => {
    const tooHigh = addressSchema.safeParse({
      ...validAddress,
      longitude: 181,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = addressSchema.safeParse({
      ...validAddress,
      longitude: -181,
    });
    expect(tooLow.success).toBe(false);
  });

  it("should reject additionalInfo longer than 500 characters", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      additionalInfo: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CREATE BOOKING SCHEMA
// ============================================================================

describe("createBookingSchema", () => {
  const validBooking = {
    professionalId: "550e8400-e29b-41d4-a716-446655440000",
    amount: 100_000,
    currency: "cop",
    scheduledStart: "2025-12-31T10:00:00Z",
    scheduledEnd: "2025-12-31T14:00:00Z",
    serviceName: "Deep Cleaning",
    serviceHourlyRate: 50_000,
    specialInstructions: "Please bring eco-friendly products",
    address: {
      street: "Calle 123 #45-67",
      city: "Bogotá",
    },
  };

  it("should accept valid booking with all fields", () => {
    const result = createBookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it("should accept minimal booking (professionalId and amount only)", () => {
    const minimalBooking = {
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 50_000,
    };

    const result = createBookingSchema.safeParse(minimalBooking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("cop"); // Default value
    }
  });

  it("should reject missing professionalId", () => {
    const { professionalId, ...booking } = validBooking;
    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should reject invalid professionalId (not UUID)", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      professionalId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing amount", () => {
    const { amount, ...booking } = validBooking;
    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should reject negative amount", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero amount", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer amount", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      amount: 100.5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject currency code not 3 characters", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      currency: "us",
    });
    expect(result.success).toBe(false);
  });

  it("should convert currency to lowercase", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      currency: "USD",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("usd");
    }
  });

  it("should reject durationMinutes greater than 1440 (24 hours)", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      durationMinutes: 1441,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative durationMinutes", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      durationMinutes: -60,
    });
    expect(result.success).toBe(false);
  });

  it("should reject specialInstructions longer than 2000 characters", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      specialInstructions: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject serviceName longer than 100 characters", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      serviceName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty serviceName", () => {
    const result = createBookingSchema.safeParse({
      ...validBooking,
      serviceName: "",
    });
    expect(result.success).toBe(false);
  });

  // Complex validation: scheduledStart + durationMinutes/scheduledEnd
  it("should accept scheduledStart with durationMinutes", () => {
    const result = createBookingSchema.safeParse({
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100_000,
      scheduledStart: "2025-12-31T10:00:00Z",
      durationMinutes: 240,
    });
    expect(result.success).toBe(true);
  });

  it("should accept scheduledStart with scheduledEnd", () => {
    const result = createBookingSchema.safeParse({
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100_000,
      scheduledStart: "2025-12-31T10:00:00Z",
      scheduledEnd: "2025-12-31T14:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should reject scheduledStart without durationMinutes or scheduledEnd", () => {
    const result = createBookingSchema.safeParse({
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100_000,
      scheduledStart: "2025-12-31T10:00:00Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("scheduledStart");
    }
  });

  it("should reject scheduledEnd before scheduledStart", () => {
    const result = createBookingSchema.safeParse({
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100_000,
      scheduledStart: "2025-12-31T14:00:00Z",
      scheduledEnd: "2025-12-31T10:00:00Z", // Earlier than start
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("scheduledEnd");
    }
  });

  it("should reject scheduledEnd equal to scheduledStart", () => {
    const result = createBookingSchema.safeParse({
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100_000,
      scheduledStart: "2025-12-31T10:00:00Z",
      scheduledEnd: "2025-12-31T10:00:00Z", // Same time
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UPDATE BOOKING SCHEMA
// ============================================================================

describe("updateBookingSchema", () => {
  it("should accept valid status update", () => {
    const result = updateBookingSchema.safeParse({
      status: "confirmed",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid scheduling update", () => {
    const result = updateBookingSchema.safeParse({
      scheduledStart: "2025-12-31T10:00:00Z",
      scheduledEnd: "2025-12-31T14:00:00Z",
      durationMinutes: 240,
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid notes update", () => {
    const result = updateBookingSchema.safeParse({
      specialInstructions: "Updated instructions",
      professionalNotes: "Professional notes here",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty update (all fields optional)", () => {
    const result = updateBookingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid status", () => {
    const result = updateBookingSchema.safeParse({
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("should reject durationMinutes greater than 1440", () => {
    const result = updateBookingSchema.safeParse({
      durationMinutes: 1500,
    });
    expect(result.success).toBe(false);
  });

  it("should reject specialInstructions longer than 2000 characters", () => {
    const result = updateBookingSchema.safeParse({
      specialInstructions: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject professionalNotes longer than 2000 characters", () => {
    const result = updateBookingSchema.safeParse({
      professionalNotes: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject cancellationReason longer than 1000 characters", () => {
    const result = updateBookingSchema.safeParse({
      cancellationReason: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// BOOKING FILTER SCHEMA
// ============================================================================

describe("bookingFilterSchema", () => {
  it("should accept valid filter with all fields", () => {
    const result = bookingFilterSchema.safeParse({
      status: "confirmed",
      professionalId: "550e8400-e29b-41d4-a716-446655440000",
      customerId: "660e8400-e29b-41d4-a716-446655440001",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      minAmount: 50_000,
      maxAmount: 200_000,
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty filter (all fields optional)", () => {
    const result = bookingFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid date format for startDate", () => {
    const result = bookingFilterSchema.safeParse({
      startDate: "2025/01/01", // Wrong format
    });
    expect(result.success).toBe(false);
  });

  it("should accept YYYY-MM-DD format for dates", () => {
    const result = bookingFilterSchema.safeParse({
      startDate: "2025-01-15",
      endDate: "2025-01-30",
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative minAmount", () => {
    const result = bookingFilterSchema.safeParse({
      minAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative maxAmount", () => {
    const result = bookingFilterSchema.safeParse({
      maxAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should coerce string numbers to numbers", () => {
    const result = bookingFilterSchema.safeParse({
      minAmount: "50000",
      maxAmount: "200000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.minAmount).toBe("number");
      expect(typeof result.data.maxAmount).toBe("number");
    }
  });
});

// ============================================================================
// CANCEL BOOKING SCHEMA
// ============================================================================

describe("cancelBookingSchema", () => {
  const validCancel = {
    bookingId: "550e8400-e29b-41d4-a716-446655440000",
    reason: "Unable to make it on the scheduled date, need to reschedule",
    refundAmount: 50_000,
  };

  it("should accept valid cancellation", () => {
    const result = cancelBookingSchema.safeParse(validCancel);
    expect(result.success).toBe(true);
  });

  it("should accept cancellation without refundAmount", () => {
    const { refundAmount, ...cancel } = validCancel;
    const result = cancelBookingSchema.safeParse(cancel);
    expect(result.success).toBe(true);
  });

  it("should reject missing bookingId", () => {
    const { bookingId, ...cancel } = validCancel;
    const result = cancelBookingSchema.safeParse(cancel);
    expect(result.success).toBe(false);
  });

  it("should reject invalid bookingId (not UUID)", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      bookingId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing reason", () => {
    const { reason, ...cancel } = validCancel;
    const result = cancelBookingSchema.safeParse(cancel);
    expect(result.success).toBe(false);
  });

  it("should reject reason shorter than 10 characters", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      reason: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject reason longer than 1000 characters", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      reason: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative refundAmount", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      refundAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer refundAmount", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      refundAmount: 100.5,
    });
    expect(result.success).toBe(false);
  });

  it("should accept zero refundAmount", () => {
    const result = cancelBookingSchema.safeParse({
      ...validCancel,
      refundAmount: 0,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// COMPLETE BOOKING SCHEMA
// ============================================================================

describe("completeBookingSchema", () => {
  const validComplete = {
    bookingId: "550e8400-e29b-41d4-a716-446655440000",
    actualEnd: "2025-12-31T14:30:00Z",
    finalAmount: 125_000,
    professionalNotes: "Service completed successfully, client was satisfied",
  };

  it("should accept valid completion", () => {
    const result = completeBookingSchema.safeParse(validComplete);
    expect(result.success).toBe(true);
  });

  it("should accept minimal completion (bookingId only)", () => {
    const result = completeBookingSchema.safeParse({
      bookingId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing bookingId", () => {
    const { bookingId, ...complete } = validComplete;
    const result = completeBookingSchema.safeParse(complete);
    expect(result.success).toBe(false);
  });

  it("should reject invalid bookingId", () => {
    const result = completeBookingSchema.safeParse({
      ...validComplete,
      bookingId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative finalAmount", () => {
    const result = completeBookingSchema.safeParse({
      ...validComplete,
      finalAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero finalAmount", () => {
    const result = completeBookingSchema.safeParse({
      ...validComplete,
      finalAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer finalAmount", () => {
    const result = completeBookingSchema.safeParse({
      ...validComplete,
      finalAmount: 125.5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject professionalNotes longer than 2000 characters", () => {
    const result = completeBookingSchema.safeParse({
      ...validComplete,
      professionalNotes: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CREATE REVIEW SCHEMA
// ============================================================================

describe("createReviewSchema", () => {
  const validReview = {
    bookingId: "550e8400-e29b-41d4-a716-446655440000",
    rating: 5,
    comment: "Excellent service, very professional and thorough!",
    wouldRecommend: true,
  };

  it("should accept valid review with all fields", () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("should accept review without comment", () => {
    const { comment, ...review } = validReview;
    const result = createReviewSchema.safeParse(review);
    expect(result.success).toBe(true);
  });

  it("should default wouldRecommend to true", () => {
    const { wouldRecommend, ...review } = validReview;
    const result = createReviewSchema.safeParse(review);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wouldRecommend).toBe(true);
    }
  });

  it("should reject missing bookingId", () => {
    const { bookingId, ...review } = validReview;
    const result = createReviewSchema.safeParse(review);
    expect(result.success).toBe(false);
  });

  it("should reject invalid bookingId", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      bookingId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing rating", () => {
    const { rating, ...review } = validReview;
    const result = createReviewSchema.safeParse(review);
    expect(result.success).toBe(false);
  });

  it("should reject rating less than 1", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject rating greater than 5", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer rating", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      rating: 4.5,
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid ratings (1-5)", () => {
    const ratings = [1, 2, 3, 4, 5];
    ratings.forEach((rating) => {
      const result = createReviewSchema.safeParse({
        ...validReview,
        rating,
      });
      expect(result.success).toBe(true);
    });
  });

  it("should reject comment shorter than 10 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject comment longer than 1000 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept comment with exactly 10 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("should accept comment with exactly 1000 characters", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(1000),
    });
    expect(result.success).toBe(true);
  });
});
