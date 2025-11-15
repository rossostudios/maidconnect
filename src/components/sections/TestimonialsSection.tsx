import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * TestimonialsSection - Aurius-inspired editorial layout
 *
 * - Centered badge + serif headline
 * - Featured story with portrait on the left and quote on the right
 * - Supporting quotes arranged in a bordered grid
 * - Subtle dividers + neutral paper background
 */
export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const [featured, ...supporting] = testimonials;
  const formatMeta = (role?: string, location?: string) =>
    [role, location].filter(Boolean).join(" · ");

  return (
    <section className="bg-neutral-50 py-16 md:py-20" id="testimonials">
      {/* Top horizontal divider */}
      <div className="mx-auto mb-16 h-px max-w-6xl bg-neutral-200" />

      <Container className="max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-4xl border border-neutral-200 px-6 py-12 text-center sm:px-12">
          <div className="mb-4 flex items-center justify-center gap-2 font-semibold text-[0.7rem] text-orange-600 uppercase tracking-[0.35em]">
            <span aria-hidden="true" className="h-2 w-2 bg-orange-500" />
            Testimonials
          </div>

          <h2 className="font-bold text-3xl text-neutral-900 leading-tight sm:text-4xl md:text-5xl">
            What Our Clients Say
          </h2>

          <p className="mt-5 text-lg text-neutral-600">
            Real stories from discerning households who trust Casaora to run their homes with
            precision.
          </p>
        </div>

        {/* Featured testimonial */}
        {featured && (
          <div className="mt-16 grid overflow-hidden border border-neutral-200 bg-white shadow-sm md:grid-cols-[minmax(0,320px)_1fr]">
            <div className="relative aspect-[4/5] w-full bg-neutral-100 md:min-h-[420px]">
              <Image
                alt={featured.name}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 768px) 320px, 100vw"
                src={featured.avatar || "/placeholder-professional.jpg"}
              />
            </div>

            <div className="flex flex-col gap-8 p-8 md:p-10">
              <blockquote className="font-serif text-2xl text-neutral-900 leading-snug md:text-3xl">
                “{featured.quote}”
              </blockquote>

              <div>
                <p className="font-semibold text-base text-neutral-900">{featured.name}</p>
                <p className="text-neutral-500 text-xs uppercase tracking-[0.35em]">
                  {formatMeta(featured.role, featured.location)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supporting testimonials */}
        {supporting.length > 0 && (
          <div className="mt-8 grid border border-neutral-200 bg-white sm:grid-cols-2">
            {supporting.map((testimonial, index) => (
              <div
                className={cn(
                  "border-neutral-200 p-8 sm:p-10",
                  index > 0 && "border-t",
                  index <= 1 && "sm:border-t-0",
                  index >= 2 && "sm:border-t",
                  index % 2 === 1 && "sm:border-l"
                )}
                key={testimonial.handle}
              >
                <blockquote className="font-serif text-neutral-900 text-xl leading-relaxed">
                  “{testimonial.quote}”
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
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
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-neutral-500 text-xs uppercase tracking-[0.35em]">
                      {formatMeta(testimonial.role, testimonial.location)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
