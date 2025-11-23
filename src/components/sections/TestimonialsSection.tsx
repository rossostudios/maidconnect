"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // For now we only showcase a single hero testimonial
  const _featured = testimonials[0];
  const brandLabel = "Trust & Safety";
  const quoteText =
    "Finding reliable help at home used to be so stressful. Casaora verified everything—background checks, interviews, reviews—so I could focus on my family. The booking process was simple, and our housekeeper has been wonderful.";
  const authorName = "Brooke S.";
  const authorRole = "Family · Medellín, Colombia";

  return (
    <section
      className="bg-neutral-50 px-5 py-10 sm:px-8 md:py-14 lg:px-12 xl:px-16"
      id="testimonials"
    >
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900/10 shadow-xl">
        {/* Gradient illustration backdrop */}
        <div className="absolute inset-0">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="/testimoninal1.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/45 via-neutral-900/15 to-neutral-900/50" />
        </div>

        <Container className="relative max-w-5xl py-10 md:py-14">
          <div className="text-center text-white">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-white/75 text-xs uppercase tracking-[0.24em]"
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              Trusted by families across Latin America
            </motion.p>
            <motion.h2
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-white leading-tight sm:text-[34px] md:text-[38px]"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              Trust and safety built in.
            </motion.h2>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-3 max-w-2xl text-sm text-white/80 sm:text-base"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, delay: 0.18 }}
            >
              Verified profiles, secure payments, and clear expectations. Simple, safe, and fair for
              families and professionals.
            </motion.p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 font-semibold text-sm text-white/80 uppercase tracking-[0.22em]">
            <span className="h-px w-16 bg-white/35" />
            <span className="whitespace-nowrap">{brandLabel}</span>
            <span className="h-px w-16 bg-white/35" />
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200/80 bg-[#fdfaf5] shadow-[0_20px_60px_-28px_rgba(15,23,42,0.42)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col justify-between px-7 py-9 sm:px-9 md:px-10 lg:px-10 lg:py-11">
                  <div>
                    <p className="font-semibold text-neutral-600 text-xs uppercase tracking-[0.18em]">
                      {brandLabel}
                    </p>
                    <blockquote className="mt-4 font-serif text-neutral-900 text-xl leading-[1.5] sm:text-[22px] md:text-[26px]">
                      &ldquo;{quoteText}&rdquo;
                    </blockquote>
                  </div>

                  <div className="border-neutral-200 border-t pt-6">
                    <p className="font-semibold text-base text-neutral-900">{authorName}</p>
                    <p className="mt-1 text-neutral-600 text-sm">{authorRole}</p>
                  </div>
                </div>

                <div className="relative min-h-[240px] w-full sm:min-h-[300px] lg:order-last lg:min-h-[420px]">
                  <div className="relative h-full w-full rounded-2xl bg-white/80 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <Image
                        alt={authorName}
                        className="object-cover"
                        fill
                        sizes="(min-width: 1024px) 420px, 100vw"
                        src="/Brooke.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
