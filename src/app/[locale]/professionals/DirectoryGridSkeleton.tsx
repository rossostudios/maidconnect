"use client";

/**
 * DirectoryGridSkeleton - Loading state for the professionals directory
 */

import { ProfessionalCardSkeleton } from "@/components/directory/cards/ProfessionalCard";

export function DirectoryGridSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-64 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-96 animate-pulse rounded bg-neutral-200" />
      </div>

      {/* Controls skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-neutral-200" />
        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="flex gap-8">
        {/* Sidebar skeleton - hidden on mobile */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="h-[600px] animate-pulse rounded-lg bg-neutral-200" />
        </aside>

        {/* Main content skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProfessionalCardSkeleton className="max-w-none" key={`skeleton-${i}`} size="md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
