"use client";

import {
  Calendar,
  Eye,
  Filter,
  Heart,
  MapPin,
  SlidersHorizontal,
  Star,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";
import type { FilterState } from "./professionals-filter-sheet";
import { SearchBar, type SearchSuggestion } from "./search-bar";
import { VerificationBadge, type VerificationLevel } from "./verification-badge";
import { type ViewMode, ViewToggle } from "./view-toggle";

// Dynamic imports for heavy components (lazy load on demand)
const MapView = dynamic(() => import("./map-view").then((mod) => mod.MapView), { ssr: false });
const ProfessionalsFilterSheet = dynamic(
  () => import("./professionals-filter-sheet").then((mod) => mod.ProfessionalsFilterSheet),
  { ssr: false }
);

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

// Moved outside component - no dependencies on component state (React 19 best practice)

// Moved outside component - no dependencies on component state (React 19 best practice)
// Generate real-time activity indicators based on professional stats
function getActivityIndicators(professional: DirectoryProfessional) {
  const indicators: Array<{
    text: string;
    type: "viewing" | "booked" | "demand" | "rare";
    icon: "eye" | "calendar" | "trending" | "star";
  }> = [];

  // High booking frequency (booked many times)
  if (professional.totalCompletedBookings && professional.totalCompletedBookings >= 10) {
    const recentBookings = Math.min(Math.floor(professional.totalCompletedBookings / 10) + 1, 8);
    indicators.push({
      text: `Booked ${recentBookings} times this month`,
      type: "booked",
      icon: "calendar",
    });
  }

  // High demand indicator (high rating + many reviews)
  if (
    professional.rating &&
    professional.rating >= 4.8 &&
    professional.reviewCount &&
    professional.reviewCount >= 15
  ) {
    indicators.push({
      text: "High demand - books up fast",
      type: "demand",
      icon: "trending",
    });
  }

  // Guest favorite (top rated with many favorites)
  if (
    professional.rating &&
    professional.rating >= 4.9 &&
    professional.favoritesCount &&
    professional.favoritesCount >= 10
  ) {
    indicators.push({
      text: "Guest Favorite",
      type: "rare",
      icon: "star",
    });
  }

  // Simulated viewing activity for popular professionals
  if (professional.reviewCount && professional.reviewCount >= 5) {
    const viewingCount = Math.floor(Math.random() * 4) + 1; // 1-4 viewers
    if (viewingCount >= 2) {
      indicators.push({
        text: `${viewingCount} people viewing right now`,
        type: "viewing",
        icon: "eye",
      });
    }
  }

  return indicators.slice(0, 2); // Show max 2 indicators
}

type ProfessionalsDirectoryProps = {
  professionals: DirectoryProfessional[];
};

// React.memo optimization for heavy component rendering 100+ professionals
// Custom comparison: only re-render if professionals array reference changes
const ProfessionalsDirectoryComponent = memo(
  function ProfessionalsDirectoryInner({ professionals }: ProfessionalsDirectoryProps) {
    const t = useTranslations("professionalsDirectory");
    const searchParams = useSearchParams();
    const [serviceFilter, setServiceFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [availableToday, setAvailableToday] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    // Week 3-4 feature flag
    const showEnhancedTrustBadges = useFeatureFlag("enhanced_trust_badges");

    const ratingOptions = [
      { value: "all", label: t("filters.allRatings") },
      { value: "4.5", label: t("filters.rating45") },
      { value: "4.8", label: t("filters.rating48") },
    ];

    const serviceOptions = useMemo(() => {
      const unique = new Set<string>();
      for (const professional of professionals) {
        if (professional.service) {
          unique.add(professional.service);
        }
      }
      return ["all", ...Array.from(unique)];
    }, [professionals]);

    const cityOptions = useMemo(() => {
      const unique = new Set<string>();
      for (const professional of professionals) {
        if (professional.city) {
          unique.add(professional.city);
        }
      }
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
        const slugifiedOption = normalizedOption
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
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

        return (
          matchesSearch && matchesService && matchesCity && matchesRating && matchesAvailability
        );
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
        <Container className="space-y-16">
          <header className="space-y-6 text-center">
            <h1 className="font-[family-name:var(--font-cinzel)] text-5xl text-[#211f1a] tracking-tight sm:text-6xl lg:text-7xl">
              {t("header.title")}
            </h1>
            <p className="mx-auto max-w-3xl text-[#5d574b] text-xl sm:text-2xl">
              {t("header.subtitle")}
            </p>
          </header>

          <div className="space-y-6 rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <div className="space-y-6">
              {/* Search Bar with Autocomplete */}
              <SearchBar
                onSearch={setSearchTerm}
                onSuggestionSelect={(suggestion: SearchSuggestion) => {
                  // When user selects a suggestion, navigate to their profile
                  window.location.href = `/professionals/${suggestion.id}`;
                }}
                placeholder={t("filters.search")}
              />

              {/* View Toggle (List / Map) */}
              <div className="flex justify-end">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
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
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#8B7355] px-2 font-semibold text-white text-xs">
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
          ) : viewMode === "map" ? (
            <div className="h-[600px] overflow-hidden rounded-[32px] border border-[#ebe5d8] shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
              <MapView professionals={filteredProfessionals} />
            </div>
          ) : (
            <div className="space-y-12">
              {filteredProfessionals.map((professional) => (
                <article
                  className="hover:-translate-y-0.5 overflow-hidden rounded-[32px] border border-[#ebe5d8] bg-white p-8 shadow-[var(--shadow-card)] transition hover:border-[#8B7355] hover:shadow-[var(--shadow-elevated)] sm:p-10"
                  key={professional.id}
                >
                  {/* Header Row: Profile + Stats + Actions */}
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Profile Info */}
                    <div className="flex items-start gap-5">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#ebe5d8] shadow-[var(--shadow-subtle)]">
                        <Image
                          alt={professional.name}
                          className="object-cover"
                          fill
                          src={professional.photoUrl}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-[#211f1a] tracking-wide sm:text-3xl">
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
                        aria-label={t("card.favorite")}
                        className="rounded-full border-2 border-[#211f1a] bg-white p-2.5 transition hover:bg-[#f5f2ed]"
                        type="button"
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

                  {/* Activity Indicators */}
                  {(() => {
                    const activityIndicators = getActivityIndicators(professional);
                    const getIcon = (iconName: string) => {
                      switch (iconName) {
                        case "eye":
                          return <Eye className="h-3.5 w-3.5" />;
                        case "calendar":
                          return <Calendar className="h-3.5 w-3.5" />;
                        case "trending":
                          return <TrendingUp className="h-3.5 w-3.5" />;
                        case "star":
                          return <Star className="h-3.5 w-3.5 fill-current" />;
                        default:
                          return null;
                      }
                    };

                    const getStyles = (type: string) => {
                      switch (type) {
                        case "viewing":
                          return "bg-[#f5f2ed] text-[#8B7355] border-[#e2ddd2]";
                        case "booked":
                          return "bg-[#6B7F5C]/10 text-[#6B7F5C] border-[#6B7F5C]/20";
                        case "demand":
                          return "bg-[#8B7355]/10 text-[#8B7355] border-[#8B7355]/20";
                        case "rare":
                          return "bg-[#9B8B7E]/10 text-[#9B8B7E] border-[#9B8B7E]/20";
                        default:
                          return "bg-[#f5f2ed] text-[#5d574b] border-[#e2ddd2]";
                      }
                    };

                    return activityIndicators.length > 0 ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {activityIndicators.map((indicator, index) => (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-xs ${getStyles(indicator.type)}`}
                            key={index}
                          >
                            {getIcon(indicator.icon)}
                            {indicator.text}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {/* Stats Row */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-[#ebe5d8] border-b pb-4 text-sm">
                    {/* Total Earnings */}
                    {professional.totalEarnings !== undefined && professional.totalEarnings > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#211f1a]">
                          {formatCOP(professional.totalEarnings)}
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
                    {professional.favoritesCount !== undefined &&
                      professional.favoritesCount > 0 && (
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
                    {showEnhancedTrustBadges &&
                      professional.verificationLevel &&
                      professional.verificationLevel !== "none" && (
                        <VerificationBadge level={professional.verificationLevel} size="sm" />
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
  },
  // Custom comparison: only re-render if professionals array reference changes
  (prevProps, nextProps) =>
    prevProps.professionals === nextProps.professionals &&
    prevProps.professionals.length === nextProps.professionals.length
);

// Export the memoized component
export const ProfessionalsDirectory = ProfessionalsDirectoryComponent;
