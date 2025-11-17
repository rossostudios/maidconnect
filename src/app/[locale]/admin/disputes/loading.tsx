/**
 * Dispute Resolution Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while dispute resolution dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { DisputeResolutionSkeleton } from "@/components/admin/dispute-resolution-skeleton";
import { LoadingCamper } from "@/components/ui/loading-camper";

export default function DisputesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <LoadingCamper size="lg" text="Reviewing disputes" />
      </div>
      {/* Page Header Skeleton */}
      <div>
        <div className="mb-1.5 h-9 w-64 animate-pulse bg-neutral-200" />
        <div className="h-5 w-96 animate-pulse bg-neutral-200" />
      </div>

      {/* Dashboard Skeleton */}
      <DisputeResolutionSkeleton />
    </div>
  );
}
