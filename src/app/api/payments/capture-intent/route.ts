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

    if (retrievedIntent.metadata?.supabase_profile_id !== user.id) {
      return NextResponse.json({ error: "Payment intent does not belong to this user" }, { status: 403 });
    }

    const intent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture,
    });

    await supabase
      .from("bookings")
      .update({
        status: "completed",
        amount_captured: intent.amount_received ?? intent.amount,
        stripe_payment_status: intent.status,
      })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .eq("customer_id", user.id);

    return NextResponse.json({ paymentIntent: intent });
  } catch (error) {
    console.error("Stripe capture-intent error", error);
    return NextResponse.json({ error: "Unable to capture payment intent" }, { status: 500 });
  }
}
