/**
 * Professional accepts a booking request
 * POST /api/bookings/accept
 *
 * REFACTORED: Complexity 20 → <15
 * - Extracted business logic to booking-workflow-service.ts
 * - Route now focuses on orchestration
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import type { BookingWorkflowData } from "@/lib/bookings/booking-workflow-service";
import {
  fetchNotificationDetails,
  sendAcceptanceNotifications,
  updateBookingToConfirmed,
  validateAcceptEligibility,
} from "@/lib/bookings/booking-workflow-service";
import { invalidateBookings } from "@/lib/cache";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { trackBookingConfirmedServer } from "@/lib/integrations/posthog/server";

const acceptBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId } = acceptBookingSchema.parse(body);

  // Verify professional owns this booking and get full booking data
  const booking = (await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId
  )) as BookingWorkflowData;

  // Validate booking can be accepted using service
  const validationResult = validateAcceptEligibility(booking.status);
  if (!validationResult.success) {
    throw new InvalidBookingStatusError(booking.status, "accept");
  }

  // Update booking status to confirmed using service
  const updateResult = await updateBookingToConfirmed(supabase, bookingId);
  if (!updateResult.success) {
    throw new ValidationError(updateResult.error || "Failed to accept booking");
  }

  // Fetch customer and professional details using service
  const { professionalName, customerName, customerEmail } = await fetchNotificationDetails(
    supabase,
    booking.professional_id,
    booking.customer_id
  );

  // Send notifications if customer email exists
  if (customerEmail) {
    await sendAcceptanceNotifications(booking, professionalName, customerName, customerEmail);
  }

  // Track booking confirmation
  await trackBookingConfirmedServer(booking.customer_id, {
    bookingId: booking.id,
    professionalId: booking.professional_id,
    totalAmount: booking.amount_authorized ?? 0,
    currency: booking.currency ?? "COP",
  });

  // Invalidate booking-related caches (availability, stats)
  invalidateBookings();

  return ok(
    {
      booking: {
        id: booking.id,
        status: "confirmed",
      },
    },
    "Booking accepted successfully"
  );
});
