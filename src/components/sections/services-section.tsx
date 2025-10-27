import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { services } from "@/lib/content";

export function ServicesSection() {
  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20">
      <Container className="rounded-[40px] border border-[#ebe7e0] bg-[#fbfafa] p-8 shadow-[0_22px_60px_rgba(18,17,15,0.06)] md:p-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              Services across Colombia
            </p>
            <h2 className="text-[2.2rem] font-semibold leading-tight text-[#211f1a]">
              Curated professionals for every household routine
            </h2>
          </div>
          <p className="max-w-xl text-base text-[#5d574b]">
            From high-rise apartments to coastal villas, we adapt to your lifestyle with
            bilingual experts and transparent support at every step.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group flex h-full flex-col justify-between rounded-[28px] border border-[#e5dfd4] bg-white p-7 shadow-[0_20px_45px_rgba(15,15,15,0.05)] transition hover:-translate-y-1 hover:border-[#fd857f]/40"
            >
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#fd857f]/15 px-3 py-1 text-xs font-semibold text-[#8a3934]">
                <service.icon className="h-3 w-3" />
                {service.badge}
              </div>
              <div className="mt-5 space-y-3">
                <h3 className="text-xl font-semibold text-[#211f1a]">
                  {service.title}
                </h3>
                <p className="text-sm text-[#5d574b]">{service.description}</p>
              </div>
              <Button
                href="#get-started"
                label="Match me with a pro"
                variant="ghost"
                icon
                className="justify-start px-0 py-0 text-sm font-semibold"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
