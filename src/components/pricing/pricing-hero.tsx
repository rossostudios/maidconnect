"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/core";

type AudienceTab = "customers" | "professionals";

type Props = {
  customerContent: ReactNode;
  professionalContent: ReactNode;
  defaultTab?: AudienceTab;
};

export function PricingHero({
  customerContent,
  professionalContent,
  defaultTab = "customers",
}: Props) {
  const t = useTranslations("pricing.hero");
  const [activeTab, setActiveTab] = useState<AudienceTab>(defaultTab);

  return (
    <section className="relative bg-neutral-50 pt-24 pb-16 sm:pt-32 sm:pb-20">
      <Container>
        {/* Hero Content */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[48px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h1>
          <p className="mb-baseline-2 text-[18px] text-neutral-700 leading-[24px]">
            {t("subtitle")}
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-200 bg-white p-2 shadow-sm">
            <button
              className={cn(
                "rounded-full px-8 py-3 font-semibold text-base transition-all duration-200",
                activeTab === "customers"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("customers")}
              type="button"
            >
              {t("tabs.customers")}
            </button>
            <button
              className={cn(
                "rounded-full px-8 py-3 font-semibold text-base transition-all duration-200",
                activeTab === "professionals"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("professionals")}
              type="button"
            >
              {t("tabs.professionals")}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === "customers" ? customerContent : professionalContent}
        </div>
      </Container>
    </section>
  );
}
