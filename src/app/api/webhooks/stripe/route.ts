import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, assertStripeSignature } from "@/lib/stripe";

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
    case "payment_intent.succeeded":
    case "payment_intent.canceled":
    case "payment_intent.payment_failed":
    case "charge.refunded":
    case "payout.paid":
    case "payout.failed":
      console.log(`Received event ${event.type}`, event.id);
      break;
    default:
      console.log(`Unhandled Stripe event: ${event.type}`, event.id);
  }

  return NextResponse.json({ received: true });
}
