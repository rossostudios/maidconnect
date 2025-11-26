"use client";

import {
  AnalyticsUpIcon,
  Calendar01Icon,
  FavouriteIcon,
  FilterIcon,
  Location01Icon,
  Settings02Icon,
  StarIcon,
  Video01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";
import { ProfessionalsEmptyState } from "./empty-state";
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
  // Enhanced verification data (detailed badges)
  verification?: {
    backgroundCheckPassed?: boolean;
    documentsVerified?: boolean;
    interviewCompleted?: boolean;
    referencesVerified?: boolean;
  };
  // Intro video (Phase 2.3)
  introVideoPath?: string | null;
  introVideoStatus?: "none" | "pending_review" | "approved" | "rejected";
  introVideoDurationSeconds?: number | null;
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

    // Track initial page view with professionals list
    useEffect(() => {
      conversionTracking.professionalsListViewed({
        totalCount: professionals.length,
        filters: {
          serviceType: serviceFilter !== "all" ? serviceFilter : undefined,
          city: cityFilter !== "all" ? cityFilter : undefined,
          rating: ratingFilter !== "all" ? Number.parseFloat(ratingFilter) : undefined,
          availableToday: availableToday || undefined,
        },
      });
      // Only run on initial mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableToday, cityFilter, professionals.length, ratingFilter, serviceFilter]);

    // Track search queries
    useEffect(() => {
      if (searchTerm.trim().length > 0) {
        conversionTracking.professionalsSearched({
          query: searchTerm,
          filters: {
            serviceType: serviceFilter !== "all" ? serviceFilter : undefined,
            city: cityFilter !== "all" ? cityFilter : undefined,
            rating: ratingFilter !== "all" ? Number.parseFloat(ratingFilter) : undefined,
            availableToday: availableToday || undefined,
          },
        });
      }
    }, [searchTerm, serviceFilter, cityFilter, ratingFilter, availableToday]);

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
      // Track each filter that changed
      if (filters.serviceFilter !== serviceFilter && filters.serviceFilter !== "all") {
        conversionTracking.filterApplied({
          filterType: "service",
          filterValue: filters.serviceFilter,
        });
      }
      if (filters.cityFilter !== cityFilter && filters.cityFilter !== "all") {
        conversionTracking.filterApplied({
          filterType: "city",
          filterValue: filters.cityFilter,
        });
      }
      if (filters.ratingFilter !== ratingFilter && filters.ratingFilter !== "all") {
        conversionTracking.filterApplied({
          filterType: "rating",
          filterValue: filters.ratingFilter,
        });
      }
      if (filters.availableToday !== availableToday && filters.availableToday) {
        conversionTracking.filterApplied({
          filterType: "availability",
          filterValue: "available_today",
        });
      }

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
            <h1 className="serif-display-lg text-[neutral-900]">{t("header.title")}</h1>
            <p className="lead mx-auto max-w-3xl text-[neutral-900]/70">{t("header.subtitle")}</p>
          </header>

          <div className="space-y-6 border border-[neutral-200] bg-[neutral-50] p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
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
                  className="flex w-full items-center justify-center gap-2 border-2 border-[neutral-500] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-500] text-base transition hover:bg-[neutral-500] hover:text-[neutral-50]"
                  onClick={() => setIsFilterSheetOpen(true)}
                  type="button"
                >
                  <HugeiconsIcon className="h-5 w-5" icon={Settings02Icon} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center bg-[neutral-500] px-2 font-semibold text-[neutral-50] text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Desktop Filter Controls - Hidden on mobile */}
              <div className="hidden flex-wrap items-center gap-4 font-semibold text-[neutral-900] text-sm md:flex">
                <label className="flex items-center gap-2.5">
                  <HugeiconsIcon className="h-5 w-5 text-[neutral-900]" icon={FilterIcon} />
                  <span>{t("filters.service")}</span>
                  <select
                    className="border border-[neutral-200] bg-[neutral-50] px-4 py-2 text-sm transition focus:border-[neutral-900] focus:outline-none"
                    onChange={(event) => {
                      const newValue = event.target.value;
                      if (newValue !== "all") {
                        conversionTracking.filterApplied({
                          filterType: "service",
                          filterValue: newValue,
                        });
                      }
                      setServiceFilter(newValue);
                    }}
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
                  <HugeiconsIcon className="h-5 w-5 text-[neutral-900]" icon={Location01Icon} />
                  <span>{t("filters.city")}</span>
                  <select
                    className="border border-[neutral-200] bg-[neutral-50] px-4 py-2 text-sm transition focus:border-[neutral-900] focus:outline-none"
                    onChange={(event) => {
                      const newValue = event.target.value;
                      if (newValue !== "all") {
                        conversionTracking.filterApplied({
                          filterType: "city",
                          filterValue: newValue,
                        });
                      }
                      setCityFilter(newValue);
                    }}
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
                  <HugeiconsIcon className="h-5 w-5 text-[neutral-900]" icon={Settings02Icon} />
                  <span>{t("filters.rating")}</span>
                  <select
                    className="border border-[neutral-200] bg-[neutral-50] px-4 py-2 text-sm transition focus:border-[neutral-900] focus:outline-none"
                    onChange={(event) => {
                      const newValue = event.target.value;
                      if (newValue !== "all") {
                        conversionTracking.filterApplied({
                          filterType: "rating",
                          filterValue: newValue,
                        });
                      }
                      setRatingFilter(newValue);
                    }}
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
                    className="h-5 w-5 rounded border-[neutral-200] text-[neutral-900] focus:ring-[neutral-900]"
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      if (isChecked) {
                        conversionTracking.filterApplied({
                          filterType: "availability",
                          filterValue: "available_today",
                        });
                      }
                      setAvailableToday(isChecked);
                    }}
                    type="checkbox"
                  />
                  <span>{t("filters.availableToday")}</span>
                </label>

                <button
                  className="ml-auto border-2 border-[neutral-500] bg-[neutral-50] px-5 py-2 font-semibold text-[neutral-500] text-sm transition hover:bg-[neutral-500] hover:text-[neutral-50]"
                  onClick={resetFilters}
                  type="button"
                >
                  {t("filters.reset")}
                </button>
              </div>
            </div>
          </div>

          {filteredProfessionals.length === 0 ? (
            <ProfessionalsEmptyState
              hasFilters={
                activeFilterCount > 0 || searchTerm.length > 0 || professionals.length > 0
              }
              onClearFilters={resetFilters}
            />
          ) : viewMode === "map" ? (
            <div className="h-[600px] overflow-hidden border border-[neutral-200] shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
              <MapView professionals={filteredProfessionals} />
            </div>
          ) : (
            <div className="space-y-12">
              {filteredProfessionals.map((professional) => (
                <article
                  className="hover:-translate-y-0.5 overflow-hidden border border-[neutral-200] bg-[neutral-50] p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:border-[neutral-500] hover:shadow-[0_24px_60px_rgba(22,22,22,0.06)] sm:p-10"
                  key={professional.id}
                >
                  {/* Header Row: Profile + Stats + Actions */}
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Profile Info */}
                    <div className="flex items-start gap-5">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border-2 border-[neutral-200] shadow-[0_2px_12px_rgba(22,22,22,0.02)]">
                        <Image
                          alt={professional.name}
                          className="object-cover"
                          fill
                          src={professional.photoUrl}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h2 className="serif-headline-lg text-[neutral-900]">
                          {professional.name}
                        </h2>
                        <p className="text-[neutral-400] text-sm">
                          {professional.service ?? t("card.flexibleServices")}
                        </p>
                        <div className="flex items-center gap-1.5 text-[neutral-400] text-sm">
                          <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
                          <span>{professional.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        aria-label={t("card.favorite")}
                        className="border-2 border-[neutral-500]/30 bg-[neutral-50] p-2.5 transition hover:border-[neutral-500] hover:bg-[neutral-500] hover:text-[neutral-50]"
                        type="button"
                      >
                        <HugeiconsIcon
                          className="h-5 w-5 text-[neutral-900]"
                          icon={FavouriteIcon}
                        />
                      </button>
                      <Link
                        className="flex-1 border-2 border-[neutral-500] bg-[neutral-50] px-6 py-2.5 text-center font-semibold text-[neutral-500] text-sm transition hover:bg-[neutral-500] hover:text-[neutral-50] sm:flex-none"
                        href={`/professionals/${professional.id}`}
                        onClick={() => {
                          conversionTracking.profileViewed({
                            professionalId: professional.id,
                            serviceType: professional.service ?? "unknown",
                          });
                        }}
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
                          return <HugeiconsIcon className="h-3.5 w-3.5" icon={ViewIcon} />;
                        case "calendar":
                          return <HugeiconsIcon className="h-3.5 w-3.5" icon={Calendar01Icon} />;
                        case "trending":
                          return <HugeiconsIcon className="h-3.5 w-3.5" icon={AnalyticsUpIcon} />;
                        case "star":
                          return (
                            <HugeiconsIcon className="h-3.5 w-3.5 fill-current" icon={StarIcon} />
                          );
                        default:
                          return null;
                      }
                    };

                    const getStyles = (type: string) => {
                      switch (type) {
                        case "viewing":
                          return "bg-[neutral-50] text-[neutral-500] border-[neutral-200]";
                        case "booked":
                          return "bg-neutral-100 text-neutral-900 border-[neutral-900]/20";
                        case "demand":
                          return "bg-[neutral-500]/10 text-[neutral-500] border-[neutral-500]/20";
                        case "rare":
                          return "bg-[neutral-500]/10 text-[neutral-500] border-[neutral-500]/20";
                        default:
                          return "bg-[neutral-50] text-[neutral-400] border-[neutral-200]";
                      }
                    };

                    return activityIndicators.length > 0 ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {activityIndicators.map((indicator, index) => (
                          <span
                            className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-medium text-xs ${getStyles(indicator.type)}`}
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
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-[neutral-200] border-b pb-4 text-sm">
                    {/* Total Earnings */}
                    {professional.totalEarnings !== undefined && professional.totalEarnings > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[neutral-900]">
                          {formatCOP(professional.totalEarnings)}
                        </span>
                        <span className="text-[neutral-400]">{t("card.earned")}</span>
                      </div>
                    )}

                    {/* Completed Bookings (Hires) */}
                    {professional.totalCompletedBookings !== undefined &&
                      professional.totalCompletedBookings > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[neutral-900]">
                            {professional.totalCompletedBookings}
                          </span>
                          <span className="text-[neutral-400]">{t("card.hired")}</span>
                        </div>
                      )}

                    {/* Rating */}
                    {professional.rating !== undefined && professional.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon
                          className="h-4 w-4 fill-[neutral-900] text-[neutral-900]"
                          icon={StarIcon}
                        />
                        <span className="font-semibold text-[neutral-900]">
                          {professional.rating.toFixed(1)}
                        </span>
                        {professional.reviewCount !== undefined && professional.reviewCount > 0 && (
                          <span className="text-[neutral-400]">({professional.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Favorites Count */}
                    {professional.favoritesCount !== undefined &&
                      professional.favoritesCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[neutral-900]">
                            {professional.favoritesCount}
                          </span>
                          <span className="text-[neutral-400]">{t("card.favorites")}</span>
                        </div>
                      )}
                  </div>

                  {/* Badges Row */}
                  <div
                    className="mt-4 flex flex-wrap items-center gap-2 text-xs"
                    suppressHydrationWarning
                  >
                    {showEnhancedTrustBadges && professional.verification ? (
                      <>
                        {/* Show individual verification badges */}
                        {professional.verification.backgroundCheckPassed && (
                          <VerificationBadge level="background-check" size="sm" />
                        )}
                        {professional.verification.documentsVerified && (
                          <VerificationBadge level="document-verified" size="sm" />
                        )}
                        {professional.verification.interviewCompleted && (
                          <VerificationBadge level="interview-completed" size="sm" />
                        )}
                        {professional.verification.referencesVerified && (
                          <VerificationBadge level="reference-checked" size="sm" />
                        )}
                        {/* Fallback to basic badge if no detailed verification data */}
                        {!(
                          professional.verification.backgroundCheckPassed ||
                          professional.verification.documentsVerified ||
                          professional.verification.interviewCompleted ||
                          professional.verification.referencesVerified
                        ) &&
                          professional.verificationLevel &&
                          professional.verificationLevel !== "none" && (
                            <VerificationBadge level={professional.verificationLevel} size="sm" />
                          )}
                      </>
                    ) : showEnhancedTrustBadges &&
                      professional.verificationLevel &&
                      professional.verificationLevel !== "none" ? (
                      <VerificationBadge level={professional.verificationLevel} size="sm" />
                    ) : showEnhancedTrustBadges ? null : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[neutral-50] px-3 py-1.5 font-semibold text-[neutral-900]">
                        <HugeiconsIcon className="h-3.5 w-3.5 text-[neutral-900]" icon={StarIcon} />
                        {t("card.newBadge")}
                      </span>
                    )}

                    {/* Intro Video Badge (Phase 2.3) */}
                    {professional.introVideoStatus === "approved" &&
                      professional.introVideoPath && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-rausch-200 bg-rausch-50 px-3 py-1.5 font-semibold text-rausch-600">
                          <HugeiconsIcon className="h-3.5 w-3.5" icon={Video01Icon} />
                          {t("card.hasIntroVideo")}
                        </span>
                      )}

                    {professional.languages.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[neutral-50] px-3 py-1.5 font-semibold text-[neutral-900]">
                        {professional.languages.join(" / ")}
                      </span>
                    )}

                    {professional.availableToday && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[neutral-900] px-3 py-1.5 font-semibold text-[neutral-50]">
                        {t("filters.availableToday")}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {professional.bio && (
                    <p className="mt-4 text-[neutral-400] text-sm leading-relaxed">
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
