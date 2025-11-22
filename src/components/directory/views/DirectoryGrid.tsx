"use client";

/**
 * DirectoryGrid - Lia Design System
 *
 * Grid layout for displaying professional cards.
 */

import { cn } from "@/lib/utils";
import { ProfessionalCard, ProfessionalCardSkeleton } from "../cards/ProfessionalCard";
import type { DirectoryProfessional } from "../types";

interface DirectoryGridProps {
  professionals: DirectoryProfessional[];
  isLoading?: boolean;
  className?: string;
}

export function DirectoryGrid({ professionals, isLoading = false, className }: DirectoryGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProfessionalCardSkeleton className="max-w-none" key={`skeleton-${i}`} size="md" />
        ))}
      </div>
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {professionals.map((professional) => (
        <ProfessionalCard
          className="max-w-none"
          key={professional.id}
          professional={professional}
          size="md"
        />
      ))}
    </div>
  );
}
