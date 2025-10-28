import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      paymentIntentId,
      amountToCapture,
    }: {
      paymentIntentId: string;
      amountToCapture?: number;
    } = body ?? {};

    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentId is required" }, { status: 400 });
    }

    const retrievedIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const {
      data: booking,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select("id, customer_id, professional_id, status, amount_authorized")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found for payment intent" }, { status: 404 });
    }

    const isCustomer = booking.customer_id === user.id;
    const isProfessional = booking.professional_id === user.id;

    if (!isCustomer && !isProfessional) {
      return NextResponse.json({ error: "You are not authorized to capture this payment" }, { status: 403 });
    }

    if (retrievedIntent.metadata?.booking_id !== booking.id) {
      return NextResponse.json({ error: "Payment intent does not belong to this booking" }, { status: 400 });
    }

    if (retrievedIntent.status !== "requires_capture") {
      return NextResponse.json({ error: "This payment cannot be captured in its current state" }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture,
    });

    await supabase
      .from("bookings")
      .update({
        status: "completed",
        amount_captured: intent.amount_received ?? intent.amount ?? booking.amount_authorized,
        stripe_payment_status: intent.status,
      })
      .eq("id", booking.id);

    return NextResponse.json({ paymentIntent: intent });
  } catch (error) {
    console.error("Stripe capture-intent error", error);
    return NextResponse.json({ error: "Unable to capture payment intent" }, { status: 500 });
  }
}
