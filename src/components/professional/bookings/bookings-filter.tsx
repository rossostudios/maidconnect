"use client";

/**
 * BookingsFilter - Airbnb-Style Filter Bar for Professional Bookings
 *
 * Comprehensive filter interface with search, status pills, and date filters.
 * Supports both desktop inline view and mobile sheet view.
 *
 * Key Features:
 * - Search input with debounce
 * - Status filter pills (All, Active, Completed, Cancelled)
 * - Date range presets (Today, This Week, This Month, History)
 * - Active filter count badge
 * - Clear all filters button
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - orange-500 active states
 * - neutral color palette
 */

import {
  Cancel01Icon,
  FilterIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type BookingStatusFilter = "all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type DateRangeFilter = "all" | "today" | "week" | "month" | "history";

export type BookingsFilterState = {
  search: string;
  status: BookingStatusFilter;
  dateRange: DateRangeFilter;
};

export type BookingsFilterProps = {
  /** Current filter values */
  filters: BookingsFilterState;
  /** Called when any filter changes */
  onFiltersChange: (filters: Partial<BookingsFilterState>) => void;
  /** Called when filters are cleared */
  onClearFilters: () => void;
  /** Search debounce delay in ms */
  searchDebounce?: number;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Filter Option Definitions
// ============================================================================

const STATUS_OPTIONS: Array<{ value: BookingStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const DATE_OPTIONS: Array<{ value: DateRangeFilter; label: string; description?: string }> = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today", description: "Bookings scheduled for today" },
  { value: "week", label: "This Week", description: "Next 7 days" },
  { value: "month", label: "This Month", description: "Next 30 days" },
  { value: "history", label: "History", description: "Past bookings" },
];

// ============================================================================
// Main Component
// ============================================================================

export function BookingsFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  searchDebounce = 300,
  className,
}: BookingsFilterProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate active filter count
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.search.trim() !== "" ? 1 : 0);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onFiltersChange({ search: value });
      }, searchDebounce);
    },
    [onFiltersChange, searchDebounce]
  );

  // Sync local search with external filter changes
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <HugeiconsIcon
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
            icon={Search01Icon}
          />
          <input
            className={cn(
              "h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pr-4 pl-10 text-sm",
              "placeholder:text-neutral-400",
              "focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20",
              "transition-all",
              geistSans.className
            )}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by customer name, service, or booking ID..."
            type="text"
            value={localSearch}
          />
          {localSearch && (
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              onClick={() => {
                setLocalSearch("");
                onFiltersChange({ search: "" });
              }}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                className="whitespace-nowrap"
                onPress={onClearFilters}
                size="sm"
                variant="ghost"
              >
                <HugeiconsIcon className="mr-1.5 h-4 w-4" icon={Cancel01Icon} />
                Clear filters
                <Badge
                  className="ml-1.5 border-neutral-200 bg-neutral-100 text-neutral-600"
                  size="sm"
                  variant="outline"
                >
                  {activeFilterCount}
                </Badge>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {/* Status Pills */}
        <FilterPillGroup
          label="Status"
          onChange={(value) => onFiltersChange({ status: value as BookingStatusFilter })}
          options={STATUS_OPTIONS}
          value={filters.status}
        />

        {/* Date Range Pills */}
        <div className="mx-2 h-8 w-px bg-neutral-200" />
        <FilterPillGroup
          label="Date"
          onChange={(value) => onFiltersChange({ dateRange: value as DateRangeFilter })}
          options={DATE_OPTIONS}
          value={filters.dateRange}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Filter Pill Group
// ============================================================================

type FilterPillGroupProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

function FilterPillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterPillGroupProps<T>) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-neutral-500 text-xs", geistSans.className)}>{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <FilterPill
            isActive={value === option.value}
            key={option.value}
            label={option.label}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Filter Pill
// ============================================================================

type FilterPillProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function FilterPill({ label, isActive, onClick }: FilterPillProps) {
  return (
    <button
      className={cn(
        "relative rounded-full border px-3 py-1.5 font-medium text-xs transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        isActive
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-200 hover:bg-orange-50/50"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-orange-300"
          layoutId="filter-pill-active"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
    </button>
  );
}

// ============================================================================
// Compact Mobile Variant
// ============================================================================

export type BookingsFilterCompactProps = BookingsFilterProps & {
  /** Whether the filter sheet is open */
  isOpen?: boolean;
  /** Called when filter sheet opens/closes */
  onOpenChange?: (open: boolean) => void;
};

export function BookingsFilterCompact({
  filters,
  onFiltersChange,
  onClearFilters: _onClearFilters,
  isOpen = false,
  onOpenChange,
  className,
}: BookingsFilterCompactProps) {
  // onClearFilters available via _onClearFilters for filter sheet implementation
  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.search.trim() !== "" ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Search Input - Always visible */}
      <div className="relative flex-1">
        <HugeiconsIcon
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
          icon={Search01Icon}
        />
        <input
          className={cn(
            "h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pr-4 pl-10 text-sm",
            "placeholder:text-neutral-400",
            "focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20",
            geistSans.className
          )}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          placeholder="Search bookings..."
          type="text"
          value={filters.search}
        />
      </div>

      {/* Filter Toggle Button */}
      <Button
        className={cn(
          "relative",
          activeFilterCount > 0 && "border-orange-200 bg-orange-50"
        )}
        onPress={() => onOpenChange?.(!isOpen)}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon
          className={cn("h-5 w-5", activeFilterCount > 0 && "text-orange-600")}
          icon={FilterIcon}
        />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 font-semibold text-white text-xs">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}

// ============================================================================
// Filter Summary (shows active filters as removable chips)
// ============================================================================

export function BookingsFilterSummary({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: BookingsFilterProps) {
  const activeFilters: Array<{ key: keyof BookingsFilterState; label: string; value: string }> = [];

  if (filters.status !== "all") {
    const statusLabel = STATUS_OPTIONS.find((o) => o.value === filters.status)?.label || filters.status;
    activeFilters.push({ key: "status", label: "Status", value: statusLabel });
  }

  if (filters.dateRange !== "all") {
    const dateLabel = DATE_OPTIONS.find((o) => o.value === filters.dateRange)?.label || filters.dateRange;
    activeFilters.push({ key: "dateRange", label: "Date", value: dateLabel });
  }

  if (filters.search.trim()) {
    activeFilters.push({ key: "search", label: "Search", value: filters.search });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemove = (key: keyof BookingsFilterState) => {
    const defaultValues: Record<keyof BookingsFilterState, string> = {
      status: "all",
      dateRange: "all",
      search: "",
    };
    onFiltersChange({ [key]: defaultValues[key] });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className={cn("text-neutral-500 text-sm", geistSans.className)}>Showing:</span>
      {activeFilters.map((filter) => (
        <Badge
          className="cursor-pointer border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
          key={filter.key}
          onClick={() => handleRemove(filter.key)}
          size="sm"
          variant="outline"
        >
          {filter.label}: {filter.value}
          <HugeiconsIcon className="ml-1 h-3 w-3" icon={Cancel01Icon} />
        </Badge>
      ))}
      <button
        className={cn(
          "text-neutral-500 text-sm underline-offset-2 hover:text-neutral-700 hover:underline",
          geistSans.className
        )}
        onClick={onClearFilters}
        type="button"
      >
        Clear all
      </button>
    </div>
  );
}
