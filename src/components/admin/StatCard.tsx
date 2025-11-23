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

type SparklineData = {
  day: number;
  value: number;
};

type Props = {
  title: string;
  value: string;
  description: string;
  sparklineData?: SparklineData[];
};

export function StatCard({ title, value, description, sparklineData }: Props) {
  // Calculate trend color
  const trendColor = (() => {
    if (!sparklineData || sparklineData.length < 2) {
      return "#F97316"; // Default orange
    }
    const first = sparklineData[0]?.value ?? 0;
    const last = sparklineData.at(-1)?.value ?? 0;
    return last >= first ? "#22C55E" : "#F97316"; // Green if up/flat, Orange if down
  })();

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "font-medium text-neutral-500 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {title}
          </p>
          <h3
            className={cn(
              "font-semibold text-3xl text-neutral-900 tracking-tight",
              geistSans.className
            )}
          >
            {value}
          </h3>
        </div>
        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 w-24">
            <MiniSparkline color={trendColor} data={sparklineData} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className={cn("text-neutral-400 text-xs", geistSans.className)}>{description}</p>
      </div>
    </div>
  );
}
