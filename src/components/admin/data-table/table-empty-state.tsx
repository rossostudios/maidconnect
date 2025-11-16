"use client";

import { SearchList01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type Props = {
  title?: string;
  description?: string;
  icon?: HugeIcon;
  action?: React.ReactNode;
  hasFilters?: boolean;
  onResetFilters?: () => void;
};

/**
 * LiaDataTableEmptyState - Empty state for tables
 *
 * Features:
 * - Contextual messaging
 * - Optional CTA button
 * - Filter reset suggestion
 */
export function LiaDataTableEmptyState({
  title = "No results found",
  description = "Try adjusting your search or filter to find what you're looking for.",
  icon: Icon = SearchList01Icon,
  action,
  hasFilters = false,
  onResetFilters,
}: Props) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center border-neutral-200 border-t bg-white px-6 py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-neutral-200 bg-neutral-50">
        <HugeiconsIcon className="h-8 w-8 text-neutral-400" icon={Icon} />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "mb-2 font-semibold text-neutral-900 text-xl uppercase tracking-wider",
          geistSans.className
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p className={cn("mb-6 max-w-md font-normal text-neutral-600 text-sm", geistSans.className)}>
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {hasFilters && onResetFilters && (
          <button
            className={cn(
              "border border-neutral-200 bg-white px-6 py-2.5 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-neutral-300 hover:bg-neutral-50",
              geistSans.className
            )}
            onClick={onResetFilters}
            type="button"
          >
            Clear filters
          </button>
        )}

        {action}
      </div>
    </div>
  );
}
