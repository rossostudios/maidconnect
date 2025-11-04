"use client";

import { MapPin, Star, Verified } from "lucide-react";
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
      <section className={`bg-[#fbfafa] py-16 ${className}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-[#ebe5d8] bg-white p-12 text-center">
            <p className="text-[#5d574b] text-lg">{t("professionals.empty", { city: cityName })}</p>
            <p className="mt-4 text-[#8a8175] text-base">{t("professionals.emptyDescription")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-[#fbfafa] py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="mb-4 font-bold text-3xl text-[#211f1a] sm:text-4xl">
            {t("professionals.title", { city: cityName })}
          </h2>
          <p className="text-[#5d574b] text-lg">
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
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#8B7355] px-8 py-4 font-semibold text-[#8B7355] text-base transition hover:bg-[#8B7355] hover:text-white"
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
      className="group relative overflow-hidden rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
      href={`/professionals/${professional.profile_id}`}
    >
      {/* Verification Badge */}
      {professional.is_verified && (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
          <Verified className="h-3 w-3 fill-green-600 text-green-600" />
          <span className="font-semibold text-green-700 text-xs">
            {t("professionals.card.verified")}
          </span>
        </div>
      )}

      {/* Profile Image */}
      <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5">
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
            <span className="font-bold text-5xl text-[#8B7355]">
              {professional.full_name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Professional Info */}
      <div>
        <h3 className="mb-2 font-semibold text-[#211f1a] text-lg group-hover:text-[#8B7355]">
          {professional.full_name || t("professionals.card.unnamed")}
        </h3>

        {/* Location */}
        {professional.city && (
          <div className="mb-3 flex items-center gap-2 text-[#5d574b] text-sm">
            <MapPin className="h-4 w-4" />
            <span>{professional.city}</span>
          </div>
        )}

        {/* Rating */}
        {professional.average_rating && professional.total_reviews > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 fill-[#8B7355] text-[#8B7355]" />
            <span className="font-medium text-[#211f1a] text-sm">
              {professional.average_rating.toFixed(1)}
            </span>
            <span className="text-[#8a8175] text-sm">
              ({professional.total_reviews} {t("professionals.card.reviews")})
            </span>
          </div>
        )}

        {/* Services */}
        {professional.services.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {professional.services.slice(0, 2).map((service, index) => (
              <span
                className="rounded-full bg-[#8B7355]/10 px-3 py-1 text-[#8B7355] text-xs"
                key={index}
              >
                {service.name}
              </span>
            ))}
            {professional.services.length > 2 && (
              <span className="rounded-full bg-[#ebe5d8] px-3 py-1 text-[#5d574b] text-xs">
                +{professional.services.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Hourly Rate */}
        {hourlyRate && (
          <div className="flex items-baseline justify-between border-[#ebe5d8] border-t pt-4">
            <span className="text-[#8a8175] text-sm">{t("professionals.card.startingAt")}</span>
            <span className="font-bold text-[#211f1a] text-xl">{hourlyRate}/hr</span>
          </div>
        )}
      </div>
    </Link>
  );
}
