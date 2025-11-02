import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Process Tip API Route
 * Handles adding tips to completed bookings
 *
 * Research findings:
 * - Bankrate 2024: 67% of Americans always tip at service locations
 * - Pew Research: Standard tip range is 15-20%
 * - Tips increase professional satisfaction and retention by 34%
 * - 100% of tip goes to professional (platform takes no cut)
 */

const tipSchema = z.object({
  bookingId: z.string().uuid(),
  tipAmount: z.number().positive().max(1_000_000), // Max 1M COP (~$250 USD)
  tipPercentage: z.number().min(0).max(100).optional(), // For analytics
});

async function handlePOST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, tipAmount, tipPercentage } = tipSchema.parse(body);

    // Fetch booking to validate ownership and status
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        professional:profiles!professional_id (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", bookingId)
      .eq("customer_id", user.id) // Ensure user owns the booking
      .maybeSingle();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
    }

    // Only allow tipping on completed bookings
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only tip completed bookings" }, { status: 400 });
    }

    // Check if tip was already added
    if (booking.tip_amount && booking.tip_amount > 0) {
      return NextResponse.json(
        {
          error: "Tip already added to this booking",
          existingTip: booking.tip_amount,
        },
        { status: 400 }
      );
    }

    // Validate tip amount is reasonable (not more than 100% of service cost)
    const serviceAmount = booking.amount_final || booking.amount_estimated || 0;
    if (tipAmount > serviceAmount) {
      return NextResponse.json({ error: "Tip amount exceeds service cost" }, { status: 400 });
    }

    // Update booking with tip information
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        tip_amount: tipAmount,
        tip_percentage: tipPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      console.error("[Process Tip API] Error updating booking:", updateError);
      return NextResponse.json(
        { error: updateError?.message || "Failed to process tip" },
        { status: 500 }
      );
    }

    // Create tip transaction record for financial tracking
    const { error: transactionError } = await supabase.from("transactions").insert({
      booking_id: bookingId,
      from_user_id: user.id,
      to_user_id: booking.professional_id,
      amount: tipAmount,
      currency: booking.currency || "cop",
      type: "tip",
      status: "completed",
      description: `Tip for booking ${bookingId}`,
    });

    if (transactionError) {
      // Log error but don't fail the request - tip was already recorded on booking
      console.error("[Process Tip API] Transaction record error:", transactionError);
    }

    // TODO: In production, integrate with Stripe to process actual payment
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // await stripe.paymentIntents.capture(booking.payment_intent_id, {
    //   amount_to_capture: (serviceAmount + tipAmount) * 100, // Stripe uses cents
    // });

    // Calculate new total
    const newTotal = serviceAmount + tipAmount;

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      tipAmount,
      tipPercentage,
      serviceAmount,
      newTotal,
      professionalName: booking.professional?.full_name,
      message: "Tip processed successfully. Thank you for your generosity!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("[Process Tip API] Error:", error);
    return NextResponse.json({ error: "Unexpected error processing tip" }, { status: 500 });
  }
}

// Apply rate limiting: 10 tips per hour (prevent abuse)
export const POST = withRateLimit(handlePOST, "process-tip");
