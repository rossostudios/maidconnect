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
    <section className="border-[neutral-200] border-b bg-[neutral-50] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="type-serif-lg text-center text-[neutral-900]">{headline}</h2>

        {description && (
          <p className="mx-auto mt-6 max-w-3xl text-center text-[neutral-400] text-lg leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div className="text-center" key={step.number}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[neutral-500] font-semibold text-2xl text-[neutral-50]">
                {step.number}
              </div>

              <h3 className="mt-6 font-semibold text-[neutral-900] text-xl">{step.title}</h3>

              <p className="mt-3 text-[neutral-400] text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
