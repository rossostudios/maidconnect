import { Container } from "@/components/ui/container";
import { productPillars } from "@/lib/content";

export function CapabilitiesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="capabilities">
      <Container>
        <div className="rounded-[44px] border border-[#1b1916] bg-[#11100e] p-10 text-white shadow-[0_35px_90px_rgba(0,0,0,0.4)] md:p-14">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,_1fr)]">
            <div className="space-y-6">
              <p className="font-semibold text-[#b1aca5] text-xs uppercase tracking-[0.15em]">
                Product pillars
              </p>
              <h2 className="font-semibold text-[2.1rem] leading-tight sm:text-[2.3rem]">
                A single platform connecting household needs with trusted talent
              </h2>
              <p className="text-[#c1bbb1] text-base">
                These modules map directly to the PRD—and guide what our engineering, product, and
                concierge teams prioritize across each release.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {productPillars.map((pillar) => (
                <div
                  className="flex flex-col gap-3 rounded-[28px] border border-[#26231f] bg-[#181612] p-6 text-left transition hover:border-[var(--red)]/60"
                  key={pillar.title}
                >
                  <pillar.icon className="h-6 w-6 text-[var(--red)]" />
                  <h3 className="font-semibold text-lg text-white">{pillar.title}</h3>
                  <p className="text-[#cfc8be] text-sm">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
