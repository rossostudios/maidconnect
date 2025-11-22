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
    <section className="bg-white py-24">
      <Container className="max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                className="group rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-200 hover:border-orange-200 hover:shadow-orange-900/5 hover:shadow-xl"
                key={feature.key}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600 transition-colors group-hover:bg-orange-50 group-hover:text-orange-600">
                  <HugeiconsIcon className="h-7 w-7" icon={Icon} />
                </div>
                <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-neutral-900 text-xl">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 rounded-3xl border border-orange-100 bg-orange-50/50 p-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <HugeiconsIcon className="h-8 w-8" icon={Shield01Icon} />
          </div>
          <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
            {t("trustBadge.title")}
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600 leading-relaxed">
            {t("trustBadge.description")}
          </p>
        </div>
      </Container>
    </section>
  );
}
