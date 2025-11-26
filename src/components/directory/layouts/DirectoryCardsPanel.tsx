"use client";

/**
 * DirectoryCardsPanel - Lia Design System
 *
 * Scrollable cards container for professionals directory.
 * Displays professional cards in a responsive grid.
 *
 * Features:
 * - Scrollable container (overflow-y-auto)
 * - Grid of ProfessionalCard components
 * - Loading skeleton support
 * - Empty state handling
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "../cards/ProfessionalCard";
import type { DirectoryProfessional } from "../types";

export type DirectoryCardsPanelProps = {
  /** List of professionals to display */
  professionals: DirectoryProfessional[];
  /** Loading state */
  isLoading?: boolean;
  /** Currently selected professional ID (for map sync) */
  selectedId?: string | null;
  /** Callback when a card is hovered */
  onHover?: (id: string | null) => void;
  /** Callback when a card is clicked */
  onClick?: (professional: DirectoryProfessional) => void;
  className?: string;
};

/**
 * Loading skeleton for cards grid
 */
function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div className="space-y-3" key={i}>
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no professionals match filters
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="h-8 w-8 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>No results</title>
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <h3 className="mb-2 font-semibold text-lg text-neutral-900">No professionals found</h3>
      <p className="max-w-sm text-neutral-600">
        Try adjusting your filters or search criteria to find more results.
      </p>
    </div>
  );
}

export function DirectoryCardsPanel({
  professionals,
  isLoading = false,
  selectedId,
  onHover,
  onClick,
  className,
}: DirectoryCardsPanelProps) {
  if (isLoading) {
    return (
      <div className={cn("p-6", className)}>
        <CardsSkeleton />
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className={cn("p-6", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("p-6", className)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            onMouseEnter={() => onHover?.(professional.id)}
            onMouseLeave={() => onHover?.(null)}
          >
            <ProfessionalCard
              isHighlighted={selectedId === professional.id}
              onClick={() => onClick?.(professional)}
              professional={professional}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
