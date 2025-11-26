/**
 * Professional checks out after completing a service
 * POST /api/bookings/check-out
 *
 * REFACTORED: Complexity 35 → <15
 * - Extracted business logic to check-out-service.ts
 * - Route now focuses on orchestration
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import type { BookingCheckOutData } from "@/lib/bookings/check-out-service";
import {
  calculateActualDuration,
  captureBookingPayment,
  completeBookingCheckOut,
  initializeRebookNudge,
  prepareCheckOutEmailData,
  sendCheckOutNotifications,
  updateProfessionalEarningsStats,
  validateCheckOutEligibility,
  verifyAndLogCheckOutLocation,
} from "@/lib/bookings/check-out-service";
import { BusinessRuleError, InvalidBookingStatusError, ValidationError } from "@/lib/errors";

const checkOutSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  completionNotes: z.string().optional(),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, latitude, longitude, completionNotes } = checkOutSchema.parse(body);

  // Fetch the booking with all necessary data
  const booking = (await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId,
    `
    id,
    professional_id,
    customer_id,
    status,
    checked_in_at,
    scheduled_start,
    duration_minutes,
    service_name,
    service_hourly_rate,
    amount_authorized,
    time_extension_minutes,
    time_extension_amount,
    currency,
    address,
    stripe_payment_intent_id,
    customer_profiles:profiles!bookings_customer_id_fkey(full_name),
    professional_profiles:profiles!bookings_professional_id_fkey(full_name)
  `
  )) as BookingCheckOutData;

  // Validate booking can be checked out using service
  const validationResult = validateCheckOutEligibility(booking);
  if (!validationResult.success) {
    if (booking.status !== "in_progress") {
      throw new InvalidBookingStatusError(booking.status, "check out of");
    }
    throw new BusinessRuleError(validationResult.error || "Cannot check out", "CHECK_OUT_ERROR");
  }

  const location = { latitude, longitude };
  const checkedOutAt = new Date();

  // GPS verification using service
  await verifyAndLogCheckOutLocation(
    booking.id,
    booking.professional_id,
    location,
    booking.address,
    booking.service_name
  );

  // Calculate actual duration using service
  const actualDurationMinutes = calculateActualDuration(booking.checked_in_at!, checkedOutAt);

  // Capture payment using service
  const paymentResult = await captureBookingPayment(booking, actualDurationMinutes);
  if (!paymentResult.success) {
    throw new ValidationError(
      paymentResult.error || "Failed to capture payment. Please try again or contact support."
    );
  }

  // Complete booking check-out using service
  const updateResult = await completeBookingCheckOut(
    supabase,
    bookingId,
    booking,
    location,
    checkedOutAt,
    actualDurationMinutes,
    paymentResult.capturedAmount,
    completionNotes
  );

  if (!updateResult.success) {
    throw new ValidationError(
      updateResult.error || "Payment captured but booking update failed. Contact support."
    );
  }

  // Update professional's career earnings stats (non-blocking - Digital CV feature)
  // This powers the Earnings Badge on public profiles
  await updateProfessionalEarningsStats(
    supabase,
    booking.professional_id,
    paymentResult.capturedAmount,
    bookingId
  );

  // Initialize rebook nudge experiment using service (non-blocking)
  await initializeRebookNudge(supabase, bookingId, booking.customer_id);

  // Prepare and send notifications using service
  const emailContext = await prepareCheckOutEmailData(
    supabase,
    booking,
    new Date(booking.checked_in_at!),
    checkedOutAt,
    actualDurationMinutes,
    paymentResult.capturedAmount
  );

  await sendCheckOutNotifications(
    booking,
    emailContext.emailData,
    emailContext.customerEmail,
    emailContext.professionalEmail,
    paymentResult.capturedAmount
  );

  return ok({
    booking: {
      id: updateResult.booking.id,
      status: updateResult.booking.status,
      checked_out_at: updateResult.booking.checked_out_at,
      actual_duration_minutes: updateResult.booking.actual_duration_minutes,
      amount_captured: updateResult.booking.amount_captured,
    },
  });
});
