"use client";

/**
 * FilterSidebar - Lia Design System
 *
 * Desktop sidebar containing all filter components.
 */

import { Button } from "@/components/ui/button";
import type { useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { LocationFilter } from "./LocationFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { RatingFilter } from "./RatingFilter";
import { ServiceFilter } from "./ServiceFilter";
import { VerificationFilter } from "./VerificationFilter";

interface FilterSidebarProps {
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  clearFilters: ReturnType<typeof useDirectoryFilters>["clearFilters"];
  activeFilterCount: number;
  className?: string;
}

export function FilterSidebar({
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  className,
}: FilterSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-4 flex h-fit max-h-[calc(100vh-2rem)] w-full max-w-[280px] flex-col rounded-lg border border-neutral-200 bg-white",
        className
      )}
    >
      {/* Header - fixed at top */}
      <div className="flex shrink-0 items-center justify-between border-neutral-100 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 font-medium text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <Button
            className="h-7 px-2 text-neutral-500 text-xs hover:text-orange-600"
            onClick={clearFilters}
            size="sm"
            variant="ghost"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Scrollable filter content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Location Filter */}
        <LocationFilter
          city={filters.city}
          country={filters.country}
          neighborhood={filters.neighborhood}
          onCityChange={(v) => setFilter("city", v)}
          onCountryChange={(v) => setFilter("country", v)}
          onNeighborhoodChange={(v) => setFilter("neighborhood", v)}
        />

        <div className="border-neutral-100 border-t" />

        {/* Service Filter */}
        <ServiceFilter onChange={(v) => setFilter("service", v)} value={filters.service} />

        <div className="border-neutral-100 border-t" />

        {/* Price Range Filter */}
        <PriceRangeFilter
          maxRate={filters.maxRate}
          minRate={filters.minRate}
          onMaxRateChange={(v) => setFilter("maxRate", v)}
          onMinRateChange={(v) => setFilter("minRate", v)}
        />

        <div className="border-neutral-100 border-t" />

        {/* Rating Filter */}
        <RatingFilter onChange={(v) => setFilter("minRating", v)} value={filters.minRating} />

        <div className="border-neutral-100 border-t" />

        {/* Availability Filter */}
        <AvailabilityFilter
          availableToday={filters.availableToday}
          date={filters.date}
          onAvailableTodayChange={(v) => setFilter("availableToday", v)}
          onDateChange={(v) => setFilter("date", v)}
        />

        <div className="border-neutral-100 border-t" />

        {/* Verification Filter */}
        <VerificationFilter
          onVerifiedOnlyChange={(v) => setFilter("verifiedOnly", v)}
          verifiedOnly={filters.verifiedOnly}
        />
      </div>
    </aside>
  );
}
