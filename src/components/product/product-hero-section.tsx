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
    <section className="border-[#e2e8f0] border-b bg-[#f8fafc] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        {badge && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border-2 border-[#64748b] bg-[#64748b]/5 px-4 py-2 font-semibold text-[#64748b] text-sm">
              {badge}
            </span>
          </div>
        )}

        <h1 className="type-serif-display text-center text-[#0f172a]">{headline}</h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[#94a3b8] text-xl leading-relaxed sm:text-2xl">
          {description}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-[#64748b] px-8 py-4 font-semibold text-[#f8fafc] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b]"
            href={primaryCTA.href}
          >
            {primaryCTA.label}
          </Link>

          {secondaryCTA && (
            <Link
              className="inline-flex items-center justify-center rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-8 py-4 font-semibold text-[#0f172a] text-base transition hover:border-[#64748b] hover:text-[#64748b]"
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
