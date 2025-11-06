/**
 * Pricing Plans Component
 *
 * Displays all pricing plans with monthly/annual toggle
 * Fetches pricing data from database via API
 */

"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import type { PricingPlan } from "@/types/pricing";

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing plans from API on mount
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

  // Get all features from a plan as a flat list
  const getAllFeatures = (plan: PricingPlan) => plan.features.flatMap((category) => category.items);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="text-gray-500">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-orange-500">Error loading pricing plans</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            className="mt-4 rounded-[14px] border-2 border-stone-200 px-6 py-2 font-semibold text-gray-900 hover:border-gray-900"
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
        <div className="inline-flex items-center gap-4 rounded-[16px] border-2 border-stone-200 bg-white p-2">
          <button
            className={`rounded-[12px] px-6 py-2 font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-orange-500 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setBillingPeriod("monthly")}
            type="button"
          >
            Monthly
          </button>
          <button
            className={`relative rounded-[12px] px-6 py-2 font-medium transition-all ${
              billingPeriod === "annual"
                ? "bg-orange-500 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setBillingPeriod("annual")}
            type="button"
          >
            Annual
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-xs">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => {
          const allFeatures = getAllFeatures(plan);

          return (
            <div
              className={`relative rounded-[28px] bg-white p-8 transition-all ${
                plan.highlight_as_popular
                  ? "scale-105 border-4 border-orange-500 shadow-xl"
                  : "border-2 border-stone-200 hover:border-orange-500"
              }`}
              key={plan.id}
            >
              {/* Most popular badge */}
              {plan.highlight_as_popular && (
                <div className="-top-4 -translate-x-1/2 absolute left-1/2 rounded-full bg-orange-500 px-4 py-1 font-semibold text-sm text-white">
                  Most Popular
                </div>
              )}

              {/* Plan name and description */}
              <div className="mb-6 text-center">
                <h3 className="mb-2 font-bold text-2xl text-gray-900">{plan.name}</h3>
                <p className="text-gray-500">{plan.description}</p>
                {plan.recommended_for && (
                  <p className="mt-2 text-gray-500 text-sm italic">
                    Recommended for: {plan.recommended_for}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-8 text-center">
                <div className="type-serif-lg mb-2 text-gray-900">
                  {getPrice(plan)}
                  {plan.price_monthly !== null && plan.price_monthly > 0 && (
                    <span className="font-normal text-gray-500 text-xl">{getPeriod()}</span>
                  )}
                </div>
                {getMonthlyEquivalent(plan) && (
                  <div className="text-gray-500 text-sm">
                    billed annually ({getMonthlyEquivalent(plan)})
                  </div>
                )}
              </div>

              {/* CTA button */}
              <a
                className={`mb-8 block w-full rounded-[14px] py-4 text-center font-semibold transition-all ${
                  plan.highlight_as_popular
                    ? "bg-orange-500 text-white hover:bg-orange-500"
                    : "border-2 border-stone-200 text-gray-900 hover:border-gray-900"
                }`}
                href={plan.cta_url || "/auth/sign-up"}
              >
                {plan.cta_text}
              </a>

              {/* Features */}
              <div className="space-y-3">
                {allFeatures
                  .filter((feature) => feature.included)
                  .map((feature, idx) => (
                    <div className="flex items-start gap-3" key={idx}>
                      <HugeiconsIcon
                        className="mt-0.5 flex-shrink-0 text-green-500"
                        icon={Tick02Icon}
                        size={20}
                      />
                      <span className="text-gray-900">
                        {feature.name}
                        {feature.limit && (
                          <span className="ml-1 text-gray-500 text-sm">({feature.limit})</span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
