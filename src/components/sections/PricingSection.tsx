"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

/**
 * PricingSection - Homepage Pricing Module
 *
 * Editorial split-layout with animated Colombia map
 * Premium concierge aesthetic with subtle animations
 * LIA Design System: Strict 24px baseline alignment
 */
export function PricingSection() {
  const t = useTranslations("home.pricing");

  const plan = {
    name: "Concierge Service",
    description: "Expert matching with white-glove service for foreigners in Colombia",
    commission: 20,
    features: [
      "Expert human matching based on your needs",
      "English-speaking coordinators",
      "Thoroughly vetted, background-checked professionals",
      "Priority booking and faster response",
      "Secure payment via Stripe with insurance",
      "Satisfaction guarantee",
      "24/7 dedicated support",
    ],
    ctaText: "Get Started",
    ctaHref: "/professionals",
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-orange-50/30 py-12 md:py-24">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-neutral-200/40 blur-3xl" />
      </div>

      <Container className="relative max-w-7xl px-4">
        {/* Section Badge & Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-block rounded-full border-2 border-orange-500/20 bg-white px-6 py-2 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="font-semibold text-orange-600 text-sm uppercase tracking-wider">
              {t("badge")}
            </span>
          </motion.div>
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-5xl text-neutral-900 tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-neutral-600 text-xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>

        {/* Main Content - Split Layout */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Colombia Map with Glow Effect */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative aspect-square w-full lg:sticky lg:top-24">
              {/* Glow background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400/20 via-orange-500/10 to-transparent blur-2xl" />

              {/* Map container */}
              <div className="relative h-full w-full rounded-3xl border border-neutral-200/50 bg-white p-12 shadow-2xl">
                <div className="relative h-full w-full">
                  {/* Animated SVG with path drawing effect */}
                  <motion.div
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                    }}
                    className="relative h-full w-full"
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      rotate: 0,
                    }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                    }}
                  >
                    <motion.svg
                      animate={{
                        rotate: [0, 0.5, 0, -0.5, 0],
                      }}
                      className="h-full w-full drop-shadow-2xl"
                      style={{
                        filter: "drop-shadow(0 0 40px rgba(255, 82, 0, 0.15))",
                      }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <image
                        height="100%"
                        href="/colombia.svg"
                        style={{
                          opacity: 0.9,
                        }}
                        width="100%"
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Animated accent dots - Major Cities */}
                  {/* Bogotá */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    className="absolute top-[45%] left-[48%] h-3 w-3 rounded-full bg-orange-500 shadow-lg ring-4 ring-orange-500/20"
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Medellín */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    className="absolute top-[38%] left-[42%] h-3 w-3 rounded-full bg-orange-500 shadow-lg ring-4 ring-orange-500/20"
                    transition={{
                      duration: 3,
                      delay: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Cali */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    className="absolute top-[58%] left-[40%] h-3 w-3 rounded-full bg-orange-500 shadow-lg ring-4 ring-orange-500/20"
                    transition={{
                      duration: 3,
                      delay: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Subtle pulse rings emanating from cities */}
                  <motion.div
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.5, 0],
                    }}
                    className="-translate-x-1/2 -translate-y-1/2 absolute top-[45%] left-[48%] h-3 w-3 rounded-full border-2 border-orange-500"
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.5, 0],
                    }}
                    className="-translate-x-1/2 -translate-y-1/2 absolute top-[38%] left-[42%] h-3 w-3 rounded-full border-2 border-orange-500"
                    transition={{
                      duration: 3,
                      delay: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.5, 0],
                    }}
                    className="-translate-x-1/2 -translate-y-1/2 absolute top-[58%] left-[40%] h-3 w-3 rounded-full border-2 border-orange-500"
                    transition={{
                      duration: 3,
                      delay: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>

              {/* Static badge - no animation */}
              <div className="-right-4 -bottom-4 absolute rounded-2xl border-2 border-white bg-orange-500 px-6 py-4 shadow-2xl">
                <div className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-white">
                  {plan.commission}%
                </div>
                <div className="text-orange-100 text-xs uppercase tracking-wider">Service Fee</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Pricing Details */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Plan header */}
            <div className="mb-8">
              <motion.h3
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.7 }}
              >
                {plan.name}
              </motion.h3>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-neutral-600"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.8 }}
              >
                {plan.description}
              </motion.p>
            </div>

            {/* Features with staggered animation */}
            <motion.ul
              animate={{ opacity: 1 }}
              className="mb-10 space-y-4"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.9 }}
            >
              {plan.features.map((feature, idx) => (
                <motion.li
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  key={feature}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <HugeiconsIcon
                      className="h-4 w-4 text-green-700"
                      icon={CheckmarkCircle01Icon}
                    />
                  </div>
                  <span className="text-neutral-700 leading-relaxed">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Button */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 1.5 }}
            >
              <Button
                asChild
                className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30"
                variant="default"
              >
                <Link href={plan.ctaHref}>
                  <span className="relative z-10">{plan.ctaText}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </Button>
            </motion.div>

            {/* Transparency note */}
            <motion.div
              animate={{ opacity: 1 }}
              className="mt-8 rounded-xl border border-neutral-200/60 bg-neutral-50 p-6"
              initial={{ opacity: 0 }}
              transition={{ delay: 1.6 }}
            >
              <p className="text-center text-neutral-600 text-sm leading-relaxed">
                <span className="font-semibold text-neutral-900">{t("footer.highlight")}</span>{" "}
                {t("footer.text")}
              </p>
              <Link
                className="mt-3 flex items-center justify-center gap-2 font-semibold text-orange-600 text-sm transition-colors hover:text-orange-700"
                href="/pricing"
              >
                {t("footer.link")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
