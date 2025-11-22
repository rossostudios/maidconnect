"use client";

/**
 * EmptyState - Lia Design System
 *
 * Empty state component for when no professionals match filters.
 */

import { RefreshIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No professionals found",
  description = "Try adjusting your filters or search criteria to find more results.",
  onClearFilters,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <HugeiconsIcon className="h-8 w-8 text-neutral-400" icon={Search01Icon} />
      </div>

      <h3 className="mb-2 font-semibold text-lg text-neutral-900">{title}</h3>
      <p className="mb-6 max-w-md text-neutral-600 text-sm">{description}</p>

      {onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={RefreshIcon} />
          Clear all filters
        </Button>
      )}
    </div>
  );
}
