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
    <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        {badge && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border-2 border-[#8B7355] bg-[#8B7355]/5 px-4 py-2 font-semibold text-[#8B7355] text-sm">
              {badge}
            </span>
          </div>
        )}

        <h1 className="text-center font-semibold text-5xl text-[#211f1a] leading-tight sm:text-6xl lg:text-7xl">
          {headline}
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[#5d574b] text-xl leading-relaxed sm:text-2xl">
          {description}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-[#8B7355] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#9B8B7E]"
            href={primaryCTA.href}
          >
            {primaryCTA.label}
          </Link>

          {secondaryCTA && (
            <Link
              className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 font-semibold text-[#211f1a] text-base transition hover:border-[#8B7355] hover:text-[#8B7355]"
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
