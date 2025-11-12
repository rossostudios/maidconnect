import { Container } from "@/components/ui/container";

/**
 * ProcessSection - Swiss Design System
 *
 * Clean 3-step process display following Swiss principles:
 * - Swiss numbering (01, 02, 03)
 * - Minimal borders
 * - Orange accent bars
 * - Satoshi for headings
 * - No rounded corners or heavy shadows
 */
export async function ProcessSection() {
  const steps = [
    {
      number: "01",
      label: "Brief",
      title: "Tell Us Your Needs",
      description:
        "Share your household requirements, preferences, and schedule through our simple intake form.",
    },
    {
      number: "02",
      label: "Curate",
      title: "We Handpick Candidates",
      description:
        "Our team reviews hundreds of profiles to select the best matches based on your specific criteria.",
    },
    {
      number: "03",
      label: "Place",
      title: "Meet and Hire",
      description:
        "Interview your top candidates and make your choice. We handle all contracts and onboarding.",
    },
  ];

  return (
    <section className="bg-neutral-50 py-24 md:py-32" id="how-it-works">
      <Container className="mx-auto max-w-7xl px-4">
        {/* Section Header - Swiss Typography */}
        <div className="mb-16">
          <h2
            className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
          >
            How It Works
          </h2>
          <div className="mt-4 h-1 w-16 bg-orange-500" />
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
            Three simple steps to finding your perfect household professional.
          </p>
        </div>

        {/* Steps Grid - 3 Columns */}
        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div className="group" key={step.number}>
              {/* Swiss Number - Large and Bold */}
              <div className="mb-6">
                <div
                  className="font-bold text-6xl text-neutral-900 tracking-tighter"
                  style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                >
                  {step.number}
                </div>
                {/* Label - Uppercase */}
                <div className="mt-2 font-mono text-neutral-400 text-xs uppercase tracking-wider">
                  {step.label}
                </div>
              </div>

              {/* Orange Accent Bar */}
              <div className="mb-6 h-1 w-12 bg-orange-500" />

              {/* Content */}
              <h3
                className="font-semibold text-neutral-900 text-xl tracking-tight"
                style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
              >
                {step.title}
              </h3>

              <p className="mt-3 text-base text-neutral-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
