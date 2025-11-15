"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

// Lia Design Animation - Minimal and Purposeful
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
 * HeroSection - Lia Design System
 *
 * Clean, minimalist hero section following Lia design principles:
 * - Geist Sans for display typography (geometric, precise)
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
  // Highlight Medellín focus and Colombian expansion rather than abstract company logos
  const trustedAreas = [
    "El Poblado · Medellín",
    "Laureles · Medellín",
    "Envigado · Medellín",
    "Sabaneta · Medellín",
    "Bogotá · Coming Soon",
    "Cali · Coming Soon",
  ];

  return (
    <section className="relative overflow-visible bg-neutral-50" ref={containerRef}>
      {/* Hero Section */}
      <div className="py-32 md:py-40">
        <Container className="relative max-w-6xl px-4 md:px-8">
          {/* Hero Content - Swiss Grid Layout */}
          <motion.div
            animate="visible"
            className="mb-24 grid grid-cols-1 gap-16 md:grid-cols-12 md:items-start md:gap-8"
            initial="hidden"
            variants={stagger}
          >
            {/* Text Content - 7 columns */}
            <div className="flex flex-col md:col-span-7">
              {/* Overline - Uppercase, tracked */}
              <motion.div
                className="mb-4 font-medium text-neutral-600 text-xs uppercase tracking-wider"
                variants={fadeIn}
              >
                {t("overline") || "Domestic Staffing for Expats in Colombia"}
              </motion.div>

              {/* Display Heading - Geist Sans Medium */}
              <motion.h1
                className="font-[family-name:var(--font-geist-sans)] font-medium text-5xl text-neutral-900 tracking-tight sm:text-6xl md:text-7xl"
                variants={fadeIn}
              >
                {t("title") || "Find trusted household staff in Colombia—entirely in English."}
              </motion.h1>

              {/* Body Copy - Geist Sans */}
              <motion.p
                className="mt-6 max-w-xl text-lg text-neutral-600 leading-relaxed"
                variants={fadeIn}
              >
                {t("subtitle") ||
                  "We connect expat and local families with Colombia's most trusted housekeepers, nannies, and estate staff. Every professional is carefully vetted, English-supported, and fully insured—ready to bring warmth and expertise to your home, typically within 5 business days."}
              </motion.p>

              {/* CTA Buttons - Swiss Alignment */}
              <motion.div
                className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:flex-nowrap"
                variants={fadeIn}
              >
                <Link href="/brief">
                  <Button
                    className="w-full justify-center sm:w-auto"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "start_brief",
                        location: "hero",
                        ctaText: t("cta.primary") || "Start Your Brief",
                        variant: "control",
                      })
                    }
                    size="lg"
                  >
                    {t("cta.primary") || "Start Your Brief"}
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button
                    className="w-full justify-center sm:w-auto"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "learn_more",
                        location: "hero",
                        ctaText: t("cta.secondary") || "Learn More",
                        variant: "control",
                      })
                    }
                    size="lg"
                    variant="ghost"
                  >
                    {t("cta.secondary") || "Learn More"}
                  </Button>
                </Link>
                <Link
                  className="text-center font-semibold text-neutral-600 text-sm transition hover:text-neutral-900 sm:text-base"
                  href="/concierge"
                >
                  Speak with a concierge →
                </Link>
              </motion.div>
            </div>

            {/* Empty space for visual balance - 5 columns */}
            <div className="hidden md:col-span-5 md:block" />
          </motion.div>

          {/* Hero Image */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative mt-16"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative aspect-[16/9] overflow-hidden bg-neutral-200"
              style={{ y: y1 }}
            >
              <Image
                alt="Premium household professionals - Casaora"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                src="/hero.jpg"
              />
              {/* Gradient overlay - fades image to page background */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50" />
            </motion.div>
          </motion.div>

          {/* Trusted By Section - Marquee inside bordered card */}
          <div className="mt-24">
            <div className="border border-neutral-200 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10">
              <p className="mb-8 text-center text-neutral-600 text-xs uppercase tracking-[0.4em]">
                Built for expat and local households in Medellín — expanding across Colombia
              </p>

              <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

                <motion.div
                  animate={{
                    x: [0, -960],
                  }}
                  className="flex gap-16 opacity-75"
                  transition={{
                    duration: 28,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  {[...trustedAreas, ...trustedAreas].map((area, index) => (
                    <div
                      className="flex min-w-[160px] items-center justify-center"
                      key={`${area}-${index}`}
                    >
                      <span className="whitespace-nowrap font-semibold text-neutral-900 text-sm tracking-tight">
                        {area}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
