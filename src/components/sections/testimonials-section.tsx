import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="testimonials">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="font-semibold text-[#a49c90] text-sm uppercase tracking-[0.32em]">
              Testimonials
            </p>
            <h2 className="mx-auto max-w-3xl font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              Trusted by Colombia's Finest Families
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                className="flex flex-col gap-6 rounded-[28px] border border-[#e6e0d4] bg-[#fbfafa] p-10 text-left shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
                key={testimonial.handle}
              >
                <div className="flex flex-col gap-4">
                  <p className="text-2xl text-[#211f1a] leading-relaxed">"{testimonial.quote}"</p>
                  {testimonial.outcome && (
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700 text-sm">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <title>Success checkmark</title>
                        <path
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          fillRule="evenodd"
                        />
                      </svg>
                      {testimonial.outcome}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B7355] font-semibold text-base text-white">
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#211f1a] text-base">{testimonial.name}</p>
                    <p className="text-[#938c7f] text-sm">{testimonial.location}</p>
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
