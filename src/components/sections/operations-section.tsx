import { Container } from "@/components/ui/container";
import { operationsHighlights } from "@/lib/content";

export function OperationsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container className="rounded-[40px] border border-gray-200 bg-gray-50 p-10 shadow-lg md:p-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_minmax(0,_1.1fr)]">
          <div className="flex flex-col gap-5">
            <p className="font-medium text-gray-600 text-sm uppercase tracking-wider">
              Operations playbook
            </p>
            <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
              Built on the processes that keep every booking trustworthy
            </h2>
            <p className="text-base text-gray-600">
              Our operations manual defines how professionals are vetted, bookings are governed, and
              issues are resolved. These pillars translate directly into product features and
              service expectations.
            </p>
            <div className="rounded-3xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-sm">
              Need the full SOPs? Message the operations team to access the latest version of the
              manual and training assets.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {operationsHighlights.map((item) => (
              <div
                className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
                key={item.title}
              >
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="mt-3 text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
