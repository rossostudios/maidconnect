import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { useCaseFlows } from "@/lib/content";

export function UseCasesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="use-cases">
      <Container className="flex flex-col gap-12 md:gap-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <p className="font-medium text-stone-600 text-sm uppercase tracking-wider">
              End-to-end marketplace flows
            </p>
            <h2 className="font-semibold text-3xl text-stone-900 leading-tight sm:text-4xl">
              Designed around the journeys that power Casaora
            </h2>
          </div>
          <p className="max-w-xl text-base text-stone-600">
            Each flow mirrors our product requirements and wireframes—so households and
            professionals know exactly what to expect from onboarding through repeat bookings.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {useCaseFlows.map((flow) => (
            <Card
              className="flex h-full flex-col rounded-3xl border-stone-200 bg-white shadow-sm"
              key={flow.name}
            >
              <CardHeader className="flex flex-col gap-1">
                <Badge
                  className="w-fit rounded-full bg-stone-900/10 px-2.5 py-1 font-semibold text-stone-900 text-xs uppercase tracking-[0.15em]"
                  variant="secondary"
                >
                  {flow.persona}
                </Badge>
                <h3 className="font-semibold text-stone-900 text-xl">{flow.name}</h3>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="text-stone-600 text-sm">{flow.summary}</p>
                <ul className="flex flex-col gap-3 text-sm">
                  {flow.steps.map((step) => (
                    <li className="flex items-start gap-2" key={step}>
                      <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-stone-900" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                <Card className="rounded-2xl border-stone-200 bg-stone-50 px-4 py-3 text-stone-600 text-xs">
                  <CardContent className="p-0">
                    Interactive wireframes are available in the internal prototype. Replace this
                    card with live embeds when ready.
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
