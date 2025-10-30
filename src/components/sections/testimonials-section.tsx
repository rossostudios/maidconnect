import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              Testimonials
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Trusted by expats across Colombia
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.handle}
                className="flex flex-col gap-6 rounded-[28px] border border-[#e6e0d4] bg-[#fbfafa] p-10 text-left shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
              >
                <p className="text-2xl leading-relaxed text-[#211f1a]">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff5d46] text-base font-semibold text-white">
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#211f1a]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#938c7f]">{testimonial.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
