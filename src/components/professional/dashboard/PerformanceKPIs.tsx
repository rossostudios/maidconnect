/**
 * PerformanceKPIs - Always-Visible KPI Grid (Airbnb-Style)
 *
 * Displays 4 key performance indicators:
 * - Bookings (with trend)
 * - Rating (with review count)
 * - Response Rate
 * - Completion Rate
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Neutral backgrounds with subtle borders
 * - Color-coded trend indicators
 */

"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

// ========================================
// Types
// ========================================

type PerformanceData = {
  rating: number;
  totalReviews: number;
  responseRate: number;
  completionRate: number;
};

type BookingsData = {
  total: number;
  trend: number;
};

type KPIData = {
  bookings: BookingsData;
  performance: PerformanceData;
};

type PerformanceKPIsProps = {
  className?: string;
};

// ========================================
// Main Component
// ========================================

export function PerformanceKPIs({ className }: PerformanceKPIsProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/dashboard/stats?period=30d");
      if (!response.ok) {
        throw new Error("Failed to fetch KPI data");
      }
      const result = await response.json();
      if (result.success) {
        setData({
          bookings: result.bookings,
          performance: result.performance,
        });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KPIs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <KPISkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
        <p className="text-center text-muted-foreground text-sm">{error}</p>
        <button
          className="mt-2 block w-full text-center text-rausch-600 text-sm hover:text-rausch-700"
          onClick={fetchData}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <h2 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
        Performance
      </h2>

      {/* KPI Grid - Always visible */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={Calendar03Icon}
          index={0}
          label="Bookings"
          subtext="last 30 days"
          trend={data.bookings.trend}
          value={data.bookings.total}
        />
        <KPICard
          icon={StarIcon}
          index={1}
          label="Rating"
          subtext={`${data.performance.totalReviews} reviews`}
          suffix="★"
          value={data.performance.rating}
        />
        <KPICard
          icon={Clock01Icon}
          index={2}
          label="Response Rate"
          suffix="%"
          value={data.performance.responseRate}
        />
        <KPICard
          icon={CheckmarkCircle02Icon}
          index={3}
          label="Completion Rate"
          suffix="%"
          value={data.performance.completionRate}
        />
      </div>
    </div>
  );
}

// ========================================
// KPI Card Component
// ========================================

type KPICardProps = {
  label: string;
  value: number;
  suffix?: string;
  trend?: number;
  subtext?: string;
  icon: HugeIcon;
  index: number;
};

function KPICard({ label, value, suffix = "", trend, subtext, icon: Icon, index }: KPICardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-4",
        "border-stone-800/60 bg-stone-900/50",
        "dark:border-rausch-800/40 dark:bg-rausch-950/30"
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "font-medium text-xs uppercase tracking-wide",
            "text-stone-400 dark:text-rausch-300"
          )}
        >
          {label}
        </span>
        <HugeiconsIcon className="h-4 w-4 text-stone-500 dark:text-rausch-400" icon={Icon} />
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold text-2xl",
            "text-stone-100 dark:text-rausch-50",
            geistSans.className
          )}
        >
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
        </span>
        {suffix && (
          <span className="font-medium text-sm text-stone-400 dark:text-rausch-300">{suffix}</span>
        )}
      </div>

      {(trend !== undefined || subtext) && (
        <div className="mt-1 flex items-center gap-1">
          {trend !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium text-xs",
                isPositiveTrend
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              <HugeiconsIcon
                className="h-3 w-3"
                icon={isPositiveTrend ? ArrowUp01Icon : ArrowDown01Icon}
              />
              {Math.abs(trend)}%
            </span>
          ) : subtext ? (
            <span className="text-stone-500 text-xs dark:text-rausch-400">{subtext}</span>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

// ========================================
// Skeleton Component
// ========================================

function KPISkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-6 w-32 animate-pulse rounded bg-stone-800/40 dark:bg-rausch-900/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            className={cn(
              "animate-pulse rounded-lg border p-4",
              "border-stone-800/60 bg-stone-900/50",
              "dark:border-rausch-800/40 dark:bg-rausch-950/30"
            )}
            key={i}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
              <div className="h-4 w-4 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
            </div>
            <div className="h-8 w-16 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
            <div className="mt-2 h-3 w-12 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
