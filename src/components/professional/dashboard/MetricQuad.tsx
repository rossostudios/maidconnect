/**
 * MetricQuad - High-Density KPI Cards Row
 *
 * Displays 4 key performance indicators with Pro-friendly terminology:
 * - Total Earnings (with Quick Withdraw action!)
 * - Jobs Completed (not "Total Sales")
 * - Repeat Clients (not "Active Clients")
 * - Completion Rate
 *
 * Key Change: Total Earnings card now has a "Withdraw" button - this is
 * the #1 feature domestic workers need for immediate money access.
 *
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Money01Icon,
  MoneyReceiveSquareIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";

// ========================================
// Types
// ========================================

export type MetricData = {
  totalEarnings: { value: number; trend: number };
  totalBookings: { value: number; trend: number };
  activeClients: { value: number; trend: number };
  completionRate: { value: number; trend: number };
};

type MetricQuadProps = {
  data: MetricData;
  currencyCode?: Currency;
  className?: string;
  onWithdraw?: () => void;
};

type MetricAccent = "rausch" | "babu" | "green";

type MetricCardAction = {
  label: string;
  icon: HugeIcon;
  onClick: () => void;
};

type MetricCardProps = {
  icon: HugeIcon;
  label: string;
  value: string | number;
  trend: number;
  index: number;
  accent: MetricAccent;
  action?: MetricCardAction;
};

// ========================================
// Accent Color Styles (explicit classes for Tailwind JIT)
// ========================================

const ACCENT_STYLES: Record<
  MetricAccent,
  { card: string; icon: string; label: string; value: string; muted: string }
> = {
  rausch: {
    card: "dark:border-border dark:bg-background",
    icon: "dark:text-muted-foreground",
    label: "dark:text-muted-foreground",
    value: "dark:text-foreground",
    muted: "dark:text-muted-foreground",
  },
  babu: {
    card: "dark:border-border dark:bg-background",
    icon: "dark:text-muted-foreground",
    label: "dark:text-muted-foreground",
    value: "dark:text-foreground",
    muted: "dark:text-muted-foreground",
  },
  green: {
    card: "dark:border-border dark:bg-background",
    icon: "dark:text-muted-foreground",
    label: "dark:text-muted-foreground",
    value: "dark:text-foreground",
    muted: "dark:text-muted-foreground",
  },
};

// ========================================
// Mock Data (Development)
// ========================================

export const MOCK_METRICS: MetricData = {
  totalEarnings: { value: 880_000_000, trend: 3.1 },
  totalBookings: { value: 224, trend: 20 },
  activeClients: { value: 3612, trend: -15 },
  completionRate: { value: 67, trend: -12 },
};

// ========================================
// Components
// ========================================

function MetricCard({ icon: Icon, label, value, trend, index, accent, action }: MetricCardProps) {
  const isPositive = trend >= 0;
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-5",
        // Light mode
        "border-neutral-200 bg-white",
        // Dark mode
        styles.card
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Header: Icon + Label */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className={cn("h-4 w-4 text-neutral-600", styles.icon)} icon={Icon} />
          <span
            className={cn(
              "font-medium text-xs uppercase tracking-wide",
              "text-neutral-600",
              styles.label,
              geistSans.className
            )}
          >
            {label}
          </span>
        </div>
        {/* Quick Action Button (e.g., Withdraw for Earnings) */}
        {action && (
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs",
              "bg-rausch-500 text-white",
              "hover:bg-rausch-600",
              "transition-colors",
              geistSans.className
            )}
            onClick={action.onClick}
            title={action.label}
            type="button"
          >
            <HugeiconsIcon className="h-3.5 w-3.5" icon={action.icon} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )}
      </div>

      {/* Value */}
      <p
        className={cn(
          "font-bold text-2xl tracking-tight",
          "text-neutral-900",
          styles.value,
          geistSans.className
        )}
      >
        {value}
      </p>

      {/* Trend Badge */}
      <div className="mt-2 flex items-center gap-1">
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium text-xs",
            isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}
        >
          <HugeiconsIcon className="h-3 w-3" icon={isPositive ? ArrowUp01Icon : ArrowDown01Icon} />
          {isPositive ? "+" : ""}
          {trend}%
        </span>
        <span className={cn("text-neutral-500 text-xs", styles.muted)}>vs last month</span>
      </div>
    </motion.div>
  );
}

export function MetricQuad({ data, currencyCode = "COP", className, onWithdraw }: MetricQuadProps) {
  const formattedEarnings = formatFromMinorUnits(data.totalEarnings.value, currencyCode);

  // Quick Withdraw action for earnings card
  const withdrawAction: MetricCardAction | undefined = onWithdraw
    ? {
        label: "Withdraw",
        icon: MoneyReceiveSquareIcon,
        onClick: onWithdraw,
      }
    : undefined;

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <MetricCard
        accent="rausch"
        action={withdrawAction}
        icon={Money01Icon}
        index={0}
        label="Total Earnings"
        trend={data.totalEarnings.trend}
        value={formattedEarnings}
      />
      <MetricCard
        accent="rausch"
        icon={Calendar03Icon}
        index={1}
        label="Jobs Completed"
        trend={data.totalBookings.trend}
        value={data.totalBookings.value.toLocaleString()}
      />
      <MetricCard
        accent="rausch"
        icon={UserMultiple02Icon}
        index={2}
        label="Repeat Clients"
        trend={data.activeClients.trend}
        value={data.activeClients.value.toLocaleString()}
      />
      <MetricCard
        accent="rausch"
        icon={CheckmarkCircle02Icon}
        index={3}
        label="Success Rate"
        trend={data.completionRate.trend}
        value={`${data.completionRate.value}%`}
      />
    </div>
  );
}

// ========================================
// Skeleton
// ========================================

export function MetricQuadSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          className={cn(
            "animate-pulse rounded-lg border p-5",
            "border-neutral-200 bg-white",
            "dark:border-border dark:bg-background"
          )}
          key={i}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-neutral-200 dark:bg-muted" />
            <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-muted" />
          </div>
          <div className="h-8 w-28 rounded bg-neutral-200 dark:bg-muted" />
          <div className="mt-2 h-5 w-24 rounded bg-neutral-200 dark:bg-muted" />
        </div>
      ))}
    </div>
  );
}
