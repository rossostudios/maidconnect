"use client";

import { SparklesIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/lib/subscriptions/plans";
import { formatPlanPrice } from "@/lib/subscriptions/plans";
import { cn } from "@/lib/utils";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

type Props = {
  plans: SubscriptionPlan[];
  currentPlanSlug?: string;
  planType: "customer" | "professional";
};

export function SubscriptionPlans({ plans, currentPlanSlug, planType }: Props) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.slug === currentPlanSlug) {
      return;
    }

    setLoadingPlan(plan.slug);

    try {
      if (plan.priceCents === 0) {
        // Free plan - direct activation
        const response = await fetch("/api/subscriptions/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planSlug: plan.slug }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to activate free plan");
        }

        toast.success("Free plan activated!");
        router.refresh();
      } else {
        // Paid plan - redirect to Stripe checkout
        const response = await fetch("/api/subscriptions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planSlug: plan.slug }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout session");
        }

        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div
      animate="visible"
      className="grid gap-6 md:grid-cols-2"
      initial="hidden"
      variants={stagger}
    >
      {plans.map((plan) => {
        const isCurrentPlan = plan.slug === currentPlanSlug;
        const isLoading = loadingPlan === plan.slug;
        const isPaid = plan.priceCents > 0;

        return (
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md",
              plan.popular ? "border-rausch-300" : "border-neutral-200",
              isCurrentPlan && "ring-2 ring-green-500"
            )}
            key={plan.slug}
            variants={fadeIn}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="flex items-center gap-1 rounded-bl-lg bg-rausch-500 px-4 py-1 font-semibold text-white text-xs">
                  <HugeiconsIcon className="h-3 w-3" icon={SparklesIcon} />
                  Most Popular
                </div>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 font-medium text-green-700 text-xs">
                  Current Plan
                </span>
              </div>
            )}

            {/* Plan Name & Price */}
            <div className={cn("mb-6", plan.popular || isCurrentPlan ? "mt-6" : "")}>
              <h3 className="mb-2 font-semibold text-2xl text-neutral-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl text-neutral-900">{formatPlanPrice(plan)}</span>
                {isPaid && (
                  <span className="text-neutral-500 text-sm">
                    /{plan.billingInterval === "month" ? "month" : "year"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-neutral-600 text-sm">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="mb-8 space-y-3">
              {plan.features.map((feature) => (
                <li className="flex items-start gap-3" key={feature}>
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <HugeiconsIcon
                      className="h-3 w-3 text-white"
                      icon={Tick01Icon}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-neutral-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              className={cn(
                "w-full rounded-lg",
                plan.popular && "bg-rausch-500 hover:bg-rausch-600"
              )}
              disabled={isCurrentPlan || isLoading}
              onClick={() => handleSelectPlan(plan)}
              variant={plan.popular ? "default" : "outline"}
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : isCurrentPlan ? (
                "Current Plan"
              ) : isPaid ? (
                "Upgrade Now"
              ) : (
                "Get Started Free"
              )}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
