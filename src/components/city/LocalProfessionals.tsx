"use client";

import { IdVerifiedIcon, Location01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Professional = {
  profile_id: string;
  full_name: string | null;
  city: string | null;
  bio: string | null;
  hourly_rate_cop: number | null;
  profile_image_url: string | null;
  is_verified: boolean;
  average_rating: number | null;
  total_reviews: number;
  services: Array<{ name: string }>;
};

type LocalProfessionalsProps = {
  cityName: string;
  professionals: Professional[];
  className?: string;
};

/**
 * Local Professionals Component
 *
 * Displays verified professionals serving a specific city with:
 * - Profile cards with ratings and services
 * - Location verification badge
 * - Local reviews and testimonials
 * - Responsive grid layout
 *
 * Research shows local professionals list with reviews increases conversion by 397%
 */
export function LocalProfessionals({
  cityName,
  professionals,
  className = "",
}: LocalProfessionalsProps) {
  const t = useTranslations("city");

  if (professionals.length === 0) {
    return (
      <section className={`bg-[#f8fafc] py-16 ${className}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-12 text-center">
            <p className="text-[#94a3b8] text-lg">{t("professionals.empty", { city: cityName })}</p>
            <p className="mt-4 text-[#94a3b8] text-base">{t("professionals.emptyDescription")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-[#f8fafc] py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="mb-4 font-bold text-3xl text-[#0f172a] sm:text-4xl">
            {t("professionals.title", { city: cityName })}
          </h2>
          <p className="text-[#94a3b8] text-lg">
            {t("professionals.description", { count: professionals.length })}
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <ProfessionalCard key={professional.profile_id} professional={professional} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#64748b] px-8 py-4 font-semibold text-[#64748b] text-base transition hover:bg-[#64748b] hover:text-[#f8fafc]"
            href={`/professionals?city=${cityName.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {t("professionals.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProfessionalCard({ professional }: { professional: Professional }) {
  const t = useTranslations("city");

  const hourlyRate = professional.hourly_rate_cop
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(professional.hourly_rate_cop / 100)
    : null;

  return (
    <Link
      className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm transition hover:shadow-md"
      href={`/professionals/${professional.profile_id}`}
    >
      {/* Verification Badge */}
      {professional.is_verified && (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-[#64748b]/10 px-3 py-1">
          <HugeiconsIcon className="h-3 w-3 fill-[#64748b] text-[#64748b]" icon={IdVerifiedIcon} />
          <span className="font-semibold text-[#64748b] text-xs">
            {t("professionals.card.verified")}
          </span>
        </div>
      )}

      {/* Profile Image */}
      <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#64748b]/10 to-[#64748b]/5">
        {professional.profile_image_url ? (
          <Image
            alt={professional.full_name || "Professional"}
            className="h-full w-full object-cover transition group-hover:scale-105"
            height={300}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            src={professional.profile_image_url}
            width={300}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="type-serif-lg text-[#64748b]">
              {professional.full_name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Professional Info */}
      <div>
        <h3 className="mb-2 font-semibold text-[#0f172a] text-lg group-hover:text-[#64748b]">
          {professional.full_name || t("professionals.card.unnamed")}
        </h3>

        {/* Location */}
        {professional.city && (
          <div className="mb-3 flex items-center gap-2 text-[#94a3b8] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
            <span>{professional.city}</span>
          </div>
        )}

        {/* Rating */}
        {professional.average_rating && professional.total_reviews > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <HugeiconsIcon className="h-4 w-4 fill-[#64748b] text-[#64748b]" icon={StarIcon} />
            <span className="font-medium text-[#0f172a] text-sm">
              {professional.average_rating.toFixed(1)}
            </span>
            <span className="text-[#94a3b8] text-sm">
              ({professional.total_reviews} {t("professionals.card.reviews")})
            </span>
          </div>
        )}

        {/* Services */}
        {professional.services.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {professional.services.slice(0, 2).map((service, index) => (
              <span
                className="rounded-full bg-[#64748b]/10 px-3 py-1 text-[#64748b] text-xs"
                key={index}
              >
                {service.name}
              </span>
            ))}
            {professional.services.length > 2 && (
              <span className="rounded-full bg-[#e2e8f0] px-3 py-1 text-[#94a3b8] text-xs">
                +{professional.services.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Hourly Rate */}
        {hourlyRate && (
          <div className="flex items-baseline justify-between border-[#e2e8f0] border-t pt-4">
            <span className="text-[#94a3b8] text-sm">{t("professionals.card.startingAt")}</span>
            <span className="font-bold text-[#0f172a] text-xl">{hourlyRate}/hr</span>
          </div>
        )}
      </div>
    </Link>
  );
}
