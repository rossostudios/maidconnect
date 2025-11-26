"use client";

/**
 * DirectoryHeader - Lia Design System
 *
 * Airbnb-style header section for professionals directory.
 * Combines results count, filter button, sort dropdown, and active filters.
 *
 * Features:
 * - Results count ("194 professionals")
 * - FilterButton (opens FilterModal)
 * - SortDropdown
 * - ActiveFilters pills
 * - Responsive layout
 */

import type {
  DirectoryFilters,
  SortOption,
  useDirectoryFilters,
} from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";
import { ActiveFilters } from "./controls/ActiveFilters";
import { FilterButton } from "./controls/FilterButton";
import { SortDropdown } from "./controls/SortDropdown";

export type DirectoryHeaderProps = {
  /** Total number of results */
  totalResults: number;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Number of active filters */
  activeFilterCount: number;
  /** Callback when filter button is pressed */
  onFilterPress: () => void;
  /** Current sort value */
  sortValue: SortOption;
  /** Callback when sort changes */
  onSortChange: (value: SortOption) => void;
  /** Active filter chips getter function */
  getActiveFilterChips: ReturnType<typeof useDirectoryFilters>["getActiveFilterChips"];
  /** Callback to remove a single filter */
  onRemoveFilter: (key: keyof DirectoryFilters) => void;
  /** Callback to clear all filters */
  onClearAll: () => void;
  className?: string;
};

export function DirectoryHeader({
  totalResults,
  isLoading = false,
  activeFilterCount,
  onFilterPress,
  sortValue,
  onSortChange,
  getActiveFilterChips,
  onRemoveFilter,
  onClearAll,
  className,
}: DirectoryHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Row: Results count + Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Results count */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          ) : (
            <h2 className="font-semibold text-lg text-neutral-900 dark:text-white">
              {totalResults.toLocaleString()} professional
              {totalResults !== 1 ? "s" : ""}
            </h2>
          )}
        </div>

        {/* Controls: Filter button + Sort dropdown */}
        <div className="flex items-center gap-3">
          <FilterButton activeFilterCount={activeFilterCount} onPress={onFilterPress} />
          <SortDropdown onChange={onSortChange} value={sortValue} />
        </div>
      </div>

      {/* Active Filters Pills */}
      <ActiveFilters
        chips={getActiveFilterChips}
        onClearAll={onClearAll}
        onRemove={onRemoveFilter}
      />
    </div>
  );
}
