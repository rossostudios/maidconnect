/**
 * REFACTORED VERSION - Professional checks in to start a service
 * POST /api/bookings/check-in
 *
 * BEFORE: 179 lines
 * AFTER: 103 lines (42% reduction)
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { verifyBookingLocation } from "@/lib/gps-verification";
import { logger } from "@/lib/logger";
import { notifyCustomerServiceStarted } from "@/lib/notifications";

const checkInSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, latitude, longitude } = checkInSchema.parse(body);

  // Verify professional owns this booking and get full booking data
  const booking = await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId,
    `
    id,
    professional_id,
    customer_id,
    status,
    scheduled_start,
    service_name,
    address
  `
  );

  // Can only check in to confirmed bookings
  if (booking.status !== "confirmed") {
    throw new InvalidBookingStatusError(booking.status, "check in to");
  }

  // GPS Verification: Check if professional is within reasonable distance of booking address
  const gpsVerification = verifyBookingLocation(
    { latitude, longitude },
    booking.address,
    150 // 150 meters = ~0.09 miles
  );

  // Log GPS verification result
  await logger.info("GPS verification at check-in", {
    bookingId: booking.id,
    professionalId: booking.professional_id,
    verified: gpsVerification.verified,
    distance: gpsVerification.distance,
    maxDistance: gpsVerification.maxDistance,
    reason: gpsVerification.reason,
    professionalLocation: { latitude, longitude },
  });

  // Soft enforcement: Log warning if too far but still allow check-in
  if (!gpsVerification.verified && gpsVerification.distance > 0) {
    await logger.warn("Professional checking in from unexpected location", {
      bookingId: booking.id,
      professionalId: booking.professional_id,
      distance: gpsVerification.distance,
      maxDistance: gpsVerification.maxDistance,
      serviceName: booking.service_name,
      severity: "MEDIUM",
      actionRecommended: "Review check-in location for potential fraud",
    });
  }

  // Update booking to in_progress status with check-in data
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "in_progress",
      checked_in_at: new Date().toISOString(),
      check_in_latitude: latitude,
      check_in_longitude: longitude,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError) {
    throw new ValidationError("Failed to check in");
  }

  // Fetch professional name for notification
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("full_name")
    .eq("profile_id", booking.professional_id)
    .single();

  // Send push notification to customer
  await notifyCustomerServiceStarted(booking.customer_id, {
    id: booking.id,
    serviceName: booking.service_name || "Service",
    professionalName: professionalProfile?.full_name || "Your professional",
  });

  return ok({
    booking: {
      id: updatedBooking.id,
      status: updatedBooking.status,
      checked_in_at: updatedBooking.checked_in_at,
    },
  });
});
