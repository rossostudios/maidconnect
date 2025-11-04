import { Container } from "@/components/ui/container";
import { operationsHighlights } from "@/lib/content";

export function OperationsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container className="rounded-[40px] border border-[var(--border)] bg-[var(--background-alt)] p-10 shadow-[0_24px_70px_rgba(18,17,15,0.06)] md:p-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_minmax(0,_1.1fr)]">
          <div className="space-y-5">
            <p className="tagline">Operations playbook</p>
            <h2 className="font-semibold text-[2.1rem] text-[var(--foreground)] leading-tight sm:text-[2.3rem]">
              Built on the processes that keep every booking trustworthy
            </h2>
            <p className="text-[var(--muted-foreground)] text-base">
              Our operations manual defines how professionals are vetted, bookings are governed, and
              issues are resolved. These pillars translate directly into product features and
              service expectations.
            </p>
            <div className="rounded-3xl border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] text-sm shadow-[0_16px_36px_rgba(18,17,15,0.04)]">
              Need the full SOPs? Message the operations team to access the latest version of the
              manual and training assets.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {operationsHighlights.map((item) => (
              <div
                className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_18px_42px_rgba(18,17,15,0.05)]"
                key={item.title}
              >
                <h3 className="font-semibold text-[var(--foreground)] text-lg">{item.title}</h3>
                <p className="mt-3 text-[var(--muted-foreground)] text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
