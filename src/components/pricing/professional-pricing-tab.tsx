"use client";

import {
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EarningsCalculator } from "./earnings-calculator";

export function ProfessionalPricingTab() {
  const t = useTranslations("pricing.professional");

  const howItWorksSteps = [
    { icon: StarIcon, key: "setRate" },
    { icon: CheckmarkCircle01Icon, key: "customerPays" },
    { icon: ArrowUp01Icon, key: "youReceive" },
  ];

  const benefits = [
    { icon: Shield01Icon, key: "noHiddenFees" },
    { icon: Clock01Icon, key: "weeklyPayouts" },
    { icon: StarIcon, key: "instantBooking" },
    { icon: CheckmarkCircle01Icon, key: "earnMore" },
  ];

  return (
    <div className="space-y-20">
      {/* How It Works */}
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
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div className="text-center" key={step.key}>
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-500 bg-orange-100">
                  <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={Icon} />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
                  {t(`howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="text-[14px] text-neutral-700 leading-[20px]">
                  {t(`howItWorks.steps.${step.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Key Point Card */}
        <Card className="mb-16 border-4 border-orange-500 bg-orange-50 shadow-xl">
          <CardContent className="p-8 text-center">
            <HugeiconsIcon className="mx-auto mb-4 h-16 w-16 text-orange-600" icon={StarIcon} />
            <h3 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-[24px] text-neutral-900 leading-[24px]">
              {t("keyPoint.title")}
            </h3>
            <p className="mx-auto max-w-2xl text-[18px] text-neutral-700 leading-[24px]">
              {t("keyPoint.description")}
            </p>
          </CardContent>
        </Card>
      </Container>

      {/* Earnings Calculator */}
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
          <EarningsCalculator />
        </Container>
      </section>

      {/* Benefits */}
      <Container>
        <div className="mb-12 text-center">
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
            {t("benefits.title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                className="border-2 border-neutral-200 bg-white transition-all duration-200 hover:border-orange-500 hover:shadow-lg"
                key={benefit.key}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <HugeiconsIcon className="h-8 w-8 text-orange-600" icon={Icon} />
                  </div>
                  <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                    {t(`benefits.items.${benefit.key}.title`)}
                  </h3>
                  <p className="text-[14px] text-neutral-700 leading-[20px]">
                    {t(`benefits.items.${benefit.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>

      {/* What Platform Fee Covers */}
      <section className="bg-orange-50 py-16">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
              {t("feeCovers.title")}
            </h2>
            <p className="text-[16px] text-neutral-700 leading-[24px]">
              {t("feeCovers.description")}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(t.raw("feeCovers.items") as Array<{ title: string; description: string }>).map(
              (item, idx) => (
                <Card className="border-2 border-orange-200 bg-white" key={idx}>
                  <CardContent className="p-6">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                      <span className="font-bold text-white">✓</span>
                    </div>
                    <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[16px] text-neutral-900 leading-[24px]">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-neutral-700 leading-[20px]">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </Container>
      </section>

      {/* Payout Info */}
      <Container>
        <Card className="border-4 border-orange-500 bg-neutral-900 shadow-2xl">
          <CardContent className="p-12">
            <div className="mb-8 text-center">
              <HugeiconsIcon
                className="mx-auto mb-4 h-16 w-16 text-orange-500"
                icon={Clock01Icon}
              />
              <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-white leading-[24px]">
                {t("payouts.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-[16px] text-neutral-300 leading-[24px]">
                {t("payouts.description")}
              </p>
            </div>

            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-3">
              {(t.raw("payouts.features") as string[]).map((feature, idx) => (
                <div
                  className="rounded-lg border-2 border-neutral-700 bg-neutral-800 p-4 text-center"
                  key={idx}
                >
                  <p className="text-[14px] text-neutral-300 leading-[20px]">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Container>

      {/* Final CTA */}
      <section className="bg-orange-500 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[36px] text-white leading-[48px]">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-[18px] text-white/90 leading-[24px]">{t("cta.subtitle")}</p>
            <a
              className="inline-block rounded-full bg-white px-10 py-4 font-bold text-lg text-orange-600 shadow-lg transition-all duration-200 hover:bg-neutral-100 hover:shadow-xl"
              href="/professionals/onboarding"
            >
              {t("cta.button")}
            </a>
            <p className="mt-4 text-sm text-white/80">{t("cta.subtext")}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
