import { Container } from "@/components/ui/container";
import { useCaseFlows } from "@/lib/content";

export function UseCasesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="use-cases">
      <Container className="flex flex-col gap-12 md:gap-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <p className="font-medium text-gray-600 text-sm uppercase tracking-wider">
              End-to-end marketplace flows
            </p>
            <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
              Designed around the journeys that power Casaora
            </h2>
          </div>
          <p className="max-w-xl text-base text-gray-600">
            Each flow mirrors our product requirements and wireframes—so households and
            professionals know exactly what to expect from onboarding through repeat bookings.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {useCaseFlows.map((flow) => (
            <article
              className="flex h-full flex-col gap-5 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm"
              key={flow.name}
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#E85D48] text-xs uppercase tracking-[0.15em]">
                  {flow.persona}
                </p>
                <h3 className="font-semibold text-xl">{flow.name}</h3>
              </div>
              <p className="text-gray-600 text-sm">{flow.summary}</p>
              <ul className="flex flex-col gap-3 text-sm">
                {flow.steps.map((step) => (
                  <li className="flex items-start gap-2" key={step}>
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[#E85D48]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 text-xs">
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
