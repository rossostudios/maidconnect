/**
 * Real-time Stats Panel
 *
 * Displays live-updating dashboard statistics using WebSocket subscriptions.
 * Updates automatically when database changes occur (bookings, users, professionals).
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import { useState } from "react";
import { useRealtimeAdminStats } from "@/hooks/use-realtime-admin-stats";
import { formatCurrency } from "@/lib/utils/format";
import { DateRange, DateRangePicker } from "@/components/ui/date-range-picker";
import { StatCard } from "./StatCard";

type RealtimeStatsPanelProps = {
  /**
   * Whether real-time updates are enabled
   * @default true
   */
  enabled?: boolean;
};

/**
 * Real-time statistics panel for admin dashboard
 *
 * Automatically updates metrics when database changes occur:
 * - Total Bookings: Updates on booking inserts
 * - Pending Bookings: Updates on booking status changes
 * - Active Users: Updates on new user registrations
 * - Total Revenue: Updates when bookings are completed
 * - New Professionals: Updates on professional applications
 *
 * @example
 * ```tsx
 * // In analytics page or dashboard
 * <RealtimeStatsPanel />
 * ```
 *
 * @example
 * ```tsx
 * // Conditional real-time (only for admins)
 * <RealtimeStatsPanel enabled={user.role === 'admin'} />
 * ```
 */
export function RealtimeStatsPanel({ enabled = true }: RealtimeStatsPanelProps) {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const { stats, isLoading, error } = useRealtimeAdminStats({ enabled, dateRange });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="rounded-lg border border-neutral-200 bg-white p-6" key={i}>
            <div className="mb-4 h-4 w-32 animate-pulse rounded-lg bg-neutral-200" />
            <div className="mb-3 h-10 w-24 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-4 w-40 animate-pulse rounded-lg bg-neutral-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 text-sm">Failed to load real-time stats: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const isFiltered = !!dateRange.from;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-medium text-2xl text-neutral-900 leading-none">Performance Overview</h2>
          <p className="mt-1 text-neutral-600 text-sm leading-none">
            {isFiltered ? "Overview of key performance indicators" : "Real-time statistics updated automatically"}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <DateRangePicker
            onChange={setDateRange}
            placeholder="Filter by date"
            value={dateRange}
          />
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          description="All bookings in system"
          sparklineData={stats.sparklines?.bookings}
          title="Total Bookings"
          value={stats.totalBookings.toString()}
        />

        <StatCard
          description="Awaiting confirmation"
          title="Pending Bookings"
          value={stats.pendingBookings.toString()}
        />

        <StatCard
          description="Registered platform users"
          sparklineData={stats.sparklines?.users}
          title="Active Users"
          value={stats.activeUsers.toString()}
        />

        <StatCard
          description="Completed bookings (all markets)"
          sparklineData={stats.sparklines?.revenue}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue, { currency: "COP" })}
        />

        <StatCard
          description={isFiltered ? "In selected period" : "Last 30 days"}
          sparklineData={stats.sparklines?.professionals}
          title="New Professionals"
          value={stats.newProfessionals.toString()}
        />
      </div>

      {/* Last Updated Timestamp */}
      {!isFiltered && (
        <div className="flex items-center justify-end gap-2 text-neutral-500 text-xs">
          <span>Last updated:</span>
          <time dateTime={stats.lastUpdated}>{new Date(stats.lastUpdated).toLocaleTimeString()}</time>
        </div>
      )}
    </div>
  );
}
