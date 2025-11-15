import { Link } from "@/i18n/routing";

type ProductHeroSectionProps = {
  headline: string;
  description: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  badge?: string;
};

export function ProductHeroSection({
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
}: ProductHeroSectionProps) {
  return (
    <section className="border-[neutral-200] border-b bg-[neutral-50] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        {badge && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center border-2 border-[neutral-500] bg-[neutral-500]/5 px-4 py-2 font-semibold text-[neutral-500] text-sm">
              {badge}
            </span>
          </div>
        )}

        <h1 className="type-serif-display text-center text-[neutral-900]">{headline}</h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[neutral-400] text-xl leading-relaxed sm:text-2xl">
          {description}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center bg-[neutral-500] px-8 py-4 font-semibold text-[neutral-50] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[neutral-500]"
            href={primaryCTA.href}
          >
            {primaryCTA.label}
          </Link>

          {secondaryCTA && (
            <Link
              className="inline-flex items-center justify-center border-2 border-[neutral-200] bg-[neutral-50] px-8 py-4 font-semibold text-[neutral-900] text-base transition hover:border-[neutral-500] hover:text-[neutral-500]"
              href={secondaryCTA.href}
            >
              {secondaryCTA.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
