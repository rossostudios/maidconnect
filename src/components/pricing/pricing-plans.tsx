/**
 * Pricing Plans Component
 *
 * Displays all pricing plans with monthly/annual toggle
 */

"use client";

import { useState } from "react";
import { Check } from "lucide-react";

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

  const getPrice = (plan: typeof SAMPLE_PLANS[0]) => {
    if (plan.price_monthly === 0) return "Free";

    const price = billingPeriod === "annual" ? plan.price_annual : plan.price_monthly;
    return `$${price}`;
  };

  const getPeriod = () => {
    return billingPeriod === "annual" ? "/year" : "/month";
  };

  const getMonthlyEquivalent = (plan: typeof SAMPLE_PLANS[0]) => {
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
        <div className="inline-flex items-center gap-4 p-2 bg-white border-2 border-[#ebe5d8] rounded-[16px]">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-[12px] font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-[#ff5d46] text-white"
                : "text-[#6B7280] hover:text-[#211f1a]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-6 py-2 rounded-[12px] font-medium transition-all relative ${
              billingPeriod === "annual"
                ? "bg-[#ff5d46] text-white"
                : "text-[#6B7280] hover:text-[#211f1a]"
            }`}
          >
            Annual
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {SAMPLE_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 bg-white rounded-[28px] transition-all ${
              plan.highlight
                ? "border-4 border-[#ff5d46] shadow-xl scale-105"
                : "border-2 border-[#ebe5d8] hover:border-[#ff5d46]"
            }`}
          >
            {/* Most popular badge */}
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#ff5d46] text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
            )}

            {/* Plan name and description */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#211f1a] mb-2">{plan.name}</h3>
              <p className="text-[#6B7280]">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-[#211f1a] mb-2">
                {getPrice(plan)}
                {plan.price_monthly > 0 && (
                  <span className="text-xl font-normal text-[#6B7280]">{getPeriod()}</span>
                )}
              </div>
              {getMonthlyEquivalent(plan) && (
                <div className="text-sm text-[#6B7280]">
                  billed annually ({getMonthlyEquivalent(plan)})
                </div>
              )}
            </div>

            {/* CTA button */}
            <a
              href="/auth/sign-up"
              className={`block w-full py-4 text-center font-semibold rounded-[14px] transition-all mb-8 ${
                plan.highlight
                  ? "bg-[#ff5d46] text-white hover:bg-[#e54d36]"
                  : "border-2 border-[#ebe5d8] text-[#211f1a] hover:border-[#211f1a]"
              }`}
            >
              {plan.cta_text}
            </a>

            {/* Features */}
            <div className="space-y-3">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check size={20} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#211f1a]">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="text-center py-8">
        <p className="text-[#6B7280] mb-6">Trusted by over 10,000+ professionals</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span className="text-sm text-[#6B7280]">Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span className="text-sm text-[#6B7280]">SOC 2 compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="text-sm text-[#6B7280]">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
