/**
 * Get Subscription Status
 * GET /api/subscriptions/status
 *
 * Returns the user's current subscription status.
 */

import { ok, withAuth, withRateLimit } from "@/lib/api";
import { formatPlanPrice } from "@/lib/subscriptions/plans";
import {
  getSubscriptionDiscount,
  getUserSubscription,
} from "@/lib/subscriptions/subscription-service";

const handler = withAuth(async ({ user }, request: Request) => {
  const url = new URL(request.url);
  const planType = url.searchParams.get("planType") as "customer" | "professional" | null;

  const subscription = await getUserSubscription(user.id, planType ?? undefined);
  const discount = await getSubscriptionDiscount(user.id);

  if (!subscription) {
    return ok({
      hasSubscription: false,
      subscription: null,
      discount: 0,
    });
  }

  return ok({
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      plan: subscription.plan
        ? {
            slug: subscription.plan.slug,
            name: subscription.plan.name,
            planType: subscription.plan.planType,
            price: formatPlanPrice(subscription.plan),
            features: subscription.plan.features,
            discountPercentage: subscription.plan.discountPercentage,
            priorityBadge: subscription.plan.priorityBadge,
          }
        : null,
    },
    discount,
  });
});

// Apply rate limiting
export const GET = withRateLimit(handler, "api");
