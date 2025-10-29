import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe } from "@/lib/stripe";
import { calculateCancellationPolicy, calculateRefundAmount } from "@/lib/cancellation-policy";
import { sendBookingDeclinedEmail } from "@/lib/email/send";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type CancelBookingRequest = {
  bookingId: string;
  reason?: string;
};

/**
 * Customer cancels a booking
 * POST /api/bookings/cancel
 *
 * This endpoint:
 * - Verifies the customer owns the booking
 * - Calculates refund based on cancellation policy
 * - Processes refund via Stripe
 * - Updates booking status to "canceled"
 * - Sends notification emails
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
    const body = (await request.json()) as CancelBookingRequest;
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_id,
        professional_id,
        status,
        scheduled_start,
        amount_authorized,
        stripe_payment_intent_id,
        currency,
        service_name
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this customer owns this booking
    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Check if booking can be canceled
    const validStatuses = ["pending_payment", "authorized", "confirmed"];
    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Calculate cancellation policy
    if (!booking.scheduled_start) {
      return NextResponse.json(
        { error: "Cannot calculate cancellation policy without scheduled start time" },
        { status: 400 }
      );
    }

    const policy = calculateCancellationPolicy(booking.scheduled_start, booking.status);

    if (!policy.canCancel) {
      return NextResponse.json(
        { error: policy.reason, policy },
        { status: 400 }
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
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripe_payment_intent_id
        );

        // If payment was authorized but not captured, cancel it
        if (paymentIntent.status === "requires_capture") {
          await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
          stripeStatus = "canceled";

          // If there's a refund amount, we need to refund after canceling won't work
          // In this case, since it was never captured, full "refund" is automatic
        } else if (paymentIntent.status === "succeeded" && refundAmount > 0) {
          // If payment was already captured, create a refund
          await stripe.refunds.create({
            payment_intent: booking.stripe_payment_intent_id,
            amount: refundAmount,
          });
          stripeStatus = "refunded";
        }
      } catch (stripeError) {
        console.error("Stripe cancellation/refund failed:", stripeError);
        return NextResponse.json(
          { error: "Failed to process refund. Please contact support." },
          { status: 500 }
        );
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

    if (updateError) {
      console.error("Failed to update booking after cancellation:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel booking. Please contact support." },
        { status: 500 }
      );
    }

    // Send notification emails
    const { data: professionalUser } = await supabase.auth.admin.getUserById(
      booking.professional_id
    );

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

      await sendBookingDeclinedEmail(
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
      );
    }

    return NextResponse.json({
      success: true,
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
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Unable to cancel booking" }, { status: 500 });
  }
}
