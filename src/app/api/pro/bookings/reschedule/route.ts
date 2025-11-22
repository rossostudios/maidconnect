/**
 * Pro Booking Reschedule API Route
 * Allows professionals to reschedule pending/confirmed bookings
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { NotFoundError, ValidationError } from "@/lib/errors";

const rescheduleSchema = z.object({
  bookingId: z.string().uuid(),
  newStart: z.string().datetime(),
  newEnd: z.string().datetime(),
});

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { bookingId, newStart, newEnd } = rescheduleSchema.parse(body);

  // Verify booking exists and belongs to this professional
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, professional_id, status, customer_id")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.professional_id !== user.id) {
    throw new ValidationError("You don't have permission to modify this booking");
  }

  // Only allow rescheduling pending/confirmed bookings
  if (!["pending", "confirmed"].includes(booking.status)) {
    throw new ValidationError("Only pending or confirmed bookings can be rescheduled");
  }

  // Validate times
  const startDate = new Date(newStart);
  const endDate = new Date(newEnd);

  if (startDate >= endDate) {
    throw new ValidationError("End time must be after start time");
  }

  if (startDate < new Date()) {
    throw new ValidationError("Cannot reschedule to a time in the past");
  }

  // Calculate new duration
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  if (durationMinutes < 30 || durationMinutes > 480) {
    throw new ValidationError("Booking duration must be between 30 minutes and 8 hours");
  }

  // Update booking
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      scheduled_start: newStart,
      scheduled_end: newEnd,
      duration_minutes: durationMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError) {
    throw new ValidationError(updateError.message || "Failed to reschedule booking");
  }

  // TODO: Notify customer about the reschedule via email/push notification

  return ok({
    success: true,
    booking: {
      id: updatedBooking.id,
      scheduled_start: updatedBooking.scheduled_start,
      scheduled_end: updatedBooking.scheduled_end,
      duration_minutes: updatedBooking.duration_minutes,
    },
  });
});

export const POST = withRateLimit(handler, "booking");
