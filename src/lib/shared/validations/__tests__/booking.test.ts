/**
 * Validation Tests for Booking Schemas
 *
 * CRITICAL: These tests protect against invalid data entering the database.
 * All validation rules must be enforced to prevent data corruption and security issues.
 *
 * Tests cover:
 * - Required field validation
 * - Type checking
 * - Range validation (min/max)
 * - Custom business rules
 * - Edge cases and malformed input
 */

import { describe, expect, it } from "vitest";
import {
  addressSchema,
  bookingFilterSchema,
  bookingStatusSchema,
  cancelBookingSchema,
  completeBookingSchema,
  createBookingSchema,
  createReviewSchema,
  updateBookingSchema,
  type Address,
  type BookingStatus,
  type CancelBookingInput,
  type CompleteBookingInput,
  type CreateBookingInput,
  type CreateReviewInput,
  type UpdateBookingInput,
} from "../booking";

// ============================================================================
// BOOKING STATUS ENUM
// ============================================================================

describe("bookingStatusSchema", () => {
  it("accepts valid booking statuses", () => {
    const validStatuses: BookingStatus[] = [
      "pending_payment",
      "payment_authorized",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "refunded",
    ];

    for (const status of validStatuses) {
      const result = bookingStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(status);
      }
    }
  });

  it("rejects invalid statuses", () => {
    const invalidStatuses = ["pending", "active", "closed", "unknown", "", "CONFIRMED"];

    for (const status of invalidStatuses) {
      const result = bookingStatusSchema.safeParse(status);
      expect(result.success).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    const invalidValues = [null, undefined, 123, true, {}, []];

    for (const value of invalidValues) {
      const result = bookingStatusSchema.safeParse(value);
      expect(result.success).toBe(false);
    }
  });
});

// ============================================================================
// ADDRESS SCHEMA
// ============================================================================

describe("addressSchema", () => {
  const validAddress: Address = {
    street: "Calle 123 #45-67",
    city: "Bogotá",
    state: "Cundinamarca",
    postalCode: "110111",
    country: "CO",
    latitude: 4.7110,
    longitude: -74.0721,
    additionalInfo: "Apartamento 301",
  };

  describe("valid addresses", () => {
    it("accepts complete address", () => {
      const result = addressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.street).toBe("Calle 123 #45-67");
        expect(result.data.city).toBe("Bogotá");
      }
    });

    it("accepts minimal address (street + city)", () => {
      const minimal = {
        street: "123 Main St",
        city: "Medellín",
      };

      const result = addressSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("CO"); // Default value
      }
    });

    it("applies default country code", () => {
      const address = { street: "Street", city: "City" };
      const result = addressSchema.safeParse(address);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("CO");
      }
    });
  });

  describe("field validation", () => {
    it("rejects empty street", () => {
      const invalid = { ...validAddress, street: "" };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects street over 200 characters", () => {
      const invalid = { ...validAddress, street: "a".repeat(201) };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects empty city", () => {
      const invalid = { ...validAddress, city: "" };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects city over 100 characters", () => {
      const invalid = { ...validAddress, city: "a".repeat(101) };
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid country code length", () => {
      const invalid = { ...validAddress, country: "COL" }; // Should be 2 chars
      const result = addressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("coordinate validation", () => {
    it("accepts valid latitude", () => {
      const addresses = [
        { ...validAddress, latitude: -90 },
        { ...validAddress, latitude: 0 },
        { ...validAddress, latitude: 90 },
      ];

      for (const addr of addresses) {
        const result = addressSchema.safeParse(addr);
        expect(result.success).toBe(true);
      }
    });

    it("rejects latitude out of range", () => {
      const invalid1 = { ...validAddress, latitude: -91 };
      const invalid2 = { ...validAddress, latitude: 91 };

      expect(addressSchema.safeParse(invalid1).success).toBe(false);
      expect(addressSchema.safeParse(invalid2).success).toBe(false);
    });

    it("accepts valid longitude", () => {
      const addresses = [
        { ...validAddress, longitude: -180 },
        { ...validAddress, longitude: 0 },
        { ...validAddress, longitude: 180 },
      ];

      for (const addr of addresses) {
        const result = addressSchema.safeParse(addr);
        expect(result.success).toBe(true);
      }
    });

    it("rejects longitude out of range", () => {
      const invalid1 = { ...validAddress, longitude: -181 };
      const invalid2 = { ...validAddress, longitude: 181 };

      expect(addressSchema.safeParse(invalid1).success).toBe(false);
      expect(addressSchema.safeParse(invalid2).success).toBe(false);
    });
  });

  describe("additional info", () => {
    it("accepts additional info up to 500 characters", () => {
      const valid = { ...validAddress, additionalInfo: "a".repeat(500) };
      expect(addressSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects additional info over 500 characters", () => {
      const invalid = { ...validAddress, additionalInfo: "a".repeat(501) };
      expect(addressSchema.safeParse(invalid).success).toBe(false);
    });
  });
});

// ============================================================================
// CREATE BOOKING SCHEMA
// ============================================================================

describe("createBookingSchema", () => {
  const validBooking: CreateBookingInput = {
    professionalId: "123e4567-e89b-12d3-a456-426614174000",
    amount: 100000,
    scheduledStart: "2024-12-25T10:00:00Z",
    durationMinutes: 120,
    currency: "cop",
    serviceName: "House Cleaning",
    specialInstructions: "Please bring cleaning supplies",
  };

  describe("required fields", () => {
    it("accepts valid booking with all required fields", () => {
      const result = createBookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it("requires professionalId", () => {
      const { professionalId, ...invalid } = validBooking;
      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("requires amount", () => {
      const { amount, ...invalid } = validBooking;
      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("validates professionalId is UUID", () => {
      const invalid = { ...validBooking, professionalId: "not-a-uuid" };
      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("amount validation", () => {
    it("rejects zero amount", () => {
      const invalid = { ...validBooking, amount: 0 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects negative amount", () => {
      const invalid = { ...validBooking, amount: -1000 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects fractional amount", () => {
      const invalid = { ...validBooking, amount: 100.50 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("accepts large amounts", () => {
      const valid = { ...validBooking, amount: 10_000_000 };
      expect(createBookingSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe("duration validation", () => {
    it("accepts duration up to 24 hours", () => {
      const valid = { ...validBooking, durationMinutes: 1440 }; // 24 hours
      expect(createBookingSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects duration over 24 hours", () => {
      const invalid = { ...validBooking, durationMinutes: 1441 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects zero duration", () => {
      const invalid = { ...validBooking, durationMinutes: 0 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects negative duration", () => {
      const invalid = { ...validBooking, durationMinutes: -60 };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("currency validation", () => {
    it("applies default currency", () => {
      const { currency, ...booking } = validBooking;
      const result = createBookingSchema.safeParse(booking);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("cop");
      }
    });

    it("converts currency to lowercase", () => {
      const booking = { ...validBooking, currency: "COP" };
      const result = createBookingSchema.safeParse(booking);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("cop");
      }
    });

    it("rejects invalid currency code length", () => {
      const invalid1 = { ...validBooking, currency: "co" }; // Too short
      const invalid2 = { ...validBooking, currency: "copa" }; // Too long

      expect(createBookingSchema.safeParse(invalid1).success).toBe(false);
      expect(createBookingSchema.safeParse(invalid2).success).toBe(false);
    });
  });

  describe("custom validation rules", () => {
    it("requires durationMinutes or scheduledEnd when scheduledStart is provided", () => {
      const invalid = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
        scheduledStart: "2024-12-25T10:00:00Z",
        // Missing both durationMinutes and scheduledEnd
      };

      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("scheduledStart");
      }
    });

    it("accepts scheduledStart with durationMinutes", () => {
      const valid = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
        scheduledStart: "2024-12-25T10:00:00Z",
        durationMinutes: 120,
      };

      expect(createBookingSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts scheduledStart with scheduledEnd", () => {
      const valid = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
        scheduledStart: "2024-12-25T10:00:00Z",
        scheduledEnd: "2024-12-25T12:00:00Z",
      };

      expect(createBookingSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects scheduledEnd before scheduledStart", () => {
      const invalid = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
        scheduledStart: "2024-12-25T12:00:00Z",
        scheduledEnd: "2024-12-25T10:00:00Z", // Before start!
      };

      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("after scheduledStart");
      }
    });

    it("accepts scheduledEnd equal to scheduledStart", () => {
      // Edge case: same time should fail (must be AFTER)
      const invalid = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
        scheduledStart: "2024-12-25T12:00:00Z",
        scheduledEnd: "2024-12-25T12:00:00Z",
      };

      const result = createBookingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("optional fields", () => {
    it("accepts booking without optional fields", () => {
      const minimal = {
        professionalId: validBooking.professionalId,
        amount: validBooking.amount,
      };

      expect(createBookingSchema.safeParse(minimal).success).toBe(true);
    });

    it("validates serviceName length", () => {
      const invalid = { ...validBooking, serviceName: "a".repeat(101) };
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("validates specialInstructions length", () => {
      const valid = { ...validBooking, specialInstructions: "a".repeat(2000) };
      const invalid = { ...validBooking, specialInstructions: "a".repeat(2001) };

      expect(createBookingSchema.safeParse(valid).success).toBe(true);
      expect(createBookingSchema.safeParse(invalid).success).toBe(false);
    });

    it("accepts address field", () => {
      const withAddress = {
        ...validBooking,
        address: {
          street: "Calle 123",
          city: "Bogotá",
        },
      };

      expect(createBookingSchema.safeParse(withAddress).success).toBe(true);
    });
  });
});

// ============================================================================
// CANCEL BOOKING SCHEMA
// ============================================================================

describe("cancelBookingSchema", () => {
  const validCancel: CancelBookingInput = {
    bookingId: "123e4567-e89b-12d3-a456-426614174000",
    reason: "Unable to attend due to emergency",
    refundAmount: 50000,
  };

  it("accepts valid cancellation", () => {
    expect(cancelBookingSchema.safeParse(validCancel).success).toBe(true);
  });

  it("requires bookingId", () => {
    const { bookingId, ...invalid } = validCancel;
    expect(cancelBookingSchema.safeParse(invalid).success).toBe(false);
  });

  it("requires reason", () => {
    const { reason, ...invalid } = validCancel;
    expect(cancelBookingSchema.safeParse(invalid).success).toBe(false);
  });

  it("enforces minimum reason length (10 chars)", () => {
    const tooShort = { ...validCancel, reason: "Too short" }; // 9 chars
    expect(cancelBookingSchema.safeParse(tooShort).success).toBe(false);

    const justRight = { ...validCancel, reason: "Ten chars!" }; // 10 chars
    expect(cancelBookingSchema.safeParse(justRight).success).toBe(true);
  });

  it("enforces maximum reason length (1000 chars)", () => {
    const valid = { ...validCancel, reason: "a".repeat(1000) };
    const invalid = { ...validCancel, reason: "a".repeat(1001) };

    expect(cancelBookingSchema.safeParse(valid).success).toBe(true);
    expect(cancelBookingSchema.safeParse(invalid).success).toBe(false);
  });

  it("refundAmount is optional", () => {
    const { refundAmount, ...valid } = validCancel;
    expect(cancelBookingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative refundAmount", () => {
    const invalid = { ...validCancel, refundAmount: -1000 };
    expect(cancelBookingSchema.safeParse(invalid).success).toBe(false);
  });

  it("accepts zero refundAmount", () => {
    const valid = { ...validCancel, refundAmount: 0 };
    expect(cancelBookingSchema.safeParse(valid).success).toBe(true);
  });
});

// ============================================================================
// COMPLETE BOOKING SCHEMA
// ============================================================================

describe("completeBookingSchema", () => {
  const validComplete: CompleteBookingInput = {
    bookingId: "123e4567-e89b-12d3-a456-426614174000",
    actualEnd: "2024-12-25T14:00:00Z",
    finalAmount: 120000,
    professionalNotes: "Service completed successfully",
  };

  it("accepts valid completion", () => {
    expect(completeBookingSchema.safeParse(validComplete).success).toBe(true);
  });

  it("requires only bookingId (all else optional)", () => {
    const minimal = { bookingId: validComplete.bookingId };
    expect(completeBookingSchema.safeParse(minimal).success).toBe(true);
  });

  it("validates finalAmount is positive", () => {
    const invalid1 = { ...validComplete, finalAmount: 0 };
    const invalid2 = { ...validComplete, finalAmount: -1000 };

    expect(completeBookingSchema.safeParse(invalid1).success).toBe(false);
    expect(completeBookingSchema.safeParse(invalid2).success).toBe(false);
  });

  it("validates professionalNotes length", () => {
    const valid = { ...validComplete, professionalNotes: "a".repeat(2000) };
    const invalid = { ...validComplete, professionalNotes: "a".repeat(2001) };

    expect(completeBookingSchema.safeParse(valid).success).toBe(true);
    expect(completeBookingSchema.safeParse(invalid).success).toBe(false);
  });
});

// ============================================================================
// REVIEW SCHEMA
// ============================================================================

describe("createReviewSchema", () => {
  const validReview: CreateReviewInput = {
    bookingId: "123e4567-e89b-12d3-a456-426614174000",
    rating: 5,
    comment: "Excellent service! Very professional and thorough.",
    wouldRecommend: true,
  };

  it("accepts valid review", () => {
    expect(createReviewSchema.safeParse(validReview).success).toBe(true);
  });

  it("requires bookingId and rating", () => {
    const { bookingId, ...noId } = validReview;
    const { rating, ...noRating } = validReview;

    expect(createReviewSchema.safeParse(noId).success).toBe(false);
    expect(createReviewSchema.safeParse(noRating).success).toBe(false);
  });

  describe("rating validation", () => {
    it("accepts ratings 1-5", () => {
      for (let rating = 1; rating <= 5; rating++) {
        const review = { ...validReview, rating };
        expect(createReviewSchema.safeParse(review).success).toBe(true);
      }
    });

    it("rejects rating below 1", () => {
      const invalid = { ...validReview, rating: 0 };
      expect(createReviewSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects rating above 5", () => {
      const invalid = { ...validReview, rating: 6 };
      expect(createReviewSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects fractional ratings", () => {
      const invalid = { ...validReview, rating: 4.5 };
      expect(createReviewSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("comment validation", () => {
    it("comment is optional", () => {
      const { comment, ...valid } = validReview;
      expect(createReviewSchema.safeParse(valid).success).toBe(true);
    });

    it("enforces minimum comment length (10 chars)", () => {
      const tooShort = { ...validReview, comment: "Too short" }; // 9 chars
      expect(createReviewSchema.safeParse(tooShort).success).toBe(false);

      const justRight = { ...validReview, comment: "Ten chars!" }; // 10 chars
      expect(createReviewSchema.safeParse(justRight).success).toBe(true);
    });

    it("enforces maximum comment length (1000 chars)", () => {
      const valid = { ...validReview, comment: "a".repeat(1000) };
      const invalid = { ...validReview, comment: "a".repeat(1001) };

      expect(createReviewSchema.safeParse(valid).success).toBe(true);
      expect(createReviewSchema.safeParse(invalid).success).toBe(false);
    });
  });

  it("applies default wouldRecommend value", () => {
    const { wouldRecommend, ...review } = validReview;
    const result = createReviewSchema.safeParse(review);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wouldRecommend).toBe(true);
    }
  });
});

// ============================================================================
// BOOKING FILTER SCHEMA
// ============================================================================

describe("bookingFilterSchema", () => {
  it("accepts empty filter", () => {
    expect(bookingFilterSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const filter = {
      status: "confirmed" as const,
      professionalId: "123e4567-e89b-12d3-a456-426614174000",
      customerId: "123e4567-e89b-12d3-a456-426614174001",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      minAmount: 50000,
      maxAmount: 500000,
    };

    expect(bookingFilterSchema.safeParse(filter).success).toBe(true);
  });

  describe("date format validation", () => {
    it("accepts valid date format (YYYY-MM-DD)", () => {
      const filter = { startDate: "2024-12-25", endDate: "2024-12-31" };
      expect(bookingFilterSchema.safeParse(filter).success).toBe(true);
    });

    it("rejects invalid date formats", () => {
      const invalidFormats = [
        { startDate: "12/25/2024" },
        { startDate: "25-12-2024" },
        { startDate: "2024/12/25" },
        { startDate: "2024-12-25T10:00:00" },
      ];

      for (const filter of invalidFormats) {
        expect(bookingFilterSchema.safeParse(filter).success).toBe(false);
      }
    });
  });

  describe("amount coercion", () => {
    it("coerces string amounts to numbers", () => {
      const filter = { minAmount: "50000", maxAmount: "100000" };
      const result = bookingFilterSchema.safeParse(filter);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minAmount).toBe(50000);
        expect(result.data.maxAmount).toBe(100000);
        expect(typeof result.data.minAmount).toBe("number");
      }
    });

    it("rejects negative amounts", () => {
      const invalid1 = { minAmount: -1000 };
      const invalid2 = { maxAmount: -500 };

      expect(bookingFilterSchema.safeParse(invalid1).success).toBe(false);
      expect(bookingFilterSchema.safeParse(invalid2).success).toBe(false);
    });

    it("accepts zero amounts", () => {
      const valid = { minAmount: 0, maxAmount: 0 };
      expect(bookingFilterSchema.safeParse(valid).success).toBe(true);
    });
  });
});
