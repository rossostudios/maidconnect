"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

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
 * HeroVariantA - A/B Test Variant
 *
 * Alternative hero messaging emphasizing speed and ease:
 * - Overline highlights "5 business days" turnaround
 * - Shorter, benefit-focused copy
 * - More action-oriented CTA: "Find Your Match"
 * - Reduced cognitive load with concise subtitle
 */
export function HeroVariantA() {
  const containerRef = useRef<HTMLElement>(null);

  // Subtle parallax for visual depth
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
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
      {/* Concierge Banner - Above Hero */}
      <div className="flex items-center justify-center bg-white py-4">
        <div className="w-full max-w-[1320px] border-neutral-200 border-b">
          <Container className="max-w-6xl px-4 md:px-8">
            <p className="text-center text-neutral-700 text-sm sm:text-base">
              <strong className="font-semibold text-neutral-900">New to Colombia?</strong> Try our
              Concierge service — English-speaking coordinator, curated matches in 5 days.{" "}
              <Link
                className="inline-flex items-center font-semibold text-orange-600 transition-colors hover:text-orange-700"
                href="/concierge"
                onClick={() =>
                  conversionTracking.heroCTAClicked({
                    ctaType: "concierge",
                    location: "banner",
                    ctaText: "Learn More",
                    variant: "variant_a",
                  })
                }
              >
                Learn More →
              </Link>
            </p>
          </Container>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-12 md:py-20">
        {/* Vertical Lines - Full height from navbar to bottom, aligned with container */}
        <div className="-translate-x-1/2 pointer-events-none fixed top-0 bottom-0 left-1/2 z-10 w-full max-w-[1320px]">
          <div className="absolute inset-y-0 left-0 w-px bg-neutral-200" />
          <div className="absolute inset-y-0 right-0 w-px bg-neutral-200" />
        </div>

        <Container className="relative max-w-6xl px-4 md:px-8">
          {/* Hero Content - Swiss Grid Layout */}
          <motion.div
            animate="visible"
            className="mb-24 grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-8"
            initial="hidden"
            variants={stagger}
          >
            {/* Text Content - 7 columns */}
            <div className="md:col-span-7">
              {/* Overline - Emphasize Speed */}
              <motion.div
                className="mb-4 font-semibold text-orange-600 text-xs uppercase tracking-wider"
                variants={fadeIn}
              >
                Staff Your Home in 5 Business Days
              </motion.div>

              {/* Display Heading - Variant A Messaging */}
              <motion.h1
                className="font-[family-name:var(--font-geist-sans)] font-normal text-5xl text-neutral-900 tracking-tight sm:text-6xl md:text-7xl"
                variants={fadeIn}
              >
                Trusted household staff, matched to your needs.
              </motion.h1>

              {/* Body Copy - Shorter, Benefit-Focused */}
              <motion.p
                className="mt-6 max-w-xl text-lg text-neutral-600 leading-relaxed"
                variants={fadeIn}
              >
                Connect with Colombia's top housekeepers, nannies, and estate staff through our
                streamlined matching process. Every professional is vetted, English-supported, and
                ready to start—typically within 5 business days.
              </motion.p>

              {/* CTA Buttons - Variant A Copy */}
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
                        ctaText: "Find Your Match",
                        variant: "variant_a",
                      })
                    }
                    size="lg"
                  >
                    Find Your Match
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button
                    className="w-full justify-center sm:w-auto"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "learn_more",
                        location: "hero",
                        ctaText: "See How It Works",
                        variant: "variant_a",
                      })
                    }
                    size="lg"
                    variant="ghost"
                  >
                    See How It Works
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
            <motion.div className="relative aspect-[16/9] overflow-hidden rounded-2xl" style={{ y: y1 }}>
              <Image
                alt="Casaora - Professional household staff in Medellín"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                src="/casaora-hero.jpg"
              />
              {/* Elegant fade to blend into background - subtle blend */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-50/30 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-50/40" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-50/20 via-transparent to-transparent" />
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
