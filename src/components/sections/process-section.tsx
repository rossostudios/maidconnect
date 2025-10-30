import { Container } from "@/components/ui/container";
import { steps } from "@/lib/content";

export function ProcessSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              How it works
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              From search to support in four simple steps
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5d46] text-xl font-semibold text-white">
                  {item.step}
                </span>
                <h3 className="mt-6 text-xl font-semibold text-[#211f1a]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base text-[#5d574b]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
