/**
 * Pricing Plans Component
 *
 * Displays all pricing plans with monthly/annual toggle
 */

"use client";

import { Check } from "lucide-react";
import { useState } from "react";

// Placeholder data - will be replaced with API call
const SAMPLE_PLANS = [
  {
    id: "1",
    name: "Starter",
    description: "Perfect for individuals getting started",
    price_monthly: 0,
    price_annual: 0,
    features: [
      { name: "Up to 5 bookings per month", included: true },
      { name: "Basic messaging", included: true },
      { name: "Standard support", included: true },
      { name: "Mobile app access", included: true },
    ],
    cta_text: "Get Started Free",
    highlight: false,
  },
  {
    id: "2",
    name: "Professional",
    description: "Best for growing professionals",
    price_monthly: 29.99,
    price_annual: 299.88,
    features: [
      { name: "Unlimited bookings", included: true },
      { name: "Priority messaging", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom branding", included: true },
    ],
    cta_text: "Start Free Trial",
    highlight: true,
  },
  {
    id: "3",
    name: "Business",
    description: "For established service providers",
    price_monthly: 79.99,
    price_annual: 799.88,
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Team management", included: true },
      { name: "White-label branding", included: true },
      { name: "API access", included: true },
      { name: "Dedicated account manager", included: true },
    ],
    cta_text: "Contact Sales",
    highlight: false,
  },
];

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const getPrice = (plan: (typeof SAMPLE_PLANS)[0]) => {
    if (plan.price_monthly === 0) return "Free";

    const price = billingPeriod === "annual" ? plan.price_annual : plan.price_monthly;
    return `$${price}`;
  };

  const getPeriod = () => (billingPeriod === "annual" ? "/year" : "/month");

  const getMonthlyEquivalent = (plan: (typeof SAMPLE_PLANS)[0]) => {
    if (billingPeriod === "annual" && plan.price_annual > 0) {
      const monthly = plan.price_annual / 12;
      return `$${monthly.toFixed(2)}/mo`;
    }
    return null;
  };

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
        {SAMPLE_PLANS.map((plan) => (
          <div
            className={`relative rounded-[28px] bg-white p-8 transition-all ${
              plan.highlight
                ? "scale-105 border-4 border-[#ff5d46] shadow-xl"
                : "border-2 border-[#ebe5d8] hover:border-[#ff5d46]"
            }`}
            key={plan.id}
          >
            {/* Most popular badge */}
            {plan.highlight && (
              <div className="-top-4 -translate-x-1/2 absolute left-1/2 rounded-full bg-[#ff5d46] px-4 py-1 font-semibold text-sm text-white">
                Most Popular
              </div>
            )}

            {/* Plan name and description */}
            <div className="mb-6 text-center">
              <h3 className="mb-2 font-bold text-2xl text-[#211f1a]">{plan.name}</h3>
              <p className="text-[#6B7280]">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-8 text-center">
              <div className="mb-2 font-bold text-5xl text-[#211f1a]">
                {getPrice(plan)}
                {plan.price_monthly > 0 && (
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
                plan.highlight
                  ? "bg-[#ff5d46] text-white hover:bg-[#e54d36]"
                  : "border-2 border-[#ebe5d8] text-[#211f1a] hover:border-[#211f1a]"
              }`}
              href="/auth/sign-up"
            >
              {plan.cta_text}
            </a>

            {/* Features */}
            <div className="space-y-3">
              {plan.features.map((feature, idx) => (
                <div className="flex items-start gap-3" key={idx}>
                  <Check className="mt-0.5 flex-shrink-0 text-[#10B981]" size={20} />
                  <span className="text-[#211f1a]">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
