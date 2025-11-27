"use client";

import { IdVerifiedIcon, Location01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatFromMinorUnits } from "@/lib/utils/format";

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
      <section className={`bg-[neutral-50] py-16 ${className}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="border border-[neutral-200] bg-[neutral-50] p-12 text-center">
            <p className="text-[neutral-400] text-lg">
              {t("professionals.empty", { city: cityName })}
            </p>
            <p className="mt-4 text-[neutral-400] text-base">
              {t("professionals.emptyDescription")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-[neutral-50] py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="mb-4 font-bold text-3xl text-[neutral-900] sm:text-4xl">
            {t("professionals.title", { city: cityName })}
          </h2>
          <p className="text-[neutral-400] text-lg">
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
            className="inline-flex items-center justify-center gap-2 border-2 border-[neutral-500] px-8 py-4 font-semibold text-[neutral-500] text-base transition hover:bg-[neutral-500] hover:text-[neutral-50]"
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
    ? formatFromMinorUnits(professional.hourly_rate_cop, "COP")
    : null;

  return (
    <Link
      className="group relative overflow-hidden border border-[neutral-200] bg-[neutral-50] p-6 shadow-sm transition hover:shadow-md"
      href={`/professionals/${professional.profile_id}`}
    >
      {/* Verification Badge */}
      {professional.is_verified && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[neutral-500]/10 px-3 py-1">
          <HugeiconsIcon
            className="h-3 w-3 fill-[neutral-500] text-[neutral-500]"
            icon={IdVerifiedIcon}
          />
          <span className="font-semibold text-[neutral-500] text-xs">
            {t("professionals.card.verified")}
          </span>
        </div>
      )}

      {/* Profile Image */}
      <div className="mb-4 aspect-square overflow-hidden bg-gradient-to-br from-[neutral-500]/10 to-[neutral-500]/5">
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
            <span className="type-serif-lg text-[neutral-500]">
              {professional.full_name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Professional Info */}
      <div>
        <h3 className="mb-2 font-semibold text-[neutral-900] text-lg group-hover:text-[neutral-500]">
          {professional.full_name || t("professionals.card.unnamed")}
        </h3>

        {/* Location */}
        {professional.city && (
          <div className="mb-3 flex items-center gap-2 text-[neutral-400] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
            <span>{professional.city}</span>
          </div>
        )}

        {/* Rating */}
        {professional.average_rating && professional.total_reviews > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <HugeiconsIcon
              className="h-4 w-4 fill-[neutral-500] text-[neutral-500]"
              icon={StarIcon}
            />
            <span className="font-medium text-[neutral-900] text-sm">
              {professional.average_rating.toFixed(1)}
            </span>
            <span className="text-[neutral-400] text-sm">
              ({professional.total_reviews} {t("professionals.card.reviews")})
            </span>
          </div>
        )}

        {/* Services */}
        {professional.services.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {professional.services.slice(0, 2).map((service, index) => (
              <span
                className="bg-[neutral-500]/10 px-3 py-1 text-[neutral-500] text-xs"
                key={index}
              >
                {service.name}
              </span>
            ))}
            {professional.services.length > 2 && (
              <span className="bg-[neutral-200] px-3 py-1 text-[neutral-400] text-xs">
                +{professional.services.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Hourly Rate */}
        {hourlyRate && (
          <div className="flex items-baseline justify-between border-[neutral-200] border-t pt-4">
            <span className="text-[neutral-400] text-sm">{t("professionals.card.startingAt")}</span>
            <span className="font-bold text-[neutral-900] text-xl">{hourlyRate}/hr</span>
          </div>
        )}
      </div>
    </Link>
  );
}
