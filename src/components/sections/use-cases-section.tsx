import { Container } from "@/components/ui/container";
import { useCaseFlows } from "@/lib/content";

export function UseCasesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20" id="use-cases">
      <Container className="space-y-8 md:space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="font-semibold text-[#a49c90] text-xs uppercase tracking-[0.32em]">
              End-to-end marketplace flows
            </p>
            <h2 className="font-semibold text-[#211f1a] text-[2.2rem] leading-tight">
              Designed around the journeys that power Maidconnect
            </h2>
          </div>
          <p className="max-w-xl text-[#5d574b] text-base">
            Each flow mirrors our product requirements and wireframes—so households and
            professionals know exactly what to expect from onboarding through repeat bookings.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {useCaseFlows.map((flow) => (
            <article
              className="flex h-full flex-col gap-5 rounded-[32px] border border-[#e5dfd4] bg-white p-7 shadow-[0_20px_50px_rgba(18,17,15,0.05)]"
              key={flow.name}
            >
              <div className="space-y-1">
                <p className="font-semibold text-[#ff5d46] text-xs uppercase tracking-[0.26em]">
                  {flow.persona}
                </p>
                <h3 className="font-semibold text-[#211f1a] text-xl">{flow.name}</h3>
              </div>
              <p className="text-[#5d574b] text-sm">{flow.summary}</p>
              <ul className="space-y-3 text-[#4d473d] text-sm">
                {flow.steps.map((step) => (
                  <li className="flex items-start gap-2" key={step}>
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[#ff5d46]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-[#f0ebe0] bg-[#fbfafa] px-4 py-3 text-[#7a7263] text-xs">
                Interactive wireframes are available in the internal prototype. Replace this card
                with live embeds when ready.
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
