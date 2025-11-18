/**
 * UserManagementSkeleton - Loading state for user management dashboard
 *
 * Features:
 * - Search bar skeleton
 * - Table controls skeleton (filters, export)
 * - Data table skeleton
 *
 * Week 2: Route-Level Loading States
 */

import { LiaDataTableSkeleton } from "./data-table/table-skeleton";

export function UserManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search & Controls Skeleton */}
      <div className="flex items-center justify-between gap-4">
        {/* Search bar */}
        <div className="h-12 w-96 animate-pulse rounded-lg bg-neutral-200" />

        {/* Filter buttons and export */}
        <div className="flex gap-2">
          <div className="h-12 w-32 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-12 w-32 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-12 w-32 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>

      {/* Table Skeleton - 7 columns for user management */}
      <LiaDataTableSkeleton columns={7} rows={10} showHeader />
    </div>
  );
}
