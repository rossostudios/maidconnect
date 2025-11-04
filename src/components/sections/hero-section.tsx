"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedMarquee } from "@/components/ui/animated-marquee";
import { Container } from "@/components/ui/container";
import { HeroSearchBar } from "@/components/ui/hero-search-bar";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <>
      {/* Animated Marquee - Staays Style */}
      <AnimatedMarquee speed={25} text="FIND THE WORLD'S BEST HOME PROFESSIONALS" />

      {/* Modern 2026 Hero */}
      <section className="relative bg-[var(--background)] py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--muted-foreground)] text-xs uppercase tracking-[0.12em] will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {t("badge")}
            </motion.div>

            {/* Main Headline - Massive, Bold, Clean */}
            <motion.h1
              className="type-serif-display mb-8 text-[var(--foreground)] will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {t("title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mb-12 max-w-2xl text-[var(--muted-foreground)] text-lg leading-relaxed will-change-transform motion-reduce:transform-none motion-reduce:opacity-100 sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {t("subtitle")}
            </motion.p>

            {/* Hero Search Bar - Staays Style */}
            <motion.div
              className="mb-12 will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
              data-tour="search"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <HeroSearchBar />
            </motion.div>

            {/* Stats Bar - Clean & Minimal */}
            <motion.div
              className="mt-20 grid gap-8 border-[var(--border)] border-t pt-12 will-change-transform motion-reduce:transform-none motion-reduce:opacity-100 sm:grid-cols-3"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="space-y-2 will-change-transform motion-reduce:scale-100 motion-reduce:opacity-100"
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, scale: 1 }}
              >
                <p className="type-serif-md text-[var(--red)]">500+</p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("trustSignals.verified") || "Verified Professionals"}
                </p>
              </motion.div>
              <motion.div
                className="space-y-2 will-change-transform motion-reduce:scale-100 motion-reduce:opacity-100"
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, scale: 1 }}
              >
                <p className="type-serif-md text-[var(--red)]">15+</p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("trustSignals.cities") || "Cities Worldwide"}
                </p>
              </motion.div>
              <motion.div
                className="space-y-2 will-change-transform motion-reduce:scale-100 motion-reduce:opacity-100"
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, scale: 1 }}
              >
                <p className="type-serif-md text-[var(--red)]">4.9★</p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("trustSignals.rating") || "Average Rating"}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  );
}
