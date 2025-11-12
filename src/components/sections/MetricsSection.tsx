import { Container } from "@/components/ui/container";

/**
 * MetricsSection - Swiss Design System
 *
 * Bold metrics display following Swiss principles:
 * - Large, impactful numbers with Satoshi
 * - Minimal decoration
 * - High contrast (dark background)
 * - Orange accent for emphasis
 * - Precise spacing and alignment
 */
export function MetricsSection() {
  const metrics = [
    {
      value: "95%",
      label: "Client Retention",
      description: "Clients who stay year after year",
    },
    {
      value: "5 days",
      label: "To Shortlist",
      description: "Fast, efficient candidate matching",
    },
    {
      value: "4.9★",
      label: "Average Rating",
      description: "Consistently excellent service",
    },
  ];

  return (
    <section className="w-full bg-neutral-900 py-24 md:py-32">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Grid Layout - 3 Equal Columns */}
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {metrics.map((metric) => (
            <div className="text-center md:text-left" key={metric.label}>
              {/* Metric Number - Huge and Bold */}
              <div
                className="font-bold text-6xl text-white tracking-tighter md:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
              >
                {metric.value}
              </div>

              {/* Metric Label - Swiss Typography */}
              <div className="mt-4 font-medium text-neutral-400 text-sm uppercase tracking-widest">
                {metric.label}
              </div>

              {/* Description */}
              <p className="mt-3 text-neutral-500 text-sm leading-relaxed">{metric.description}</p>

              {/* Orange Accent Bar */}
              <div className="mx-auto mt-6 h-1 w-12 bg-orange-500 md:mx-0" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
