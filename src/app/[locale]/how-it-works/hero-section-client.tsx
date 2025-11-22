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

interface HeroSectionClientProps {
  badge: string;
  title: string;
  subtitle: string;
}

export function HeroSectionClient({ badge, title, subtitle }: HeroSectionClientProps) {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <motion.div animate="visible" className="text-center" initial="hidden" variants={stagger}>
          {/* Pill Badge - Dunas style */}
          <motion.div className="mb-8" variants={fadeIn}>
            <span className="inline-flex rounded-full bg-neutral-100 px-4 py-1.5 font-medium text-neutral-600 text-sm">
              {badge}
            </span>
          </motion.div>

          {/* Title - Large centered headline */}
          <motion.h1
            className="font-[family-name:var(--font-geist-sans)] font-medium text-4xl text-neutral-900 leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl"
            variants={fadeIn}
          >
            {title}
          </motion.h1>

          {/* Subtitle - Clean description */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed"
            variants={fadeIn}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
