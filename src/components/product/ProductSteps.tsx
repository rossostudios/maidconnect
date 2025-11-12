type ProductStepsSectionProps = {
  headline: string;
  description?: string;
  steps: Array<{
    number: string;
    title: string;
    description: string;
  }>;
};

export function ProductStepsSection({ headline, description, steps }: ProductStepsSectionProps) {
  return (
    <section className="border-[#e2e8f0] border-b bg-[#f8fafc] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="type-serif-lg text-center text-[#0f172a]">{headline}</h2>

        {description && (
          <p className="mx-auto mt-6 max-w-3xl text-center text-[#94a3b8] text-lg leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div className="text-center" key={step.number}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#64748b] font-semibold text-2xl text-[#f8fafc]">
                {step.number}
              </div>

              <h3 className="mt-6 font-semibold text-[#0f172a] text-xl">{step.title}</h3>

              <p className="mt-3 text-[#94a3b8] text-base leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
