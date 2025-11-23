/**
 * EarningsComparison - Airbnb-Inspired Year-over-Year Dashboard
 *
 * Shows earnings comparisons (this month vs same month last year),
 * payout projections, and gross vs net visibility.
 *
 * Inspired by Airbnb's October 2025 redesigned Earnings Dashboard.
 *
 * Following Lia Design System.
 */

"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  DollarCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  eachMonthOfInterval,
  format,
  isSameMonth,
  parseISO,
  subMonths,
  subYears,
} from "date-fns";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/core";
import type { Currency } from "@/lib/utils/format";

// Platform commission rate (15%)
const PLATFORM_FEE_RATE = 0.15;

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_captured: number | null;
  amount_authorized: number | null;
  currency: string | null;
  service_name: string | null;
  created_at: string;
};

type EarningsComparisonProps = {
  bookings: Booking[];
  currencyCode: Currency;
  className?: string;
};

// Dynamically import Recharts
const ComparisonChartComponent = dynamic(
  () =>
    import("recharts").then((mod) => ({
      default: ({
        data,
        formatCurrency,
      }: {
        data: Array<{
          month: string;
          thisYear: number;
          lastYear: number;
        }>;
        formatCurrency: (value: number) => string;
      }) => {
        const {
          BarChart,
          Bar,
          CartesianGrid,
          XAxis,
          YAxis,
          Tooltip,
          ResponsiveContainer,
          Legend,
        } = mod;
        return (
          <ResponsiveContainer height={280} width="100%">
            <BarChart barGap={4} data={data}>
              <CartesianGrid stroke="#E8E6DC" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#68665F" style={{ fontSize: 11 }} />
              <YAxis
                stroke="#68665F"
                style={{ fontSize: 11 }}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E8E6DC",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                formatter={(value: number) => formatCurrency(value * 1000)}
              />
              <Legend
                formatter={(value) => (value === "thisYear" ? "This Year" : "Last Year")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="lastYear" fill="#B0AEA5" name="lastYear" radius={[4, 4, 0, 0]} />
              <Bar dataKey="thisYear" fill="#D97757" name="thisYear" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

function ChartSkeleton() {
  return (
    <div className="flex h-[280px] w-full items-center justify-center">
      <div className="h-full w-full animate-pulse rounded-lg bg-neutral-100" />
    </div>
  );
}

export function EarningsComparison({ bookings, currencyCode, className }: EarningsComparisonProps) {
  const [timeRange, setTimeRange] = useState<"6m" | "12m">("6m");

  // Calculate YoY comparison data
  const comparisonData = useMemo(() => {
    const monthsCount = timeRange === "6m" ? 6 : 12;
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), monthsCount - 1),
      end: new Date(),
    });

    return months.map((month) => {
      const lastYearMonth = subYears(month, 1);

      // This year's earnings
      const thisYearBookings = bookings.filter(
        (b) =>
          b.scheduled_start &&
          b.status === "completed" &&
          isSameMonth(parseISO(b.scheduled_start), month)
      );
      const thisYearEarnings = thisYearBookings.reduce(
        (sum, b) => sum + (b.amount_captured || 0),
        0
      );

      // Last year's earnings
      const lastYearBookings = bookings.filter(
        (b) =>
          b.scheduled_start &&
          b.status === "completed" &&
          isSameMonth(parseISO(b.scheduled_start), lastYearMonth)
      );
      const lastYearEarnings = lastYearBookings.reduce(
        (sum, b) => sum + (b.amount_captured || 0),
        0
      );

      return {
        month: format(month, "MMM"),
        thisYear: thisYearEarnings / 1000,
        lastYear: lastYearEarnings / 1000,
        thisYearCount: thisYearBookings.length,
        lastYearCount: lastYearBookings.length,
      };
    });
  }, [bookings, timeRange]);

  // Calculate current month comparison
  const currentMonthComparison = useMemo(() => {
    const now = new Date();
    const lastYear = subYears(now, 1);

    const thisMonthBookings = bookings.filter(
      (b) =>
        b.scheduled_start && b.status === "completed" && isSameMonth(parseISO(b.scheduled_start), now)
    );
    const lastYearSameMonthBookings = bookings.filter(
      (b) =>
        b.scheduled_start &&
        b.status === "completed" &&
        isSameMonth(parseISO(b.scheduled_start), lastYear)
    );

    const thisMonthEarnings = thisMonthBookings.reduce(
      (sum, b) => sum + (b.amount_captured || 0),
      0
    );
    const lastYearSameMonthEarnings = lastYearSameMonthBookings.reduce(
      (sum, b) => sum + (b.amount_captured || 0),
      0
    );

    const percentChange =
      lastYearSameMonthEarnings > 0
        ? ((thisMonthEarnings - lastYearSameMonthEarnings) / lastYearSameMonthEarnings) * 100
        : thisMonthEarnings > 0
          ? 100
          : 0;

    return {
      thisMonth: thisMonthEarnings,
      lastYearSameMonth: lastYearSameMonthEarnings,
      percentChange,
      thisMonthCount: thisMonthBookings.length,
      lastYearCount: lastYearSameMonthBookings.length,
    };
  }, [bookings]);

  // Calculate gross vs net breakdown for pending/upcoming
  const grossNetBreakdown = useMemo(() => {
    const pendingBookings = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    );
    const grossAmount = pendingBookings.reduce((sum, b) => sum + (b.amount_authorized || 0), 0);
    const platformFee = grossAmount * PLATFORM_FEE_RATE;
    const netAmount = grossAmount - platformFee;

    return {
      gross: grossAmount,
      platformFee,
      net: netAmount,
      bookingCount: pendingBookings.length,
    };
  }, [bookings]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);

  const currentMonthName = format(new Date(), "MMMM yyyy");
  const lastYearMonthName = format(subYears(new Date(), 1), "MMMM yyyy");

  return (
    <div className={cn("space-y-6", className)}>
      {/* YoY Comparison Header Card */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-neutral-200 bg-white">
          <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-orange-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <HugeiconsIcon className="h-5 w-5 text-orange-600" icon={Calendar03Icon} />
                </div>
                <div>
                  <h2 className={cn("font-semibold text-neutral-900 text-lg", geistSans.className)}>
                    Year-over-Year Comparison
                  </h2>
                  <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
                    {currentMonthName} vs {lastYearMonthName}
                  </p>
                </div>
              </div>

              {/* Trend Badge */}
              <Badge
                className={cn(
                  "flex items-center gap-1 border px-3 py-1",
                  currentMonthComparison.percentChange >= 0
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon
                  className="h-3.5 w-3.5"
                  icon={currentMonthComparison.percentChange >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
                />
                {Math.abs(currentMonthComparison.percentChange).toFixed(1)}% YoY
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* This Month */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className={cn("font-medium text-orange-700 text-xs uppercase", geistSans.className)}>
                  {currentMonthName}
                </p>
                <p
                  className={cn(
                    "mt-2 font-bold text-3xl text-neutral-900 tracking-tight",
                    geistSans.className
                  )}
                >
                  {formatCurrency(currentMonthComparison.thisMonth)}
                </p>
                <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                  {currentMonthComparison.thisMonthCount} completed booking
                  {currentMonthComparison.thisMonthCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Last Year Same Month */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className={cn("font-medium text-neutral-600 text-xs uppercase", geistSans.className)}>
                  {lastYearMonthName}
                </p>
                <p
                  className={cn(
                    "mt-2 font-bold text-3xl text-neutral-700 tracking-tight",
                    geistSans.className
                  )}
                >
                  {formatCurrency(currentMonthComparison.lastYearSameMonth)}
                </p>
                <p className={cn("mt-1 text-neutral-500 text-sm", geistSans.className)}>
                  {currentMonthComparison.lastYearCount} completed booking
                  {currentMonthComparison.lastYearCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gross vs Net Breakdown - Airbnb's "What guests pay vs what you earn" */}
      {grossNetBreakdown.bookingCount > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-neutral-200 bg-white">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5 text-neutral-500" icon={DollarCircleIcon} />
                <h3 className={cn("font-semibold text-neutral-900 text-base", geistSans.className)}>
                  Upcoming Earnings Breakdown
                </h3>
                <div className="group relative">
                  <HugeiconsIcon
                    className="h-4 w-4 cursor-help text-neutral-400"
                    icon={InformationCircleIcon}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    What customers pay vs your net earnings after platform fee
                  </div>
                </div>
              </div>
              <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                {grossNetBreakdown.bookingCount} pending/confirmed booking
                {grossNetBreakdown.bookingCount !== 1 ? "s" : ""}
              </p>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {/* Gross */}
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                  <span className={cn("text-neutral-600 text-sm", geistSans.className)}>
                    Customer pays (gross)
                  </span>
                  <span className={cn("font-medium text-neutral-900", geistSans.className)}>
                    {formatCurrency(grossNetBreakdown.gross)}
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                  <span className={cn("text-red-700 text-sm", geistSans.className)}>
                    Platform fee (15%)
                  </span>
                  <span className={cn("font-medium text-red-700", geistSans.className)}>
                    -{formatCurrency(grossNetBreakdown.platformFee)}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-neutral-300" />

                {/* Net */}
                <div className="flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-3">
                  <span className={cn("font-medium text-green-700 text-sm", geistSans.className)}>
                    Your earnings (net)
                  </span>
                  <span className={cn("font-bold text-green-700 text-lg", geistSans.className)}>
                    {formatCurrency(grossNetBreakdown.net)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* YoY Chart */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-neutral-200 bg-white">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h3 className={cn("font-semibold text-neutral-900 text-base", geistSans.className)}>
                Earnings Trend
              </h3>
              <div className="flex gap-1">
                <Button
                  className={cn(
                    "h-8 px-3 text-xs",
                    timeRange === "6m" && "border-orange-200 bg-orange-50 text-orange-600"
                  )}
                  onClick={() => setTimeRange("6m")}
                  size="sm"
                  variant="outline"
                >
                  6 months
                </Button>
                <Button
                  className={cn(
                    "h-8 px-3 text-xs",
                    timeRange === "12m" && "border-orange-200 bg-orange-50 text-orange-600"
                  )}
                  onClick={() => setTimeRange("12m")}
                  size="sm"
                  variant="outline"
                >
                  12 months
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <ComparisonChartComponent data={comparisonData} formatCurrency={formatCurrency} />

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-orange-500" />
                <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                  This Year
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-neutral-400" />
                <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                  Last Year
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
