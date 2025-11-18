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
  title: string;
  subtitle: string;
}

export function HeroSectionClient({ title, subtitle }: HeroSectionClientProps) {
  return (
    <section className="bg-neutral-50 py-12 md:py-24">
      <Container className="max-w-5xl">
        <motion.div animate="visible" className="text-center" initial="hidden" variants={stagger}>
          {/* Badge */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2 font-semibold text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]"
            variants={fadeIn}
          >
            <span aria-hidden="true" className="h-2 w-2 bg-orange-500" />
            How It Works
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-[family-name:var(--font-geist-sans)] font-normal text-5xl text-neutral-900 leading-[1.1] tracking-tight lg:text-[72px] lg:leading-[1]"
            variants={fadeIn}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-3xl text-lg text-neutral-600 leading-relaxed md:text-xl"
            variants={fadeIn}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
