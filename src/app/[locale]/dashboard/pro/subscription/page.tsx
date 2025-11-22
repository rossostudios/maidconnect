/**
 * Professional Subscription Management Page
 */

import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { SubscriptionManager, SubscriptionPlans } from "@/components/subscriptions";
import { requireUser } from "@/lib/auth";
import { PROFESSIONAL_PLANS } from "@/lib/subscriptions/plans";
import {
  getSubscriptionDiscount,
  getUserSubscription,
} from "@/lib/subscriptions/subscription-service";
import { cn } from "@/lib/utils";

export default async function ProSubscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.subscription" });

  const user = await requireUser({ allowedRoles: ["professional", "admin"] });

  // Get user's current subscription
  const subscription = await getUserSubscription(user.id, "professional");
  const discount = await getSubscriptionDiscount(user.id);

  // Transform for component
  const subscriptionData = subscription
    ? {
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
              price: `$${subscription.plan.priceCents / 100}/month`,
              features: subscription.plan.features,
              discountPercentage: subscription.plan.discountPercentage,
              priorityBadge: subscription.plan.priorityBadge,
            }
          : null,
      }
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      {/* Current Subscription */}
      <section>
        <h2
          className={cn(
            "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {t("currentPlan")}
        </h2>
        <SubscriptionManager discount={discount} subscription={subscriptionData} />
      </section>

      {/* Available Plans */}
      <section>
        <h2
          className={cn(
            "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {t("availablePlans")}
        </h2>
        <SubscriptionPlans
          currentPlanSlug={subscription?.plan?.slug}
          plans={PROFESSIONAL_PLANS}
          planType="professional"
        />
      </section>
    </div>
  );
}
