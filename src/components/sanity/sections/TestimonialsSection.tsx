/**
 * Testimonials Section Component
 *
 * Renders testimonials section from Sanity CMS
 */

import { Container } from "@/components/ui/container";

type Testimonial = {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
  rating: number;
};

type TestimonialsSectionProps = {
  data: {
    title?: string;
    description?: string;
    testimonials?: Testimonial[];
  };
};

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const { title, description, testimonials } = data;

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container>
        {(title || description) && (
          <div className="mb-16 text-center">
            {title && <h2 className="serif-display-lg text-[neutral-900]">{title}</h2>}
            {description && (
              <p className="lead mx-auto mt-6 max-w-2xl text-[neutral-900]/70">{description}</p>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              className="rounded-3xl border border-[neutral-200] bg-[neutral-50] p-8 shadow-sm"
              key={index}
            >
              <blockquote className="mb-6 text-[neutral-900] leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Rating stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    className={i < testimonial.rating ? "text-[neutral-500]" : "text-[neutral-400]"}
                    key={i}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[neutral-500]/100/10 font-semibold text-[neutral-500]">
                  {testimonial.authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[neutral-900]">{testimonial.authorName}</div>
                  {testimonial.authorRole && (
                    <div className="text-[neutral-900]/60 text-sm">{testimonial.authorRole}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
