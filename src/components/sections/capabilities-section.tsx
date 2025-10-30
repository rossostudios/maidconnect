import { Container } from "@/components/ui/container";
import { productPillars } from "@/lib/content";

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="rounded-[44px] border border-[#1b1916] bg-[#11100e] p-8 text-white shadow-[0_35px_90px_rgba(0,0,0,0.4)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_minmax(0,_1fr)]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b1aca5]">
                Product pillars
              </p>
              <h2 className="text-[2.1rem] font-semibold leading-tight sm:text-[2.3rem]">
                A single platform connecting household needs with trusted talent
              </h2>
              <p className="text-base text-[#c1bbb1]">
                These modules map directly to the PRD—and guide what our engineering,
                product, and concierge teams prioritize across each release.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {productPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="flex flex-col gap-3 rounded-[28px] border border-[#26231f] bg-[#181612] p-6 text-left transition hover:border-[#ff5d46]/60"
                >
                  <pillar.icon className="h-6 w-6 text-[#ff5d46]" />
                  <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="text-sm text-[#cfc8be]">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
