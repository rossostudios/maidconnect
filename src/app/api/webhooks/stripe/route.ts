import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, assertStripeSignature } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { signature, secret } = assertStripeSignature(request as unknown as import("next/server").NextRequest);
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "completed",
            amount_captured: intent.amount_received ?? intent.amount,
            stripe_payment_status: intent.status,
          })
          .eq("id", bookingId);
      }
      break;
    }
    case "payment_intent.canceled": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "canceled",
            stripe_payment_status: intent.status,
          })
          .eq("id", bookingId);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "payment_failed",
            stripe_payment_status: intent.status,
          })
          .eq("id", bookingId);
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const bookingId = charge.metadata?.booking_id ?? charge.payment_intent ? undefined : undefined;
      if (charge.payment_intent) {
        const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id;
        await supabaseAdmin
          .from("bookings")
          .update({
            stripe_payment_status: charge.status ?? "refunded",
          })
          .eq("stripe_payment_intent_id", intentId);
      } else if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({ stripe_payment_status: "refunded" })
          .eq("id", bookingId);
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`, event.id);
  }

  return NextResponse.json({ received: true });
}
