"use client";

import {
  ArrowRight01Icon,
  Location01Icon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type CityHeroSectionProps = {
  cityName: string;
  citySlug: string;
  locale: string;
  stats: {
    professionalCount: number;
    averageRating: number;
    totalReviews: number;
  };
  className?: string;
};

/**
 * City Landing Page Hero Section
 *
 * SEO-optimized hero section for city-specific landing pages following
 * 2025 local SEO best practices:
 *
 * - H1 includes city name + primary service keyword (first 100 words critical)
 * - Location-specific imagery and trust signals
 * - Clear CTA linked to professionals directory filtered by city
 * - Schema-compatible data structure
 * - Mobile-optimized responsive design
 *
 * Research shows top-ranking local pages see 612% increase in search traffic
 */
export function CityHeroSection({
  cityName,
  citySlug,
  locale: _locale,
  stats,
  className = "",
}: CityHeroSectionProps) {
  const t = useTranslations("city");

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-[var(--red)]/5 via-white to-[var(--red)]/5 ${className}`}
    >
      {/* Background Pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff5d46' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center">
            {/* Location Badge */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#ebe5d8] bg-white px-4 py-2 shadow-sm">
              <HugeiconsIcon className="h-4 w-4 text-[var(--red)]" icon={Location01Icon} />
              <span className="font-medium text-[var(--foreground)] text-sm">{cityName}</span>
            </div>

            {/* H1 - Critical for SEO (includes city name + primary keyword) */}
            <h1 className="type-serif-lg mb-6 text-[var(--foreground)]">
              {t("hero.title", { city: cityName })}
            </h1>

            {/* First 100 words critical for local SEO */}
            <p className="mb-8 text-[var(--muted-foreground)] text-lg leading-relaxed sm:text-xl">
              {t("hero.description", { city: cityName })}
            </p>

            {/* Trust Signals - Research shows local trust indicators improve conversion */}
            <div className="mb-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5 text-[var(--red)]" icon={UserGroupIcon} />
                <span className="font-semibold text-[var(--foreground)] text-base">
                  {stats.professionalCount}+ {t("hero.stats.professionals")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  className="h-5 w-5 fill-[var(--red)] text-[var(--red)]"
                  icon={StarIcon}
                />
                <span className="font-semibold text-[var(--foreground)] text-base">
                  {stats.averageRating.toFixed(1)} ({stats.totalReviews.toLocaleString()}{" "}
                  {t("hero.stats.reviews")})
                </span>
              </div>
            </div>

            {/* Primary CTA - Linked to professionals directory filtered by city */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--red)] px-8 py-4 font-semibold text-base text-white shadow-[0_4px_12px_rgba(255,93,70,0.22)] transition hover:bg-[var(--red-hover)]"
                href={`/professionals?city=${citySlug}`}
              >
                {t("hero.cta.primary")}
                <HugeiconsIcon
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  icon={ArrowRight01Icon}
                />
              </Link>

              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#ebe5d8] px-8 py-4 font-semibold text-[var(--foreground)] text-base transition hover:border-[var(--red)] hover:text-[var(--red)]"
                href="/how-it-works"
              >
                {t("hero.cta.secondary")}
              </Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative lg:flex lg:items-center">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--red)]/10 to-[var(--red)]/5 p-12 shadow-xl">
              {/* Placeholder for city-specific imagery */}
              <div className="relative aspect-square">
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <HugeiconsIcon className="h-24 w-24 text-[var(--red)]" icon={Location01Icon} />
                  <div className="text-center">
                    <p className="font-bold text-2xl text-[var(--foreground)]">{cityName}</p>
                    <p className="mt-2 text-[var(--muted-foreground)] text-base">
                      {t("hero.visualTagline")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 h-32 w-32 rounded-full bg-[var(--red)]/10 blur-3xl" />
              <div className="absolute bottom-8 left-8 h-32 w-32 rounded-full bg-[var(--red)]/10 blur-3xl" />
            </div>

            {/* Floating Stats Card */}
            <div className="-bottom-4 -left-4 absolute rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-lg lg:left-4">
              <p className="mb-2 font-semibold text-[var(--foreground)] text-sm">
                {t("hero.popularServices")}
              </p>
              <div className="flex flex-wrap gap-2">
                {["cleaning", "deepCleaning", "moving"].map((service) => (
                  <span
                    className="rounded-full bg-[var(--red)]/10 px-3 py-1 text-[var(--red)] text-xs"
                    key={service}
                  >
                    {t(`hero.services.${service}` as any)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
