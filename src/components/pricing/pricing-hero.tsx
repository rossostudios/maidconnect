"use client";

import { AnimatePresence, motion } from "motion/react";
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
    <section className="relative bg-neutral-50 py-12 md:py-24">
      <Container>
        {/* Hero Content */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="mb-6 font-[family-name:var(--font-geist-sans)] font-normal text-5xl text-neutral-900 leading-[1.1] tracking-tight lg:text-[72px] lg:leading-[1]">
            {t("title")}
          </h1>
          <p className="mb-12 text-lg text-neutral-600 leading-relaxed md:text-xl">
            {t("subtitle")}
          </p>

          {/* Tab Switcher - Anthropic Rounded Design */}
          <div className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
            <motion.button
              className={cn(
                "relative rounded-xl px-8 py-3 font-semibold text-base transition-colors duration-200",
                activeTab === "customers"
                  ? "text-white"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("customers")}
              type="button"
            >
              {activeTab === "customers" && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-neutral-900 shadow-md"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("tabs.customers")}</span>
            </motion.button>
            <motion.button
              className={cn(
                "relative rounded-xl px-8 py-3 font-semibold text-base transition-colors duration-200",
                activeTab === "professionals"
                  ? "text-white"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("professionals")}
              type="button"
            >
              {activeTab === "professionals" && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-neutral-900 shadow-md"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("tabs.professionals")}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key={activeTab}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {activeTab === "customers" ? customerContent : professionalContent}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
