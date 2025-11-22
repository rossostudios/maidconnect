/**
 * Reactivate Subscription
 * POST /api/subscriptions/reactivate
 *
 * Reactivates a subscription that was scheduled for cancellation.
 */

import { z } from "zod";
import { badRequest, notFound, ok, withAuth, withRateLimit } from "@/lib/api";
import {
  getUserSubscription,
  reactivateSubscription,
} from "@/lib/subscriptions/subscription-service";

const reactivateSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
});

const handler = withAuth(async ({ user }, request: Request) => {
  const body = await request.json();
  const result = reactivateSchema.safeParse(body);

  if (!result.success) {
    return badRequest(result.error.errors[0].message);
  }

  const { subscriptionId } = result.data;

  // Verify user owns this subscription
  const subscription = await getUserSubscription(user.id);
  if (!subscription || subscription.id !== subscriptionId) {
    return notFound("Subscription not found");
  }

  // Can only reactivate if scheduled for cancellation
  if (!subscription.cancelAtPeriodEnd) {
    return badRequest("Subscription is not scheduled for cancellation");
  }

  await reactivateSubscription(subscriptionId);

  return ok({
    success: true,
    message: "Subscription has been reactivated",
    cancelAtPeriodEnd: false,
  });
});

// Apply rate limiting
export const POST = withRateLimit(handler, "api");
