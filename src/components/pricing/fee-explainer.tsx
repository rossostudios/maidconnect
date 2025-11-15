"use client";

import {
  Alert01Icon,
  CheckmarkCircle01Icon,
  Search01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function FeeExplainer() {
  const t = useTranslations("pricing.feeExplainer");

  const features = [
    { icon: CheckmarkCircle01Icon, key: "backgroundChecks" },
    { icon: Shield01Icon, key: "insurance" },
    { icon: StarIcon, key: "paymentProtection" },
    { icon: Alert01Icon, key: "support" },
    { icon: CheckmarkCircle01Icon, key: "verification" },
    { icon: Search01Icon, key: "technology" },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container className="max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[36px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-[18px] text-neutral-700 leading-[24px]">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                className="group border-2 border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50"
                key={feature.key}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-neutral-200 bg-white transition-all group-hover:border-orange-500 group-hover:bg-orange-50">
                  <HugeiconsIcon
                    className="h-6 w-6 text-neutral-700 group-hover:text-orange-600"
                    icon={Icon}
                  />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-[14px] text-neutral-700 leading-[20px]">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 border-2 border-orange-200 bg-orange-50 p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-orange-500">
            <HugeiconsIcon className="h-8 w-8 text-white" icon={Shield01Icon} />
          </div>
          <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
            {t("trustBadge.title")}
          </h3>
          <p className="mx-auto max-w-2xl text-[16px] text-neutral-700 leading-[24px]">
            {t("trustBadge.description")}
          </p>
        </div>
      </Container>
    </section>
  );
}
