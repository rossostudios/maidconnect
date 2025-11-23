"use client";

/**
 * ActiveFilters - Lia Design System
 *
 * Display active filters as removable chips.
 */

import { Cancel01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { DirectoryFilters, useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

type ActiveFiltersProps = {
  chips: ReturnType<typeof useDirectoryFilters>["getActiveFilterChips"];
  onRemove: (key: keyof DirectoryFilters) => void;
  onClearAll: () => void;
  className?: string;
};

export function ActiveFilters({ chips, onRemove, onClearAll, className }: ActiveFiltersProps) {
  const activeChips = typeof chips === "function" ? chips() : chips;

  if (!activeChips || activeChips.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-neutral-500 text-sm">Active filters:</span>

      {activeChips.map((chip) => (
        <button
          className="group flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-orange-700 text-sm transition-colors hover:border-orange-300 hover:bg-orange-100"
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          type="button"
        >
          <span className="font-medium">{chip.label}:</span>
          <span className="max-w-[120px] truncate">{chip.value}</span>
          <HugeiconsIcon
            className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100"
            icon={Cancel01Icon}
          />
        </button>
      ))}

      {activeChips.length > 1 && (
        <Button
          className="h-7 text-neutral-600 text-xs hover:text-orange-600"
          onClick={onClearAll}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon className="mr-1 h-3.5 w-3.5" icon={RefreshIcon} />
          Clear all
        </Button>
      )}
    </div>
  );
}
