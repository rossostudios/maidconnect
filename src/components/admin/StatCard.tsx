/**
 * StatCard - Individual KPI metric card with Lia design
 *
 * Design:
 * ┌─────────────────────────────────────────┐
 * │ FILL RATE              [mini sparkline] │ ← Geist Sans UPPERCASE
 * │                                          │
 * │ 78.4%                            ↗ GOOD │ ← Geist Mono 48px + status
 * │                                          │
 * │ Booking requests accepted               │ ← Neutral-600 description
 * │                                          │
 * │ ────────────────────────────────────    │ ← Orange gradient border (bottom)
 * └─────────────────────────────────────────┘
 *
 * Features:
 * - Sharp corners (no rounding) - Lia design
 * - Geist Mono for value display (Bloomberg aesthetic)
 * - Geist Sans for labels/descriptions
 * - Border-only status badges (no background fills)
 * - Mini sparkline chart (Recharts)
 * - Orange gradient bottom border accent (featured cards)
 * - Hover: Border transitions to orange
 * - WCAG AAA contrast ratios
 */

"use client";

import { geistMono, geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./MiniSparkline";

type StatusLevel = "good" | "neutral" | "poor";

type SparklineData = {
  day: number;
  value: number;
};

type Props = {
  title: string;
  value: string;
  description: string;
  status: StatusLevel;
  sparklineData?: SparklineData[];
  featured?: boolean; // If true, shows orange gradient bottom border
};

/**
 * Get status badge styling based on performance level
 * Uses border-only design for Precision aesthetic (no background fills)
 */
function getStatusBadge(status: StatusLevel) {
  const statusConfig = {
    good: {
      borderColor: "border-green-600",
      textColor: "text-green-700",
      label: "GOOD",
    },
    neutral: {
      borderColor: "border-yellow-600",
      textColor: "text-yellow-700",
      label: "OK",
    },
    poor: {
      borderColor: "border-red-600",
      textColor: "text-red-700",
      label: "LOW",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "border-2 px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        config.borderColor,
        config.textColor,
        geistSans.className
      )}
    >
      {config.label}
    </span>
  );
}

export function StatCard({
  title,
  value,
  description,
  status,
  sparklineData,
  featured = false,
}: Props) {
  return (
    <div
      className={cn(
        "border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-orange-500",
        featured && "border-b-2 border-b-orange-500"
      )}
    >
      {/* Header: Title + Sparkline */}
      <div className="mb-4 flex items-start justify-between">
        <h3
          className={cn(
            "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {title}
        </h3>
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24">
            <MiniSparkline data={sparklineData} />
          </div>
        )}
      </div>

      {/* Value + Status Badge */}
      <div className="mb-3 flex items-end justify-between">
        <p
          className={cn(
            "font-semibold text-3xl text-neutral-900 tracking-tighter",
            geistMono.className
          )}
        >
          {value}
        </p>
        {getStatusBadge(status)}
      </div>

      {/* Description */}
      <p className={cn("font-normal text-neutral-600 text-sm", geistSans.className)}>
        {description}
      </p>
    </div>
  );
}
