"use client";

import { Calendar03Icon, Search01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import type { HugeIcon } from "@/types/icons";

/**
 * ProcessSection - 3-Step Linear Flow
 *
 * Clear, linear design that tells Casaora's story:
 * 1. Tell Us What You Need - Describe service, schedule, location
 * 2. Meet Verified Pros - Browse background-checked professionals
 * 3. Book & Relax - Pay securely, peace of mind
 *
 * Design: Clean cards with icons, step numbers, connecting line, and CTA
 */

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

type ProcessStep = {
  number: number;
  icon: HugeIcon;
  titleKey: string;
  descriptionKey: string;
};

const processSteps: ProcessStep[] = [
  {
    number: 1,
    icon: Search01Icon,
    titleKey: "step1.title",
    descriptionKey: "step1.description",
  },
  {
    number: 2,
    icon: SecurityCheckIcon,
    titleKey: "step2.title",
    descriptionKey: "step2.description",
  },
  {
    number: 3,
    icon: Calendar03Icon,
    titleKey: "step3.title",
    descriptionKey: "step3.description",
  },
];

// Step Card Component
function StepCard({
  step,
  isLast,
  t,
}: {
  step: ProcessStep;
  isLast: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Step Number Badge */}
      <motion.div
        className="-top-4 absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-semibold text-sm text-white shadow-md"
        variants={fadeIn}
      >
        {step.number}
      </motion.div>

      {/* Card */}
      <motion.div
        className="flex h-full w-full flex-col items-center rounded-xl border border-neutral-200 bg-white px-6 pt-10 pb-6 text-center shadow-sm transition-all hover:border-orange-200 hover:shadow-md sm:px-8 sm:pt-12 sm:pb-8"
        variants={fadeIn}
      >
        {/* Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 sm:h-16 sm:w-16">
          <HugeiconsIcon
            className="h-7 w-7 text-orange-600 sm:h-8 sm:w-8"
            icon={step.icon}
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className="mb-2 font-semibold text-lg text-neutral-900 sm:text-xl">
          {t(step.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed sm:text-base">
          {t(step.descriptionKey)}
        </p>
      </motion.div>

      {/* Connector Arrow (hidden on last step and mobile) */}
      {!isLast && (
        <div className="-right-3 -translate-y-1/2 lg:-right-5 absolute top-1/2 hidden text-orange-300 md:block">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </div>
      )}
    </div>
  );
}

export function ProcessSection() {
  const t = useTranslations("home.process");

  return (
    <section className="bg-neutral-50 py-16 sm:py-20 lg:py-24" id="how-it-works">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <motion.div
          animate="visible"
          className="mb-10 text-center sm:mb-12 lg:mb-14"
          initial="hidden"
          variants={stagger}
        >
          <motion.span
            className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1.5 font-medium text-orange-700 text-xs uppercase tracking-wider"
            variants={fadeIn}
          >
            How It Works
          </motion.span>
          <motion.h2
            className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl"
            variants={fadeIn}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            className="mx-auto mt-3 max-w-xl text-base text-neutral-600 sm:text-lg"
            variants={fadeIn}
          >
            {t("description")}
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10"
          initial="hidden"
          variants={stagger}
        >
          {processSteps.map((step, index) => (
            <StepCard
              isLast={index === processSteps.length - 1}
              key={step.number}
              step={step}
              t={t}
            />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          animate="visible"
          className="mt-10 text-center sm:mt-12"
          initial="hidden"
          variants={stagger}
        >
          <motion.div className="mb-4" variants={fadeIn}>
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-xl"
              href="/brief"
            >
              {t("cta")}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Link>
          </motion.div>
          <motion.p className="text-neutral-500 text-sm" variants={fadeIn}>
            15% service fee covers background checks, insurance & support. Professionals keep 100%.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
