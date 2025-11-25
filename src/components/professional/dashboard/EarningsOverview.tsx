/**
 * EarningsOverview - Three-Column Airbnb-Style Earnings Display
 *
 * Displays professional earnings in three categories:
 * - PAID: Completed earnings from the selected period
 * - UPCOMING: Estimated earnings from confirmed future bookings
 * - PENDING: Earnings awaiting release/payout
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Orange accent for primary actions
 * - Neutral colors for content
 * - Trend indicators with green/red colors
 */

"use client";

import { ArrowDown01Icon, ArrowUp01Icon, Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Link } from "@/i18n/routing";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { DateRangeFilter, type DatePeriod } from "./DateRangeFilter";

type EarningsData = {
  paid: number;
  upcoming: number;
  pending: number;
  trend: number;
  paidBookingsCount: number;
  upcomingBookingsCount: number;
};

type EarningsOverviewProps = {
  className?: string;
};

export function EarningsOverview({ className }: EarningsOverviewProps) {
  const [period, setPeriod] = useState<DatePeriod>("7d");
  const [data, setData] = useState<EarningsData | null>(null);
  const [currency, setCurrency] = useState<Currency>("COP");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pro/dashboard/stats?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch earnings data");
      }
      const result = await response.json();
      if (result.success) {
        setData(result.earnings);
        setCurrency(result.currencyCode as Currency);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load earnings");
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
          Your Earnings
        </h2>
        <DateRangeFilter value={period} onChange={setPeriod} size="sm" />
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <EarningsOverviewSkeleton />
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* PAID Column */}
            <EarningsColumn
              label="Paid"
              amount={data.paid}
              currency={currency}
              trend={data.trend}
              trendLabel={`vs last ${period === "7d" ? "week" : period === "30d" ? "month" : "quarter"}`}
              subtext={`${data.paidBookingsCount} booking${data.paidBookingsCount !== 1 ? "s" : ""}`}
              actionLabel="View Details"
              actionHref="/dashboard/pro/finances"
              variant="primary"
              index={0}
            />

            {/* UPCOMING Column */}
            <EarningsColumn
              label="Upcoming"
              amount={data.upcoming}
              currency={currency}
              subtext={`${data.upcomingBookingsCount} booking${data.upcomingBookingsCount !== 1 ? "s" : ""}`}
              actionLabel="View Schedule"
              actionHref="/dashboard/pro/bookings"
              icon={Calendar03Icon}
              variant="secondary"
              index={1}
            />

            {/* PENDING Column */}
            <EarningsColumn
              label="Pending"
              amount={data.pending}
              currency={currency}
              subtext="Awaiting release"
              actionLabel="View Details"
              actionHref="/dashboard/pro/finances"
              icon={Clock01Icon}
              variant="tertiary"
              index={2}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type EarningsColumnProps = {
  label: string;
  amount: number;
  currency: Currency;
  trend?: number;
  trendLabel?: string;
  subtext: string;
  actionLabel: string;
  actionHref: string;
  icon?: React.ComponentType;
  variant: "primary" | "secondary" | "tertiary";
  index: number;
};

function EarningsColumn({
  label,
  amount,
  currency,
  trend,
  trendLabel,
  subtext,
  actionLabel,
  actionHref,
  icon: Icon,
  variant,
  index,
}: EarningsColumnProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "rounded-lg border p-4",
        variant === "primary"
          ? "border-orange-200 bg-orange-50/50"
          : "border-neutral-200 bg-neutral-50/50"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "font-medium text-xs uppercase tracking-wide",
            variant === "primary" ? "text-orange-700" : "text-neutral-600"
          )}
        >
          {label}
        </span>
        {Icon && (
          <HugeiconsIcon
            icon={Icon}
            className={cn(
              "h-4 w-4",
              variant === "primary" ? "text-orange-500" : "text-neutral-400"
            )}
          />
        )}
      </div>

      {/* Amount */}
      <p
        className={cn(
          "font-bold text-2xl",
          variant === "primary" ? "text-neutral-900" : "text-neutral-800"
        )}
      >
        {formatFromMinorUnits(amount, currency)}
      </p>

      {/* Trend or Subtext */}
      <div className="mt-1 flex items-center gap-1">
        {trend !== undefined ? (
          <>
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
            {trendLabel && (
              <span className="text-neutral-500 text-xs">{trendLabel}</span>
            )}
          </>
        ) : (
          <span className="text-neutral-500 text-xs">{subtext}</span>
        )}
      </div>

      {/* Subtext (if trend is shown) */}
      {trend !== undefined && (
        <p className="mt-0.5 text-neutral-500 text-xs">{subtext}</p>
      )}

      {/* Action Link */}
      <Link
        href={actionHref}
        className={cn(
          "mt-4 block text-center font-medium text-xs transition-colors",
          variant === "primary"
            ? "text-orange-600 hover:text-orange-700"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        {actionLabel} →
      </Link>
    </motion.div>
  );
}

function EarningsOverviewSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="mb-3 h-3 w-12 rounded bg-neutral-200" />
          <div className="h-8 w-24 rounded bg-neutral-200" />
          <div className="mt-2 h-3 w-20 rounded bg-neutral-200" />
          <div className="mt-4 h-3 w-16 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
