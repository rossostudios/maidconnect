/**
 * Pro Booking Reschedule API Route
 * Allows professionals to reschedule pending/confirmed bookings
 */

import { format } from "date-fns";
import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { sendBookingRescheduleEmail } from "@/lib/email/send";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { notifyCustomerBookingRescheduled } from "@/lib/notifications";

const rescheduleSchema = z.object({
  bookingId: z.string().uuid(),
  newStart: z.string().datetime(),
  newEnd: z.string().datetime(),
});

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { bookingId, newStart, newEnd } = rescheduleSchema.parse(body);

  // Verify booking exists and belongs to this professional
  // Include relations needed for notification
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(`
      id,
      professional_id,
      status,
      customer_id,
      scheduled_start,
      scheduled_end,
      duration_minutes,
      service_id,
      address,
      services!inner(name),
      profiles!bookings_customer_id_fkey(full_name, email),
      professional_profiles!bookings_professional_id_fkey(business_name)
    `)
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

  // Notify customer about the reschedule
  const customerProfile = booking.profiles as { full_name: string; email: string } | null;
  const professionalProfile = booking.professional_profiles as { business_name: string } | null;
  const service = booking.services as { name: string } | null;

  if (customerProfile?.email && service?.name) {
    const newStartDate = new Date(newStart);

    // Send email notification (fire-and-forget, don't block response)
    sendBookingRescheduleEmail(
      customerProfile.email,
      {
        customerName: customerProfile.full_name || "Customer",
        professionalName: professionalProfile?.business_name || "Professional",
        serviceName: service.name,
        scheduledDate: format(new Date(booking.scheduled_start), "MMMM d, yyyy"),
        scheduledTime: format(new Date(booking.scheduled_start), "h:mm a"),
        duration: `${durationMinutes} minutes`,
        address: booking.address || "",
        bookingId: booking.id,
      },
      format(newStartDate, "MMMM d, yyyy"),
      format(newStartDate, "h:mm a"),
      false // isForProfessional = false (this is for the customer)
    ).catch((err) => {
      console.error("Failed to send reschedule email to customer:", err);
    });

    // Send push notification (fire-and-forget)
    notifyCustomerBookingRescheduled(booking.customer_id, {
      id: booking.id,
      serviceName: service.name,
      professionalName: professionalProfile?.business_name || "Professional",
      newScheduledStart: newStart,
    }).catch((err) => {
      console.error("Failed to send reschedule push notification:", err);
    });
  }

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
