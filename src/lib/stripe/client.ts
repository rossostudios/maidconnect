import Stripe from "stripe";
import type { NextRequest } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2024-06-20";

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set. Add it to your environment to enable Stripe integration.");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION,
});

export function getStripePublishableKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in the environment.");
  }
  return key;
}

export function assertStripeSignature(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Missing Stripe signature header.");
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return { signature, secret: webhookSecret };
}

export type StripeEvent<T extends Stripe.Event.Type = Stripe.Event.Type> = Stripe.Event & {
  type: T;
};
