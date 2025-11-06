"use client";

import {
  BabyBed01Icon,
  ChefHatIcon,
  FavouriteIcon,
  Home03Icon,
  PackageIcon,
  UserLove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

// Icon mapping for each service
const serviceIcons = {
  housekeeping: Home03Icon,
  childcare: BabyBed01Icon,
  relocation: PackageIcon,
  elderCare: UserLove01Icon,
  petCare: FavouriteIcon,
  lifestyle: ChefHatIcon,
} as const;

// Service metadata (non-translatable data)
const serviceMetadata = {
  housekeeping: {
    professionalCount: 145,
    rating: 4.8,
    reviewCount: 312,
    startingPrice: 2_500_000, // in cents
    responseTime: "<2 horas",
  },
  childcare: {
    professionalCount: 89,
    rating: 4.9,
    reviewCount: 267,
    startingPrice: 3_000_000,
    responseTime: "<2 horas",
  },
  relocation: {
    professionalCount: 62,
    rating: 4.7,
    reviewCount: 189,
    startingPrice: 5_000_000,
    responseTime: "<3 horas",
  },
  elderCare: {
    professionalCount: 76,
    rating: 4.9,
    reviewCount: 234,
    startingPrice: 3_500_000,
    responseTime: "<2 horas",
  },
  petCare: {
    professionalCount: 54,
    rating: 4.8,
    reviewCount: 178,
    startingPrice: 2_000_000,
    responseTime: "<3 horas",
  },
  lifestyle: {
    professionalCount: 43,
    rating: 4.7,
    reviewCount: 124,
    startingPrice: 4_000_000,
    responseTime: "<4 horas",
  },
} as const;

type ServiceKey = keyof typeof serviceIcons;

// Format price from cents to currency string
function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

export function ServicesSection() {
  const t = useTranslations("services");

  const serviceKeys: ServiceKey[] = [
    "housekeeping",
    "childcare",
    "relocation",
    "elderCare",
    "petCare",
    "lifestyle",
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-28" id="services">
      <Container>
        <div className="mx-auto max-w-6xl space-y-16 text-center">
          {/* Header */}
          <div className="space-y-5">
            <p className="tagline">{t("badge")}</p>
            <h2 className="type-serif-lg mx-auto max-w-3xl text-[var(--foreground)]">
              {t("title")}
            </h2>
          </div>

          {/* Service Cards Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => {
              const Icon = serviceIcons[key];
              const metadata = serviceMetadata[key];
              const { professionalCount, rating, reviewCount, startingPrice, responseTime } =
                metadata;

              return (
                <article
                  className="group hover:-translate-y-1 relative flex h-full flex-col items-start rounded-[28px] border border-[var(--border)] bg-white p-8 text-left shadow-[0_10px_40px_rgba(15,15,15,0.04)] transition-all duration-300 hover:border-[var(--red)]/20 hover:shadow-[0_20px_60px_rgba(15,15,15,0.12)]"
                  key={key}
                >
                  {/* Icon */}
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--red)]/10 transition-colors duration-300 group-hover:bg-[var(--red)]/20">
                    <HugeiconsIcon
                      className="h-7 w-7 text-[var(--red)] transition-transform duration-300 group-hover:scale-110"
                      icon={Icon}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="type-serif-sm mb-3 text-[var(--foreground)]">
                    {t(`items.${key}.title`)}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 flex-grow text-[var(--muted-foreground)] text-base leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>

                  {/* Trust Indicators */}
                  <div className="mb-4 w-full space-y-2 border-[var(--border)] border-t pt-4">
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon className="h-4 w-4 text-[var(--red)]" icon={FavouriteIcon} />
                        <span className="font-semibold text-[var(--foreground)]">{rating}</span>
                      </div>
                      <span className="text-[var(--muted-foreground)]">
                        ({reviewCount} {t("reviews")})
                      </span>
                    </div>

                    {/* Professional Count */}
                    <p className="text-[var(--muted-foreground)] text-sm">
                      {professionalCount}+ {t("professionals")}
                    </p>

                    {/* Response Time */}
                    <p className="text-[var(--muted-foreground)] text-sm">
                      {t("responsesIn")} {responseTime}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 w-full">
                    <p className="font-semibold text-[var(--foreground)] text-lg">
                      {t("from")} {formatPrice(startingPrice)}
                      <span className="text-[var(--muted-foreground)] text-sm">{t("perHour")}</span>
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--red)] px-6 py-3 font-semibold text-sm text-white transition-all duration-300 hover:bg-[var(--red-hover)] active:scale-95"
                    href={`/professionals?service=${key}`}
                  >
                    {t("cta")}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
