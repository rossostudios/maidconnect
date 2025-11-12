import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

/**
 * TestimonialsSection Component
 *
 * Displays client testimonials in a 2-column grid layout.
 * Shows all testimonials at once (no carousel).
 */
export function TestimonialsSection() {
  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-stone-100 py-16 sm:py-20 lg:py-24" id="testimonials">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-bold text-3xl text-stone-800 md:text-4xl">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-stone-600">
            Real experiences from families we've helped.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-8 transition-all duration-200 hover:border-stone-400 hover:shadow-lg"
              key={testimonial.handle}
            >
              {/* Quote */}
              <blockquote className="text-base text-stone-700 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-stone-400">
                  <AvatarImage
                    alt={testimonial.name}
                    src={testimonial.avatar || "/placeholder-professional.jpg"}
                  />
                  <AvatarFallback className="bg-stone-200 text-stone-700">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-stone-800">{testimonial.name}</p>
                  <p className="text-sm text-stone-600">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
