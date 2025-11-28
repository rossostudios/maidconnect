/**
 * InsightEngine - Charts Row Container
 *
 * Combines:
 * - UpcomingJobsList (1/3 width) - Next 3 jobs preview (replaced ServiceBreakdown)
 * - RevenueFlowChart (2/3 width) - Bar chart with insight box
 *
 * Why the change? Domestic workers care more about "What's next?" than
 * historical service distribution. UpcomingJobsList shows actionable info.
 *
 * Responsive layout: stacks on mobile, side-by-side on desktop.
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/utils/format";
import {
  RevenueFlowChart,
  RevenueFlowChartSkeleton,
  type RevenueFlowPoint,
} from "./RevenueFlowChart";
import { type UpcomingJob, UpcomingJobsList, UpcomingJobsListSkeleton } from "./UpcomingJobsList";

// ========================================
// Types
// ========================================

type InsightEngineProps = {
  upcomingJobs: UpcomingJob[];
  revenueData: RevenueFlowPoint[];
  currencyCode?: Currency;
  className?: string;
};

// ========================================
// Components
// ========================================

export function InsightEngine({
  upcomingJobs,
  revenueData,
  currencyCode = "COP",
  className,
}: InsightEngineProps) {
  const router = useRouter();

  const handleViewAllBookings = () => {
    router.push("/dashboard/pro/bookings");
  };

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      <UpcomingJobsList
        className="md:col-span-1"
        jobs={upcomingJobs}
        onViewAll={handleViewAllBookings}
      />
      <RevenueFlowChart className="md:col-span-2" currencyCode={currencyCode} data={revenueData} />
    </div>
  );
}

// ========================================
// Skeleton
// ========================================

export function InsightEngineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      <UpcomingJobsListSkeleton className="md:col-span-1" />
      <RevenueFlowChartSkeleton className="md:col-span-2" />
    </div>
  );
}
