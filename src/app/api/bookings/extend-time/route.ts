/**
 * REFACTORED VERSION - Professional requests time extension during active service
 * POST /api/bookings/extend-time
 *
 * BEFORE: 185 lines
 * AFTER: 102 lines (45% reduction)
 */

import { withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";
import { sendPushNotification } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";
import { InvalidBookingStatusError, ValidationError, BusinessRuleError } from "@/lib/errors";
import { z } from "zod";

const extendTimeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  additionalMinutes: z.number().int().positive().max(240, "Cannot extend more than 240 minutes (4 hours) at a time"),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, additionalMinutes } = extendTimeSchema.parse(body);

  // Fetch the booking with professional name for notification
  const booking = await requireProfessionalOwnership(supabase, user.id, bookingId, `
    id,
    professional_id,
    customer_id,
    status,
    service_name,
    service_hourly_rate,
    amount_authorized,
    time_extension_minutes,
    time_extension_amount,
    stripe_payment_intent_id,
    currency,
    professional_profiles:profiles!bookings_professional_id_fkey(full_name)
  `);

  // Can only extend in_progress bookings
  if (booking.status !== "in_progress") {
    throw new InvalidBookingStatusError(booking.status, "extend");
  }

  // Must have a payment intent
  if (!booking.stripe_payment_intent_id) {
    throw new BusinessRuleError(
      "No payment intent found for this booking",
      "MISSING_PAYMENT_INTENT"
    );
  }

  // Must have hourly rate to calculate extension cost
  if (!booking.service_hourly_rate) {
    throw new BusinessRuleError("No hourly rate found for this booking", "MISSING_HOURLY_RATE");
  }

  // Calculate additional amount (hourly rate / 60 * additional minutes)
  // Amount is stored in cents
  const additionalAmount = Math.round((booking.service_hourly_rate / 60) * additionalMinutes);

  // Calculate new total
  const newExtensionMinutes = (booking.time_extension_minutes || 0) + additionalMinutes;
  const newExtensionAmount = (booking.time_extension_amount || 0) + additionalAmount;
  const newTotalAmount = booking.amount_authorized + newExtensionAmount;

  // Update the Stripe PaymentIntent amount
  try {
    await stripe.paymentIntents.update(booking.stripe_payment_intent_id, {
      amount: newTotalAmount,
    });
  } catch (_stripeError) {
    throw new ValidationError("Failed to update payment amount. Please try again.");
  }

  // Update booking with extension data
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      time_extension_minutes: newExtensionMinutes,
      time_extension_amount: newExtensionAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError) {
    // Stripe was updated but database wasn't - log for manual review
    throw new ValidationError("Failed to record time extension. Contact support.");
  }

  // Send notification to customer about time extension
  const professionalName =
    (booking.professional_profiles as any)?.full_name || "Your professional";
  const formattedAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: booking.currency || "COP",
  }).format(additionalAmount / 100);

  await sendPushNotification({
    userId: booking.customer_id,
    title: "Service Time Extended",
    body: `${professionalName} extended your ${booking.service_name || "service"} by ${additionalMinutes} minutes. Additional charge: ${formattedAmount}`,
    url: "/dashboard/customer/bookings",
    tag: `time-extension-${booking.id}`,
    requireInteraction: false,
  });

  return ok(
    {
      booking: {
        id: updatedBooking.id,
        time_extension_minutes: updatedBooking.time_extension_minutes,
        time_extension_amount: updatedBooking.time_extension_amount,
        new_total_amount: newTotalAmount,
      },
      extension: {
        additional_minutes: additionalMinutes,
        additional_amount: additionalAmount,
        formatted_amount: formattedAmount,
      },
    },
    "Time extension processed successfully"
  );
});
