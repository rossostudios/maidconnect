"use client";

/**
 * SimplePricing - Airbnb-Style Single Card Pricing
 *
 * Clean, focused pricing display:
 * - Single centered card
 * - Big 15% number
 * - Short list of what's included
 * - Clear CTA
 *
 * Design: Minimal, no complex layouts, immediate clarity.
 */

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";

const includedFeatures = [
  "Background checks on all professionals",
  "Secure payments with buyer protection",
  "Instant booking, no back-and-forth",
  "Satisfaction guarantee on every job",
  "Bilingual support (English & Spanish)",
  "Professionals receive 100% of their rate",
];

type SimplePricingProps = {
  className?: string;
};

export function SimplePricing({ className }: SimplePricingProps) {
  const t = useTranslations("home.simplePricing");

  return (
    <section className={cn("bg-white py-16 sm:py-20 lg:py-24", className)}>
      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-neutral-600 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-lg sm:p-12">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
            <span className="font-semibold text-orange-600 text-xs uppercase tracking-wider">
              {t("badge")}
            </span>
          </div>

          {/* Big Number */}
          <div className="mb-4">
            <span className="font-[family-name:var(--font-geist-mono)] font-bold text-6xl text-neutral-900 sm:text-7xl">
              15%
            </span>
            <span className="ml-2 text-lg text-neutral-600 sm:text-xl">service fee</span>
          </div>

          {/* Value Prop */}
          <p className="mb-8 text-base text-neutral-600 sm:text-lg">{t("description")}</p>

          {/* Features List */}
          <ul className="mb-8 space-y-3 text-left sm:mb-10">
            {includedFeatures.map((feature) => (
              <li className="flex items-center gap-3" key={feature}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <HugeiconsIcon className="h-4 w-4 text-green-600" icon={CheckmarkCircle01Icon} />
                </span>
                <span className="text-neutral-700 text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/pros">{t("cta")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">{t("detailsLink")}</Link>
            </Button>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-neutral-500 text-sm">{t("footer")}</p>
        </div>
      </Container>
    </section>
  );
}
