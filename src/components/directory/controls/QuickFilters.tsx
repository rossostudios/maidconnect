"use client";

/**
 * QuickFilters - Airbnb-Style Filter Chips
 *
 * Horizontal scrollable pill filters with fade edges,
 * clear all button, and subtle shadows on active state.
 */

import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  FlashIcon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

type QuickFiltersProps = {
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  resetFilters?: () => void;
  className?: string;
};

export function QuickFilters({ filters, setFilter, resetFilters, className }: QuickFiltersProps) {
  const quickOptions = [
    {
      key: "availableToday" as const,
      label: "Available today",
      icon: FlashIcon,
      active: filters.availableToday,
      toggle: () => setFilter("availableToday", !filters.availableToday),
    },
    {
      key: "verifiedOnly" as const,
      label: "Verified",
      icon: Shield01Icon,
      active: filters.verifiedOnly,
      toggle: () => setFilter("verifiedOnly", !filters.verifiedOnly),
    },
    {
      key: "backgroundChecked" as const,
      label: "Background checked",
      icon: CheckmarkCircle01Icon,
      active: filters.backgroundChecked,
      toggle: () => setFilter("backgroundChecked", !filters.backgroundChecked),
    },
    {
      key: "minRating" as const,
      label: "4+ stars",
      icon: StarIcon,
      active: filters.minRating !== null && filters.minRating >= 4,
      toggle: () => setFilter("minRating", filters.minRating === 4 ? null : 4),
    },
  ];

  const hasActiveFilters = quickOptions.some((opt) => opt.active);

  return (
    <div className={cn("relative", className)}>
      {/* Scrollable container with fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />

        {/* Right fade */}
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />

        {/* Scrollable pills */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-8 py-1">
          {/* Clear all button - appears when filters are active */}
          {hasActiveFilters && resetFilters && (
            <button
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all",
                "border-neutral-900 bg-neutral-900 text-white",
                "hover:bg-neutral-800 active:scale-[0.98]"
              )}
              onClick={resetFilters}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              Clear all
            </button>
          )}

          {quickOptions.map((option) => (
            <button
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                "active:scale-[0.98]",
                option.active
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                  : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900 hover:shadow-sm"
              )}
              key={option.key}
              onClick={option.toggle}
              type="button"
            >
              <HugeiconsIcon
                className={cn("h-4 w-4", option.active ? "text-white" : "text-neutral-600")}
                icon={option.icon}
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
