"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeURL } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types/pricing";

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/pricing/plans");

        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans");
        }

        const data = await response.json();

        if (data.success && data.data) {
          setPlans(data.data);
        } else {
          throw new Error(data.error || "Failed to load pricing plans");
        }
      } catch (err) {
        console.error("Error fetching pricing plans:", err);
        setError(err instanceof Error ? err.message : "Failed to load pricing plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price_monthly === 0) {
      return "Free";
    }

    const price = billingPeriod === "annual" ? plan.price_annual : plan.price_monthly;
    return `$${price}`;
  };

  const getPeriod = () => (billingPeriod === "annual" ? "/year" : "/month");

  const getMonthlyEquivalent = (plan: PricingPlan) => {
    if (billingPeriod === "annual" && plan.price_annual && plan.price_annual > 0) {
      const monthly = plan.price_annual / 12;
      return `$${monthly.toFixed(2)}/mo`;
    }
    return null;
  };

  const getAllFeatures = (plan: PricingPlan) => plan.features.flatMap((category) => category.items);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
          <p className="text-neutral-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error loading pricing plans</p>
          <p className="mb-4 text-neutral-600 text-sm">{error}</p>
          <button
            className="rounded-xl border-2 border-neutral-300 px-6 py-2 font-semibold text-neutral-900 hover:border-neutral-900"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Billing toggle */}
      <div className="flex items-center justify-center">
        <Card className="inline-flex items-center gap-4 border-2 border-neutral-200 bg-white p-2">
          <button
            className={cn(
              "rounded-xl px-6 py-2 font-medium transition-all",
              billingPeriod === "monthly"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            onClick={() => setBillingPeriod("monthly")}
            type="button"
          >
            Monthly
          </button>
          <button
            className={cn(
              "relative rounded-xl px-6 py-2 font-medium transition-all",
              billingPeriod === "annual"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            onClick={() => setBillingPeriod("annual")}
            type="button"
          >
            Annual
            <Badge className="ml-2" size="sm" variant="success">
              Save 20%
            </Badge>
          </button>
        </Card>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => {
          const allFeatures = getAllFeatures(plan);

          return (
            <Card
              className={cn(
                "relative bg-white transition-all",
                plan.highlight_as_popular
                  ? "scale-105 border-4 border-neutral-900 shadow-xl"
                  : "border-2 border-neutral-200 hover:border-neutral-300"
              )}
              key={plan.id}
            >
              {plan.highlight_as_popular && (
                <div className="-top-4 -tranneutral-x-1/2 absolute left-1/2 rounded-full bg-neutral-900 px-4 py-1 font-semibold text-sm text-white">
                  Most Popular
                </div>
              )}

              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 font-bold text-2xl text-neutral-900">{plan.name}</h3>
                  <p className="text-neutral-600">{plan.description}</p>
                  {plan.recommended_for && (
                    <p className="mt-2 text-neutral-600 text-sm italic">
                      Recommended for: {plan.recommended_for}
                    </p>
                  )}
                </div>

                <div className="mb-8 text-center">
                  <div className="type-serif-lg mb-2 text-neutral-900">
                    {getPrice(plan)}
                    {plan.price_monthly !== null && plan.price_monthly > 0 && (
                      <span className="font-normal text-neutral-600 text-xl">{getPeriod()}</span>
                    )}
                  </div>
                  {getMonthlyEquivalent(plan) && (
                    <div className="text-neutral-600 text-sm">
                      billed annually ({getMonthlyEquivalent(plan)})
                    </div>
                  )}
                </div>

                <a
                  className={cn(
                    "mb-8 block w-full rounded-xl py-4 text-center font-semibold transition-all",
                    plan.highlight_as_popular
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "border-2 border-neutral-300 text-neutral-900 hover:border-neutral-900"
                  )}
                  // snyk:ignore javascript/DOMXSS - URLs are sanitized via sanitizeURL() from @/lib/utils/sanitize
                  href={sanitizeURL(plan.cta_url || "/auth/sign-up")}
                >
                  {plan.cta_text}
                </a>

                <div className="space-y-3">
                  {allFeatures
                    .filter((feature) => feature.included)
                    .map((feature, idx) => (
                      <div className="flex items-start gap-3" key={idx}>
                        <HugeiconsIcon
                          className="mt-0.5 flex-shrink-0 text-green-600"
                          icon={Tick02Icon}
                          size={20}
                        />
                        <span className="text-neutral-900">
                          {feature.name}
                          {feature.limit && (
                            <span className="ml-1 text-neutral-600 text-sm">({feature.limit})</span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
