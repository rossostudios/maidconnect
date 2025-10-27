import { Container } from "@/components/ui/container";
import { testimonials } from "@/lib/content";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 sm:py-16 lg:py-20">
      <Container className="rounded-[40px] border border-[#ece8df] bg-white p-8 shadow-[0_26px_75px_rgba(18,17,15,0.07)] md:p-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              Stories from the community
            </p>
            <h2 className="text-[2.1rem] font-semibold leading-tight text-[#211f1a] sm:text-[2.3rem]">
              Why expats rely on Maidconnect
            </h2>
          </div>
          <p className="max-w-xl text-base text-[#5d574b]">
            We listen, vet, and continuously support. Explore how clients describe the
            experience of having a concierge team watching over their home life.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.handle}
              className="flex h-full flex-col justify-between gap-6 rounded-[28px] border border-[#e6e0d4] bg-[#fbfafa] p-7 shadow-[0_22px_55px_rgba(18,17,15,0.06)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fd857f]/18 text-sm font-semibold text-[#8a3934]">
                  {testimonial.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#211f1a]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#938c7f]">{testimonial.location}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#514c41]">
                “{testimonial.quote}”
              </p>
              <div className="flex items-center justify-between text-xs font-semibold text-[#8a826d]">
                <span>{testimonial.handle}</span>
                <span className="flex items-center gap-1 text-[#fd857f]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index}>★</span>
                  ))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
