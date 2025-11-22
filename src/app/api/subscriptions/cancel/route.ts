/**
 * Cancel Subscription
 * POST /api/subscriptions/cancel
 *
 * Cancels the user's subscription (at period end).
 */

import { z } from "zod";
import { badRequest, notFound, ok, withAuth, withRateLimit } from "@/lib/api";
import { cancelSubscription, getUserSubscription } from "@/lib/subscriptions/subscription-service";

const cancelSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
  reason: z.string().optional(),
});

const handler = withAuth(async ({ user }, request: Request) => {
  const body = await request.json();
  const result = cancelSchema.safeParse(body);

  if (!result.success) {
    return badRequest(result.error.errors[0].message);
  }

  const { subscriptionId, reason } = result.data;

  // Verify user owns this subscription
  const subscription = await getUserSubscription(user.id);
  if (!subscription || subscription.id !== subscriptionId) {
    return notFound("Subscription not found");
  }

  // Can't cancel if already canceled
  if (subscription.cancelAtPeriodEnd) {
    return badRequest("Subscription is already scheduled for cancellation");
  }

  await cancelSubscription(subscriptionId, reason);

  return ok({
    success: true,
    message: "Subscription will be canceled at the end of the billing period",
    cancelAtPeriodEnd: true,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });
});

// Apply rate limiting
export const POST = withRateLimit(handler, "api");
