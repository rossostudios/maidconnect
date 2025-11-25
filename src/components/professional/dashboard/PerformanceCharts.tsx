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
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { DateRangeFilter, type DatePeriod } from "./DateRangeFilter";

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
  className?: string;
};

export function PerformanceCharts({ className }: PerformanceChartsProps) {
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
    <div className={cn("rounded-lg border border-neutral-200 bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4">
        <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
          Performance
        </h2>
        <DateRangeFilter value={period} onChange={setPeriod} size="sm" />
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <PerformanceChartsSkeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500 text-sm">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="mt-2 text-orange-600 text-sm hover:text-orange-700"
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Bookings"
                value={data.bookings.total}
                trend={data.bookings.trend}
                icon={Calendar03Icon}
                index={0}
              />
              <KPICard
                label="Rating"
                value={data.performance.rating}
                suffix="★"
                subtext={`${data.performance.totalReviews} reviews`}
                icon={StarIcon}
                index={1}
              />
              <KPICard
                label="Response Rate"
                value={data.performance.responseRate}
                suffix="%"
                icon={Clock01Icon}
                index={2}
              />
              <KPICard
                label="Completion Rate"
                value={data.performance.completionRate}
                suffix="%"
                icon={CheckmarkCircle02Icon}
                index={3}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Earnings Trend Chart */}
              <EarningsTrendChart
                data={data.charts.earningsTrend}
                currency={data.currencyCode}
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
  icon: React.ComponentType;
  index: number;
};

function KPICard({ label, value, suffix = "", trend, subtext, icon: Icon, index }: KPICardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-neutral-600 text-xs uppercase tracking-wide">
          {label}
        </span>
        <HugeiconsIcon icon={Icon} className="h-4 w-4 text-neutral-400" />
      </div>

      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold text-2xl text-neutral-900", geistSans.className)}>
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
        </span>
        {suffix && <span className="font-medium text-neutral-600 text-sm">{suffix}</span>}
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
                icon={isPositiveTrend ? ArrowUp01Icon : ArrowDown01Icon}
                className="h-3 w-3"
              />
              {Math.abs(trend)}%
            </span>
          ) : subtext ? (
            <span className="text-neutral-500 text-xs">{subtext}</span>
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
      color: "#D97757", // orange-500
    },
  };

  const formatValue = (value: number) => formatFromMinorUnits(value, currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-lg border border-neutral-200 bg-neutral-50/30 p-4"
    >
      <h3 className={cn("mb-4 font-medium text-neutral-700 text-sm", geistSans.className)}>
        Earnings Trend
      </h3>

      {data.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-48">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97757" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D97757" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-neutral-500"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                // Compact format for Y axis
                const formatted = formatFromMinorUnits(v, currency);
                // Extract just the number part for cleaner display
                return formatted.replace(/[^0-9.,K-]+/g, '').slice(0, 6);
              }}
              className="text-neutral-500"
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  valueFormatter={formatValue}
                  indicator="line"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#D97757"
              strokeWidth={2}
              fill="url(#earningsGradient)"
              name="Earnings"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-neutral-500 text-sm">No earnings data for this period</p>
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
      color: "#6A9BCC", // blue-500
    },
    cancelled: {
      label: "Cancelled",
      color: "#B0AEA5", // neutral-500
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-lg border border-neutral-200 bg-neutral-50/30 p-4"
    >
      <h3 className={cn("mb-4 font-medium text-neutral-700 text-sm", geistSans.className)}>
        Booking Activity
      </h3>

      {data.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-48">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-neutral-500"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-neutral-500"
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="completed" fill="#788C5D" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="upcoming" fill="#6A9BCC" radius={[4, 4, 0, 0]} name="Upcoming" />
            <Bar dataKey="cancelled" fill="#B0AEA5" radius={[4, 4, 0, 0]} name="Cancelled" />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-neutral-500 text-sm">No booking activity for this period</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#788C5D]" />
          <span className="text-neutral-600 text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#6A9BCC]" />
          <span className="text-neutral-600 text-xs">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#B0AEA5]" />
          <span className="text-neutral-600 text-xs">Cancelled</span>
        </div>
      </div>
    </motion.div>
  );
}

function PerformanceChartsSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-neutral-200" />
              <div className="h-4 w-4 rounded bg-neutral-200" />
            </div>
            <div className="h-8 w-16 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-12 rounded bg-neutral-200" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-neutral-200 bg-neutral-50/30 p-4">
            <div className="mb-4 h-4 w-24 rounded bg-neutral-200" />
            <div className="h-48 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
