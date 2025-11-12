import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

/**
 * TestimonialsSection - Swiss Design System
 *
 * Minimalist testimonials display following Swiss principles:
 * - Clean borders (no rounded corners)
 * - Orange quotation marks
 * - Satoshi for headings
 * - Simple avatar styling
 * - Neutral color palette
 */
export function TestimonialsSection() {
  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-24 md:py-32" id="testimonials">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Section Header - Swiss Typography */}
        <div className="mb-16">
          <h2
            className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
          >
            What Our Clients Say
          </h2>
          <div className="mt-4 h-1 w-16 bg-orange-500" />
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
            Real experiences from families we've helped.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              className="border border-neutral-200 bg-white p-8 transition-all hover:border-neutral-300"
              key={testimonial.handle}
            >
              {/* Orange Quotation Mark - Swiss Accent */}
              <div className="mb-6">
                <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Quote */}
              <blockquote className="text-base text-neutral-700 leading-relaxed">
                {testimonial.quote}
              </blockquote>

              {/* Orange Accent Bar */}
              <div className="my-6 h-px w-12 bg-orange-500" />

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-neutral-200">
                  <AvatarImage
                    alt={testimonial.name}
                    src={testimonial.avatar || "/placeholder-professional.jpg"}
                  />
                  <AvatarFallback className="bg-neutral-100 text-neutral-600">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className="font-semibold text-neutral-900 tracking-tight"
                    style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                  >
                    {testimonial.name}
                  </p>
                  <p className="text-neutral-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
