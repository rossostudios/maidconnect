/**
 * Pricing Plans Component
 *
 * Displays all pricing plans with monthly/annual toggle
 * Fetches pricing data from database via API
 */

"use client";

import { Check } from "lucide-react";
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
    if (plan.price_monthly === 0) return "Free";

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
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff5d46]" />
          <p className="text-[#6B7280]">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-[#ff5d46]">Error loading pricing plans</p>
          <p className="text-[#6B7280] text-sm">{error}</p>
          <button
            className="mt-4 rounded-[14px] border-2 border-[#ebe5d8] px-6 py-2 font-semibold text-[#211f1a] hover:border-[#211f1a]"
            onClick={() => window.location.reload()}
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
        <div className="inline-flex items-center gap-4 rounded-[16px] border-2 border-[#ebe5d8] bg-white p-2">
          <button
            className={`rounded-[12px] px-6 py-2 font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-[#ff5d46] text-white"
                : "text-[#6B7280] hover:text-[#211f1a]"
            }`}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            className={`relative rounded-[12px] px-6 py-2 font-medium transition-all ${
              billingPeriod === "annual"
                ? "bg-[#ff5d46] text-white"
                : "text-[#6B7280] hover:text-[#211f1a]"
            }`}
            onClick={() => setBillingPeriod("annual")}
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
                  ? "scale-105 border-4 border-[#ff5d46] shadow-xl"
                  : "border-2 border-[#ebe5d8] hover:border-[#ff5d46]"
              }`}
              key={plan.id}
            >
              {/* Most popular badge */}
              {plan.highlight_as_popular && (
                <div className="-top-4 -translate-x-1/2 absolute left-1/2 rounded-full bg-[#ff5d46] px-4 py-1 font-semibold text-sm text-white">
                  Most Popular
                </div>
              )}

              {/* Plan name and description */}
              <div className="mb-6 text-center">
                <h3 className="mb-2 font-bold text-2xl text-[#211f1a]">{plan.name}</h3>
                <p className="text-[#6B7280]">{plan.description}</p>
                {plan.recommended_for && (
                  <p className="mt-2 text-[#6B7280] text-sm italic">
                    Recommended for: {plan.recommended_for}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-8 text-center">
                <div className="mb-2 font-bold text-5xl text-[#211f1a]">
                  {getPrice(plan)}
                  {plan.price_monthly !== null && plan.price_monthly > 0 && (
                    <span className="font-normal text-[#6B7280] text-xl">{getPeriod()}</span>
                  )}
                </div>
                {getMonthlyEquivalent(plan) && (
                  <div className="text-[#6B7280] text-sm">
                    billed annually ({getMonthlyEquivalent(plan)})
                  </div>
                )}
              </div>

              {/* CTA button */}
              <a
                className={`mb-8 block w-full rounded-[14px] py-4 text-center font-semibold transition-all ${
                  plan.highlight_as_popular
                    ? "bg-[#ff5d46] text-white hover:bg-[#e54d36]"
                    : "border-2 border-[#ebe5d8] text-[#211f1a] hover:border-[#211f1a]"
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
                      <Check className="mt-0.5 flex-shrink-0 text-[#10B981]" size={20} />
                      <span className="text-[#211f1a]">
                        {feature.name}
                        {feature.limit && (
                          <span className="ml-1 text-[#6B7280] text-sm">({feature.limit})</span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="py-8 text-center">
        <p className="mb-6 text-[#6B7280]">Trusted by over 10,000+ professionals</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span className="text-[#6B7280] text-sm">Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span className="text-[#6B7280] text-sm">SOC 2 compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="text-[#6B7280] text-sm">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
