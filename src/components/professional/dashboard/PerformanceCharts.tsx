/**
 * PerformanceCharts - Analytics Section with Charts and KPIs
 *
 * Displays professional performance data:
 * - KPI Cards: Bookings, Rating, Response Rate, Completion Rate
 * - Earnings Trend Chart: Area chart showing earnings over time
 * - Booking Activity Chart: Bar chart showing booking status distribution
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Orange accent for primary data
 * - Neutral colors for secondary data
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { geistSans } from "@/app/fonts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";
import { type DatePeriod, DateRangeFilter } from "./DateRangeFilter";

type EarningsTrendPoint = {
  date: string;
  amount: number;
};

type BookingActivityPoint = {
  date: string;
  completed: number;
  upcoming: number;
  cancelled: number;
};

type PerformanceData = {
  rating: number;
  totalReviews: number;
  responseRate: number;
  completionRate: number;
};

type BookingsData = {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  trend: number;
};

type DashboardStats = {
  period: DatePeriod;
  currencyCode: Currency;
  earnings: {
    paid: number;
    upcoming: number;
    pending: number;
    trend: number;
    paidBookingsCount: number;
    upcomingBookingsCount: number;
  };
  bookings: BookingsData;
  performance: PerformanceData;
  charts: {
    earningsTrend: EarningsTrendPoint[];
    bookingActivity: BookingActivityPoint[];
  };
};

type PerformanceChartsProps = {
  /** Whether to show KPI cards (default: true). Set to false when using standalone PerformanceKPIs */
  showKPIs?: boolean;
  className?: string;
};

export function PerformanceCharts({ showKPIs = true, className }: PerformanceChartsProps) {
  const [period, setPeriod] = useState<DatePeriod>("7d");
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pro/dashboard/stats?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }
      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b px-6 py-4">
        <h2 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
          Performance
        </h2>
        <DateRangeFilter onChange={setPeriod} size="sm" value={period} />
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <PerformanceChartsSkeleton showKPIs={showKPIs} />
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">{error}</p>
            <button
              className="mt-2 text-rausch-600 text-sm hover:text-rausch-700"
              onClick={fetchData}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* KPI Cards - Optional (hidden when using standalone PerformanceKPIs) */}
            {showKPIs && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  icon={Calendar03Icon}
                  index={0}
                  label="Bookings"
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
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Earnings Trend Chart */}
              <EarningsTrendChart
                currency={data.currencyCode}
                data={data.charts.earningsTrend}
                period={period}
              />

              {/* Booking Activity Chart */}
              <BookingActivityChart data={data.charts.bookingActivity} period={period} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
      className="rounded-lg border border-border bg-muted/30 p-4"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </span>
        <HugeiconsIcon className="h-4 w-4 text-muted-foreground/70" icon={Icon} />
      </div>

      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold text-2xl text-foreground", geistSans.className)}>
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
        </span>
        {suffix && <span className="font-medium text-muted-foreground text-sm">{suffix}</span>}
      </div>

      {(trend !== undefined || subtext) && (
        <div className="mt-1 flex items-center gap-1">
          {trend !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium text-xs",
                isPositiveTrend ? "text-green-600" : "text-red-500"
              )}
            >
              <HugeiconsIcon
                className="h-3 w-3"
                icon={isPositiveTrend ? ArrowUp01Icon : ArrowDown01Icon}
              />
              {Math.abs(trend)}%
            </span>
          ) : subtext ? (
            <span className="text-muted-foreground text-xs">{subtext}</span>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

type EarningsTrendChartProps = {
  data: EarningsTrendPoint[];
  currency: Currency;
  period: DatePeriod;
};

function EarningsTrendChart({ data, currency, period }: EarningsTrendChartProps) {
  const chartConfig = {
    amount: {
      label: "Earnings",
      color: "#7A3B4A", // rausch-500 (Burgundy)
    },
  };

  const formatValue = (value: number) => formatFromMinorUnits(value, currency);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/20 p-4"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className={cn("mb-4 font-medium text-muted-foreground text-sm", geistSans.className)}>
        Earnings Trend
      </h3>

      {data.length > 0 ? (
        <ChartContainer className="h-48" config={chartConfig}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#7A3B4A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7A3B4A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid className="stroke-neutral-200" strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              className="text-neutral-500"
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              className="text-muted-foreground"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => {
                // Compact format for Y axis
                const formatted = formatFromMinorUnits(v, currency);
                // Extract just the number part for cleaner display
                return formatted.replace(/[^0-9.,K-]+/g, "").slice(0, 6);
              }}
              tickLine={false}
              width={50}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" valueFormatter={formatValue} />}
            />
            <Area
              dataKey="amount"
              fill="url(#earningsGradient)"
              name="Earnings"
              stroke="#7A3B4A"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground text-sm">No earnings data for this period</p>
        </div>
      )}
    </motion.div>
  );
}

type BookingActivityChartProps = {
  data: BookingActivityPoint[];
  period: DatePeriod;
};

function BookingActivityChart({ data, period }: BookingActivityChartProps) {
  const chartConfig = {
    completed: {
      label: "Completed",
      color: "#788C5D", // green-500
    },
    upcoming: {
      label: "Upcoming",
      color: "#00A699", // babu-500 (Airbnb teal)
    },
    cancelled: {
      label: "Cancelled",
      color: "#B0AEA5", // neutral-500
    },
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/20 p-4"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <h3 className={cn("mb-4 font-medium text-muted-foreground text-sm", geistSans.className)}>
        Booking Activity
      </h3>

      {data.length > 0 ? (
        <ChartContainer className="h-48" config={chartConfig}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid className="stroke-border" strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              className="text-muted-foreground"
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              className="text-muted-foreground"
              tick={{ fontSize: 11 }}
              tickLine={false}
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="completed" fill="#788C5D" name="Completed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="upcoming" fill="#00A699" name="Upcoming" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="#B0AEA5" name="Cancelled" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground text-sm">No booking activity for this period</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#788C5D]" />
          <span className="text-muted-foreground text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#00A699]" />
          <span className="text-muted-foreground text-xs">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#B0AEA5]" />
          <span className="text-muted-foreground text-xs">Cancelled</span>
        </div>
      </div>
    </motion.div>
  );
}

function PerformanceChartsSkeleton({ showKPIs = true }: { showKPIs?: boolean }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton - Optional */}
      {showKPIs && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div className="animate-pulse rounded-lg border border-border bg-muted/30 p-4" key={i}>
              <div className="mb-2 flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-4 rounded bg-muted" />
              </div>
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div className="animate-pulse rounded-lg border border-border bg-muted/20 p-4" key={i}>
            <div className="mb-4 h-4 w-24 rounded bg-muted" />
            <div className="h-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
