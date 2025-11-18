/**
 * Analytics Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while analytics dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsDashboardSkeleton } from "@/components/admin/analytics-dashboard-skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto space-y-8 px-6 py-8">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-12 w-12 animate-spin text-orange-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">Crunching telemetry</p>
        </div>
      </div>
      <AnalyticsDashboardSkeleton />
    </div>
  );
}
