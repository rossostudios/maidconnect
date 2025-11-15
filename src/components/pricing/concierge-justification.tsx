"use client";

import {
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Message01Icon,
  Search01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export function ConciergeJustification() {
  const t = useTranslations("pricing.concierge");

  const benefits = [
    { icon: CheckmarkCircle01Icon, key: "humanMatching" },
    { icon: Search01Icon, key: "englishSupport" },
    { icon: ArrowUp01Icon, key: "priorityBooking" },
    { icon: Shield01Icon, key: "qualityGuarantee" },
    { icon: Message01Icon, key: "dedicatedCoordinator" },
    { icon: StarIcon, key: "topProfessionals" },
  ];

  return (
    <section className="bg-orange-50 py-16 sm:py-20">
      <Container className="max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center bg-orange-500">
            <HugeiconsIcon className="h-10 w-10 text-white" icon={ArrowUp01Icon} />
          </div>
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[36px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-[18px] text-neutral-700 leading-[24px]">
            {t("subtitle")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                className="border-2 border-orange-200 bg-white transition-all duration-200 hover:border-orange-500 hover:shadow-lg"
                key={benefit.key}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center bg-orange-100">
                    <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Icon} />
                  </div>
                  <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                    {t(`benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="text-[14px] text-neutral-700 leading-[20px]">
                    {t(`benefits.${benefit.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Perfect For Section */}
        <Card className="border-4 border-orange-500 bg-white shadow-xl">
          <CardContent className="p-8 md:p-12">
            <h3 className="mb-6 text-center font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-neutral-900 leading-[24px]">
              {t("perfectFor.title")}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(t.raw("perfectFor.audiences") as string[]).map((audience, idx) => (
                <div className="flex items-start gap-3" key={idx}>
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center bg-orange-500">
                    <span className="font-bold text-sm text-white">✓</span>
                  </div>
                  <span className="font-medium text-[16px] text-neutral-900 leading-[24px]">
                    {audience}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <a
                className="inline-block bg-orange-500 px-10 py-4 font-semibold text-lg text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
                href="/concierge"
              >
                {t("cta")}
              </a>
              <p className="mt-4 text-neutral-600 text-sm">{t("ctaSubtext")}</p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
