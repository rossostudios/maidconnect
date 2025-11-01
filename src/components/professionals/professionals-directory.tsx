"use client";

import { Filter, Heart, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Link } from "@/i18n/routing";
import { type FilterState, ProfessionalsFilterSheet } from "./professionals-filter-sheet";
import {
  OnTimeRateBadge,
  RatingBadge,
  VerificationBadge,
  type VerificationLevel,
} from "./verification-badge";

export type DirectoryProfessional = {
  id: string;
  name: string;
  service: string | null;
  experienceYears: number | null;
  hourlyRateCop: number | null;
  languages: string[];
  city: string | null;
  country: string | null;
  location: string;
  availableToday: boolean;
  photoUrl: string;
  bio: string | null;
  // Week 3-4 enhanced trust signals
  verificationLevel?: VerificationLevel;
  rating?: number;
  reviewCount?: number;
  onTimeRate?: number; // 0-100 percentage
  // Enhanced stats
  totalCompletedBookings?: number;
  totalEarnings?: number; // in COP cents
  favoritesCount?: number;
};

function formatCurrencyCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProfessionalsDirectoryProps = {
  professionals: DirectoryProfessional[];
};

export function ProfessionalsDirectory({ professionals }: ProfessionalsDirectoryProps) {
  const t = useTranslations("professionalsDirectory");
  const searchParams = useSearchParams();
  const [serviceFilter, setServiceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availableToday, setAvailableToday] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Week 3-4 feature flag
  const showEnhancedTrustBadges = useFeatureFlag("enhanced_trust_badges");

  const ratingOptions = [
    { value: "all", label: t("filters.allRatings") },
    { value: "4.5", label: t("filters.rating45") },
    { value: "4.8", label: t("filters.rating48") },
  ];

  const serviceOptions = useMemo(() => {
    const unique = new Set<string>();
    professionals.forEach((professional) => {
      if (professional.service) {
        unique.add(professional.service);
      }
    });
    return ["all", ...Array.from(unique)];
  }, [professionals]);

  const cityOptions = useMemo(() => {
    const unique = new Set<string>();
    professionals.forEach((professional) => {
      if (professional.city) {
        unique.add(professional.city);
      }
    });
    return ["all", ...Array.from(unique)];
  }, [professionals]);

  useEffect(() => {
    const param = searchParams.get("service");
    if (!param) {
      return;
    }

    const normalizedParam = param.toLowerCase();
    const match = serviceOptions.find((option) => {
      if (option === "all") {
        return false;
      }
      const normalizedOption = option.toLowerCase();
      const slugifiedOption = normalizedOption.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return normalizedOption === normalizedParam || slugifiedOption === normalizedParam;
    });

    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServiceFilter(match);
    }
  }, [searchParams, serviceOptions]);

  const filteredProfessionals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return professionals.filter((professional) => {
      const matchesSearch =
        term.length === 0 ||
        professional.name.toLowerCase().includes(term) ||
        (professional.service ?? "").toLowerCase().includes(term) ||
        professional.location.toLowerCase().includes(term);

      const matchesService =
        serviceFilter === "all" ||
        (professional.service ?? "").toLowerCase() === serviceFilter.toLowerCase();
      const matchesCity =
        cityFilter === "all" ||
        (professional.city ?? "").toLowerCase() === cityFilter.toLowerCase();
      const matchesRating = ratingFilter === "all";
      const matchesAvailability = !availableToday || professional.availableToday;

      return matchesSearch && matchesService && matchesCity && matchesRating && matchesAvailability;
    });
  }, [availableToday, cityFilter, professionals, ratingFilter, searchTerm, serviceFilter]);

  const resetFilters = () => {
    setServiceFilter("all");
    setCityFilter("all");
    setRatingFilter("all");
    setAvailableToday(false);
    setSearchTerm("");
  };

  const handleApplyFilters = (filters: FilterState) => {
    setServiceFilter(filters.serviceFilter);
    setCityFilter(filters.cityFilter);
    setRatingFilter(filters.ratingFilter);
    setAvailableToday(filters.availableToday);
  };

  const activeFilterCount = [
    serviceFilter !== "all",
    cityFilter !== "all",
    ratingFilter !== "all",
    availableToday,
  ].filter(Boolean).length;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <header className="space-y-6 text-center">
          <h1 className="font-semibold text-5xl text-[#211f1a] tracking-tight sm:text-6xl lg:text-7xl">
            {t("header.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-[#5d574b] text-xl sm:text-2xl">
            {t("header.subtitle")}
          </p>
        </header>

        <div className="space-y-6 rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-5 h-6 w-6 text-[#a49c90]" />
              <input
                className="w-full rounded-full border border-[#e2ddd2] bg-[#fbfafa] py-4 pr-6 pl-14 text-[#211f1a] text-base shadow-black/5 shadow-inner outline-none transition focus:border-[#211f1a]"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("filters.search")}
                value={searchTerm}
              />
            </div>

            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#211f1a] bg-white px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:bg-[#211f1a] hover:text-white"
                onClick={() => setIsFilterSheetOpen(true)}
                type="button"
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#ff5d46] px-2 font-semibold text-white text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Filter Controls - Hidden on mobile */}
            <div className="hidden flex-wrap items-center gap-4 font-semibold text-[#5a5549] text-sm md:flex">
              <label className="flex items-center gap-2.5">
                <Filter className="h-5 w-5 text-[#211f1a]" />
                <span>{t("filters.service")}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
                  onChange={(event) => setServiceFilter(event.target.value)}
                  value={serviceFilter}
                >
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service === "all" ? t("filters.allServices") : service}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-[#211f1a]" />
                <span>{t("filters.city")}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
                  onChange={(event) => setCityFilter(event.target.value)}
                  value={cityFilter}
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city === "all" ? t("filters.allCities") : city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-[#211f1a]" />
                <span>{t("filters.rating")}</span>
                <select
                  className="rounded-full border border-[#e2ddd2] bg-[#fbfafa] px-4 py-2 text-sm transition focus:border-[#211f1a] focus:outline-none"
                  onChange={(event) => setRatingFilter(event.target.value)}
                  value={ratingFilter}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5">
                <input
                  checked={availableToday}
                  className="h-5 w-5 rounded border-[#e2ddd2] text-[#211f1a] focus:ring-[#211f1a]"
                  onChange={(event) => setAvailableToday(event.target.checked)}
                  type="checkbox"
                />
                <span>{t("filters.availableToday")}</span>
              </label>

              <button
                className="ml-auto rounded-full border-2 border-[#211f1a] bg-white px-5 py-2 font-semibold text-[#211f1a] text-sm transition hover:bg-[#211f1a] hover:text-white"
                onClick={resetFilters}
                type="button"
              >
                {t("filters.reset")}
              </button>
            </div>
          </div>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="rounded-[32px] border border-[#f0ece4] bg-[#fbfafa] p-12 text-center">
            <p className="text-[#5d574b] text-lg">{t("results.noResults")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProfessionals.map((professional) => (
              <article
                className="hover:-translate-y-0.5 overflow-hidden rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:border-[#211f1a] hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
                key={professional.id}
              >
                {/* Header Row: Profile + Stats + Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Profile Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#ebe5d8]">
                      <Image
                        alt={professional.name}
                        className="object-cover"
                        fill
                        src={professional.photoUrl}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h2 className="font-semibold text-xl text-[#211f1a] sm:text-2xl">
                        {professional.name}
                      </h2>
                      <p className="text-[#7d7566] text-sm">
                        {professional.service ?? t("card.flexibleServices")}
                      </p>
                      <div className="flex items-center gap-1.5 text-[#7d7566] text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{professional.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-full border-2 border-[#211f1a] bg-white p-2.5 transition hover:bg-[#f5f2ed]"
                      type="button"
                      aria-label={t("card.favorite")}
                    >
                      <Heart className="h-5 w-5 text-[#211f1a]" />
                    </button>
                    <Link
                      className="flex-1 rounded-full border-2 border-[#211f1a] bg-white px-6 py-2.5 text-center font-semibold text-[#211f1a] text-sm transition hover:bg-[#f5f2ed] sm:flex-none"
                      href={`/professionals/${professional.id}`}
                    >
                      {t("card.viewProfile")}
                    </Link>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-[#ebe5d8] border-b pb-4 text-sm">
                  {/* Total Earnings */}
                  {professional.totalEarnings !== undefined && professional.totalEarnings > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#211f1a]">
                        {formatCurrencyCOP(professional.totalEarnings)}
                      </span>
                      <span className="text-[#7d7566]">{t("card.earned")}</span>
                    </div>
                  )}

                  {/* Completed Bookings (Hires) */}
                  {professional.totalCompletedBookings !== undefined &&
                    professional.totalCompletedBookings > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#211f1a]">
                          {professional.totalCompletedBookings}
                        </span>
                        <span className="text-[#7d7566]">{t("card.hired")}</span>
                      </div>
                    )}

                  {/* Rating */}
                  {professional.rating !== undefined && professional.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-[#211f1a] text-[#211f1a]" />
                      <span className="font-semibold text-[#211f1a]">
                        {professional.rating.toFixed(1)}
                      </span>
                      {professional.reviewCount !== undefined && professional.reviewCount > 0 && (
                        <span className="text-[#7d7566]">({professional.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* Favorites Count */}
                  {professional.favoritesCount !== undefined && professional.favoritesCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#211f1a]">
                        {professional.favoritesCount}
                      </span>
                      <span className="text-[#7d7566]">{t("card.favorites")}</span>
                    </div>
                  )}
                </div>

                {/* Badges Row */}
                <div
                  className="mt-4 flex flex-wrap items-center gap-2 text-xs"
                  suppressHydrationWarning
                >
                  {showEnhancedTrustBadges && (
                    <>
                      {professional.verificationLevel &&
                        professional.verificationLevel !== "none" && (
                          <VerificationBadge level={professional.verificationLevel} size="sm" />
                        )}
                    </>
                  )}

                  {!showEnhancedTrustBadges && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1.5 font-semibold text-[#5a5549]">
                      <Star className="h-3.5 w-3.5 text-[#211f1a]" />
                      {t("card.newBadge")}
                    </span>
                  )}

                  {professional.languages.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-3 py-1.5 font-semibold text-[#5a5549]">
                      {professional.languages.join(" / ")}
                    </span>
                  )}

                  {professional.availableToday && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#211f1a] px-3 py-1.5 font-semibold text-white">
                      {t("filters.availableToday")}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {professional.bio && (
                  <p className="mt-4 text-[#7d7566] text-sm leading-relaxed">
                    {professional.bio.length > 200
                      ? `${professional.bio.slice(0, 200)}…`
                      : professional.bio}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Mobile Filter Sheet */}
        <ProfessionalsFilterSheet
          cityOptions={cityOptions}
          currentFilters={{
            serviceFilter,
            cityFilter,
            ratingFilter,
            availableToday,
          }}
          isOpen={isFilterSheetOpen}
          onApply={handleApplyFilters}
          onClose={() => setIsFilterSheetOpen(false)}
          serviceOptions={serviceOptions}
        />
      </Container>
    </section>
  );
}
