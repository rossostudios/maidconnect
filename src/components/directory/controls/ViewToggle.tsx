"use client";

/**
 * ViewToggle - Lia Design System
 *
 * Toggle between grid, list, and map view modes.
 */

import { GridViewIcon, ListViewIcon, MapsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ViewMode } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  showMapOption?: boolean;
  className?: string;
}

const VIEW_OPTIONS: Array<{
  value: ViewMode;
  label: string;
  icon: typeof GridViewIcon;
}> = [
  { value: "grid", label: "Grid view", icon: GridViewIcon },
  { value: "list", label: "List view", icon: ListViewIcon },
  { value: "map", label: "Map view", icon: MapsIcon },
];

export function ViewToggle({ value, onChange, showMapOption = true, className }: ViewToggleProps) {
  const options = showMapOption ? VIEW_OPTIONS : VIEW_OPTIONS.filter((opt) => opt.value !== "map");

  return (
    <div
      aria-label="View mode"
      className={cn("inline-flex rounded-lg border border-neutral-200 bg-white p-1", className)}
      role="radiogroup"
    >
      {options.map((option) => (
        <button
          aria-checked={value === option.value}
          aria-label={option.label}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-all",
            value === option.value
              ? "bg-orange-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="radio"
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={option.icon} />
        </button>
      ))}
    </div>
  );
}
