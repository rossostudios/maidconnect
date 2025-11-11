/**
 * Cancellation Service - Business logic for booking cancellation workflow
 *
 * Extracts complex cancellation logic from API route to reduce cognitive complexity
 * Handles: Validation, cancellation policy, refunds, notifications
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBookingDeclinedEmail } from "@/lib/integrations/email/send";
import { stripe } from "@/lib/integrations/stripe";
import { notifyProfessionalBookingCanceled } from "@/lib/shared/notifications";
import { calculateCancellationPolicy } from "@/lib/utils/cancellationPolicy";

export type CancellationBookingData = {
  id: string;
  professional_id: string;
  customer_id: string;
  status: string;
  scheduled_start: string | null;
  amount_authorized: number | null;
  stripe_payment_intent_id: string | null;
  service_name: string | null;
  currency: string;
};

export type CancellationValidationResult = {
  success: boolean;
  error?: string;
  errorCode?: string;
};

export type RefundProcessingResult = {
  success: boolean;
  stripeStatus: string;
  error?: string;
};

export type CancellationResult = {
  success: boolean;
  booking?: any;
  error?: string;
};

/**
 * Validate booking can be canceled
 */
export function validateCancellationEligibility(
  booking: CancellationBookingData
): CancellationValidationResult {
  const validStatuses = ["pending_payment", "authorized", "confirmed"];

  if (!validStatuses.includes(booking.status)) {
    return {
      success: false,
      error: `Cannot cancel booking with status: ${booking.status}`,
      errorCode: "INVALID_BOOKING_STATUS",
    };
  }

  if (!booking.scheduled_start) {
    return {
      success: false,
      error: "Cannot calculate cancellation policy without scheduled start time",
    };
  }

  return { success: true };
}

/**
 * Validate cancellation policy allows cancellation
 */
export function validateCancellationPolicy(
  scheduledStart: string,
  status: string
): {
  success: boolean;
  policy: any;
  error?: string;
} {
  const policy = calculateCancellationPolicy(scheduledStart, status);

  if (!policy.canCancel) {
    return {
      success: false,
      policy,
      error: policy.reason || "Cannot cancel booking",
    };
  }

  return { success: true, policy };
}

/**
 * Process Stripe refund or cancellation based on payment status
 */
export async function processStripeRefund(
  paymentIntentId: string | null,
  refundAmount: number
): Promise<RefundProcessingResult> {
  if (!paymentIntentId) {
    return { success: true, stripeStatus: "no_payment_required" };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If payment was only authorized (not captured), cancel it
    if (paymentIntent.status === "requires_capture") {
      await stripe.paymentIntents.cancel(paymentIntentId);
      return { success: true, stripeStatus: "canceled" };
    }

    // If payment was captured, issue a refund
    if (paymentIntent.status === "succeeded" && refundAmount > 0) {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount,
      });
      return { success: true, stripeStatus: "refunded" };
    }

    return { success: true, stripeStatus: "no_refund_needed" };
  } catch (stripeError) {
    return {
      success: false,
      stripeStatus: "error",
      error: stripeError instanceof Error ? stripeError.message : "Failed to process refund",
    };
  }
}

/**
 * Update booking to canceled status in database
 */
export async function cancelBookingInDatabase(
  supabase: SupabaseClient,
  bookingId: string,
  userId: string,
  reason?: string
): Promise<CancellationResult> {
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "canceled",
      canceled_reason: reason || "Customer canceled",
      canceled_at: new Date().toISOString(),
      canceled_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError || !updatedBooking) {
    return {
      success: false,
      error: "Failed to cancel booking in database",
    };
  }

  return { success: true, booking: updatedBooking };
}

/**
 * Prepare notification data for cancellation emails
 */
export function prepareCancellationNotificationData(
  booking: CancellationBookingData,
  customerName: string,
  professionalName: string
): any {
  const scheduledDate = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleDateString()
    : "TBD";
  const scheduledTime = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";

  return {
    customerName,
    professionalName,
    serviceName: booking.service_name || "Service",
    scheduledDate,
    scheduledTime,
    duration: "TBD",
    address: "TBD",
    bookingId: booking.id,
  };
}

/**
 * Send cancellation notifications to professional
 */
export async function sendCancellationNotifications(
  supabase: SupabaseClient,
  booking: CancellationBookingData,
  customerName: string,
  reason?: string
): Promise<void> {
  const { data: professionalUser } = await supabase.auth.admin.getUserById(booking.professional_id);

  if (!professionalUser.user?.email) {
    return;
  }

  const professionalName = professionalUser.user.user_metadata?.full_name || "Professional";
  const notificationData = prepareCancellationNotificationData(
    booking,
    customerName,
    professionalName
  );

  // Send email and push notification in parallel
  await Promise.all([
    sendBookingDeclinedEmail(
      professionalUser.user.email,
      notificationData,
      reason || "Customer canceled the booking"
    ),
    notifyProfessionalBookingCanceled(booking.professional_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      customerName,
      scheduledStart: booking.scheduled_start || new Date().toISOString(),
    }),
  ]);
}

/**
 * Format refund amount for display
 */
export function formatRefundAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency || "COP",
  }).format(amount / 100);
}
