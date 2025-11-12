"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * PricingSection Component
 *
 * Displays 3 pricing tiers with monthly/annual toggle.
 * Pro plan is highlighted with stone-900 border.
 */
export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Perfect for occasional household help",
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        "Up to 2 service bookings per month",
        "Background-checked professionals",
        "Email support",
        "Secure payment processing",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      description: "Best for regular household staffing needs",
      monthlyPrice: 39,
      annualPrice: 32,
      features: [
        "Unlimited service bookings",
        "Priority matching",
        "Dedicated account manager",
        "24/7 phone support",
        "Replacement guarantee",
        "Advanced scheduling",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For families with comprehensive staffing needs",
      monthlyPrice: 99,
      annualPrice: 82,
      features: [
        "Everything in Pro",
        "Multi-property support",
        "Custom contracts",
        "White-glove onboarding",
        "Annual household review",
        "Concierge services",
      ],
      highlighted: false,
    },
  ];

  return (
    <section className="w-full bg-stone-100 py-16 md:py-24">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="font-bold text-3xl text-stone-800 md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Choose the plan that fits your household needs.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border-2 border-stone-300 bg-stone-50 p-1">
            <button
              className={cn(
                "rounded-full px-6 py-2 font-medium text-sm transition-all",
                billingCycle === "monthly"
                  ? "bg-stone-700 text-stone-50"
                  : "text-stone-600 hover:text-stone-800"
              )}
              onClick={() => setBillingCycle("monthly")}
              type="button"
            >
              Monthly
            </button>
            <button
              className={cn(
                "rounded-full px-6 py-2 font-medium text-sm transition-all",
                billingCycle === "annual"
                  ? "bg-stone-700 text-stone-50"
                  : "text-stone-600 hover:text-stone-800"
              )}
              onClick={() => setBillingCycle("annual")}
              type="button"
            >
              Annual
              <span className="ml-2 text-xs">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

            return (
              <div
                className={cn(
                  "rounded-2xl border-2 bg-stone-50 p-8 transition-all duration-200 hover:shadow-lg",
                  plan.highlighted
                    ? "border-stone-700 shadow-md"
                    : "border-stone-300 hover:border-stone-400"
                )}
                key={plan.name}
              >
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-stone-700 px-3 py-1 font-semibold text-stone-50 text-xs">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="font-bold text-2xl text-stone-800">{plan.name}</h3>
                <p className="mt-2 text-sm text-stone-600">{plan.description}</p>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="font-bold text-4xl text-stone-800">${price}</span>
                    <span className="ml-2 text-stone-600">
                      /{billingCycle === "monthly" ? "mo" : "mo"}
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="mt-1 text-stone-500 text-xs">
                      Billed annually (${price * 12}/year)
                    </p>
                  )}
                </div>

                <Button
                  asChild
                  className={cn(
                    "mt-6 w-full rounded-lg px-6 py-3 font-semibold transition-all",
                    plan.highlighted
                      ? "bg-stone-700 text-stone-50 hover:bg-stone-600"
                      : "border-2 border-stone-300 bg-transparent text-stone-800 hover:bg-stone-100"
                  )}
                >
                  <Link href="/contact">Get Started</Link>
                </Button>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li className="flex items-start gap-3" key={feature}>
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      <span className="text-sm text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-stone-500">
          All plans include secure payment processing and satisfaction guarantee.
        </p>
      </Container>
    </section>
  );
}
