/**
 * Check-out Service - Business logic for booking check-out workflow
 *
 * Extracts complex check-out logic from API route to reduce cognitive complexity
 * Handles: GPS verification, payment capture, booking completion, notifications
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendServiceCompletedEmail } from "@/lib/integrations/email/send";
import { stripe } from "@/lib/integrations/stripe";
import { getRebookNudgeVariant, isFeatureEnabled } from "@/lib/shared/config/featureFlags";
import { logger } from "@/lib/shared/logger";
import {
  notifyAdminPaymentCapturedButDBFailed,
  notifyAdminPaymentFailure,
  notifyAllAdmins,
  notifyCustomerServiceCompleted,
  notifyProfessionalPaymentReceived,
} from "@/lib/shared/notifications";
import { verifyBookingLocation } from "@/lib/utils/gpsVerification";

export type BookingCheckOutData = {
  id: string;
  professional_id: string;
  customer_id: string;
  status: string;
  checked_in_at: string | null;
  scheduled_start?: string | null;
  duration_minutes?: number | null;
  service_name: string | null;
  service_hourly_rate?: number | null;
  amount_authorized: number;
  time_extension_minutes?: number | null;
  time_extension_amount?: number | null;
  currency: string;
  address?: unknown;
  stripe_payment_intent_id: string | null;
  customer_profiles?: { full_name?: string };
  professional_profiles?: { full_name?: string };
};

export type GPSLocation = {
  latitude: number;
  longitude: number;
};

export type CheckOutValidationResult = {
  success: boolean;
  error?: string;
};

export type PaymentCaptureResult = {
  success: boolean;
  capturedAmount: number;
  error?: string;
};

export type BookingUpdateResult = {
  success: boolean;
  booking?: any;
  error?: string;
};

/**
 * Validate booking can be checked out
 */
export function validateCheckOutEligibility(
  booking: BookingCheckOutData
): CheckOutValidationResult {
  if (booking.status !== "in_progress") {
    return {
      success: false,
      error: `Cannot check out of booking with status: ${booking.status}`,
    };
  }

  if (!booking.checked_in_at) {
    return {
      success: false,
      error: "Cannot check out without checking in first",
    };
  }

  if (!booking.stripe_payment_intent_id) {
    return {
      success: false,
      error: "No payment intent found for this booking",
    };
  }

  return { success: true };
}

/**
 * Verify and log GPS location at check-out
 */
export async function verifyAndLogCheckOutLocation(
  bookingId: string,
  professionalId: string,
  location: GPSLocation,
  bookingAddress: unknown,
  serviceName: string | null
): Promise<void> {
  const gpsVerification = verifyBookingLocation(
    location,
    bookingAddress,
    150 // 150 meters = ~0.09 miles
  );

  // Log GPS verification result
  await logger.info("GPS verification at check-out", {
    bookingId,
    professionalId,
    verified: gpsVerification.verified,
    distance: gpsVerification.distance,
    maxDistance: gpsVerification.maxDistance,
    reason: gpsVerification.reason,
    professionalLocation: location,
  });

  // Soft enforcement: Log warning if too far but still allow check-out
  if (!gpsVerification.verified && gpsVerification.distance > 0) {
    await logger.warn("Professional checking out from unexpected location", {
      bookingId,
      professionalId,
      distance: gpsVerification.distance,
      maxDistance: gpsVerification.maxDistance,
      serviceName: serviceName || "Unknown",
      severity: "MEDIUM",
      actionRecommended: "Review check-out location for potential fraud",
    });
  }
}

/**
 * Calculate actual service duration in minutes
 */
export function calculateActualDuration(checkedInAt: string, checkedOutAt: Date): number {
  const checkInTime = new Date(checkedInAt);
  return Math.round((checkedOutAt.getTime() - checkInTime.getTime()) / 1000 / 60);
}

/**
 * Capture payment via Stripe with comprehensive error handling
 */
export async function captureBookingPayment(
  booking: BookingCheckOutData,
  actualDurationMinutes: number
): Promise<PaymentCaptureResult> {
  if (!booking.stripe_payment_intent_id) {
    return {
      success: false,
      capturedAmount: booking.amount_authorized,
      error: "No payment intent found",
    };
  }

  try {
    // Calculate total amount including time extensions
    const amountToCapture = booking.amount_authorized + (booking.time_extension_amount || 0);

    // Log payment capture attempt
    await logger.info("Attempting payment capture", {
      bookingId: booking.id,
      paymentIntentId: booking.stripe_payment_intent_id,
      amountAuthorized: booking.amount_authorized,
      timeExtensionAmount: booking.time_extension_amount || 0,
      amountToCapture,
      professionalId: booking.professional_id,
      customerId: booking.customer_id,
    });

    // Generate idempotency key to prevent duplicate captures on retry
    const idempotencyKey = `booking-${booking.id}-checkout-capture`;

    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripe_payment_intent_id,
      {
        amount_to_capture: amountToCapture,
      },
      {
        idempotencyKey,
      }
    );

    const capturedAmount = paymentIntent.amount_received || amountToCapture;

    // Log successful capture
    await logger.info("Payment captured successfully", {
      bookingId: booking.id,
      paymentIntentId: booking.stripe_payment_intent_id,
      amountCaptured: capturedAmount,
      professionalId: booking.professional_id,
      customerId: booking.customer_id,
    });

    return { success: true, capturedAmount };
  } catch (stripeError) {
    // Log payment capture failure with full context
    await logger.error("Payment capture failed during check-out", stripeError as Error, {
      bookingId: booking.id,
      professionalId: booking.professional_id,
      customerId: booking.customer_id,
      paymentIntentId: booking.stripe_payment_intent_id,
      amountAuthorized: booking.amount_authorized,
      timeExtensionAmount: booking.time_extension_amount || 0,
      amountToCapture: booking.amount_authorized + (booking.time_extension_amount || 0),
      serviceName: booking.service_name,
      checkInTime: booking.checked_in_at,
      actualDurationMinutes,
    });
    await logger.flush();

    // Notify admins about payment failure
    const professionalName = booking.professional_profiles?.full_name || "Professional";
    const customerName = booking.customer_profiles?.full_name || "Customer";
    await notifyAllAdmins(notifyAdminPaymentFailure, {
      bookingId: booking.id,
      professionalName,
      customerName,
      amount: booking.amount_authorized + (booking.time_extension_amount || 0),
      errorMessage: stripeError instanceof Error ? stripeError.message : "Payment capture failed",
    });

    return {
      success: false,
      capturedAmount: booking.amount_authorized,
      error: "Failed to capture payment",
    };
  }
}

/**
 * Retry helper with exponential backoff
 * Prevents race condition by retrying database updates after payment capture
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * 2 ** attempt; // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Update booking to completed status with check-out data
 * Uses retry logic to handle transient database failures after payment capture
 */
export async function completeBookingCheckOut(
  supabase: SupabaseClient,
  bookingId: string,
  booking: BookingCheckOutData,
  location: GPSLocation,
  checkedOutAt: Date,
  actualDurationMinutes: number,
  capturedAmount: number,
  completionNotes?: string
): Promise<BookingUpdateResult> {
  // Retry database update with exponential backoff to handle transient failures
  // This prevents the race condition where payment is captured but DB update fails
  let updateError: Error | null = null;
  let updatedBooking: any = null;

  try {
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from("bookings")
          .update({
            status: "completed",
            checked_out_at: checkedOutAt.toISOString(),
            check_out_latitude: location.latitude,
            check_out_longitude: location.longitude,
            actual_duration_minutes: actualDurationMinutes,
            completion_notes: completionNotes || null,
            amount_captured: capturedAmount,
            stripe_payment_status: "succeeded",
            updated_at: checkedOutAt.toISOString(),
          })
          .eq("id", bookingId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      },
      3,
      100
    );

    updatedBooking = result;
  } catch (error) {
    updateError = error as Error;
  }

  if (updateError) {
    // Payment was captured but booking update failed - CRITICAL ERROR
    await logger.error("CRITICAL: Payment captured but booking update failed", updateError, {
      bookingId: booking.id,
      professionalId: booking.professional_id,
      customerId: booking.customer_id,
      paymentIntentId: booking.stripe_payment_intent_id,
      amountCaptured: capturedAmount,
      serviceName: booking.service_name,
      actualDurationMinutes,
      checkInTime: booking.checked_in_at,
      checkOutTime: checkedOutAt.toISOString(),
      severity: "CRITICAL",
      actionRequired:
        "Manual database update required - payment was captured but booking not marked complete",
    });
    await logger.flush();

    // URGENT: Notify all admins about critical payment captured + DB failure
    const professionalName = booking.professional_profiles?.full_name || "Professional";
    const customerName = booking.customer_profiles?.full_name || "Customer";
    await notifyAllAdmins(notifyAdminPaymentCapturedButDBFailed, {
      bookingId: booking.id,
      professionalName,
      customerName,
      amountCaptured: capturedAmount,
      paymentIntentId: booking.stripe_payment_intent_id || "",
    });

    return {
      success: false,
      error: "Payment captured but booking update failed",
    };
  }

  return { success: true, booking: updatedBooking };
}

/**
 * Initialize rebook nudge experiment (feature flag controlled)
 */
export async function initializeRebookNudge(
  supabase: SupabaseClient,
  bookingId: string,
  customerId: string
): Promise<void> {
  if (!isFeatureEnabled("rebook_nudge_system")) {
    return;
  }

  try {
    const variant = getRebookNudgeVariant(customerId);

    // Update booking with variant
    await supabase.from("bookings").update({ rebook_nudge_variant: variant }).eq("id", bookingId);

    // Create experiment record
    await supabase.from("rebook_nudge_experiments").insert({
      booking_id: bookingId,
      customer_id: customerId,
      variant,
    });

    logger.info("Rebook nudge experiment initialized", {
      bookingId,
      customerId,
      variant,
    });
  } catch (rebookError) {
    // Don't fail check-out if rebook nudge setup fails
    logger.error("Failed to initialize rebook nudge experiment", rebookError as Error, {
      bookingId,
      customerId,
    });
  }
}

/**
 * Format booking address for email display
 */
export function formatBookingAddress(address: unknown): string {
  if (!address) {
    return "Not specified";
  }
  if (typeof address === "object" && address !== null && "formatted" in address) {
    return String(address.formatted);
  }
  return JSON.stringify(address);
}

/**
 * Prepare email data for service completion notifications
 */
export async function prepareCheckOutEmailData(
  supabase: SupabaseClient,
  booking: BookingCheckOutData,
  checkedInAt: Date,
  checkedOutAt: Date,
  actualDurationMinutes: number,
  capturedAmount: number
): Promise<any> {
  const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);
  const { data: professionalUser } = await supabase.auth.admin.getUserById(booking.professional_id);

  const scheduledDate = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleDateString()
    : checkedOutAt.toLocaleDateString();
  const scheduledTime = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : checkedInAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const duration = `${actualDurationMinutes} minutes`;
  const address = formatBookingAddress(booking.address);
  const amount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: booking.currency || "COP",
  }).format(capturedAmount / 100);

  return {
    customerEmail: customerUser.user?.email,
    professionalEmail: professionalUser.user?.email,
    emailData: {
      customerName: customerUser.user?.user_metadata?.full_name || "Customer",
      professionalName: professionalUser.user?.user_metadata?.full_name || "Professional",
      serviceName: booking.service_name || "Service",
      scheduledDate,
      scheduledTime,
      duration,
      address,
      bookingId: booking.id,
      amount,
    },
  };
}

/**
 * Send completion emails and push notifications
 */
export async function sendCheckOutNotifications(
  booking: BookingCheckOutData,
  emailData: any,
  customerEmail?: string,
  professionalEmail?: string,
  capturedAmount?: number
): Promise<void> {
  // Send completion emails (fire-and-forget)
  const emailPromises: Promise<any>[] = [];

  if (customerEmail) {
    emailPromises.push(sendServiceCompletedEmail(customerEmail, emailData, false));
  }

  if (professionalEmail) {
    emailPromises.push(sendServiceCompletedEmail(professionalEmail, emailData, true));
  }

  // Send emails in parallel (don't await - let them send in background)
  Promise.all(emailPromises).catch((emailError) => {
    // Intentionally suppress email errors - notification emails are non-critical
    console.warn("Failed to send service completed notification emails:", emailError);
  });

  // Send push notifications
  if (customerEmail) {
    await notifyCustomerServiceCompleted(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName: emailData.professionalName,
    });
  }

  if (professionalEmail) {
    await notifyProfessionalPaymentReceived(booking.professional_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      amount: capturedAmount || booking.amount_authorized,
    });
  }
}
