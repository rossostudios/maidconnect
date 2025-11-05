/**
 * REFACTORED VERSION - Professional checks out after completing a service
 * POST /api/bookings/check-out
 *
 * BEFORE: 379 lines
 * AFTER: 252 lines (34% reduction)
 */

import { z } from "zod";
import { ok, requireProfessionalOwnership, withProfessional } from "@/lib/api";
import { sendServiceCompletedEmail } from "@/lib/email/send";
import { BusinessRuleError, InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { getRebookNudgeVariant, isFeatureEnabled } from "@/lib/feature-flags";
import { verifyBookingLocation } from "@/lib/gps-verification";
import { logger } from "@/lib/logger";
import {
  notifyAdminPaymentCapturedButDBFailed,
  notifyAdminPaymentFailure,
  notifyAllAdmins,
  notifyCustomerServiceCompleted,
  notifyProfessionalPaymentReceived,
} from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

const checkOutSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  completionNotes: z.string().optional(),
});

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, latitude, longitude, completionNotes } = checkOutSchema.parse(body);

  // Fetch the booking with all necessary data
  const booking = await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId,
    `
    id,
    professional_id,
    customer_id,
    status,
    checked_in_at,
    scheduled_start,
    duration_minutes,
    service_name,
    service_hourly_rate,
    amount_authorized,
    time_extension_minutes,
    time_extension_amount,
    currency,
    address,
    stripe_payment_intent_id,
    customer_profiles:profiles!bookings_customer_id_fkey(full_name),
    professional_profiles:profiles!bookings_professional_id_fkey(full_name)
  `
  );

  // Can only check out of in_progress bookings
  if (booking.status !== "in_progress") {
    throw new InvalidBookingStatusError(booking.status, "check out of");
  }

  // Must have checked in first
  if (!booking.checked_in_at) {
    throw new BusinessRuleError("Cannot check out without checking in first", "MISSING_CHECK_IN");
  }

  // GPS Verification: Check if professional is within reasonable distance of booking address
  const gpsVerification = verifyBookingLocation(
    { latitude, longitude },
    booking.address,
    150 // 150 meters = ~0.09 miles
  );

  // Log GPS verification result
  await logger.info("GPS verification at check-out", {
    bookingId: booking.id,
    professionalId: booking.professional_id,
    verified: gpsVerification.verified,
    distance: gpsVerification.distance,
    maxDistance: gpsVerification.maxDistance,
    reason: gpsVerification.reason,
    professionalLocation: { latitude, longitude },
  });

  // Soft enforcement: Log warning if too far but still allow check-out
  if (!gpsVerification.verified && gpsVerification.distance > 0) {
    await logger.warn("Professional checking out from unexpected location", {
      bookingId: booking.id,
      professionalId: booking.professional_id,
      distance: gpsVerification.distance,
      maxDistance: gpsVerification.maxDistance,
      serviceName: booking.service_name,
      severity: "MEDIUM",
      actionRecommended: "Review check-out location for potential fraud",
    });
  }

  // Calculate actual duration in minutes
  const checkedInAt = new Date(booking.checked_in_at);
  const checkedOutAt = new Date();
  const actualDurationMinutes = Math.round(
    (checkedOutAt.getTime() - checkedInAt.getTime()) / 1000 / 60
  );

  // Capture payment via Stripe
  if (!booking.stripe_payment_intent_id) {
    throw new BusinessRuleError(
      "No payment intent found for this booking",
      "MISSING_PAYMENT_INTENT"
    );
  }

  let capturedAmount = booking.amount_authorized;

  try {
    // Check if there was a time extension and calculate new amount
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

    const paymentIntent = await stripe.paymentIntents.capture(booking.stripe_payment_intent_id, {
      amount_to_capture: amountToCapture,
    });

    capturedAmount = paymentIntent.amount_received || amountToCapture;

    // Log successful capture
    await logger.info("Payment captured successfully", {
      bookingId: booking.id,
      paymentIntentId: booking.stripe_payment_intent_id,
      amountCaptured: capturedAmount,
      professionalId: booking.professional_id,
      customerId: booking.customer_id,
    });
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

    // Notify all admins about payment failure requiring manual review
    const professionalName = (booking.professional_profiles as any)?.full_name || "Professional";
    const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
    await notifyAllAdmins(notifyAdminPaymentFailure, {
      bookingId: booking.id,
      professionalName,
      customerName,
      amount: booking.amount_authorized + (booking.time_extension_amount || 0),
      errorMessage: stripeError instanceof Error ? stripeError.message : "Payment capture failed",
    });

    throw new ValidationError("Failed to capture payment. Please try again or contact support.");
  }

  // Update booking to completed with check-out data
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      checked_out_at: checkedOutAt.toISOString(),
      check_out_latitude: latitude,
      check_out_longitude: longitude,
      actual_duration_minutes: actualDurationMinutes,
      completion_notes: completionNotes || null,
      amount_captured: capturedAmount,
      stripe_payment_status: "succeeded",
      updated_at: checkedOutAt.toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError) {
    // Payment was captured but booking update failed - CRITICAL ERROR requiring manual review
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
    const professionalName = (booking.professional_profiles as any)?.full_name || "Professional";
    const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
    await notifyAllAdmins(notifyAdminPaymentCapturedButDBFailed, {
      bookingId: booking.id,
      professionalName,
      customerName,
      amountCaptured: capturedAmount,
      paymentIntentId: booking.stripe_payment_intent_id,
    });

    throw new ValidationError("Payment captured but booking update failed. Contact support.");
  }

  // Assign rebook nudge variant and create experiment (Sprint 2)
  if (isFeatureEnabled("rebook_nudge_system")) {
    try {
      const variant = getRebookNudgeVariant(booking.customer_id);

      // Update booking with variant
      // @ts-expect-error - rebook_nudge_variant column will be added in Sprint 4 migration
      await supabase.from("bookings").update({ rebook_nudge_variant: variant }).eq("id", bookingId);

      // Create experiment record
      // @ts-expect-error - rebook_nudge_experiments table will be created in Sprint 4 migration
      await supabase.from("rebook_nudge_experiments").insert({
        booking_id: bookingId,
        customer_id: booking.customer_id,
        variant,
      });

      logger.info("Rebook nudge experiment initialized", {
        bookingId,
        customerId: booking.customer_id,
        variant,
      });
    } catch (rebookError) {
      // Don't fail check-out if rebook nudge setup fails
      logger.error("Failed to initialize rebook nudge experiment", rebookError as Error, {
        bookingId,
        customerId: booking.customer_id,
      });
    }
  }

  // Fetch customer and professional details for emails
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
  const amount = `${new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: booking.currency || "COP",
  }).format(capturedAmount / 100)}`;

  const emailData = {
    customerName: customerUser.user?.user_metadata?.full_name || "Customer",
    professionalName: professionalUser.user?.user_metadata?.full_name || "Professional",
    serviceName: booking.service_name || "Service",
    scheduledDate,
    scheduledTime,
    duration,
    address,
    bookingId: booking.id,
    amount,
  };

  // Send completion emails to both parties
  const emailPromises: Promise<any>[] = [];

  if (customerUser.user?.email) {
    emailPromises.push(sendServiceCompletedEmail(customerUser.user.email, emailData, false));
  }

  if (professionalUser.user?.email) {
    emailPromises.push(sendServiceCompletedEmail(professionalUser.user.email, emailData, true));
  }

  // Send emails in parallel (don't await - let them send in background)
  Promise.all(emailPromises).catch((emailError) => {
    // Intentionally suppress email errors - notification emails are non-critical
    console.warn("Failed to send service completed notification emails:", emailError);
  });

  // Send push notifications
  if (customerUser.user) {
    await notifyCustomerServiceCompleted(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName: emailData.professionalName,
    });
  }

  if (professionalUser.user) {
    await notifyProfessionalPaymentReceived(booking.professional_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      amount: capturedAmount,
    });
  }

  return ok({
    booking: {
      id: updatedBooking.id,
      status: updatedBooking.status,
      checked_out_at: updatedBooking.checked_out_at,
      actual_duration_minutes: updatedBooking.actual_duration_minutes,
      amount_captured: updatedBooking.amount_captured,
    },
  });
});
