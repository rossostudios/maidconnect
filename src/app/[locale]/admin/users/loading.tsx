/**
 * User Management Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while user management dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserManagementSkeleton } from "@/components/admin/user-management-skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-12 w-12 animate-spin text-rausch-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">Loading users</p>
        </div>
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
