/**
 * Analytics Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while analytics dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { AnalyticsDashboardSkeleton } from "@/components/admin/analytics-dashboard-skeleton";
import { LoadingCamper } from "@/components/ui/loading-camper";

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto space-y-8 px-6 py-8">
      <div className="flex justify-center">
        <LoadingCamper size="lg" text="Crunching telemetry" />
      </div>
      <AnalyticsDashboardSkeleton />
    </div>
  );
}
