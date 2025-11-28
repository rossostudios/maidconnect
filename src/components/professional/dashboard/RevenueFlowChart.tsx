/**
 * RevenueFlowChart - Monthly Revenue Bar Chart with Insight Box
 *
 * Displays monthly revenue data with:
 * - Bar chart showing revenue per month
 * - Floating "Best Performing Month" insight box
 * - Highlighted best month with accent color
 *
 * Uses Recharts (restyled from existing PerformanceCharts).
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { geistSans } from "@/app/fonts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

export type RevenueFlowPoint = {
  month: string;
  amount: number;
};

type RevenueFlowChartProps = {
  data: RevenueFlowPoint[];
  currencyCode?: Currency;
  className?: string;
};

// ========================================
// Mock Data (Development)
// ========================================

export const MOCK_REVENUE_FLOW: RevenueFlowPoint[] = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 5_150_000_000 },
  { month: "Apr", amount: 3_800_000_000 },
  { month: "May", amount: 4_200_000_000 },
  { month: "Jun", amount: 2_871_000_000 },
  { month: "Jul", amount: 0 },
  { month: "Aug", amount: 0 },
  { month: "Sep", amount: 0 },
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
];

// ========================================
// Components
// ========================================

export function RevenueFlowChart({ data, currencyCode = "COP", className }: RevenueFlowChartProps) {
  // Calculate total revenue and find best month
  const { totalRevenue, bestMonth } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const best = data.reduce((max, item) => (item.amount > max.amount ? item : max), {
      month: "",
      amount: 0,
    });
    return { totalRevenue: total, bestMonth: best };
  }, [data]);

  const chartConfig = {
    amount: {
      label: "Revenue",
      color: "#00A699", // babu-500
    },
  };

  const formatValue = (value: number) => formatFromMinorUnits(value, currencyCode);

  // Color for bars - highlight best month
  const getBarColor = (month: string) => {
    if (month === bestMonth.month) {
      return "#00A699"; // babu-500 - highlighted
    }
    return "#00A699"; // babu-500 - normal (can adjust opacity via cell)
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      {/* Header */}
      <div className="mb-1 flex items-baseline justify-between">
        <h3
          className={cn(
            "font-semibold text-sm",
            "text-neutral-900 dark:text-foreground",
            geistSans.className
          )}
        >
          Revenue Flow
        </h3>
      </div>

      {/* Total Revenue */}
      <p
        className={cn(
          "mb-1 font-bold text-2xl",
          "text-neutral-900 dark:text-foreground",
          geistSans.className
        )}
      >
        {formatValue(totalRevenue)}
      </p>
      <p className={cn("mb-4 text-xs", "text-neutral-600 dark:text-muted-foreground", geistSans.className)}>
        Total Revenue (Last 6 Months)
      </p>

      {/* Insight Box - Inline on mobile, floating on desktop */}
      {bestMonth.amount > 0 && (
        <div
          className={cn(
            "z-10 max-w-[180px] rounded-lg p-3",
            "bg-neutral-100/95 dark:bg-muted/95",
            "border border-neutral-200 dark:border-border",
            // Mobile: inline below subtitle
            "mb-4",
            // Desktop: absolute positioned floating
            "md:absolute md:top-24 md:left-5 md:mb-0"
          )}
        >
          <h4
            className={cn(
              "font-semibold text-sm",
              "text-neutral-900 dark:text-foreground",
              geistSans.className
            )}
          >
            Best Performing Month
          </h4>
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              "text-neutral-600 dark:text-muted-foreground",
              geistSans.className
            )}
          >
            {bestMonth.month} is the highest revenue for the last 6 months with{" "}
            {formatValue(bestMonth.amount)}
          </p>
        </div>
      )}

      {/* Chart */}
      {data.length > 0 ? (
        <ChartContainer className="h-40 sm:h-44 lg:h-48" config={chartConfig}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              className="stroke-neutral-200 dark:stroke-border"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              className="text-neutral-500 dark:text-muted-foreground"
              dataKey="month"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              className="text-neutral-500 dark:text-muted-foreground"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickFormatter={(v) => {
                if (v === 0) {
                  return "0";
                }
                const formatted = formatFromMinorUnits(v, currencyCode);
                // Extract compact format
                return formatted.replace(/[^0-9.,KMB-]+/g, "").slice(0, 6);
              }}
              tickLine={false}
              width={50}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" valueFormatter={formatValue} />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="amount" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  fill={getBarColor(entry.month)}
                  fillOpacity={entry.month === bestMonth.month ? 1 : 0.6}
                  key={`cell-${index}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex h-40 items-center justify-center sm:h-44 lg:h-48">
          <p className="text-sm text-neutral-500 dark:text-muted-foreground">
            No revenue data for this period
          </p>
        </div>
      )}

      {/* Tooltip for best month in chart area */}
      {bestMonth.amount > 0 && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <div className="h-3 w-3 rounded-sm bg-babu-500" />
          <span className="text-neutral-600 text-xs dark:text-muted-foreground">
            {formatValue(bestMonth.amount)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ========================================
// Skeleton
// ========================================

export function RevenueFlowChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
    >
      <div className="mb-1 h-4 w-24 rounded bg-neutral-200 dark:bg-muted" />
      <div className="mb-1 h-8 w-32 rounded bg-neutral-200 dark:bg-muted" />
      <div className="mb-4 h-3 w-40 rounded bg-neutral-200 dark:bg-muted" />
      <div className="h-40 rounded bg-neutral-200 sm:h-44 lg:h-48 dark:bg-muted" />
    </div>
  );
}
