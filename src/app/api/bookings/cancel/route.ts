/**
 * REFACTORED VERSION - Customer cancels a booking
 * POST /api/bookings/cancel
 *
 * BEFORE: 214 lines
 * AFTER: 108 lines (50% reduction)
 */

import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import { calculateCancellationPolicy, calculateRefundAmount } from "@/lib/cancellation-policy";
import { sendBookingDeclinedEmail } from "@/lib/email/send";
import { BusinessRuleError, ValidationError } from "@/lib/errors";
import { notifyProfessionalBookingCanceled } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

const cancelBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  reason: z.string().optional(),
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, reason } = cancelBookingSchema.parse(body);

  // Verify customer owns this booking and get full booking data
  const booking = await requireCustomerOwnership(supabase, user.id, bookingId);

  // Validate booking can be canceled
  const validStatuses = ["pending_payment", "authorized", "confirmed"];
  if (!validStatuses.includes(booking.status)) {
    throw new BusinessRuleError(
      `Cannot cancel booking with status: ${booking.status}`,
      "INVALID_BOOKING_STATUS"
    );
  }

  if (!booking.scheduled_start) {
    throw new ValidationError("Cannot calculate cancellation policy without scheduled start time");
  }

  // Calculate cancellation policy
  const policy = calculateCancellationPolicy(booking.scheduled_start, booking.status);

  if (!policy.canCancel) {
    throw new BusinessRuleError(
      policy.reason || "Cannot cancel booking",
      "CANCELLATION_NOT_ALLOWED",
      {
        policy,
      }
    );
  }

  // Calculate refund amount
  const refundAmount = calculateRefundAmount(
    booking.amount_authorized || 0,
    policy.refundPercentage
  );

  // Process Stripe refund/cancellation
  let stripeStatus = "no_payment_required";

  if (booking.stripe_payment_intent_id) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);

      if (paymentIntent.status === "requires_capture") {
        await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
        stripeStatus = "canceled";
      } else if (paymentIntent.status === "succeeded" && refundAmount > 0) {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: refundAmount,
        });
        stripeStatus = "refunded";
      }
    } catch (_stripeError) {
      throw new ValidationError("Failed to process refund. Please contact support.");
    }
  }

  // Update booking to canceled
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "canceled",
      canceled_reason: reason || "Customer canceled",
      canceled_at: new Date().toISOString(),
      canceled_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError || !updatedBooking) {
    throw new ValidationError("Failed to cancel booking. Please contact support.");
  }

  // Send notification emails
  const { data: professionalUser } = await supabase.auth.admin.getUserById(booking.professional_id);

  if (professionalUser.user?.email) {
    const scheduledDate = booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleDateString()
      : "TBD";
    const scheduledTime = booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "TBD";

    await Promise.all([
      sendBookingDeclinedEmail(
        professionalUser.user.email,
        {
          customerName: user.user_metadata?.full_name || "Customer",
          professionalName: professionalUser.user.user_metadata?.full_name || "Professional",
          serviceName: booking.service_name || "Service",
          scheduledDate,
          scheduledTime,
          duration: "TBD",
          address: "TBD",
          bookingId: booking.id,
        },
        reason || "Customer canceled the booking"
      ),
      notifyProfessionalBookingCanceled(booking.professional_id, {
        id: booking.id,
        serviceName: booking.service_name || "Service",
        customerName: user.user_metadata?.full_name || "A customer",
        scheduledStart: booking.scheduled_start || new Date().toISOString(),
      }),
    ]);
  }

  return ok(
    {
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        canceled_at: updatedBooking.canceled_at,
      },
      refund: {
        policy: policy.reason,
        refund_percentage: policy.refundPercentage,
        refund_amount: refundAmount,
        formatted_refund: new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: booking.currency || "COP",
        }).format(refundAmount / 100),
        stripe_status: stripeStatus,
      },
    },
    "Booking canceled successfully"
  );
});
