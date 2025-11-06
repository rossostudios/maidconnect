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
    <section className="bg-[#F5F0E8] py-16 sm:py-20 lg:py-24" id="testimonials">
      <Container className="max-w-5xl">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-3">
              <p className="tagline text-[#7a6d62]">Testimonials</p>
              <h2 className="serif-display-lg text-[#1A1614]">What Our Clients Say</h2>
            </div>

            {/* Navigation - Desktop */}
            {slides.length > 1 && (
              <div className="hidden gap-2 sm:flex">
                <button
                  aria-label="Previous"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white"
                  onClick={() => goTo(current - 1)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                </button>
                <button
                  aria-label="Next"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white"
                  onClick={() => goTo(current + 1)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
                </button>
              </div>
            )}
          </div>

          {/* Testimonial Card */}
          <div className="rounded-2xl border border-[#e8e5e0] bg-white p-8 shadow-lg sm:p-12">
            <div className="flex flex-col gap-8" key={active.handle}>
              {/* Quote */}
              <blockquote className="text-[#1A1614] text-lg leading-relaxed sm:text-xl">
                "{active.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-[#F5F0E8]">
                  <Image
                    alt={active.name}
                    className="object-cover"
                    fill
                    sizes="56px"
                    src={active.avatar || "/placeholder-professional.jpg"}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-[#1A1614] text-base">{active.name}</p>
                  <p className="text-[#7a6d62] text-sm">{active.location}</p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile */}
            {slides.length > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4 border-[#e8e5e0] border-t pt-8 sm:hidden">
                <button
                  aria-label="Previous"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white"
                  onClick={() => goTo(current - 1)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                </button>
                <span className="text-[#7a6d62] text-sm">
                  {current + 1} / {slides.length}
                </span>
                <button
                  aria-label="Next"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E85D48]/30 bg-white text-[#1A1614] transition hover:border-[#E85D48] hover:bg-[#E85D48] hover:text-white"
                  onClick={() => goTo(current + 1)}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
