/**
 * User Management Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while user management dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { UserManagementSkeleton } from "@/components/admin/user-management-skeleton";
import { LoadingCamper } from "@/components/ui/loading-camper";

export default function UsersLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <LoadingCamper size="lg" text="Loading users" />
      </div>
      {/* Page Header Skeleton */}
      <div>
        <div className="mb-1.5 h-9 w-64 animate-pulse bg-neutral-200" />
        <div className="h-5 w-96 animate-pulse bg-neutral-200" />
      </div>

      {/* Dashboard Skeleton */}
      <UserManagementSkeleton />
    </div>
  );
}
