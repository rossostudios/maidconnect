import type { NextRequest } from "next/server";
import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-10-29.clover";

// Lazy initialization to avoid throwing errors during build time
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment to enable Stripe integration."
      );
    }
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
      timeout: 15_000, // 15 seconds - prevents hanging requests
      maxNetworkRetries: 2, // Retry failed requests up to 2 times (total 3 attempts)
    });
  }
  return stripeInstance;
}

// Export a proxy object that lazily initializes Stripe on first access
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripeInstance();
    const value = instance[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(instance) : value;
  },
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
