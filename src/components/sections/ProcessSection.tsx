import { Container } from "@/components/ui/container";

export async function ProcessSection() {
  const steps = [
    {
      badge: "1 • Brief",
      title: "Tell Us Your Needs",
      description:
        "Share your household requirements, preferences, and schedule through our simple intake form.",
    },
    {
      badge: "2 • Curate",
      title: "We Handpick Candidates",
      description:
        "Our team reviews hundreds of profiles to select the best matches based on your specific criteria.",
    },
    {
      badge: "3 • Place",
      title: "Meet and Hire",
      description:
        "Interview your top candidates and make your choice. We handle all contracts and onboarding.",
    },
  ];

  return (
    <section className="bg-stone-50 py-16 sm:py-20 lg:py-24" id="how-it-works">
      <Container>
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="font-bold text-3xl text-stone-800 md:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-stone-600">
              Three simple steps to finding your perfect household professional.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                className="rounded-2xl border-2 border-stone-300 bg-stone-100 p-6 transition-all duration-200 hover:border-stone-400 hover:shadow-lg"
                key={step.badge}
              >
                <div className="mb-4 inline-block rounded-full bg-stone-700 px-3 py-1 font-semibold text-sm text-stone-50">
                  {step.badge}
                </div>
                <h3 className="font-semibold text-stone-800 text-xl">{step.title}</h3>
                <p className="mt-3 text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
