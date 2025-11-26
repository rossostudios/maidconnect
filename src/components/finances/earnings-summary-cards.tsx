"use client";

import { Calendar03Icon, MoneyBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";

// ========================================
// Types
// ========================================

type PayoutTransfer = {
  id: string;
  amount_cop: number;
  fee_amount_cop: number | null;
  status: "processing" | "pending" | "completed" | "failed";
  created_at: string;
};

type EarningsSummaryCardsProps = {
  /** Payout transfer history */
  transfers: PayoutTransfer[];
  /** Currency code for formatting */
  currencyCode: Currency;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional className */
  className?: string;
};

// ========================================
// Summary Card Component
// ========================================

type SummaryCardProps = {
  icon: HugeIcon;
  label: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
};

function SummaryCard({ icon, label, value, subtitle, trend, className }: SummaryCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <p className={cn("font-medium text-muted-foreground text-sm", geistSans.className)}>
            {label}
          </p>
          <p
            className={cn(
              "font-bold text-2xl text-foreground tabular-nums tracking-tight",
              geistSans.className
            )}
          >
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
                    trend.direction === "up" && "bg-green-50 text-green-600",
                    trend.direction === "down" && "bg-red-50 text-red-600",
                    trend.direction === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.direction === "up" && "↑"}
                  {trend.direction === "down" && "↓"}
                  {trend.value}
                </span>
              )}
              {subtitle && (
                <span className={cn("text-muted-foreground text-sm", geistSans.className)}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-rausch-50 dark:bg-rausch-900/20">
          <HugeiconsIcon className="size-5 text-rausch-500" icon={icon} />
        </div>
      </div>
    </div>
  );
}

// ========================================
// Skeleton Loading State
// ========================================

function SummaryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted/50" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="size-10 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

/**
 * EarningsSummaryCards - Two minimal KPI cards (This Month + Next Payout)
 *
 * Ultra-minimal design per approved plan:
 * - NO charts
 * - Only 2 cards
 * - Clean, focused metrics
 *
 * @example
 * ```tsx
 * <EarningsSummaryCards
 *   transfers={payoutTransfers}
 *   currencyCode="COP"
 * />
 * ```
 */
export function EarningsSummaryCards({
  transfers,
  currencyCode,
  isLoading = false,
  className,
}: EarningsSummaryCardsProps) {
  const t = useTranslations("dashboard.pro.finances");

  // ========================================
  // Calculate Monthly Stats
  // ========================================

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthTransfers = transfers.filter((transfer) => {
      const date = new Date(transfer.created_at);
      return date >= thisMonthStart && transfer.status === "completed";
    });

    const lastMonthTransfers = transfers.filter((transfer) => {
      const date = new Date(transfer.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd && transfer.status === "completed";
    });

    const thisMonthTotal = thisMonthTransfers.reduce(
      (sum, t) => sum + (t.amount_cop - (t.fee_amount_cop || 0)),
      0
    );
    const lastMonthTotal = lastMonthTransfers.reduce(
      (sum, t) => sum + (t.amount_cop - (t.fee_amount_cop || 0)),
      0
    );

    const percentChange =
      lastMonthTotal > 0
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

    return {
      thisMonth: thisMonthTotal,
      percentChange,
    };
  }, [transfers]);

  // ========================================
  // Calculate Next Payout Date
  // ========================================

  const nextPayoutInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    let daysUntilPayout: number;

    // Payouts on Tuesdays (2) and Fridays (5)
    if (day < 2) {
      daysUntilPayout = 2 - day; // Until Tuesday
    } else if (day < 5) {
      daysUntilPayout = 5 - day; // Until Friday
    } else {
      daysUntilPayout = 9 - day; // Until next Tuesday
    }

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilPayout);

    const dayName = nextDate.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = nextDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      formatted: `${dayName}, ${monthDay}`,
      daysAway: daysUntilPayout,
    };
  }, []);

  // ========================================
  // Render
  // ========================================

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {/* This Month's Earnings */}
      <SummaryCard
        icon={MoneyBag01Icon}
        label={t("summary.thisMonth")}
        subtitle={t("summary.vsLastMonth")}
        trend={
          monthlyStats.percentChange !== 0
            ? {
                value: `${monthlyStats.percentChange > 0 ? "+" : ""}${monthlyStats.percentChange}%`,
                direction:
                  monthlyStats.percentChange > 0
                    ? "up"
                    : monthlyStats.percentChange < 0
                      ? "down"
                      : "neutral",
              }
            : undefined
        }
        value={formatFromMinorUnits(monthlyStats.thisMonth, currencyCode)}
      />

      {/* Next Payout */}
      <SummaryCard
        icon={Calendar03Icon}
        label={t("summary.nextPayout")}
        subtitle={t("summary.scheduledPayouts")}
        value={nextPayoutInfo.formatted}
      />
    </div>
  );
}
