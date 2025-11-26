"use client";

/**
 * TestimonialCards - Airbnb-Style Testimonial Cards
 *
 * Clean grid of testimonial cards showing real customer feedback.
 * Each card has: avatar, name, location, quote, rating stars.
 *
 * Design: Simple white cards on neutral background, star ratings.
 */

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/core";

type Testimonial = {
  id: string;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  service: string;
};

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Brooke S.",
    location: "Medellín, Colombia",
    avatar: "/review-brooke.png",
    quote:
      "Finding reliable help at home used to be so stressful. Casaora verified everything—background checks, interviews, reviews—so I could focus on my family.",
    rating: 5,
    service: "House Cleaning",
  },
  {
    id: "2",
    name: "Michael T.",
    location: "Bogotá, Colombia",
    avatar: "/avatars/michael.jpg",
    quote:
      "As an expat, trusting someone in my home was my biggest concern. Casaora's vetting process gave me confidence from day one. Highly recommend.",
    rating: 5,
    service: "Nanny Services",
  },
  {
    id: "3",
    name: "Sarah L.",
    location: "Buenos Aires, Argentina",
    avatar: "/avatars/sarah.jpg",
    quote:
      "The bilingual support made everything easy. Booked in English, communicated in Spanish with my cleaner. Simple and transparent pricing too.",
    rating: 5,
    service: "House Cleaning",
  },
  {
    id: "4",
    name: "Carlos R.",
    location: "Montevideo, Uruguay",
    avatar: "/avatars/carlos.jpg",
    quote:
      "Finally a platform that treats domestic workers fairly. Professionals keep their full rate, and I know exactly what I'm paying. Win-win.",
    rating: 5,
    service: "Elderly Care",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HugeiconsIcon
          className={cn("h-4 w-4", i < rating ? "text-rausch-500" : "text-muted-foreground/30")}
          icon={StarIcon}
          key={`star-${i}`}
        />
      ))}
    </div>
  );
}

type TestimonialCardsProps = {
  className?: string;
};

export function TestimonialCards({ className }: TestimonialCardsProps) {
  return (
    <section className={cn("bg-muted py-16 sm:py-20 lg:py-24", className)}>
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Trusted by families across Latin America
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Real reviews from real customers who found their perfect match
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              key={testimonial.id}
            >
              {/* Rating & Service */}
              <div className="mb-4 flex items-center justify-between">
                <StarRating rating={testimonial.rating} />
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
                  {testimonial.service}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-muted-foreground text-sm leading-relaxed sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 border-border border-t pt-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt={testimonial.name}
                    className="object-cover"
                    fill
                    sizes="40px"
                    src={testimonial.avatar}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-8 text-center text-muted-foreground text-sm sm:mt-10">
          All reviews are from verified bookings on Casaora
        </p>
      </Container>
    </section>
  );
}
