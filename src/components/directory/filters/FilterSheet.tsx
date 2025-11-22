"use client";

/**
 * FilterSheet - Lia Design System
 *
 * Mobile bottom sheet containing all filter components.
 */

import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { LocationFilter } from "./LocationFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { RatingFilter } from "./RatingFilter";
import { ServiceFilter } from "./ServiceFilter";
import { VerificationFilter } from "./VerificationFilter";

interface FilterSheetProps {
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  clearFilters: ReturnType<typeof useDirectoryFilters>["clearFilters"];
  activeFilterCount: number;
  className?: string;
}

export function FilterSheet({
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  className,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className={cn("relative gap-2", className)} variant="outline">
          <HugeiconsIcon className="h-4 w-4" icon={FilterIcon} />
          Filters
          {activeFilterCount > 0 && (
            <span className="-right-1 -top-1 absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 font-medium text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="h-[85vh] overflow-y-auto" side="bottom">
        <SheetHeader className="sticky top-0 z-10 border-neutral-100 border-b bg-white pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm">
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 font-medium text-white text-xs">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  className="h-7 px-2 text-neutral-500 text-xs"
                  onClick={clearFilters}
                  size="sm"
                  variant="ghost"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
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

        {/* Apply button */}
        <div className="sticky bottom-0 border-neutral-100 border-t bg-white p-4">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
