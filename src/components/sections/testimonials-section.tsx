"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

const TRANSITION = {
  type: "spring" as const,
  stiffness: 120,
  damping: 22,
};

export function TestimonialsSection() {
  const slides = useMemo(() => testimonials, []);
  const [current, setCurrent] = useState(0);

  const goTo = (index: number) => {
    const safeIndex = (index + slides.length) % slides.length;
    setCurrent(safeIndex);
  };

  const active = slides[current];

  // Don't render if no testimonials
  if (!active) {
    return null;
  }

  return (
    <section className="py-20 sm:py-24 lg:py-28" id="testimonials">
      <Container className="max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="tagline">Testimonials</p>
            <h2 className="type-serif-lg text-[var(--foreground)]">
              Trusted by Colombia&apos;s Finest Families
            </h2>
          </div>

          {slides.length > 1 && (
            <div className="hidden items-center gap-3 sm:flex">
              <button
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current - 1)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
              </button>
              <button
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current + 1)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[0_24px_70px_rgba(15,15,15,0.05)] sm:p-12 lg:p-16">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-12 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-start lg:gap-16"
              exit={{ opacity: 0, x: -32 }}
              initial={{ opacity: 0, x: 32 }}
              key={active.handle}
              transition={TRANSITION}
            >
              <div className="flex flex-col gap-6 lg:pt-2">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[var(--border)] sm:h-20 sm:w-20">
                    <Image
                      alt={active.name}
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={active.avatar || "/placeholder-professional.jpg"}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="font-semibold text-[var(--foreground)] text-sm uppercase tracking-[0.18em]">
                      {active.name}
                    </p>
                    <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.12em]">
                      {active.role || active.location}
                    </p>
                    <p className="mt-1 text-[var(--muted-foreground)] text-xs">{active.location}</p>
                  </div>
                </div>

                <div className="hidden gap-3 text-left text-[var(--muted-foreground)] text-xs uppercase tracking-[0.18em] opacity-60 lg:flex">
                  <span>{active.handle}</span>
                  <span>Casaora Client</span>
                </div>
              </div>

              <div className="flex flex-col gap-8 lg:gap-12">
                <blockquote className="type-serif-sm max-w-3xl text-left text-[clamp(18px,2.4vw,24px)] text-[var(--foreground)] leading-relaxed">
                  “{active.quote}”
                </blockquote>

                {(active.metrics?.length ?? 0) > 0 && (
                  <div className="grid gap-6 border-[var(--border)] border-t pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    {active.metrics?.map((metric) => (
                      <div className="flex flex-col gap-1 text-left" key={metric.label}>
                        <p className="font-semibold text-[var(--foreground)] text-base">
                          {metric.value}
                        </p>
                        <p className="text-[var(--muted-foreground)]/80 text-xs uppercase tracking-[0.08em]">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <div className="mt-10 flex items-center justify-between gap-4 border-[var(--border)] border-t pt-6 sm:hidden">
              <button
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current - 1)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
              </button>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                {current + 1} / {slides.length}
              </div>
              <button
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current + 1)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
