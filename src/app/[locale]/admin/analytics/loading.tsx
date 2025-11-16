/**
 * Analytics Loading State
 *
 * Next.js loading.tsx file for instant loading feedback
 * Shows skeleton while analytics dashboard loads
 *
 * Week 2: Route-Level Loading States
 */

import { AnalyticsDashboardSkeleton } from "@/components/admin/analytics-dashboard-skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      <AnalyticsDashboardSkeleton />
    </div>
  );
}
