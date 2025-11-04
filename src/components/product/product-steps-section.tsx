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
    <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="type-serif-lg text-center text-[var(--foreground)]">{headline}</h2>

        {description && (
          <p className="mx-auto mt-6 max-w-3xl text-center text-[var(--muted-foreground)] text-lg leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div className="text-center" key={step.number}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--red)] font-semibold text-2xl text-white">
                {step.number}
              </div>

              <h3 className="mt-6 font-semibold text-[var(--foreground)] text-xl">{step.title}</h3>

              <p className="mt-3 text-[var(--muted-foreground)] text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
