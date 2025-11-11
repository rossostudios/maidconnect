/**
 * REFACTORED VERSION - Customer reschedules a booking
 * POST /api/bookings/reschedule
 *
 * BEFORE: 199 lines
 * AFTER: 111 lines (44% reduction)
 */

import { format } from "date-fns";
import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import { sendBookingRescheduleEmail } from "@/lib/email/send";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { notifyProfessionalBookingRescheduled } from "@/lib/notifications";

// Type for booking with joined profile data
type BookingWithProfiles = {
  id: string;
  customer_id: string;
  professional_id: string;
  status: string;
  scheduled_start: string;
  duration_minutes: number;
  service_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  customer_profiles: { full_name: string } | null;
  professional_profiles: { full_name: string } | null;
};

const rescheduleBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  newScheduledStart: z.string().datetime("Invalid datetime format for newScheduledStart"),
  newDurationMinutes: z.number().int().positive().optional(),
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, newScheduledStart, newDurationMinutes } = rescheduleBookingSchema.parse(body);

  // Validate new datetime is in the future
  const newStartTime = new Date(newScheduledStart);
  const now = new Date();

  if (newStartTime <= now) {
    throw new ValidationError("New scheduled time must be in the future");
  }

  // Fetch the booking with names and address
  const booking = await requireCustomerOwnership<BookingWithProfiles>(
    supabase,
    user.id,
    bookingId,
    `
    id,
    customer_id,
    professional_id,
    status,
    scheduled_start,
    duration_minutes,
    service_name,
    address_line1,
    address_line2,
    address_city,
    customer_profiles:profiles!bookings_customer_id_fkey(full_name),
    professional_profiles:profiles!bookings_professional_id_fkey(full_name)
  `
  );

  // Check if booking can be rescheduled
  const validStatuses = ["authorized", "confirmed"];
  if (!validStatuses.includes(booking.status)) {
    throw new InvalidBookingStatusError(booking.status, "reschedule");
  }

  // Calculate new end time
  const durationToUse = newDurationMinutes || booking.duration_minutes || 60;
  const newEndTime = new Date(newStartTime.getTime() + durationToUse * 60 * 1000);

  // Update booking with new schedule
  // Reset status to "authorized" to require professional re-confirmation
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      scheduled_start: newStartTime.toISOString(),
      scheduled_end: newEndTime.toISOString(),
      duration_minutes: durationToUse,
      status: "authorized", // Reset to require professional confirmation
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError) {
    throw new ValidationError("Failed to reschedule booking");
  }

  // Send email notification to professional about reschedule request
  try {
    const { data: professionalAuth } = await supabase.auth.admin.getUserById(
      booking.professional_id
    );
    const professionalEmail = professionalAuth?.user?.email;

    if (professionalEmail) {
      const customerName = booking.customer_profiles?.full_name || "Customer";
      const professionalName = booking.professional_profiles?.full_name || "Professional";
      const address = [booking.address_line1, booking.address_line2, booking.address_city]
        .filter(Boolean)
        .join(", ");

      const oldDate = new Date(booking.scheduled_start);
      const oldScheduledDate = format(oldDate, "MMMM d, yyyy");
      const oldScheduledTime = format(oldDate, "h:mm a");

      const newScheduledDate = format(newStartTime, "MMMM d, yyyy");
      const newScheduledTime = format(newStartTime, "h:mm a");

      await sendBookingRescheduleEmail(
        professionalEmail,
        {
          customerName,
          professionalName,
          serviceName: booking.service_name || "Service",
          scheduledDate: oldScheduledDate,
          scheduledTime: oldScheduledTime,
          duration: `${durationToUse} minutes`,
          address,
          bookingId: booking.id,
        },
        newScheduledDate,
        newScheduledTime,
        true // isForProfessional
      );
    }
  } catch (_emailError) {
    // Don't fail request if email fails
  }

  // Send in-app notification to professional
  const customerName = booking.customer_profiles?.full_name || "Customer";
  await notifyProfessionalBookingRescheduled(booking.professional_id, {
    id: booking.id,
    serviceName: booking.service_name || "Service",
    customerName,
    newScheduledStart: newStartTime.toISOString(),
  });

  return ok(
    {
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        scheduled_start: updatedBooking.scheduled_start,
        scheduled_end: updatedBooking.scheduled_end,
        duration_minutes: updatedBooking.duration_minutes,
      },
    },
    "Booking rescheduled successfully. The professional will need to confirm the new time."
  );
});
