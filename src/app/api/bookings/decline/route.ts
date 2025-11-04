/**
 * REFACTORED VERSION - Professional declines a booking request
 * POST /api/bookings/decline
 *
 * BEFORE: 154 lines
 * AFTER: 89 lines (42% reduction)
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import { sendBookingDeclinedEmail } from "@/lib/email/send";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { notifyCustomerBookingDeclined } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

const declineBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  reason: z.string().optional(),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, reason } = declineBookingSchema.parse(body);

  // Fetch the booking with related data
  const booking = await requireProfessionalOwnership(
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
  );

  // Can only decline authorized or pending_payment bookings
  if (!["authorized", "pending_payment"].includes(booking.status)) {
    throw new InvalidBookingStatusError(booking.status, "decline");
  }

  // Cancel the payment intent if it exists
  if (booking.stripe_payment_intent_id) {
    try {
      await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
    } catch (_stripeError) {
      // Continue even if Stripe cancellation fails - we still want to decline the booking
    }
  }

  // Update booking status to declined
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "declined",
      stripe_payment_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) {
    throw new ValidationError("Failed to decline booking");
  }

  // Fetch customer and professional details for email
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("full_name")
    .eq("profile_id", booking.professional_id)
    .single();

  // Get customer email
  const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);

  if (customerUser.user?.email) {
    // Format booking data for email
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
    const getFormattedAddress = () => {
      if (!booking.address) {
        return "Not specified";
      }
      if (typeof booking.address === "object" && "formatted" in booking.address) {
        return String(booking.address.formatted);
      }
      return JSON.stringify(booking.address);
    };
    const address = getFormattedAddress();

    // Send decline email to customer
    await sendBookingDeclinedEmail(
      customerUser.user.email,
      {
        customerName: customerUser.user.user_metadata?.full_name || "there",
        professionalName: professionalProfile?.full_name || "The professional",
        serviceName: booking.service_name || "Service",
        scheduledDate,
        scheduledTime,
        duration,
        address,
        bookingId: booking.id,
      },
      reason
    );

    // Send push notification to customer
    await notifyCustomerBookingDeclined(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName: professionalProfile?.full_name || "The professional",
    });
  }

  return ok({
    booking: { id: booking.id, status: "declined" },
  });
});
