/**
 * StatCard - Individual KPI metric card with Anthropic-Inspired Lia Design
 *
 * Design:
 * ┌─────────────────────────────────────────┐
 * │ Fill Rate              [mini sparkline] │ ← Geist Sans refined typography
 * │                                          │
 * │ 78.4%                               Good │ ← Geist Sans 48px + status
 * │                                          │
 * │ Booking requests accepted               │ ← Neutral-600 description
 * │                                          │
 * │ ────────────────────────────────────    │ ← Orange gradient border (bottom)
 * └─────────────────────────────────────────┘
 *
 * Features:
 * - Anthropic rounded corners (rounded-lg for 12px radius)
 * - Geist Sans for value display (refined typography)
 * - Border-only status badges with rounded-full design
 * - Mini sparkline chart (Recharts)
 * - Orange gradient bottom border accent (featured cards)
 * - Hover: Border transitions to orange-500
 * - WCAG AAA contrast ratios
 */

"use client";

import { geistSans } from "@/app/fonts";
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
  isLive?: boolean; // If true, shows live indicator with pulsing animation
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
        "rounded-full border-2 px-2.5 py-1 font-medium text-xs tracking-wider",
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
  isLive = false,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-orange-500",
        featured && "border-b-2 border-b-orange-500"
      )}
    >
      {/* Header: Title + Live Indicator + Status Badge */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "font-medium text-neutral-700 text-xs tracking-wider",
              geistSans.className
            )}
          >
            {title}
          </h3>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-orange-500" />
              </span>
              <span
                className={cn(
                  "font-medium text-orange-600 text-xs tracking-wider",
                  geistSans.className
                )}
              >
                Live
              </span>
            </div>
          )}
        </div>
        {getStatusBadge(status)}
      </div>

      {/* Sparkline (if provided) */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mb-2 w-24">
          <MiniSparkline data={sparklineData} />
        </div>
      )}

      {/* Value */}
      <div className="mb-2">
        <p
          className={cn(
            "font-medium text-3xl text-neutral-900 tracking-tighter leading-none",
            geistSans.className
          )}
        >
          {value}
        </p>
      </div>

      {/* Description */}
      <p className={cn("font-normal text-neutral-600 text-xs leading-tight", geistSans.className)}>
        {description}
      </p>
    </div>
  );
}
