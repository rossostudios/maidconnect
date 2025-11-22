"use client";

import {
  CheckmarkCircle01Icon,
  File02Icon,
  MedicalMaskIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { Container } from "@/components/ui/container";

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
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

interface DirectHireValueSectionClientProps {
  title: string;
  subtitle: string;
  benefits: Array<{
    icon: "legal" | "background" | "medical" | "guarantee";
    title: string;
    description: string;
  }>;
}

const iconMap = {
  legal: File02Icon,
  background: Shield01Icon,
  medical: MedicalMaskIcon,
  guarantee: CheckmarkCircle01Icon,
};

export function DirectHireValueSectionClient({
  title,
  subtitle,
  benefits,
}: DirectHireValueSectionClientProps) {
  return (
    <section className="border-neutral-200 border-y bg-neutral-50 py-12 md:py-24">
      <Container className="max-w-6xl">
        <motion.div animate="visible" initial="hidden" variants={stagger}>
          {/* Section Header */}
          <motion.div className="mb-16 text-center" variants={fadeIn}>
            <h2 className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600">{subtitle}</p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
          >
            {benefits.map((benefit, idx) => {
              const IconComponent = iconMap[benefit.icon];
              return (
                <motion.div
                  className="flex flex-col items-start rounded-xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-md"
                  key={idx}
                  variants={fadeIn}
                >
                  {/* Icon */}
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <HugeiconsIcon className="h-6 w-6" icon={IconComponent} />
                  </div>

                  {/* Check Mark + Title */}
                  <div className="mb-3 flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-5 w-5 flex-shrink-0 text-green-600"
                      icon={CheckmarkCircle01Icon}
                    />
                    <h3 className="font-semibold text-lg text-neutral-900">{benefit.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-neutral-600 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Value Prop Footer */}
          <motion.div
            className="mt-16 rounded-2xl border border-blue-100 bg-blue-50/50 p-8 text-center"
            variants={fadeIn}
          >
            <p className="font-semibold text-blue-900 text-xl">Your Safety Guarantee</p>
            <p className="mx-auto mt-3 max-w-2xl text-base text-blue-700 leading-relaxed">
              The Direct Hire Fee isn't just a charge—it's your comprehensive protection plan. It
              covers rigorous background checks, legal contract preparation, and medical clearances
              to ensure your peace of mind.
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
