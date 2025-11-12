"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * PricingSection - Swiss Design System
 *
 * Clean pricing table following Swiss principles:
 * - Minimal card design (no heavy shadows)
 * - Satoshi for headings and prices
 * - Precise 8px grid spacing
 * - Orange accent for featured plan
 * - Clear visual hierarchy
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
    <section className="w-full bg-neutral-50 py-24 md:py-32">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2
            className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
          >
            Simple, Transparent Pricing
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-orange-500" />
          <p className="mt-6 text-lg text-neutral-600">
            Choose the plan that fits your household needs.
          </p>
        </div>

        {/* Billing Toggle - Swiss Minimal */}
        <div className="mb-16 flex justify-center">
          <div className="inline-flex rounded-sm border border-neutral-300 bg-white p-1">
            <button
              className={cn(
                "rounded-sm px-6 py-2.5 font-medium text-sm transition-all",
                billingCycle === "monthly"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
              onClick={() => setBillingCycle("monthly")}
              type="button"
            >
              Monthly
            </button>
            <button
              className={cn(
                "rounded-sm px-6 py-2.5 font-medium text-sm transition-all",
                billingCycle === "annual"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
              onClick={() => setBillingCycle("annual")}
              type="button"
            >
              Annual
              <span className="ml-2 text-orange-500 text-xs">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

            return (
              <div
                className={cn(
                  "relative overflow-hidden rounded-sm bg-white p-8 transition-all duration-200",
                  plan.highlighted
                    ? "border-2 border-orange-500 shadow-lg"
                    : "border border-neutral-200 hover:border-neutral-300"
                )}
                key={plan.name}
              >
                {/* Popular Badge - Swiss Minimal */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-orange-500 px-4 py-1">
                    <span className="font-medium text-white text-xs uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <div className="mb-2">
                  <h3
                    className="font-bold text-2xl text-neutral-900"
                    style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                  >
                    {plan.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-neutral-600 text-sm">{plan.description}</p>

                {/* Price - Large and Bold */}
                <div className="my-8">
                  <div className="flex items-baseline">
                    <span
                      className="font-bold text-5xl text-neutral-900 tracking-tight"
                      style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                    >
                      ${price}
                    </span>
                    <span className="ml-2 text-neutral-600">/mo</span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="mt-2 text-neutral-500 text-xs">
                      Billed annually (${price * 12}/year)
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className="mb-8 w-full rounded-sm"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/contact">Get Started</Link>
                </Button>

                {/* Features List - Clean */}
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li className="flex items-start gap-3" key={feature}>
                      {/* Checkmark - Minimal */}
                      <div className="mt-0.5 h-5 w-5 flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-neutral-900"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-neutral-700 text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-center text-neutral-500 text-sm">
          All plans include secure payment processing and satisfaction guarantee.
        </p>
      </Container>
    </section>
  );
}
