"use client";

/**
 * QuickFilters - Lia Design System
 *
 * Horizontal scrollable quick filter chips for common filter options.
 */

import {
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
  className?: string;
};

export function QuickFilters({ filters, setFilter, className }: QuickFiltersProps) {
  const quickOptions = [
    {
      key: "availableToday" as const,
      label: "Available Today",
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
      label: "Background Checked",
      icon: CheckmarkCircle01Icon,
      active: filters.backgroundChecked,
      toggle: () => setFilter("backgroundChecked", !filters.backgroundChecked),
    },
    {
      key: "minRating" as const,
      label: "4+ Stars",
      icon: StarIcon,
      active: filters.minRating !== null && filters.minRating >= 4,
      toggle: () => setFilter("minRating", filters.minRating === 4 ? null : 4),
    },
  ];

  return (
    <div className={cn("scrollbar-hide flex gap-2 overflow-x-auto pb-2", className)}>
      {quickOptions.map((option) => (
        <button
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-sm transition-colors",
            option.active
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50/50"
          )}
          key={option.key}
          onClick={option.toggle}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={option.icon} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
