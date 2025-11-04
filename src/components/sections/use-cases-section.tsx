import { Container } from "@/components/ui/container";
import { useCaseFlows } from "@/lib/content";

export function UseCasesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="use-cases">
      <Container className="space-y-12 md:space-y-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="tagline">End-to-end marketplace flows</p>
            <h2 className="font-semibold text-[2.2rem] text-[var(--foreground)] leading-tight">
              Designed around the journeys that power Casaora
            </h2>
          </div>
          <p className="max-w-xl text-[var(--muted-foreground)] text-base">
            Each flow mirrors our product requirements and wireframes—so households and
            professionals know exactly what to expect from onboarding through repeat bookings.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {useCaseFlows.map((flow) => (
            <article
              className="flex h-full flex-col gap-5 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[0_20px_50px_rgba(18,17,15,0.05)]"
              key={flow.name}
            >
              <div className="space-y-1">
                <p className="font-semibold text-[var(--accent)] text-xs uppercase tracking-[0.15em]">
                  {flow.persona}
                </p>
                <h3 className="font-semibold text-[var(--foreground)] text-xl">{flow.name}</h3>
              </div>
              <p className="text-[var(--muted-foreground)] text-sm">{flow.summary}</p>
              <ul className="space-y-3 text-[var(--foreground)] text-sm">
                {flow.steps.map((step) => (
                  <li className="flex items-start gap-2" key={step}>
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--red)]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-alt)] px-4 py-3 text-[var(--muted-foreground)] text-xs">
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
