"use client";

import { motion, Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ConciergeJustification } from "./concierge-justification";
import { FeeExplainer } from "./fee-explainer";
import { PricingComparisonCards } from "./pricing-comparison-cards";

export function CustomerPricingTab() {
  const t = useTranslations("pricing.customer");

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-24">
      {/* How Pricing Works */}
      <Container>
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            {t("howItWorks.title")}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="mb-24 grid gap-12 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {[1, 2, 3].map((step) => (
            <motion.div className="text-center" key={step} variants={fadeInUp}>
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 font-bold text-3xl text-white shadow-lg shadow-orange-500/20">
                {step}
              </div>
              <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
                {t(`howItWorks.steps.step${step}.title`)}
              </h3>
              <p className="text-base text-neutral-600 leading-relaxed">
                {t(`howItWorks.steps.step${step}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          className="mb-24"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-12 text-center font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900 tracking-tight md:text-4xl">
            {t("chooseService.title")}
          </h2>
          <PricingComparisonCards highlightConcierge />
        </motion.div>
      </Container>

      {/* Fee Explainer */}
      <motion.div
        initial="hidden"
        variants={fadeInUp}
        viewport={{ once: true, margin: "-100px" }}
        whileInView="visible"
      >
        <FeeExplainer />
      </motion.div>

      {/* Concierge Justification */}
      <motion.div
        className="pb-24"
        initial="hidden"
        variants={fadeInUp}
        viewport={{ once: true, margin: "-100px" }}
        whileInView="visible"
      >
        <ConciergeJustification />
      </motion.div>
    </div>
  );
}
