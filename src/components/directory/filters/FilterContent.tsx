"use client";

/**
 * FilterContent - Lia Design System
 *
 * Shared filter UI component used by both:
 * - FilterModal (desktop popup)
 * - FilterSheet (mobile bottom sheet)
 *
 * Extracts filter rendering logic for DRY principle.
 */

import type { useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { LocationFilter } from "./LocationFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { RatingFilter } from "./RatingFilter";
import { ServiceFilter } from "./ServiceFilter";
import { SpecialtyFilter } from "./SpecialtyFilter";
import { VerificationFilter } from "./VerificationFilter";

export type FilterContentProps = {
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  className?: string;
  /**
   * Compact mode reduces padding for mobile bottom sheets
   */
  compact?: boolean;
};

/**
 * Divider component for visual separation between filter sections
 */
function FilterDivider() {
  return <div className="border-neutral-100 border-t dark:border-rausch-800" />;
}

export function FilterContent({
  filters,
  setFilter,
  className,
  compact = false,
}: FilterContentProps) {
  return (
    <div className={cn("space-y-6", compact ? "p-4" : "p-6", className)}>
      {/* Service Filter */}
      <ServiceFilter onChange={(v) => setFilter("service", v)} value={filters.service} />

      <FilterDivider />

      {/* Location Filter */}
      <LocationFilter
        city={filters.city}
        country={filters.country}
        neighborhood={filters.neighborhood}
        onCityChange={(v) => setFilter("city", v)}
        onCountryChange={(v) => setFilter("country", v)}
        onNeighborhoodChange={(v) => setFilter("neighborhood", v)}
      />

      <FilterDivider />

      {/* Price Range Filter */}
      <PriceRangeFilter
        maxRate={filters.maxRate}
        minRate={filters.minRate}
        onMaxRateChange={(v) => setFilter("maxRate", v)}
        onMinRateChange={(v) => setFilter("minRate", v)}
      />

      <FilterDivider />

      {/* Rating Filter */}
      <RatingFilter onChange={(v) => setFilter("minRating", v)} value={filters.minRating} />

      <FilterDivider />

      {/* Availability Filter */}
      <AvailabilityFilter
        availableToday={filters.availableToday}
        date={filters.date}
        onAvailableTodayChange={(v) => setFilter("availableToday", v)}
        onDateChange={(v) => setFilter("date", v)}
      />

      <FilterDivider />

      {/* Verification Filter */}
      <VerificationFilter
        onVerifiedOnlyChange={(v) => setFilter("verifiedOnly", v)}
        verifiedOnly={filters.verifiedOnly}
      />

      <FilterDivider />

      {/* Specialty Filter */}
      <SpecialtyFilter
        englishSpeaking={filters.englishSpeaking}
        hasPassport={filters.hasPassport}
        onEnglishSpeakingChange={(v) => setFilter("englishSpeaking", v)}
        onHasPassportChange={(v) => setFilter("hasPassport", v)}
        onPetFriendlyChange={(v) => setFilter("petFriendly", v)}
        petFriendly={filters.petFriendly}
      />
    </div>
  );
}
