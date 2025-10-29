import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe } from "@/lib/stripe";
import { sendBookingDeclinedEmail } from "@/lib/email/send";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type DeclineBookingRequest = {
  bookingId: string;
  reason?: string;
};

/**
 * Professional declines a booking request
 * POST /api/bookings/decline
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
    const body = (await request.json()) as DeclineBookingRequest;
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Fetch the booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        professional_id,
        customer_id,
        status,
        stripe_payment_intent_id,
        scheduled_start,
        duration_minutes,
        service_name,
        address
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this professional owns this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json({ error: "You are not authorized to decline this booking" }, { status: 403 });
    }

    // Can only decline authorized or pending_payment bookings
    if (!["authorized", "pending_payment"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot decline booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Cancel the payment intent if it exists
    if (booking.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
      } catch (stripeError) {
        console.error("Failed to cancel payment intent:", stripeError);
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
      console.error("Failed to update booking status:", updateError);
      return NextResponse.json({ error: "Failed to decline booking" }, { status: 500 });
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
        ? new Date(booking.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "TBD";
      const duration = booking.duration_minutes
        ? `${booking.duration_minutes} minutes`
        : "TBD";
      const address = booking.address
        ? typeof booking.address === 'object' && 'formatted' in booking.address
          ? String(booking.address.formatted)
          : JSON.stringify(booking.address)
        : "Not specified";

      // Send decline email to customer
      await sendBookingDeclinedEmail(
        customerUser.user.email,
        {
          customerName: customerUser.user.user_metadata?.full_name || 'there',
          professionalName: professionalProfile?.full_name || 'The professional',
          serviceName: booking.service_name || 'Service',
          scheduledDate,
          scheduledTime,
          duration,
          address,
          bookingId: booking.id,
        },
        reason
      );
    }

    return NextResponse.json({
      success: true,
      booking: { id: booking.id, status: "declined" }
    });
  } catch (error) {
    console.error("Decline booking error:", error);
    return NextResponse.json({ error: "Unable to decline booking" }, { status: 500 });
  }
}
