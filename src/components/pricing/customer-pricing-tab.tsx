"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ConciergeJustification } from "./concierge-justification";
import { FeeExplainer } from "./fee-explainer";
import { PricingCalculator } from "./pricing-calculator";
import { PricingComparisonCards } from "./pricing-comparison-cards";

export function CustomerPricingTab() {
  const t = useTranslations("pricing.customer");

  return (
    <div className="space-y-20">
      {/* How Pricing Works */}
      <Container>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
            {t("howItWorks.title")}
          </h2>
          <p className="text-[16px] text-neutral-700 leading-[24px]">
            {t("howItWorks.description")}
          </p>
        </div>

        {/* Steps */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <div className="text-center" key={step}>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 font-bold text-2xl text-white shadow-md">
                {step}
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
                {t(`howItWorks.steps.step${step}.title`)}
              </h3>
              <p className="text-[14px] text-neutral-700 leading-[20px]">
                {t(`howItWorks.steps.step${step}.description`)}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison Cards */}
        <div className="mb-16">
          <h2 className="mb-baseline-2 text-center font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-neutral-900 leading-[24px]">
            {t("chooseService.title")}
          </h2>
          <PricingComparisonCards highlightConcierge />
        </div>
      </Container>

      {/* Calculator Section */}
      <section className="bg-neutral-50 py-16">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
              {t("calculator.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-[16px] text-neutral-700 leading-[24px]">
              {t("calculator.description")}
            </p>
          </div>
          <PricingCalculator />
        </Container>
      </section>

      {/* Fee Explainer */}
      <FeeExplainer />

      {/* Concierge Justification */}
      <ConciergeJustification />

      {/* Final CTA */}
      <section className="bg-neutral-900 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-white leading-[48px]">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-[16px] text-neutral-300 leading-[24px]">{t("cta.subtitle")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                className="inline-block rounded-full bg-orange-500 px-8 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
                href="/professionals"
              >
                {t("cta.primary")}
              </a>
              <a
                className="inline-block rounded-full border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-neutral-900"
                href="/concierge"
              >
                {t("cta.secondary")}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
