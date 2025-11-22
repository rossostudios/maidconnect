/**
 * Create Free Subscription
 * POST /api/subscriptions/free
 *
 * Activates a free subscription plan for the user.
 */

import { z } from "zod";
import { badRequest, ok, withAuth, withRateLimit } from "@/lib/api";
import { getPlanBySlug } from "@/lib/subscriptions/plans";
import {
  createFreeSubscription,
  getUserSubscription,
} from "@/lib/subscriptions/subscription-service";

const freeSubscriptionSchema = z.object({
  planSlug: z.string().min(1, "Plan slug is required"),
});

const handler = withAuth(async ({ user }, request: Request) => {
  const body = await request.json();
  const result = freeSubscriptionSchema.safeParse(body);

  if (!result.success) {
    return badRequest(result.error.errors[0].message);
  }

  const { planSlug } = result.data;

  // Validate plan exists and is free
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    return badRequest(`Plan not found: ${planSlug}`);
  }

  if (plan.priceCents !== 0) {
    return badRequest("This plan requires payment. Use the checkout endpoint.");
  }

  // Check if user already has an active subscription of this type
  const existingSubscription = await getUserSubscription(user.id, plan.planType);
  if (existingSubscription) {
    return badRequest(`You already have an active ${plan.planType} subscription`);
  }

  const subscription = await createFreeSubscription(user.id, planSlug);

  return ok({
    success: true,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      plan: {
        slug: subscription.plan?.slug,
        name: subscription.plan?.name,
        planType: subscription.plan?.planType,
      },
    },
  });
});

// Apply rate limiting
export const POST = withRateLimit(handler, "api");
