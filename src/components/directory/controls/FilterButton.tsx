"use client";

/**
 * FilterButton - Lia Design System
 *
 * Airbnb-style filter trigger button.
 * Shows filter icon, label, and active filter count badge.
 *
 * Used to open FilterModal on desktop or FilterSheet on mobile.
 */

import { FilterIcon } from "hugeicons-react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "@/lib/utils";

export type FilterButtonProps = {
  /** Number of active filters */
  activeFilterCount?: number;
  /** Click handler */
  onPress?: () => void;
  className?: string;
};

export function FilterButton({ activeFilterCount = 0, onPress, className }: FilterButtonProps) {
  return (
    <AriaButton
      className={cn(
        "inline-flex items-center gap-2",
        "rounded-lg px-4 py-2.5",
        "border border-neutral-200 bg-white",
        "font-medium text-neutral-900 text-sm",
        "transition-all duration-150",
        "hover:border-neutral-400 hover:shadow-sm",
        "pressed:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        className
      )}
      onPress={onPress}
    >
      <FilterIcon className="h-4 w-4" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center",
            "h-5 min-w-[20px] rounded-full px-1.5",
            "bg-neutral-900 text-white",
            "font-semibold text-xs"
          )}
        >
          {activeFilterCount}
        </span>
      )}
    </AriaButton>
  );
}
