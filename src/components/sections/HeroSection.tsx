"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { funnelEvents } from "@/lib/integrations/posthog";

// Swiss Design Animation - Minimal and Purposeful
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/**
 * HeroSection - Swiss Design System
 *
 * Clean, minimalist hero section following Swiss typography principles:
 * - Satoshi for display typography (geometric, precise)
 * - Ample whitespace (64px modules)
 * - Grid-based layout (8px base unit)
 * - Restrained color palette (neutral + orange accent)
 * - Asymmetric balance with portrait grid
 */
export function HeroSection() {
  const t = useTranslations("hero");
  const containerRef = useRef<HTMLElement>(null);

  // Subtle parallax for visual depth
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="relative overflow-visible bg-neutral-50 py-24 md:py-32" ref={containerRef}>
      {/* Vertical Lines - Full height from navbar to bottom, aligned with container */}
      <div className="-translate-x-1/2 pointer-events-none fixed top-0 bottom-0 left-1/2 z-10 w-full max-w-[1320px]">
        <div className="absolute inset-y-0 left-0 w-px bg-neutral-200" />
        <div className="absolute inset-y-0 right-0 w-px bg-neutral-200" />
      </div>

      <Container className="relative max-w-7xl">
        {/* Hero Content - Swiss Grid Layout */}
        <motion.div
          animate="visible"
          className="mb-20 grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-8"
          initial="hidden"
          variants={stagger}
        >
          {/* Text Content - 7 columns */}
          <div className="md:col-span-7">
            {/* Overline - Uppercase, tracked */}
            <motion.div
              className="mb-4 font-medium text-neutral-600 text-xs uppercase tracking-wider"
              variants={fadeIn}
            >
              {t("overline") || "Premium Domestic Staffing"}
            </motion.div>

            {/* Display Heading - Satoshi Medium */}
            <motion.h1
              className="font-medium text-5xl text-neutral-900 tracking-tight sm:text-6xl md:text-7xl"
              style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
              variants={fadeIn}
            >
              {t("title") || "Your home deserves exceptional care"}
            </motion.h1>

            {/* Body Copy - Manrope Regular */}
            <motion.p
              className="mt-6 max-w-xl text-lg text-neutral-600 leading-relaxed"
              variants={fadeIn}
            >
              {t("subtitle") ||
                "Casaora connects Colombia's most qualified household professionals with families who demand excellence. Every candidate is thoroughly vetted, background-checked, and matched to your unique needs."}
            </motion.p>

            {/* CTA Buttons - Swiss Alignment */}
            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
              variants={fadeIn}
            >
              <Button
                className="justify-center"
                onClick={() => funnelEvents.clickedCTA(t("cta.primary") || "Find Professionals")}
                size="lg"
              >
                {t("cta.primary") || "Find Professionals"}
              </Button>
              <Button
                className="justify-center"
                onClick={() => funnelEvents.clickedCTA(t("cta.secondary") || "Learn More")}
                size="lg"
                variant="outline"
              >
                {t("cta.secondary") || "Learn More"}
              </Button>
            </motion.div>
          </div>

          {/* Empty space for visual balance - 5 columns */}
          <div className="hidden md:col-span-5 md:block" />
        </motion.div>

        {/* Hero Image */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          initial={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            className="relative aspect-[16/9] overflow-hidden rounded-sm bg-neutral-200"
            style={{ y: y1 }}
          >
            <Image
              alt="Premium household professionals - Casaora"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              src="/hero.png"
            />
          </motion.div>
        </motion.div>

        {/* Trusted By Section - Infinite Scroll */}
        <div className="mt-20 overflow-hidden">
          <p className="mb-8 text-center font-mono text-neutral-400 text-xs uppercase tracking-widest">
            Trusted by 500+ companies worldwide
          </p>

          {/* Infinite Scroll Container */}
          <div className="relative">
            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-neutral-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-neutral-50 to-transparent" />

            {/* Scrolling Logos */}
            <motion.div
              animate={{
                x: [0, -1920], // Scroll distance (adjust based on content width)
              }}
              className="flex gap-16"
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              {/* First set of logos */}
              {[
                "Biosynthesis",
                "Quotient",
                "Hourglass",
                "Command+R",
                "GlobalBank",
                "Quotient",
                "Hourglass",
                "Command+R",
              ].map((company, index) => (
                <div
                  className="flex min-w-[180px] items-center justify-center"
                  key={`${company}-${index}`}
                >
                  <span className="whitespace-nowrap font-semibold text-neutral-900 text-sm tracking-tight">
                    {company}
                  </span>
                </div>
              ))}

              {/* Duplicate set for seamless loop */}
              {[
                "Biosynthesis",
                "Quotient",
                "Hourglass",
                "Command+R",
                "GlobalBank",
                "Quotient",
                "Hourglass",
                "Command+R",
              ].map((company, index) => (
                <div
                  className="flex min-w-[180px] items-center justify-center"
                  key={`${company}-duplicate-${index}`}
                >
                  <span className="whitespace-nowrap font-semibold text-neutral-900 text-sm tracking-tight">
                    {company}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Horizontal Divider - Connects vertical lines at container width */}
      <div className="mx-auto mt-20 h-px w-full max-w-[1320px] bg-neutral-200" />
    </section>
  );
}
