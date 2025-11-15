"use client";

import {
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
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
      {/* How It Works */}
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
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div className="text-center" key={step.key} variants={fadeInUp}>
                <motion.div
                  className="mb-4 inline-flex h-20 w-20 items-center justify-center border-4 border-orange-500 bg-orange-100"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={Icon} />
                </motion.div>
                <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
                  {t(`howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="text-[14px] text-neutral-700 leading-[20px]">
                  {t(`howItWorks.steps.${step.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Key Point Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <Card className="mb-16 border-4 border-orange-500 bg-orange-50 shadow-xl">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                viewport={{ once: true }}
                whileInView={{ scale: 1, rotate: 360 }}
              >
                <HugeiconsIcon className="mx-auto mb-4 h-16 w-16 text-orange-600" icon={StarIcon} />
              </motion.div>
              <h3 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-[24px] text-neutral-900 leading-[24px]">
                {t("keyPoint.title")}
              </h3>
              <p className="mx-auto max-w-2xl text-[18px] text-neutral-700 leading-[24px]">
                {t("keyPoint.description")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Earnings Calculator */}
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
            <EarningsCalculator />
          </motion.div>
        </Container>
      </section>

      {/* Benefits */}
      <Container>
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
            {t("benefits.title")}
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.key} variants={fadeInUp}>
                <Card className="h-full border-2 border-neutral-200 bg-white transition-all duration-200 hover:border-orange-500 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-orange-100"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                    >
                      <HugeiconsIcon className="h-8 w-8 text-orange-600" icon={Icon} />
                    </motion.div>
                    <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[18px] text-neutral-900 leading-[24px]">
                      {t(`benefits.items.${benefit.key}.title`)}
                    </h3>
                    <p className="text-[14px] text-neutral-700 leading-[20px]">
                      {t(`benefits.items.${benefit.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>

      {/* What Platform Fee Covers */}
      <section className="bg-orange-50 py-16">
        <Container>
          <motion.div
            className="mx-auto mb-12 max-w-3xl text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[32px] text-neutral-900 leading-[48px]">
              {t("feeCovers.title")}
            </h2>
            <p className="text-[16px] text-neutral-700 leading-[24px]">
              {t("feeCovers.description")}
            </p>
          </motion.div>

          <motion.div
            className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            {(t.raw("feeCovers.items") as Array<{ title: string; description: string }>).map(
              (item, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Card className="h-full border-2 border-orange-200 bg-white">
                    <CardContent className="p-6">
                      <motion.div
                        className="mb-3 flex h-8 w-8 items-center justify-center bg-orange-500"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                      >
                        <span className="font-bold text-white">✓</span>
                      </motion.div>
                      <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-bold text-[16px] text-neutral-900 leading-[24px]">
                        {item.title}
                      </h3>
                      <p className="text-[14px] text-neutral-700 leading-[20px]">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </motion.div>
        </Container>
      </section>

      {/* Payout Info */}
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-4 border-orange-500 bg-neutral-900 shadow-2xl">
            <CardContent className="p-12">
              <motion.div
                className="mb-8 text-center"
                initial="hidden"
                variants={fadeInUp}
                viewport={{ once: true }}
                whileInView="visible"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ scale: 1, rotate: 360 }}
                >
                  <HugeiconsIcon
                    className="mx-auto mb-4 h-16 w-16 text-orange-500"
                    icon={Clock01Icon}
                  />
                </motion.div>
                <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-white leading-[24px]">
                  {t("payouts.title")}
                </h2>
                <p className="mx-auto max-w-2xl text-[16px] text-neutral-300 leading-[24px]">
                  {t("payouts.description")}
                </p>
              </motion.div>

              <motion.div
                className="mx-auto grid max-w-3xl gap-6 md:grid-cols-3"
                initial="hidden"
                variants={staggerContainer}
                viewport={{ once: true }}
                whileInView="visible"
              >
                {(t.raw("payouts.features") as string[]).map((feature, idx) => (
                  <motion.div
                    className="border-2 border-neutral-700 bg-neutral-800 p-4 text-center"
                    key={idx}
                    variants={fadeInUp}
                  >
                    <p className="text-[14px] text-neutral-300 leading-[20px]">{feature}</p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Final CTA */}
      <section className="bg-orange-500 py-16">
        <Container>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-baseline-1 font-[family-name:var(--font-geist-sans)] font-bold text-[36px] text-white leading-[48px]">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-[18px] text-white/90 leading-[24px]">{t("cta.subtitle")}</p>
            <motion.a
              className="inline-block bg-white px-10 py-4 font-bold text-lg text-orange-600 shadow-lg transition-all duration-200 hover:bg-neutral-100 hover:shadow-xl"
              href="/professionals/onboarding"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("cta.button")}
            </motion.a>
            <p className="mt-4 text-sm text-white/80">{t("cta.subtext")}</p>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
