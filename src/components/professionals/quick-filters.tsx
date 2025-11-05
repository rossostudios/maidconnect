"use client";

import {
  Award01Icon,
  Clock01Icon,
  DollarCircleIcon,
  FlashIcon,
  Location01Icon,
  Shield01Icon,
  StarIcon,
  TranslateIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { HugeIcon } from "@/types/icons";

export type QuickFilter = {
  id: string;
  label: string;
  icon: HugeIcon;
  active: boolean;
};

type QuickFiltersProps = {
  onFilterChange: (filters: QuickFilter[]) => void;
};

const DEFAULT_FILTERS: QuickFilter[] = [
  {
    id: "available-today",
    label: "Available Today",
    icon: FlashIcon,
    active: false,
  },
  {
    id: "top-rated",
    label: "Top Rated (4.8+)",
    icon: StarIcon,
    active: false,
  },
  {
    id: "nearby",
    label: "Nearby (< 5km)",
    icon: Location01Icon,
    active: false,
  },
  {
    id: "budget-friendly",
    label: "Under 30k/hr",
    icon: DollarCircleIcon,
    active: false,
  },
  {
    id: "bilingual",
    label: "Bilingual",
    icon: TranslateIcon,
    active: false,
  },
  {
    id: "verified",
    label: "Background Checked",
    icon: Shield01Icon,
    active: false,
  },
  {
    id: "experienced",
    label: "5+ Years Experience",
    icon: Award01Icon,
    active: false,
  },
  {
    id: "quick-response",
    label: "Fast Response",
    icon: Clock01Icon,
    active: false,
  },
];

/**
 * Quick Filters Component
 * Provides one-click filters for common search patterns
 */
export function QuickFilters({ onFilterChange }: QuickFiltersProps) {
  const [filters, setFilters] = useState<QuickFilter[]>(DEFAULT_FILTERS);

  const toggleFilter = (filterId: string) => {
    const updated = filters.map((filter) =>
      filter.id === filterId ? { ...filter, active: !filter.active } : filter
    );
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearAllFilters = () => {
    const cleared = filters.map((filter) => ({ ...filter, active: false }));
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeCount = filters.filter((f) => f.active).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)] text-sm">Quick Filters</h3>
        {activeCount > 0 && (
          <button
            className="text-[var(--red)] text-xs transition hover:underline"
            onClick={clearAllFilters}
            type="button"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm transition ${
              filter.active
                ? "border-[var(--red)] bg-[var(--red)] text-white"
                : "border-[#ebe5d8] bg-white text-[#7d7566] hover:border-[var(--red)] hover:text-[var(--red)]"
            }`}
            key={filter.id}
            onClick={() => toggleFilter(filter.id)}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={filter.icon} />
            <span className="font-medium">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to convert quick filters to match criteria
 * Used by the smart matching algorithm
 */
export function filtersToMatchCriteria(filters: QuickFilter[]) {
  const activeFilters = filters.filter((f) => f.active);

  // This would integrate with the actual match criteria
  // For now, return the active filter IDs
  return {
    availableToday: activeFilters.some((f) => f.id === "available-today"),
    topRated: activeFilters.some((f) => f.id === "top-rated"),
    nearby: activeFilters.some((f) => f.id === "nearby"),
    budgetFriendly: activeFilters.some((f) => f.id === "budget-friendly"),
    bilingual: activeFilters.some((f) => f.id === "bilingual"),
    verified: activeFilters.some((f) => f.id === "verified"),
    experienced: activeFilters.some((f) => f.id === "experienced"),
    quickResponse: activeFilters.some((f) => f.id === "quick-response"),
  };
}
