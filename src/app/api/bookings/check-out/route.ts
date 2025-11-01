import { NextResponse } from "next/server";
import { sendServiceCompletedEmail } from "@/lib/email/send";
import { verifyBookingLocation } from "@/lib/gps-verification";
import { logger } from "@/lib/logger";
import {
  notifyCustomerServiceCompleted,
  notifyProfessionalPaymentReceived,
} from "@/lib/notifications";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type CheckOutRequest = {
  bookingId: string;
  latitude: number;
  longitude: number;
  completionNotes?: string;
};

/**
 * Professional checks out after completing a service
 * POST /api/bookings/check-out
 *
 * This endpoint:
 * - Verifies the booking is in "in_progress" status
 * - Records GPS coordinates at check-out
 * - Calculates actual service duration
 * - Captures payment via Stripe
 * - Updates booking to "completed" status
 * - Sends completion emails to both parties
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CheckOutRequest;
    const { bookingId, latitude, longitude, completionNotes } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Validate GPS coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90" }, { status: 400 });
    }
    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    // Fetch the booking with all necessary data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
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
        stripe_payment_intent_id
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this professional owns this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to check out of this booking" },
        { status: 403 }
      );
    }

    // Can only check out of in_progress bookings
    if (booking.status !== "in_progress") {
      return NextResponse.json(
        { error: `Cannot check out of booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Must have checked in first
    if (!booking.checked_in_at) {
      return NextResponse.json(
        { error: "Cannot check out without checking in first" },
        { status: 400 }
      );
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

      // Uncomment for hard enforcement (block check-out if too far):
      // return NextResponse.json(
      //   {
      //     error: "You must be at the service location to check out",
      //     distance: gpsVerification.distance,
      //     maxDistance: gpsVerification.maxDistance,
      //   },
      //   { status: 400 }
      // );
    }

    // Calculate actual duration in minutes
    const checkedInAt = new Date(booking.checked_in_at);
    const checkedOutAt = new Date();
    const actualDurationMinutes = Math.round(
      (checkedOutAt.getTime() - checkedInAt.getTime()) / 1000 / 60
    );

    // Capture payment via Stripe
    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "No payment intent found for this booking" },
        { status: 400 }
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

      // TODO: Add admin notification system for payment failures requiring manual review
      // This should trigger an alert to platform administrators with booking context

      return NextResponse.json(
        { error: "Failed to capture payment. Please try again or contact support." },
        { status: 500 }
      );
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

      // TODO: Add urgent admin notification for this critical scenario
      // Payment was taken but booking status not updated - requires immediate manual intervention

      return NextResponse.json(
        { error: "Payment captured but booking update failed. Contact support." },
        { status: 500 }
      );
    }

    // Fetch customer and professional details for emails
    const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);
    const { data: professionalUser } = await supabase.auth.admin.getUserById(
      booking.professional_id
    );

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
    const address = booking.address
      ? typeof booking.address === "object" && "formatted" in booking.address
        ? String(booking.address.formatted)
        : JSON.stringify(booking.address)
      : "Not specified";
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
    Promise.all(emailPromises).catch((_error) => {});

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

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        checked_out_at: updatedBooking.checked_out_at,
        actual_duration_minutes: updatedBooking.actual_duration_minutes,
        amount_captured: updatedBooking.amount_captured,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to check out" }, { status: 500 });
  }
}
