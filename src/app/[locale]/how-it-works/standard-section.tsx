"use client";

import { Calendar03Icon, SecurityCheckIcon, ShieldKeyIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { Container } from "@/components/ui/container";
import type { HugeIcon } from "@/types/icons";

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

type Step = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  systemAction: string;
  systemStatus: string;
};

type StandardSectionProps = {
  sectionTitle: string;
  sectionSubtitle: string;
  step1: Step;
  step2: Step;
  step3: Step;
};

// Map step numbers to icons
const stepIcons: Record<string, HugeIcon> = {
  "01": SecurityCheckIcon,
  "02": Calendar03Icon,
  "03": ShieldKeyIcon,
};

export function StandardSection({
  sectionTitle,
  sectionSubtitle,
  step1,
  step2,
  step3,
}: StandardSectionProps) {
  const steps = [step1, step2, step3];

  return (
    <section className="bg-neutral-50 py-16 md:py-24 lg:py-32 dark:bg-rausch-900">
      <Container className="max-w-6xl">
        <motion.div
          animate="visible"
          className="mb-12 text-center md:mb-16"
          initial="hidden"
          variants={stagger}
        >
          <motion.h2
            className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl dark:text-white"
            variants={fadeIn}
          >
            {sectionTitle}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-neutral-600 dark:text-rausch-300"
            variants={fadeIn}
          >
            {sectionSubtitle}
          </motion.p>
        </motion.div>

        <motion.div
          animate="visible"
          className="grid gap-6 md:gap-8 lg:grid-cols-3"
          initial="hidden"
          variants={stagger}
        >
          {steps.map((step) => (
            <StandardStepCard key={step.number} step={step} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function StandardStepCard({ step }: { step: Step }) {
  const Icon = stepIcons[step.number] || SecurityCheckIcon;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-rausch-800 dark:bg-rausch-950"
      variants={fadeIn}
    >
      {/* Large watermark step number */}
      <span
        aria-hidden="true"
        className="-right-4 -top-6 pointer-events-none absolute select-none font-bold text-[120px] text-neutral-100 leading-none dark:text-rausch-900"
      >
        {step.number}
      </span>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon container */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-rausch-50 dark:bg-rausch-800">
          <HugeiconsIcon className="h-6 w-6 text-rausch-600 dark:text-rausch-300" icon={Icon} />
        </div>

        {/* Title + Subtitle */}
        <h3 className="font-semibold text-neutral-900 text-xl dark:text-white">{step.title}</h3>
        <p className="mt-1 font-medium text-rausch-600 text-sm dark:text-rausch-400">
          {step.subtitle}
        </p>

        {/* Description */}
        <p className="mt-4 text-neutral-600 leading-relaxed dark:text-rausch-300">
          {step.description}
        </p>

        {/* System Action Bar - The "Unicorn" touch */}
        <div className="mt-6 flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3 dark:bg-rausch-900">
          {/* Animated pulsing green dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          {/* Action label */}
          <span className="text-neutral-600 text-sm dark:text-rausch-300">{step.systemAction}</span>
          {/* Status badge */}
          <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400">
            {step.systemStatus}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
