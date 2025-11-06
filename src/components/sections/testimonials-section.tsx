"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

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
    <section className="bg-[var(--background-alt)] py-20 sm:py-28" id="testimonials">
      <Container className="max-w-5xl px-6 sm:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <p className="font-medium text-[var(--muted-foreground)] text-sm uppercase tracking-wider">
              Testimonials
            </p>
            <h2 className="type-serif-lg text-[var(--foreground)]">What Our Clients Say</h2>
          </div>

          {/* Navigation - Desktop */}
          {slides.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current - 1)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              </button>
              <button
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current + 1)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
              </button>
            </div>
          )}
        </div>

        {/* Testimonial Card */}
        <div className="rounded-lg bg-white p-8 shadow-sm sm:p-12">
          <div className="space-y-8" key={active.handle}>
            {/* Quote */}
            <blockquote className="text-[var(--foreground)] text-lg leading-relaxed sm:text-xl">
              "{active.quote}"
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                <Image
                  alt={active.name}
                  className="object-cover"
                  fill
                  sizes="56px"
                  src={active.avatar || "/placeholder-professional.jpg"}
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[var(--foreground)] text-base">{active.name}</p>
                <p className="text-[var(--muted-foreground)] text-sm">{active.location}</p>
              </div>
            </div>
          </div>

          {/* Navigation - Mobile */}
          {slides.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 border-gray-200 border-t pt-8 sm:hidden">
              <button
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current - 1)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              </button>
              <span className="text-[var(--muted-foreground)] text-sm">
                {current + 1} / {slides.length}
              </span>
              <button
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-white"
                onClick={() => goTo(current + 1)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
