/**
 * EarningsOverview - Two-Column Airbnb-Style Earnings Display
 *
 * Simplified earnings display in two categories:
 * - AVAILABLE: Money ready to withdraw (paid + pending release)
 * - COMING: Estimated earnings from confirmed future bookings
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Orange accent for primary actions
 * - Neutral colors for content
 * - Trend indicators with green/red colors
 */

"use client";

import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";
import { type DatePeriod, DateRangeFilter } from "./DateRangeFilter";

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
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b px-6 py-4">
        <h2 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
          Your Earnings
        </h2>
        <DateRangeFilter onChange={setPeriod} size="sm" value={period} />
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <EarningsOverviewSkeleton />
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* AVAILABLE Column - Paid + Pending combined */}
            <EarningsColumn
              actionHref="/dashboard/pro/finances"
              actionLabel="Withdraw"
              amount={data.paid + data.pending}
              currency={currency}
              index={0}
              label="Available"
              subtext={
                data.pending > 0
                  ? `${data.paidBookingsCount} completed • ${formatFromMinorUnits(data.pending, currency)} releasing soon`
                  : `${data.paidBookingsCount} booking${data.paidBookingsCount !== 1 ? "s" : ""}`
              }
              trend={data.trend}
              trendLabel={`vs last ${period === "7d" ? "week" : period === "30d" ? "month" : "quarter"}`}
              variant="primary"
            />

            {/* COMING Column - Future confirmed bookings */}
            <EarningsColumn
              actionHref="/dashboard/pro/bookings"
              actionLabel="View Schedule"
              amount={data.upcoming}
              currency={currency}
              icon={Calendar03Icon}
              index={1}
              label="Coming"
              subtext={`${data.upcomingBookingsCount} upcoming booking${data.upcomingBookingsCount !== 1 ? "s" : ""}`}
              variant="secondary"
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
  icon?: HugeIcon;
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
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border border-border p-4",
        variant === "primary" ? "bg-rausch-50/50 dark:bg-rausch-950/30" : "bg-muted/30"
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "font-medium text-xs uppercase tracking-wide",
            variant === "primary" ? "text-rausch-700 dark:text-rausch-400" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
        {Icon && (
          <HugeiconsIcon
            className={cn(
              "h-4 w-4",
              variant === "primary" ? "text-rausch-500" : "text-muted-foreground/70"
            )}
            icon={Icon}
          />
        )}
      </div>

      {/* Amount */}
      <p
        className={cn(
          "font-bold text-2xl text-foreground",
          variant === "secondary" && "opacity-90"
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
                isPositiveTrend
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              <HugeiconsIcon
                className="h-3 w-3"
                icon={isPositiveTrend ? ArrowUp01Icon : ArrowDown01Icon}
              />
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-muted-foreground text-xs">{trendLabel}</span>}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">{subtext}</span>
        )}
      </div>

      {/* Subtext (if trend is shown) */}
      {trend !== undefined && <p className="mt-0.5 text-muted-foreground text-xs">{subtext}</p>}

      {/* Action Button - 44px+ touch target */}
      <Button
        asChild
        className={cn(
          "mt-4 min-h-[44px] w-full gap-1.5",
          variant === "secondary" && "text-foreground"
        )}
        size="sm"
        variant={variant === "primary" ? "default" : "outline"}
      >
        <Link href={actionHref}>
          {actionLabel}
          <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
        </Link>
      </Button>
    </motion.div>
  );
}

function EarningsOverviewSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div className="animate-pulse rounded-lg border border-border bg-muted/30 p-4" key={i}>
          <div className="mb-3 h-3 w-12 rounded bg-muted-foreground/20" />
          <div className="h-8 w-24 rounded bg-muted-foreground/20" />
          <div className="mt-2 h-3 w-20 rounded bg-muted-foreground/20" />
          <div className="mt-4 h-3 w-16 rounded bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}
