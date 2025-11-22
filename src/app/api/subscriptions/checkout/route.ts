/**
 * Create Subscription Checkout Session
 * POST /api/subscriptions/checkout
 *
 * Creates a Stripe checkout session for a subscription plan.
 */

import { z } from "zod";
import { badRequest, ok, withAuth, withRateLimit } from "@/lib/api";
import { getPlanBySlug } from "@/lib/subscriptions/plans";
import { createSubscriptionCheckout } from "@/lib/subscriptions/subscription-service";

const checkoutSchema = z.object({
  planSlug: z.string().min(1, "Plan slug is required"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const handler = withAuth(async ({ user }, request: Request) => {
  const body = await request.json();
  const result = checkoutSchema.safeParse(body);

  if (!result.success) {
    return badRequest(result.error.errors[0].message);
  }

  const { planSlug, successUrl, cancelUrl } = result.data;

  // Validate plan exists
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    return badRequest(`Plan not found: ${planSlug}`);
  }

  // Free plans don't need checkout
  if (plan.priceCents === 0) {
    return badRequest("Cannot create checkout for free plan. Use the free subscription endpoint.");
  }

  // Get origin for default URLs
  const origin = request.headers.get("origin") || "http://localhost:3000";

  const session = await createSubscriptionCheckout(
    user.id,
    user.email ?? "",
    planSlug,
    successUrl ?? `${origin}/dashboard/subscription/success`,
    cancelUrl ?? `${origin}/dashboard/subscription/cancel`
  );

  return ok({
    sessionId: session.sessionId,
    url: session.url,
  });
});

// Apply rate limiting: 10 requests per minute
export const POST = withRateLimit(handler, "payment");
