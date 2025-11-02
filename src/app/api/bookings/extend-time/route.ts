import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { sendPushNotification } from "@/lib/notifications";

type ExtendTimeRequest = {
  bookingId: string;
  additionalMinutes: number;
};

/**
 * Professional requests time extension during active service
 * POST /api/bookings/extend-time
 *
 * This endpoint:
 * - Verifies the booking is in "in_progress" status
 * - Calculates additional amount based on hourly rate
 * - Updates the Stripe PaymentIntent to increase the capture amount
 * - Records the time extension in the booking
 *
 * Note: The actual payment capture happens at check-out
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
    const body = (await request.json()) as ExtendTimeRequest;
    const { bookingId, additionalMinutes } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }
    if (typeof additionalMinutes !== "number" || additionalMinutes <= 0) {
      return NextResponse.json(
        { error: "additionalMinutes must be a positive number" },
        { status: 400 }
      );
    }

    // Reasonable limits (max 4 hours extension)
    if (additionalMinutes > 240) {
      return NextResponse.json(
        { error: "Cannot extend more than 240 minutes (4 hours) at a time" },
        { status: 400 }
      );
    }

    // Fetch the booking with professional name for notification
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
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
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this professional owns this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to extend this booking" },
        { status: 403 }
      );
    }

    // Can only extend in_progress bookings
    if (booking.status !== "in_progress") {
      return NextResponse.json(
        { error: `Cannot extend booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Must have a payment intent
    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "No payment intent found for this booking" },
        { status: 400 }
      );
    }

    // Must have hourly rate to calculate extension cost
    if (!booking.service_hourly_rate) {
      return NextResponse.json({ error: "No hourly rate found for this booking" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Failed to update payment amount. Please try again." },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: "Failed to record time extension. Contact support." },
        { status: 500 }
      );
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
      url: `/dashboard/customer/bookings`,
      tag: `time-extension-${booking.id}`,
      requireInteraction: false,
    });

    return NextResponse.json({
      success: true,
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
    });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to extend time" }, { status: 500 });
  }
}
