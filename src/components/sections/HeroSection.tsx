"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

// Anthropic-Inspired Animation - Refined and Purposeful
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

/**
 * HeroSection - Anthropic-Inspired Lia Design
 *
 * Refined split-screen hero with exceptional typography and spatial balance:
 * - Geist Sans for display typography (geometric, precise)
 * - Two-column layout: text left, visual right
 * - Anthropic rounded corners (12px cards, 9999px pills)
 * - 4px spacing grid with generous breathing room
 * - Strategic orange accents on warm neutral base
 * - Elevated white cards on neutral-50 background
 */
export function HeroSection() {
  const t = useTranslations("hero");
  const containerRef = useRef<HTMLElement>(null);

  // Subtle parallax for visual depth
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // Highlight Medellín focus and Colombian expansion
  const trustedAreas = [
    "El Poblado · Medellín",
    "Laureles · Medellín",
    "Envigado · Medellín",
    "Sabaneta · Medellín",
    "Bogotá · Coming Soon",
    "Cali · Coming Soon",
  ];

  return (
    <section className="relative overflow-hidden bg-neutral-50" ref={containerRef}>
      {/* Split-Screen Hero Layout */}
      <div className="py-12 md:py-20">
        <Container className="relative max-w-screen-2xl px-4 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center md:gap-20 lg:gap-24 xl:gap-32">
            {/* LEFT: Content Column */}
            <motion.div
              animate="visible"
              className="flex flex-col"
              initial="hidden"
              variants={stagger}
            >
              {/* Tagline Badge */}
              <motion.div
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2"
                variants={fadeIn}
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                <span className="font-medium text-orange-900 text-xs uppercase tracking-wider">
                  {t("tagline") || "Household Happiness"}
                </span>
              </motion.div>

              {/* Ribbon - Refined Typography */}
              <motion.p
                className="mb-6 font-medium text-neutral-600 text-sm leading-relaxed"
                variants={fadeIn}
              >
                {t("ribbon") || "Medellín's only boutique household staffing agency"}
              </motion.p>

              {/* Display Heading - Large, Refined Hierarchy */}
              <motion.h1
                className="font-[family-name:var(--font-geist-sans)] font-normal text-4xl text-neutral-900 leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
                variants={fadeIn}
              >
                {t("title") || "Hire trusted nannies, housekeepers & private staff in Medellín"}
              </motion.h1>

              {/* Body Copy */}
              <motion.p
                className="mt-8 max-w-lg text-base text-neutral-600 leading-relaxed"
                variants={fadeIn}
              >
                {t("subtitle") ||
                  "We're the boutique agency that saves you months of stress. Every candidate is background-checked, reference-verified, and hand-matched to your family."}
              </motion.p>

              {/* Trust Badges - Elevated Cards */}
              <motion.div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3" variants={fadeIn}>
                {[
                  {
                    icon: (
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                    text: t("trustLines.backgroundChecks") || "Background Checks",
                  },
                  {
                    icon: (
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                    text: t("trustLines.englishFluent") || "English Fluent",
                  },
                  {
                    icon: (
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                    text: t("trustLines.quickMatching") || "5 Days or Less",
                  },
                ].map((item, idx) => (
                  <div
                    className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                    key={idx}
                  >
                    {item.icon}
                    <span className="font-medium text-neutral-700 text-xs">{item.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons - Clear Hierarchy */}
              <motion.div
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
                variants={fadeIn}
              >
                {/* Primary CTA */}
                <Link href="/brief">
                  <Button
                    className="w-full justify-center shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:shadow-xl sm:w-auto"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "start_brief",
                        location: "hero",
                        ctaText: t("cta.primary") || "Tell Us What You Need",
                        variant: "control",
                      })
                    }
                    size="lg"
                  >
                    {t("cta.primary") || "Tell Us What You Need"} →
                  </Button>
                </Link>

                {/* Secondary Actions */}
                <Link
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 font-medium text-neutral-700 text-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  href="/concierge"
                  onClick={() =>
                    conversionTracking.heroCTAClicked({
                      ctaType: "concierge",
                      location: "hero",
                      ctaText: t("cta.bookCall") || "Book a Free Call",
                      variant: "control",
                    })
                  }
                >
                  {t("cta.bookCall") || "Book a Free Call"}
                </Link>
              </motion.div>

              {/* Subtle Learn More Link */}
              <motion.div className="mt-5" variants={fadeIn}>
                <Link
                  className="inline-flex items-center gap-1.5 font-medium text-neutral-600 text-sm transition-colors hover:text-orange-600"
                  href="/how-it-works"
                  onClick={() =>
                    conversionTracking.heroCTAClicked({
                      ctaType: "learn_more",
                      location: "hero",
                      ctaText: t("cta.howItWorks") || "How Casaora Works",
                      variant: "control",
                    })
                  }
                >
                  {t("cta.howItWorks") || "How Casaora Works"}
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT: Visual Column */}
            <motion.div
              animate="visible"
              className="relative"
              initial="hidden"
              variants={fadeInScale}
            >
              {/* Colombia SVG with Elegant Fade */}
              <motion.div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ y: imageY, scale: imageScale }}
              >
                <Image
                  alt="Colombia - Casaora service coverage"
                  className="object-contain"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src="/colombia.svg"
                />
                {/* Elegant fade to blend into background - top, right, bottom */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-50 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-50" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-50 via-transparent to-transparent" />
              </motion.div>

              {/* Location Badge - Positioned over Medellín */}
              <div className="absolute top-[35%] left-[20%] rounded-lg border border-neutral-200 bg-white px-5 py-3 shadow-xl">
                <p className="font-semibold text-neutral-900 text-sm">Medellín, Colombia</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* Trusted Areas Marquee - Refined Card */}
      <div className="pb-20 md:pb-32">
        <Container className="max-w-screen-2xl px-4 md:px-12 lg:px-16">
          <div className="rounded-lg border border-neutral-200 bg-white px-8 py-12 shadow-sm md:px-12 lg:px-16">
            <p className="mb-6 text-center font-medium text-neutral-600 text-xs uppercase tracking-widest">
              Built for expat and local households in Medellín — expanding across Colombia
            </p>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

              <motion.div
                animate={{
                  x: [0, -960],
                }}
                className="flex gap-12"
                transition={{
                  duration: 30,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                {[...trustedAreas, ...trustedAreas].map((area, index) => (
                  <div
                    className="flex min-w-[180px] items-center justify-center"
                    key={`${area}-${index}`}
                  >
                    <span className="whitespace-nowrap font-medium text-neutral-700 text-sm">
                      {area}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
