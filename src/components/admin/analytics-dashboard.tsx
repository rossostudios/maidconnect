/**
 * Platform Analytics Dashboard - Refactored with Lia Design
 *
 * Architecture:
 * - Data Layer: useAnalytics custom hook (separation of concerns)
 * - Presentation Layer: Modular components (StatsContainer, Tables, etc.)
 * - Design System: Precision aesthetic (sharp geometry, Geist fonts, orange accents)
 *
 * Features:
 * - Time range filtering (7d, 30d, 90d, all time)
 * - KPI metrics with mini sparklines (Recharts)
 * - City-level analytics table (PrecisionDataTable)
 * - Category-level analytics table (PrecisionDataTable)
 * - Staggered reveal animations
 * - Professional loading skeleton
 * - Export capabilities (CSV/JSON)
 *
 * Sprint 2: Supply & Ops (Refactored 2025-01-14)
 */

"use client";

import { useState } from "react";
import { geistMono, geistSans } from "@/app/fonts";
import { type TimeRange, useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { AnalyticsDashboardSkeleton } from "./analytics-dashboard-skeleton";
import { CategoryMetricsTable } from "./CategoryMetricsTable";
import { CityMetricsTable } from "./CityMetricsTable";
import { StatsContainer } from "./StatsContainer";
import { TimeRangeSelector } from "./TimeRangeSelector";

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { metrics, cityMetrics, categoryMetrics, isLoading, error } = useAnalytics(timeRange);

  // Loading state
  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-8 text-center">
        <p className={cn("font-semibold text-red-700 text-sm uppercase", geistSans.className)}>
          Error Loading Analytics
        </p>
        <p className={cn("mt-2 font-normal text-red-600 text-sm", geistSans.className)}>{error}</p>
      </div>
    );
  }

  // No data state
  if (!metrics) {
    return (
      <div className="border border-neutral-200 bg-white p-8 text-center">
        <p className={cn("font-semibold text-neutral-700 text-sm uppercase", geistSans.className)}>
          No Analytics Data Available
        </p>
        <p className={cn("mt-2 font-normal text-neutral-600 text-sm", geistSans.className)}>
          Analytics will appear here once bookings are created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Filter */}
      <TimeRangeSelector onChange={setTimeRange} value={timeRange} />

      {/* KPI Metrics Grid (with sparklines) */}
      <StatsContainer metrics={metrics} />

      {/* Platform Overview - Total Counts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Bookings */}
        <div className="border border-neutral-200 bg-white p-6">
          <h3
            className={cn(
              "mb-2 font-semibold text-neutral-700 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Total Bookings
          </h3>
          <p
            className={cn(
              "font-semibold text-3xl text-neutral-900 tracking-tighter",
              geistMono.className
            )}
          >
            {metrics.totalBookings}
          </p>
        </div>

        {/* Total Professionals */}
        <div className="border border-neutral-200 bg-white p-6">
          <h3
            className={cn(
              "mb-2 font-semibold text-neutral-700 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Total Professionals
          </h3>
          <p
            className={cn(
              "font-semibold text-3xl text-neutral-900 tracking-tighter",
              geistMono.className
            )}
          >
            {metrics.totalProfessionals}
          </p>
        </div>

        {/* Total Customers */}
        <div className="border border-neutral-200 bg-white p-6">
          <h3
            className={cn(
              "mb-2 font-semibold text-neutral-700 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Total Customers
          </h3>
          <p
            className={cn(
              "font-semibold text-3xl text-neutral-900 tracking-tighter",
              geistMono.className
            )}
          >
            {metrics.totalCustomers}
          </p>
        </div>
      </div>

      {/* City Metrics Table */}
      <CityMetricsTable data={cityMetrics} />

      {/* Category Metrics Table */}
      <CategoryMetricsTable data={categoryMetrics} />
    </div>
  );
}
