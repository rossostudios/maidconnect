"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { geistMono, geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

/**
 * Precision Dashboard Components
 *
 * Ultra-high contrast design for maximum readability.
 * Inspired by Bloomberg Terminal + Swiss Design.
 *
 * Design Principles:
 * - WCAG AAA contrast ratios (7:1 minimum)
 * - Geist Sans for UI text (Light 300, Regular 400, Medium 500, Semi Bold 600)
 * - Geist Mono for all numbers and data (with -3 letter spacing)
 * - Pure white backgrounds with deep black text
 * - Orange (#FF5200) for primary actions (brand color)
 * - Subtle borders for clean separation
 * - Generous whitespace for breathing room
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
 * PrecisionStatCard
 *
 * High-contrast stat card with Geist Mono numbers.
 * Numbers are the hero - large, bold, impossible to miss.
 */
export function PrecisionStatCard({
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

  return (
    <div className="group relative border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm">
      {/* Header Row - Title + Icon */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3
            className={cn(
              "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={cn(
                "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                geistSans.className
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon - Sharp square container */}
        <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-900">
          <HugeiconsIcon className="h-6 w-6 text-white" icon={icon} />
        </div>
      </div>

      {/* Value - HERO Element with Geist Mono */}
      <div className="mb-3">
        <p
          className={cn(
            "font-semibold text-5xl text-neutral-900 tracking-tighter",
            geistMono.className
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

      {/* Trend Indicator - Clean and minimal */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 font-semibold text-xs tracking-tighter",
              trendBg[trend],
              trendColors[trend],
              geistMono.className
            )}
          >
            <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}</span>
            <span>{Math.abs(change)}%</span>
          </div>
          <span
            className={cn(
              "font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
              geistSans.className
            )}
          >
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * PrecisionActivityFeed
 *
 * Timeline-based activity feed with status indicators.
 * Clean, scannable, high-information density.
 */
export function PrecisionActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const statusStyles = {
    success: {
      bg: "bg-emerald-600",
      text: "text-emerald-600",
    },
    warning: {
      bg: "bg-orange-500",
      text: "text-orange-500",
    },
    info: {
      bg: "bg-[#FF5200]",
      text: "text-[#FF5200]",
    },
  };

  return (
    <div className="border border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3
          className={cn(
            "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          Recent Activity
        </h3>
        <p
          className={cn(
            "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
            geistSans.className
          )}
        >
          Last 24 hours
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-neutral-100">
        {activities.map((activity) => (
          <div className="px-6 py-4 transition-colors hover:bg-neutral-50" key={activity.id}>
            <div className="flex items-start gap-3">
              {/* Status Dot */}
              <div className="mt-1.5 flex-shrink-0">
                <div className={cn("h-2 w-2", statusStyles[activity.status].bg)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                  <span className="font-semibold">{activity.user}</span>{" "}
                  <span className="font-normal text-neutral-600">{activity.action}</span>
                </p>
                <p
                  className={cn(
                    "mt-1 font-normal text-neutral-700 text-xs tracking-tighter",
                    geistMono.className
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
      <div className="border-neutral-200 border-t bg-neutral-50 px-6 py-3">
        <button
          className={cn(
            "font-semibold text-[#FF5200] text-xs uppercase tracking-wider transition-colors hover:text-orange-600",
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
 * PrecisionCard
 *
 * Generic container for dashboard content.
 * Sharp borders, high contrast, clean layout.
 */
export function PrecisionCard({
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
    <div className="border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <div>
          <h3
            className={cn(
              "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                geistSans.className
              )}
            >
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
 * PrecisionTable
 *
 * Data table with Geist Mono for numbers.
 * High contrast, easy to scan, grid-based layout.
 */
export function PrecisionTable<T extends Record<string, unknown>>({
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
    <div className="border border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3
          className={cn(
            "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
              geistSans.className
            )}
          >
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
                    "px-6 py-3 text-left font-semibold text-neutral-900 text-xs uppercase tracking-wider",
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
                      // Use Geist Mono for numeric values with tracking-tighter
                      typeof row[column.key] === "number"
                        ? cn("font-medium tracking-tighter", geistMono.className)
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
 * PrecisionEmptyState
 *
 * Empty state with sharp borders and clear messaging.
 */
export function PrecisionEmptyState({
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
    <div className="flex flex-col items-center justify-center border border-neutral-200 border-dashed bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center border border-neutral-200 bg-neutral-900">
        <HugeiconsIcon className="h-8 w-8 text-white" icon={icon} />
      </div>
      <h3
        className={cn(
          "mb-2 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
          geistSans.className
        )}
      >
        {title}
      </h3>
      <p className={cn("mb-6 max-w-sm font-normal text-neutral-600 text-sm", geistSans.className)}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * PrecisionButton
 *
 * High-contrast button with sharp edges.
 */
export function PrecisionButton({
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
        "inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all",
        geistSans.className,
        // Variants
        variant === "primary" &&
          "border border-neutral-200 bg-[#FF5200] text-white hover:bg-orange-600 hover:shadow-sm",
        variant === "secondary" &&
          "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        variant === "ghost" &&
          "border border-transparent text-neutral-900 hover:border-neutral-200 hover:bg-neutral-50",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-[10px]",
        size === "md" && "px-4 py-2 text-xs",
        size === "lg" && "px-6 py-3 text-sm",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
