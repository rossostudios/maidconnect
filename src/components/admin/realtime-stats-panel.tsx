/**
 * Real-time Stats Panel
 *
 * Displays live-updating dashboard statistics using WebSocket subscriptions.
 * Updates automatically when database changes occur (bookings, users, professionals).
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import { useRealtimeDashboardStats } from "@/hooks/use-realtime-stats";
import { formatCurrency } from "@/lib/utils/format";
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
  const { stats, isLoading, error } = useRealtimeDashboardStats({ enabled });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="border border-neutral-200 bg-white p-6" key={i}>
            <div className="mb-4 h-4 w-32 animate-pulse bg-neutral-200" />
            <div className="mb-3 h-10 w-24 animate-pulse bg-neutral-200" />
            <div className="h-4 w-40 animate-pulse bg-neutral-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 text-sm">Failed to load real-time stats: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Determine status levels based on typical benchmarks
  const getBookingStatus = (count: number): "good" | "neutral" | "poor" => {
    if (count >= 100) {
      return "good";
    }
    if (count >= 50) {
      return "neutral";
    }
    return "poor";
  };

  const getPendingStatus = (count: number): "good" | "neutral" | "poor" => {
    if (count <= 5) {
      return "good";
    }
    if (count <= 15) {
      return "neutral";
    }
    return "poor";
  };

  const getUsersStatus = (count: number): "good" | "neutral" | "poor" => {
    if (count >= 1000) {
      return "good";
    }
    if (count >= 500) {
      return "neutral";
    }
    return "poor";
  };

  const getRevenueStatus = (amount: number): "good" | "neutral" | "poor" => {
    if (amount >= 10_000_000) {
      return "good"; // 10M COP
    }
    if (amount >= 5_000_000) {
      return "neutral"; // 5M COP
    }
    return "poor";
  };

  const getProfessionalsStatus = (count: number): "good" | "neutral" | "poor" => {
    if (count >= 20) {
      return "good";
    }
    if (count >= 10) {
      return "neutral";
    }
    return "poor";
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="font-bold text-2xl text-neutral-900">Live Dashboard Metrics</h2>
        <p className="text-neutral-600 text-sm">Real-time statistics updated automatically</p>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          description="All bookings in system"
          featured
          status={getBookingStatus(stats.totalBookings)}
          title="Total Bookings"
          value={stats.totalBookings.toString()}
        />

        <StatCard
          description="Awaiting confirmation"
          status={getPendingStatus(stats.pendingBookings)}
          title="Pending Bookings"
          value={stats.pendingBookings.toString()}
        />

        <StatCard
          description="Registered platform users"
          status={getUsersStatus(stats.activeUsers)}
          title="Active Users"
          value={stats.activeUsers.toString()}
        />

        <StatCard
          description="Completed bookings"
          status={getRevenueStatus(stats.totalRevenue)}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue, "COP")}
        />

        <StatCard
          description="Last 30 days"
          status={getProfessionalsStatus(stats.newProfessionals)}
          title="New Professionals"
          value={stats.newProfessionals.toString()}
        />
      </div>

      {/* Last Updated Timestamp */}
      <div className="flex items-center justify-end gap-2 text-neutral-500 text-xs">
        <span>Last updated:</span>
        <time dateTime={stats.lastUpdated}>{new Date(stats.lastUpdated).toLocaleTimeString()}</time>
      </div>
    </div>
  );
}
