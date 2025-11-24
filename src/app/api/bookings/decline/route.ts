/**
 * Professional declines a booking request
 * POST /api/bookings/decline
 *
 * REFACTORED: Complexity 17 → <15
 * - Extracted business logic to booking-workflow-service.ts
 * - Route now focuses on orchestration
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import { invalidateBookings } from "@/lib/cache";
import type { BookingWorkflowData } from "@/lib/bookings/booking-workflow-service";
import {
  cancelPaymentIntent,
  fetchNotificationDetails,
  sendDeclineNotifications,
  updateBookingToDeclined,
  validateDeclineEligibility,
} from "@/lib/bookings/booking-workflow-service";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";

const declineBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  reason: z.string().optional(),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, reason } = declineBookingSchema.parse(body);

  // Fetch the booking with related data
  const booking = (await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId,
    `
    id,
    professional_id,
    customer_id,
    status,
    stripe_payment_intent_id,
    scheduled_start,
    duration_minutes,
    service_name,
    address
  `
  )) as BookingWorkflowData;

  // Validate booking can be declined using service
  const validationResult = validateDeclineEligibility(booking.status);
  if (!validationResult.success) {
    throw new InvalidBookingStatusError(booking.status, "decline");
  }

  // Cancel the payment intent if it exists using service
  await cancelPaymentIntent(booking.stripe_payment_intent_id);

  // Update booking status to declined using service
  const updateResult = await updateBookingToDeclined(supabase, bookingId);
  if (!updateResult.success) {
    throw new ValidationError(updateResult.error || "Failed to decline booking");
  }

  // Fetch customer and professional details using service
  const { professionalName, customerName, customerEmail } = await fetchNotificationDetails(
    supabase,
    booking.professional_id,
    booking.customer_id
  );

  // Send notifications if customer email exists
  if (customerEmail) {
    await sendDeclineNotifications(booking, professionalName, customerName, customerEmail, reason);
  }

  // Invalidate booking-related caches (availability, stats)
  invalidateBookings();

  return ok({
    booking: { id: booking.id, status: "declined" },
  });
});
