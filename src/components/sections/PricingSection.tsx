"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

/**
 * PricingSection - simplified concierge pricing with Lia tokens
 * Removes map animation, emphasizes guarantees, and locks copy to the 24px baseline.
 */
export function PricingSection() {
  const t = useTranslations("home.pricing");

  const plan = {
    name: "Concierge Service",
    description: "Expert matching with white-glove service for foreigners in Colombia",
    commission: 20,
    features: [
      "Expert human matching based on your needs",
      "English-speaking coordinators",
      "Thoroughly vetted, background-checked professionals",
      "Priority booking and faster response",
      "Secure payment via Stripe with insurance",
      "Satisfaction guarantee",
      "24/7 dedicated support",
    ],
    ctaText: "Get Started",
    ctaHref: "/professionals",
  };

  const guarantees = [
    {
      title: "Background checks",
      description: "ID verification, references, and in-person interviews for every pro.",
    },
    {
      title: "Insurance built in",
      description: "Protected payments through Stripe with coverage for verified bookings.",
    },
    {
      title: "5-day matching",
      description: "Curated shortlists in under a week for most requests.",
    },
    {
      title: "Concierge support",
      description: "Coordinators handle scheduling, replacements, and ongoing issues 24/7.",
    },
  ];

  return (
    <section className="bg-neutral-50 py-12 md:py-24">
      <Container className="max-w-6xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-6 py-2">
            <span className="font-semibold text-orange-600 text-xs uppercase tracking-[0.35em]">
              {t("badge")}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600 leading-6">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="font-semibold text-orange-600 text-xs uppercase tracking-[0.35em]">
                  {plan.name}
                </p>
                <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-neutral-900 leading-[1.15]">
                  {plan.description}
                </h3>
                <p className="text-base text-neutral-600 leading-6">{t("subtitle")}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-600 text-xs uppercase tracking-[0.25em]">Service Fee</p>
                <p className="font-[family-name:var(--font-geist-mono)] font-semibold text-4xl text-neutral-900 leading-tight">
                  {plan.commission}%
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li className="flex items-start gap-3" key={feature}>
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-green-50">
                    <HugeiconsIcon
                      className="h-4 w-4 text-green-700"
                      icon={CheckmarkCircle01Icon}
                    />
                  </span>
                  <span className="text-base text-neutral-700 leading-6">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href={plan.ctaHref}>{plan.ctaText} →</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto" size="lg" variant="outline">
                <Link href="/pricing">{t("footer.link")}</Link>
              </Button>
            </div>

            <p className="mt-4 text-neutral-600 text-sm leading-6 sm:mt-6">
              <span className="font-semibold text-neutral-900">{t("footer.highlight")}</span>{" "}
              {t("footer.text")}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
            <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl">
              What you get, every time
            </h3>
            <p className="mt-3 text-base text-neutral-600 leading-6">
              We remove risk with hands-on vetting, insurance, and concierge support that stays with
              you after the hire.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {guarantees.map((item) => (
                <div
                  className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4 shadow-sm"
                  key={item.title}
                >
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
                    <span className="h-2 w-2 rounded-full bg-orange-600" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-neutral-600 text-sm leading-6">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
