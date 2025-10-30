import { Container } from "@/components/ui/container";
import { services } from "@/lib/content";

export function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              Services
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Curated professionals for every routine
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group flex h-full flex-col items-start rounded-[28px] border border-[#e5dfd4] bg-white p-8 text-left shadow-[0_10px_40px_rgba(15,15,15,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,15,15,0.12)] hover:backdrop-blur-sm"
              >
                <h3 className="text-2xl font-semibold text-[#211f1a]">{service.title}</h3>
                <p className="mt-3 text-base text-[#5d574b]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
