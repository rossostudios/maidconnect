"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ConciergeJustification } from "./concierge-justification";
import { FeeExplainer } from "./fee-explainer";
import { PricingCalculator } from "./pricing-calculator";
import { PricingComparisonCards } from "./pricing-comparison-cards";

export function CustomerPricingTab() {
  const t = useTranslations("pricing.customer");

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-20">
      {/* How Pricing Works */}
      <Container>
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
            {t("howItWorks.title")}
          </h2>
          <p className="text-[16px] text-neutral-700 leading-[24px]">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="mb-16 grid gap-8 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {[1, 2, 3].map((step) => (
            <motion.div className="text-center" key={step} variants={fadeInUp}>
              <motion.div
                className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-orange-500 font-bold text-2xl text-white shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {step}
              </motion.div>
              <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
                {t(`howItWorks.steps.step${step}.title`)}
              </h3>
              <p className="text-[14px] text-neutral-700 leading-[20px]">
                {t(`howItWorks.steps.step${step}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          className="mb-16"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-baseline-2 text-center font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-neutral-900 leading-[24px]">
            {t("chooseService.title")}
          </h2>
          <PricingComparisonCards highlightConcierge />
        </motion.div>
      </Container>

      {/* Calculator Section */}
      <section className="bg-neutral-50 py-16">
        <Container>
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
              {t("calculator.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-[16px] text-neutral-700 leading-[24px]">
              {t("calculator.description")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <PricingCalculator />
          </motion.div>
        </Container>
      </section>

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
        initial="hidden"
        variants={fadeInUp}
        viewport={{ once: true, margin: "-100px" }}
        whileInView="visible"
      >
        <ConciergeJustification />
      </motion.div>

      {/* Final CTA */}
      <section className="bg-neutral-900 py-16">
        <Container>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-white leading-[48px]">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-[16px] text-neutral-300 leading-[24px]">{t("cta.subtitle")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <motion.a
                className="inline-block bg-orange-500 px-8 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
                href="/professionals"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("cta.primary")}
              </motion.a>
              <motion.a
                className="inline-block border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-neutral-900"
                href="/concierge"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("cta.secondary")}
              </motion.a>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
