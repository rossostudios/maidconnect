/**
 * DisputeResolutionSkeleton - Loading state for dispute resolution dashboard
 *
 * Features:
 * - Search bar skeleton
 * - Table controls skeleton (filters, export)
 * - Data table skeleton
 *
 * Week 2: Route-Level Loading States
 */

import { PrecisionDataTableSkeleton } from "./data-table/table-skeleton";

export function DisputeResolutionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search & Controls Skeleton */}
      <div className="flex items-center justify-between gap-4">
        {/* Search bar */}
        <div className="h-12 w-96 animate-pulse bg-neutral-200" />

        {/* Filter buttons and export */}
        <div className="flex gap-2">
          <div className="h-12 w-32 animate-pulse bg-neutral-200" />
          <div className="h-12 w-32 animate-pulse bg-neutral-200" />
          <div className="h-12 w-32 animate-pulse bg-neutral-200" />
        </div>
      </div>

      {/* Table Skeleton - 6 columns for dispute management */}
      <PrecisionDataTableSkeleton columns={6} rows={10} showHeader />
    </div>
  );
}
