"use client";

/**
 * RevenueInsightsPanel - Add-on Revenue Analytics Component
 *
 * Airbnb host dashboard-style analytics panel for service add-ons.
 * Shows key metrics to help professionals optimize their add-on offerings.
 *
 * Features:
 * - Total add-on revenue
 * - Most popular add-on
 * - Conversion rate
 * - Average add-on value per booking
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  AnalyticsUpIcon,
  MoneyBag01Icon,
  ShoppingBasket01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { geistSans } from "@/app/fonts";
import { KPICard, KPICardGrid, KPICardSkeleton } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils/core";
import type { Currency } from "@/lib/utils/format";
import { formatFromMinorUnits } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type AddonAnalytics = {
  /** Total revenue from all add-ons */
  totalRevenueCents: number;
  /** Revenue this month */
  thisMonthRevenueCents: number;
  /** Revenue last month for comparison */
  lastMonthRevenueCents: number;
  /** Number of times add-ons were booked */
  totalBookings: number;
  /** Bookings this month */
  thisMonthBookings: number;
  /** Most popular add-on name */
  mostPopularAddon?: string;
  /** Most popular add-on booking count */
  mostPopularCount?: number;
  /** Average add-on value per booking */
  averageAddonValueCents: number;
};

export type RevenueInsightsPanelProps = {
  /** Analytics data */
  analytics: AddonAnalytics | null;
  /** Currency for display */
  currency: Currency;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Main Component
// ============================================================================

export function RevenueInsightsPanel({
  analytics,
  currency,
  isLoading = false,
  className,
}: RevenueInsightsPanelProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
        </div>
        <KPICardGrid columns={4}>
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </KPICardGrid>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center",
          className
        )}
      >
        <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
          No analytics data available yet. Add-on insights will appear once customers start booking
          your add-ons.
        </p>
      </div>
    );
  }

  // Calculate trend percentage
  const revenuePercentChange =
    analytics.lastMonthRevenueCents > 0
      ? Math.round(
          ((analytics.thisMonthRevenueCents - analytics.lastMonthRevenueCents) /
            analytics.lastMonthRevenueCents) *
            100
        )
      : analytics.thisMonthRevenueCents > 0
        ? 100
        : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
          Add-on Insights
        </h2>
        <span className="rounded-full bg-rausch-100 px-2 py-0.5 font-medium text-rausch-700 text-xs">
          This Month
        </span>
      </div>

      {/* KPI Cards */}
      <KPICardGrid columns={4}>
        {/* Total Revenue This Month */}
        <KPICard
          comparisonText="vs last month"
          icon={MoneyBag01Icon}
          label="Add-on Revenue"
          trend={revenuePercentChange > 0 ? "up" : revenuePercentChange < 0 ? "down" : "neutral"}
          trendValue={`${revenuePercentChange > 0 ? "+" : ""}${revenuePercentChange}%`}
          value={formatFromMinorUnits(analytics.thisMonthRevenueCents, currency)}
        />

        {/* Bookings with Add-ons */}
        <KPICard
          icon={ShoppingBasket01Icon}
          label="Add-on Bookings"
          subtitle={`${analytics.totalBookings} all time`}
          value={analytics.thisMonthBookings}
        />

        {/* Most Popular Add-on */}
        <KPICard
          icon={StarIcon}
          label="Top Add-on"
          subtitle={
            analytics.mostPopularCount ? `${analytics.mostPopularCount} bookings` : undefined
          }
          value={analytics.mostPopularAddon || "—"}
        />

        {/* Average Add-on Value */}
        <KPICard
          icon={AnalyticsUpIcon}
          label="Avg. Add-on Value"
          subtitle="Per booking"
          value={formatFromMinorUnits(analytics.averageAddonValueCents, currency)}
        />
      </KPICardGrid>

      {/* Quick Tips */}
      {analytics.totalBookings === 0 && (
        <div className="rounded-lg border border-babu-200 bg-babu-50 p-4">
          <p className={cn("font-medium text-babu-900 text-sm", geistSans.className)}>
            💡 Tip: Add-ons with clear value propositions get booked 40% more often.
          </p>
          <p className="mt-1 text-babu-700 text-xs">
            Try adding a photo and detailed description to your add-ons to increase bookings.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Stats Row (for inline display)
// ============================================================================

export type CompactAddonStatsProps = {
  totalRevenueCents: number;
  bookingCount: number;
  currency: Currency;
  className?: string;
};

export function CompactAddonStats({
  totalRevenueCents,
  bookingCount,
  currency,
  className,
}: CompactAddonStatsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-neutral-500 text-xs">Revenue:</span>
        <span className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
          {formatFromMinorUnits(totalRevenueCents, currency)}
        </span>
      </div>
      <div className="h-4 w-px bg-neutral-200" />
      <div className="flex items-center gap-1.5">
        <span className="text-neutral-500 text-xs">Bookings:</span>
        <span className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
          {bookingCount}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Empty State for No Add-ons
// ============================================================================

export type EmptyAddonStateProps = {
  onCreateAddon?: () => void;
  className?: string;
};

export function EmptyAddonState({ onCreateAddon, className }: EmptyAddonStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-neutral-300 border-dashed bg-neutral-50 p-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rausch-100">
        <ShoppingBasket01Icon className="h-6 w-6 text-rausch-500" />
      </div>
      <h3 className={cn("mb-2 font-semibold text-lg text-neutral-900", geistSans.className)}>
        Boost Your Earnings with Add-ons
      </h3>
      <p className="mb-4 max-w-sm text-neutral-500 text-sm">
        Create service add-ons to offer customers extra value and increase your average booking
        revenue.
      </p>
      {onCreateAddon && (
        <button
          className={cn(
            "rounded-lg bg-rausch-500 px-4 py-2 font-semibold text-sm text-white transition-colors",
            "hover:bg-rausch-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
            geistSans.className
          )}
          onClick={onCreateAddon}
          type="button"
        >
          Create Your First Add-on
        </button>
      )}
    </div>
  );
}
