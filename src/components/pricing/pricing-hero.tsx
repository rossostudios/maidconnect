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
    <section className="relative bg-neutral-50 pt-24 pb-16 sm:pt-32 sm:pb-20">
      <Container>
        {/* Hero Content */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[48px] text-neutral-900 leading-[48px]">
            {t("title")}
          </h1>
          <p className="mb-baseline-2 font-[family-name:var(--font-geist-sans)] text-[18px] text-neutral-700 leading-[24px]">
            {t("subtitle")}
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex items-center gap-2 border-2 border-neutral-200 bg-white p-2 shadow-sm">
            <motion.button
              className={cn(
                "px-8 py-3 font-semibold text-base transition-colors duration-200",
                activeTab === "customers"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("customers")}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("tabs.customers")}
            </motion.button>
            <motion.button
              className={cn(
                "px-8 py-3 font-semibold text-base transition-colors duration-200",
                activeTab === "professionals"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setActiveTab("professionals")}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("tabs.professionals")}
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
