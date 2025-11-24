/**
 * Hero Section Component
 *
 * Renders hero section from Sanity CMS
 */

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/i18n/routing";
import { imageUrl } from "@/lib/integrations/sanity/imageUrl";

type HeroSectionProps = {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: {
      asset?: {
        _ref: string;
      };
      alt?: string;
    };
    showSearchBar?: boolean;
  };
};

export function HeroSection({ data }: HeroSectionProps) {
  const {
    title,
    subtitle,
    description,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    backgroundImage,
  } = data;

  const bgImageUrl = backgroundImage?.asset?._ref
    ? imageUrl(backgroundImage.asset._ref).width(1920).height(1080).url()
    : undefined;

  return (
    <section
      className="relative bg-[neutral-900] py-24 sm:py-32 lg:py-40"
      style={
        bgImageUrl
          ? {
              backgroundImage: `linear-gradient(rgba(26, 22, 20, 0.7), rgba(26, 22, 20, 0.7)), url(${bgImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {subtitle && <p className="tagline text-[neutral-50]/80">{subtitle}</p>}

          {title && <h1 className="serif-display-xl mt-6 text-[neutral-50]">{title}</h1>}

          {description && <p className="lead mt-8 text-[neutral-50]/90">{description}</p>}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {ctaText && ctaLink && (
              <Link
                className="inline-flex items-center justify-center gap-2 bg-[neutral-50] px-8 py-4 font-semibold text-[neutral-900] text-base transition hover:bg-[neutral-200]"
                href={ctaLink}
              >
                {ctaText}
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </Link>
            )}

            {secondaryCtaText && secondaryCtaLink && (
              <Link
                className="inline-flex items-center justify-center gap-2 border-2 border-[neutral-50] px-8 py-4 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-50]/10"
                href={secondaryCtaLink}
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
