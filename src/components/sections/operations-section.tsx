import { Container } from "@/components/ui/container";
import { operationsHighlights } from "@/lib/content";

export function OperationsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container className="rounded-[40px] border border-[#ebe7e0] bg-[#fbfafa] p-8 shadow-[0_24px_70px_rgba(18,17,15,0.06)] md:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_minmax(0,_1.1fr)]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
              Operations playbook
            </p>
            <h2 className="text-[2.1rem] font-semibold leading-tight text-[#211f1a] sm:text-[2.3rem]">
              Built on the processes that keep every booking trustworthy
            </h2>
            <p className="text-base text-[#5d574b]">
              Our operations manual defines how professionals are vetted, bookings are governed, and
              issues are resolved. These pillars translate directly into product features and
              service expectations.
            </p>
            <div className="rounded-3xl border border-[#e2ddd2] bg-white px-5 py-4 text-sm text-[#4d473d] shadow-[0_16px_36px_rgba(18,17,15,0.04)]">
              Need the full SOPs? Message the operations team to access the latest version of the
              manual and training assets.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {operationsHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-[#e5dfd4] bg-white p-6 shadow-[0_18px_42px_rgba(18,17,15,0.05)]"
              >
                <h3 className="text-lg font-semibold text-[#211f1a]">{item.title}</h3>
                <p className="mt-3 text-sm text-[#5d574b]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
