"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

/**
 * NewsletterCTA - Newsletter Subscription Component
 *
 * Lia Design System:
 * - Orange background with white text
 * - Sharp rectangular geometry
 * - Geist Sans typography
 * - Scroll-triggered animation
 */

export function NewsletterCTA() {
  return (
    <section className="relative bg-orange-500 py-16">
      <Container className="max-w-7xl px-4">
        <motion.div
          className="flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-white tracking-tight">
            Stay Updated
          </h2>
          <p className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-lg text-orange-50">
            Get the latest updates on new features, professional spotlights, and exclusive offers
            delivered to your inbox.
          </p>
          <form className="mt-2 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <input
              aria-label="Email address"
              className="flex-1 border-2 border-white bg-white px-6 py-4 font-[family-name:var(--font-geist-sans)] text-neutral-900 placeholder-neutral-500 transition-all focus:border-white focus:outline-none focus:ring-4 focus:ring-white/25"
              placeholder="your@email.com"
              required
              type="email"
            />
            <button
              className="border-2 border-white bg-white px-8 py-4 font-[family-name:var(--font-geist-sans)] font-semibold text-orange-500 transition-all hover:bg-orange-50"
              type="submit"
            >
              Subscribe
            </button>
          </form>
          <p className="font-[family-name:var(--font-geist-sans)] text-orange-100 text-sm">
            Join 2,500+ subscribers. Unsubscribe anytime.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
