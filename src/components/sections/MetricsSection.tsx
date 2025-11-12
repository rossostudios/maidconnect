import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * MetricsSection Component
 *
 * Displays 3 key metrics in a horizontal grid.
 * Shows client retention, placement speed, and average rating.
 */
export function MetricsSection() {
  const metrics = [
    {
      value: "95%",
      label: "Client Retention Rate",
      description: "Clients stay with us year after year",
    },
    {
      value: "5 days",
      label: "Average Time to Shortlist",
      description: "Fast, efficient candidate matching",
    },
    {
      value: "4.9★",
      label: "Average Rating",
      description: "Consistently excellent service",
    },
  ];

  return (
    <section className="w-full bg-stone-900 py-16 md:py-24">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <div
              className={cn(
                "text-center",
                index < metrics.length - 1 && "sm:border-stone-700 sm:border-r"
              )}
              key={metric.label}
            >
              <div className="font-bold font-serif text-4xl text-white md:text-5xl">
                {metric.value}
              </div>
              <div className="mt-2 font-semibold text-sm text-stone-300 uppercase tracking-wider">
                {metric.label}
              </div>
              <div className="mt-1 text-sm text-stone-400">{metric.description}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
