"use client";

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

type HeroSectionClientProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function HeroSectionClient({ badge, title, subtitle }: HeroSectionClientProps) {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 dark:bg-rausch-950">
      <Container className="max-w-4xl">
        <motion.div animate="visible" className="text-center" initial="hidden" variants={stagger}>
          {/* Pill Badge - The Casaora Standard */}
          <motion.div className="mb-8" variants={fadeIn}>
            <span className="inline-flex items-center gap-2 rounded-full border border-rausch-200 bg-rausch-50 px-4 py-1.5 font-medium text-rausch-700 text-sm dark:border-rausch-700 dark:bg-rausch-900 dark:text-rausch-300">
              {/* Subtle pulsing indicator */}
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-pulse rounded-full bg-rausch-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-rausch-500" />
              </span>
              {badge}
            </span>
          </motion.div>

          {/* Title - Large centered headline */}
          <motion.h1
            className="font-[family-name:var(--font-geist-sans)] font-medium text-4xl text-neutral-900 leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl dark:text-white"
            variants={fadeIn}
          >
            {title}
          </motion.h1>

          {/* Subtitle - Clean description */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed dark:text-rausch-300"
            variants={fadeIn}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
