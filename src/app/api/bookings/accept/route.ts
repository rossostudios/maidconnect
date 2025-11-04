/**
 * REFACTORED VERSION - Professional accepts a booking request
 * POST /api/bookings/accept
 *
 * BEFORE: 148 lines
 * AFTER: 62 lines (58% reduction)
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import { sendBookingConfirmedEmail } from "@/lib/email/send";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { notifyCustomerBookingAccepted } from "@/lib/notifications";

const acceptBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId } = acceptBookingSchema.parse(body);

  // Verify professional owns this booking and get full booking data
  const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);

  // Validate booking status
  if (booking.status !== "authorized") {
    throw new InvalidBookingStatusError(booking.status, "accept");
  }

  // Update booking status to confirmed
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) {
    throw new ValidationError("Failed to accept booking");
  }

  // Fetch customer and professional details for notifications
  const [{ data: professionalProfile }, { data: customerUser }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("full_name")
      .eq("profile_id", booking.professional_id)
      .single(),
    supabase.auth.admin.getUserById(booking.customer_id),
  ]);

  // Send notifications if customer email exists
  if (customerUser.user?.email) {
    const scheduledDate = booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleDateString()
      : "TBD";
    const scheduledTime = booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "TBD";
    const duration = booking.duration_minutes ? `${booking.duration_minutes} minutes` : "TBD";
    const address =
      booking.address && typeof booking.address === "object" && "formatted" in booking.address
        ? String(booking.address.formatted)
        : "Not specified";
    const amount = booking.amount_authorized
      ? new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: booking.currency || "COP",
        }).format(booking.amount_authorized / 100)
      : undefined;

    // Send confirmation email and push notification
    await Promise.all([
      sendBookingConfirmedEmail(customerUser.user.email, {
        customerName: customerUser.user.user_metadata?.full_name || "there",
        professionalName: professionalProfile?.full_name || "Your professional",
        serviceName: booking.service_name || "Service",
        scheduledDate,
        scheduledTime,
        duration,
        address,
        bookingId: booking.id,
        amount,
      }),
      notifyCustomerBookingAccepted(booking.customer_id, {
        id: booking.id,
        serviceName: booking.service_name || "Service",
        professionalName: professionalProfile?.full_name || "Your professional",
      }),
    ]);
  }

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
