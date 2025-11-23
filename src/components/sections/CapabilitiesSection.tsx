import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { productPillars } from "@/lib/content";
import { cn } from "@/lib/utils";

export function CapabilitiesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="capabilities">
      <Container>
        <Card className="border-neutral-800 bg-neutral-900 p-10 text-neutral-50 shadow-2xl md:p-14">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,_1fr)]">
            <div className="flex flex-col gap-6">
              <p className="font-semibold text-neutral-600 text-xs uppercase tracking-[0.15em]">
                Product pillars
              </p>
              <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
                A single platform connecting household needs with trusted talent
              </h2>
              <p className="text-base text-neutral-600">
                These modules map directly to the PRD—and guide what our engineering, product, and
                support teams prioritize across each release.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {productPillars.map((pillar) => (
                <Card
                  className={cn(
                    "flex flex-col gap-3 border-neutral-800 bg-neutral-900 p-6 text-left transition-colors",
                    "hover:border-neutral-700 hover:bg-neutral-850"
                  )}
                  key={pillar.title}
                >
                  <HugeiconsIcon className="h-6 w-6 text-neutral-600" icon={pillar.icon} />
                  <h3 className="font-semibold text-lg text-neutral-50">{pillar.title}</h3>
                  <p className="text-neutral-600 text-sm">{pillar.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}
