"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

/**
 * TestimonialsSection - Simplified Editorial Design
 *
 * Designed to work gracefully with 1-3 testimonials:
 * - Large, centered quote with generous spacing
 * - Serif typography for editorial feel
 * - Decorative quote mark
 * - Warm, refined aesthetic
 * - Staggered animations for visual interest
 */
export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Show only first 3 testimonials for clean, focused layout
  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32" id="testimonials">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />
      </div>

      <Container className="relative max-w-5xl px-4">
        {/* Section Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 inline-block rounded-full border border-orange-200 bg-orange-50 px-5 py-2"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="font-semibold text-orange-600 text-sm uppercase tracking-wider">
              Testimonials
            </span>
          </motion.div>
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 font-[family-name:var(--font-geist-sans)] font-normal text-4xl text-neutral-900 tracking-tight md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Trusted by Families Across Colombia
          </motion.h2>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-lg text-neutral-600"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Real experiences from discerning households who trust Casaora
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-1">
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              key={testimonial.handle}
              transition={{ duration: 0.7, delay: 0.5 + index * 0.15 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-10 shadow-lg transition-all duration-300 hover:shadow-2xl md:p-14">
                {/* Decorative Quote Mark */}
                <div className="absolute top-6 right-6 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <svg
                    className="h-24 w-24 text-orange-500 md:h-32 md:w-32"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Quote */}
                <blockquote className="relative mb-8 font-serif text-2xl text-neutral-900 leading-relaxed md:text-3xl">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4 border-neutral-200 border-t pt-6">
                  {/* Avatar */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-orange-200 bg-orange-50">
                    {testimonial.avatar ? (
                      <img
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                        src={testimonial.avatar}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-semibold text-2xl text-orange-600">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Details */}
                  <div>
                    <p className="font-semibold text-lg text-neutral-900">{testimonial.name}</p>
                    <p className="text-neutral-600 text-sm">
                      {[testimonial.role, testimonial.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                {/* Optional: Outcome Badge */}
                {testimonial.outcome && (
                  <div className="absolute top-6 left-6">
                    <div className="rounded-full bg-green-50 px-4 py-1.5 text-green-700 text-xs">
                      ✓ {testimonial.outcome}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional: Coming Soon Message if only 1 testimonial */}
        {displayTestimonials.length === 1 && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <p className="text-neutral-500 text-sm">
              More families sharing their Casaora experiences soon
            </p>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
