"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

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
    <section className="bg-stone-50 py-16 sm:py-20 lg:py-24" id="testimonials">
      <Container className="max-w-5xl">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-sm text-stone-600 uppercase tracking-wider">
                Testimonials
              </p>
              <h2 className="font-semibold text-3xl text-stone-900 tracking-tight sm:text-4xl">
                What Our Clients Say
              </h2>
            </div>

            {/* Navigation - Desktop */}
            {slides.length > 1 && (
              <div className="hidden gap-2 sm:flex">
                <button
                  aria-label="Previous"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                    "hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  )}
                  onClick={() => goTo(current - 1)}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                </button>
                <button
                  aria-label="Next"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                    "hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  )}
                  onClick={() => goTo(current + 1)}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
                </button>
              </div>
            )}
          </div>

          {/* Testimonial Card */}
          <Card className="rounded-2xl border-stone-200 bg-white shadow-lg">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col gap-8" key={active.handle}>
                {/* Quote */}
                <blockquote className="text-lg text-stone-900 leading-relaxed sm:text-xl">
                  "{active.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-stone-200">
                    <AvatarImage
                      alt={active.name}
                      src={active.avatar || "/placeholder-professional.jpg"}
                    />
                    <AvatarFallback className="bg-stone-100 text-stone-900">
                      {active.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-base text-stone-900">{active.name}</p>
                    <p className="text-sm text-stone-600">{active.location}</p>
                  </div>
                </div>
              </div>

              {/* Navigation - Mobile */}
              {slides.length > 1 && (
                <>
                  <Separator className="my-8 sm:hidden" />
                  <div className="flex items-center justify-center gap-4 sm:hidden">
                    <button
                      aria-label="Previous"
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                        "hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                      )}
                      onClick={() => goTo(current - 1)}
                      type="button"
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                    </button>
                    <span className="text-sm text-stone-600">
                      {current + 1} / {slides.length}
                    </span>
                    <button
                      aria-label="Next"
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-stone-900 transition-all",
                        "hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                      )}
                      onClick={() => goTo(current + 1)}
                      type="button"
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}
