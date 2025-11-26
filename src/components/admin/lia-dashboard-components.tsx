"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

/**
 * Lia Dashboard Components - Anthropic-Inspired Design
 *
 * Warm, approachable design with thoughtful rounded corners.
 * Inspired by Anthropic's design language.
 *
 * Design Principles:
 * - Anthropic rounded corners (rounded-lg for 12px radius)
 * - Geist Sans for UI text (font-normal to font-medium, avoiding bold)
 * - Geist Mono for numbers and data
 * - Warm neutral backgrounds with refined typography
 * - Orange (rausch-500/600) for primary actions (brand color)
 * - Soft borders with rounded corners for approachable aesthetic
 * - Generous whitespace and smooth transitions
 */

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: HugeIcon;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  unit?: string;
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
  status: "success" | "warning" | "info";
};

/**
 * LiaStatCard
 *
 * Anthropic-inspired stat card with rounded corners.
 * Clean typography with refined font weights.
 */
export function LiaStatCard({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  subtitle,
  unit,
}: StatCardProps) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-neutral-500",
  };

  const trendBg = {
    up: "bg-emerald-50",
    down: "bg-red-50",
    neutral: "bg-neutral-50",
  };

  const trendIcon = (() => {
    if (trend === "up") {
      return "↑";
    }
    if (trend === "down") {
      return "↓";
    }
    return "—";
  })();

  return (
    <div className="group relative rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-rausch-500 hover:shadow-sm">
      {/* Header Row - Title + Icon */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3
            className={cn(
              "font-medium text-neutral-900 text-sm leading-none tracking-tight",
              geistSans.className
            )}
          >
            {title}
          </h3>
          {subtitle && (
            <p className={cn("mt-0.5 text-neutral-600 text-xs leading-none", geistSans.className)}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon - Anthropic rounded container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-900 transition-colors group-hover:border-rausch-500 group-hover:bg-rausch-500">
          <HugeiconsIcon className="h-6 w-6 text-white" icon={icon} />
        </div>
      </div>

      {/* Value - HERO Element */}
      <div className="mb-3">
        <p
          className={cn(
            "font-medium text-5xl text-neutral-900 tracking-tight",
            geistSans.className
          )}
        >
          {value}
          {unit && (
            <span className={cn("ml-1 font-normal text-2xl text-neutral-500", geistSans.className)}>
              {unit}
            </span>
          )}
        </p>
      </div>

      {/* Trend Indicator - Anthropic rounded pill */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 font-medium text-xs",
              trendBg[trend],
              trendColors[trend],
              geistSans.className
            )}
          >
            <span>{trendIcon}</span>
            <span>{Math.abs(change)}%</span>
          </div>
          <span className={cn("text-neutral-600 text-xs", geistSans.className)}>vs last month</span>
        </div>
      )}
    </div>
  );
}

/**
 * LiaActivityFeed
 *
 * Timeline-based activity feed with Anthropic rounded design.
 * Clean, scannable layout with refined typography.
 */
export function LiaActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const statusStyles = {
    success: {
      bg: "bg-emerald-600",
      text: "text-emerald-600",
    },
    warning: {
      bg: "bg-rausch-500",
      text: "text-rausch-500",
    },
    info: {
      bg: "bg-rausch-500",
      text: "text-rausch-600",
    },
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="rounded-t-lg border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3
          className={cn(
            "font-medium text-neutral-900 text-sm leading-none tracking-tight",
            geistSans.className
          )}
        >
          Recent Activity
        </h3>
        <p className={cn("mt-0.5 text-neutral-600 text-xs leading-none", geistSans.className)}>
          Last 24 hours
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-neutral-100">
        {activities.map((activity) => (
          <div className="px-6 py-4 transition-colors hover:bg-neutral-50" key={activity.id}>
            <div className="flex items-start gap-3">
              {/* Status Dot - Anthropic rounded */}
              <div className="mt-1.5 flex-shrink-0">
                <div className={cn("h-2 w-2 rounded-full", statusStyles[activity.status].bg)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium text-neutral-900 text-sm leading-none",
                    geistSans.className
                  )}
                >
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="font-normal text-neutral-600">{activity.action}</span>
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-neutral-600 text-xs leading-none",
                    geistSans.className
                  )}
                >
                  {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-b-lg border-neutral-200 border-t bg-neutral-50 px-6 py-3">
        <button
          className={cn(
            "font-medium text-rausch-600 text-sm transition-colors hover:text-rausch-700",
            geistSans.className
          )}
          type="button"
        >
          View All Activity →
        </button>
      </div>
    </div>
  );
}

/**
 * LiaCard
 *
 * Generic container for dashboard content.
 * Anthropic rounded design with refined typography.
 */
export function LiaCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between rounded-t-lg border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <div>
          <h3
            className={cn(
              "font-medium text-neutral-900 text-sm leading-none tracking-tight",
              geistSans.className
            )}
          >
            {title}
          </h3>
          {description && (
            <p className={cn("mt-0.5 text-neutral-600 text-xs leading-none", geistSans.className)}>
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}

/**
 * LiaTable
 *
 * Data table with Anthropic rounded design.
 * Clean typography, easy to scan layout.
 */
export function LiaTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
}: {
  title: string;
  description?: string;
  columns: { key: string; label: string; align?: "left" | "right" }[];
  data: T[];
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="rounded-t-lg border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3
          className={cn(
            "font-medium text-neutral-900 text-sm leading-none tracking-tight",
            geistSans.className
          )}
        >
          {title}
        </h3>
        {description && (
          <p className={cn("mt-0.5 text-neutral-600 text-xs leading-none", geistSans.className)}>
            {description}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="border-neutral-200 border-b bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    "px-6 py-3 text-left font-medium text-neutral-900 text-sm",
                    column.align === "right" && "text-right",
                    geistSans.className
                  )}
                  key={column.key}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.map((row, i) => (
              <tr className="transition-colors hover:bg-neutral-50" key={i}>
                {columns.map((column) => (
                  <td
                    className={cn(
                      "whitespace-nowrap px-6 py-4 text-neutral-900 text-sm",
                      column.align === "right" && "text-right",
                      // Use Geist Mono for numeric values
                      typeof row[column.key] === "number"
                        ? cn("font-medium", geistSans.className)
                        : cn("font-normal", geistSans.className)
                    )}
                    key={column.key}
                  >
                    {String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * LiaEmptyState
 *
 * Empty state with Anthropic rounded design and clear messaging.
 */
export function LiaEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: HugeIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-900">
        <HugeiconsIcon className="h-8 w-8 text-white" icon={icon} />
      </div>
      <h3 className={cn("mb-2 font-medium text-base text-neutral-900", geistSans.className)}>
        {title}
      </h3>
      <p className={cn("mb-6 max-w-sm text-neutral-600 text-sm", geistSans.className)}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * LiaButton
 *
 * Anthropic-inspired button with rounded corners.
 */
export function LiaButton({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all",
        geistSans.className,
        // Variants
        variant === "primary" &&
          "border border-neutral-200 bg-rausch-500 text-white hover:bg-rausch-600 hover:shadow-sm",
        variant === "secondary" &&
          "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        variant === "ghost" &&
          "border border-transparent text-neutral-900 hover:border-neutral-200 hover:bg-neutral-50",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
