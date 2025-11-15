"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";

/**
 * PricingSection - Homepage Pricing Module
 *
 * Clean, modern pricing display showing commission-based marketplace model
 * Matches the Aurius pricing aesthetic with Casaora's transparent pricing
 */
export function PricingSection() {
  const t = useTranslations("home.pricing");

  const plans = [
    {
      name: "Marketplace",
      description: "Search, compare, and book professionals directly",
      commission: 15,
      features: [
        "Browse verified professionals",
        "Direct booking system",
        "Background-checked staff",
        "Secure payment via Stripe",
        "Insurance coverage",
        "24/7 email support",
      ],
      highlighted: false,
      ctaText: "Browse Professionals",
      ctaHref: "/professionals",
    },
    {
      name: "Concierge",
      description: "Expert matching with white-glove service",
      commission: 25,
      features: [
        "Everything in Marketplace",
        "Expert human matching",
        "English-speaking coordinators",
        "Priority booking",
        "Dedicated support",
        "Satisfaction guarantee",
      ],
      highlighted: true,
      ctaText: "Request Concierge",
      ctaHref: "/concierge",
    },
  ];

  return (
    <section className="w-full bg-neutral-50 py-16 md:py-20">
      {/* Top horizontal divider */}
      <div className="mx-auto mb-16 h-px max-w-6xl bg-neutral-200" />

      {/* Pricing Box Container */}
      <Container className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-5xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          {/* Section Header */}
          <div className="px-8 py-16 text-center">
            <div className="mb-4 inline-block bg-orange-100 px-4 py-1.5">
              <span className="font-semibold text-orange-600 text-xs uppercase tracking-wider">
                {t("badge")}
              </span>
            </div>
            <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">{t("subtitle")}</p>
          </div>

          {/* Horizontal line */}
          <div className="border-neutral-200 border-t" />

          {/* Top Section: Names and Commission */}
          <div className="grid divide-x-0 divide-neutral-200 md:grid-cols-2 md:divide-x">
            {plans.map((plan) => (
              <div className="relative bg-white" key={`top-${plan.name}`}>
                {/* Plan Name & Description */}
                <div className="p-8">
                  <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 text-sm">{plan.description}</p>
                </div>

                {/* Commission Display */}
                <div className="bg-white p-8 text-center">
                  <div className="mb-2 font-semibold text-neutral-600 text-xs uppercase tracking-wider">
                    {t("platformFee")}
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="font-[family-name:var(--font-geist-sans)] font-bold text-5xl text-neutral-900">
                      {plan.commission}%
                    </span>
                  </div>
                  <div className="mt-2 text-neutral-600 text-xs">{t("addedToServiceCost")}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Horizontal line spanning both cards */}
          <div className="border-neutral-200 border-t" />

          {/* Bottom Section: Buttons and Features */}
          <div className="grid divide-x-0 divide-neutral-200 md:grid-cols-2 md:divide-x">
            {plans.map((plan) => (
              <div className="relative bg-white" key={`bottom-${plan.name}`}>
                {/* CTA Button */}
                <div className="p-8">
                  <Button
                    asChild
                    className={cn(
                      "w-full font-semibold transition-all duration-200",
                      plan.highlighted
                        ? "bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
                        : "border-2 border-neutral-200 bg-white hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link href={plan.ctaHref}>{plan.ctaText}</Link>
                  </Button>
                </div>

                {/* Features List */}
                <div className="p-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li className="flex items-start gap-3" key={feature}>
                        <HugeiconsIcon
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                          icon={CheckmarkCircle01Icon}
                        />
                        <span className="text-neutral-700 text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Horizontal line */}
          <div className="border-neutral-200 border-t" />

          {/* Footer Note - Transparency */}
          <div className="space-y-2 px-8 py-12 text-center">
            <p className="text-neutral-600 text-sm">
              <span className="font-semibold text-neutral-900">{t("footer.highlight")}</span>{" "}
              {t("footer.text")}
            </p>
            <Link
              className="inline-flex items-center font-semibold text-orange-600 text-sm hover:text-orange-700"
              href="/pricing"
            >
              {t("footer.link")} →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
