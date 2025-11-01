import { z } from "zod";
import { dateSchema, uuidSchema } from "./api";

/**
 * Booking Validation Schemas
 *
 * Validates booking creation, updates, and related operations.
 */

// ============================================
// Booking Status Enums
// ============================================

export const bookingStatusSchema = z.enum([
  "pending_payment",
  "payment_authorized",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "refunded",
]);

export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// ============================================
// Address Schema
// ============================================

export const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: z.string().min(2).max(2).default("CO"), // ISO 3166-1 alpha-2
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  additionalInfo: z.string().max(500).optional(),
});

export type Address = z.infer<typeof addressSchema>;

// ============================================
// Create Booking Schema
// ============================================

export const createBookingSchema = z
  .object({
    // Required fields
    professionalId: uuidSchema,
    amount: z.number().positive().int(),

    // Optional scheduling
    scheduledStart: dateSchema.optional(),
    scheduledEnd: dateSchema.optional(),
    durationMinutes: z.number().int().positive().max(1440).optional(), // Max 24 hours

    // Payment
    currency: z.string().length(3).toLowerCase().default("cop"),

    // Service details
    serviceName: z.string().min(1).max(100).optional(),
    serviceHourlyRate: z.number().positive().int().optional(),

    // Additional info
    specialInstructions: z.string().max(2000).optional(),
    address: addressSchema.optional(),
  })
  .refine(
    (data) => {
      // If scheduledStart is provided, durationMinutes or scheduledEnd must also be provided
      if (data.scheduledStart) {
        return data.durationMinutes || data.scheduledEnd;
      }
      return true;
    },
    {
      message: "Either durationMinutes or scheduledEnd must be provided when scheduledStart is set",
      path: ["scheduledStart"],
    }
  )
  .refine(
    (data) => {
      // If scheduledEnd is provided, it must be after scheduledStart
      if (data.scheduledStart && data.scheduledEnd) {
        return new Date(data.scheduledEnd) > new Date(data.scheduledStart);
      }
      return true;
    },
    {
      message: "scheduledEnd must be after scheduledStart",
      path: ["scheduledEnd"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ============================================
// Update Booking Schema
// ============================================

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  scheduledStart: dateSchema.optional(),
  scheduledEnd: dateSchema.optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
  specialInstructions: z.string().max(2000).optional(),
  address: addressSchema.optional(),
  actualStart: dateSchema.optional(),
  actualEnd: dateSchema.optional(),
  cancellationReason: z.string().max(1000).optional(),
  professionalNotes: z.string().max(2000).optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// ============================================
// Booking Query/Filter Schemas
// ============================================

export const bookingFilterSchema = z.object({
  status: bookingStatusSchema.optional(),
  professionalId: uuidSchema.optional(),
  customerId: uuidSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
});

export type BookingFilter = z.infer<typeof bookingFilterSchema>;

// ============================================
// Cancel Booking Schema
// ============================================

export const cancelBookingSchema = z.object({
  bookingId: uuidSchema,
  reason: z.string().min(10).max(1000),
  refundAmount: z.number().nonnegative().int().optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// ============================================
// Complete Booking Schema
// ============================================

export const completeBookingSchema = z.object({
  bookingId: uuidSchema,
  actualEnd: dateSchema.optional(),
  finalAmount: z.number().positive().int().optional(),
  professionalNotes: z.string().max(2000).optional(),
});

export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;

// ============================================
// Review/Rating Schema
// ============================================

export const createReviewSchema = z.object({
  bookingId: uuidSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
  wouldRecommend: z.boolean().default(true),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
