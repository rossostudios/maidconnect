"use client";

import {
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

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
      {/* How It Works */}
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
          <p className="text-lg text-neutral-600 leading-relaxed">{t("howItWorks.description")}</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="mb-24 grid gap-12 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div className="text-center" key={step.key} variants={fadeInUp}>
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-orange-200 bg-orange-100 text-orange-600">
                  <HugeiconsIcon className="h-10 w-10" icon={Icon} />
                </div>
                <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-neutral-900">
                  {t(`howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="text-base text-neutral-600 leading-relaxed">
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
          <div className="mb-24 rounded-3xl border-2 border-orange-500 bg-orange-50 p-12 text-center shadow-orange-900/10 shadow-xl">
            <motion.div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg"
              initial={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              viewport={{ once: true }}
              whileInView={{ scale: 1, rotate: 360 }}
            >
              <HugeiconsIcon className="h-10 w-10" icon={StarIcon} />
            </motion.div>
            <h3 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
              {t("keyPoint.title")}
            </h3>
            <p className="mx-auto max-w-2xl text-neutral-700 text-xl leading-relaxed">
              {t("keyPoint.description")}
            </p>
          </div>
        </motion.div>
      </Container>

      {/* Benefits */}
      <Container>
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
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
                <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-orange-900/5 hover:shadow-xl">
                  <div className="text-center">
                    <motion.div
                      className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                    >
                      <HugeiconsIcon className="h-8 w-8" icon={Icon} />
                    </motion.div>
                    <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-neutral-900 text-xl">
                      {t(`benefits.items.${benefit.key}.title`)}
                    </h3>
                    <p className="text-base text-neutral-600 leading-relaxed">
                      {t(`benefits.items.${benefit.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>

      {/* What Platform Fee Covers */}
      <section className="bg-orange-50 py-24">
        <Container>
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              {t("feeCovers.title")}
            </h2>
            <p className="text-lg text-neutral-700 leading-relaxed">{t("feeCovers.description")}</p>
          </motion.div>

          <motion.div
            className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            {(t.raw("feeCovers.items") as Array<{ title: string; description: string }>).map(
              (item, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <div className="h-full rounded-2xl border border-orange-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <motion.div
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                    >
                      <span className="font-bold text-lg">✓</span>
                    </motion.div>
                    <h3 className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-neutral-900 text-xl">
                      {item.title}
                    </h3>
                    <p className="text-base text-neutral-600 leading-relaxed">{item.description}</p>
                  </div>
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
          <div className="rounded-3xl border border-orange-200 bg-white p-12 shadow-orange-900/5 shadow-xl md:p-16">
            <motion.div
              className="mb-12 text-center"
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
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <HugeiconsIcon className="h-10 w-10" icon={Clock01Icon} />
                </div>
              </motion.div>
              <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight">
                {t("payouts.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-neutral-600 leading-relaxed">
                {t("payouts.description")}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3"
              initial="hidden"
              variants={staggerContainer}
              viewport={{ once: true }}
              whileInView="visible"
            >
              {(t.raw("payouts.features") as string[]).map((feature, idx) => (
                <motion.div
                  className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 text-center transition-colors duration-200 hover:border-orange-100 hover:bg-orange-50"
                  key={idx}
                  variants={fadeInUp}
                >
                  <p className="font-medium text-lg text-neutral-900">{feature}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Container>

      {/* Final CTA */}
      <section className="bg-orange-500 py-24">
        <Container>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-white tracking-tight md:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mb-12 text-white/90 text-xl leading-relaxed">{t("cta.subtitle")}</p>
            <motion.a
              className="inline-block rounded-xl bg-white px-10 py-4 font-bold text-lg text-orange-600 shadow-xl transition-all duration-200 hover:scale-105 hover:bg-neutral-50 hover:shadow-2xl"
              href="/professionals/onboarding"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("cta.button")}
            </motion.a>
            <p className="mt-6 text-base text-white/80">{t("cta.subtext")}</p>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
