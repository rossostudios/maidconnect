/**
 * TimeRangeSelector - Time range filter buttons with Anthropic-inspired Lia design
 *
 * Features:
 * - Rounded buttons (rounded-lg)
 * - Active: Orange border + orange background
 * - Hover: Orange border transition
 * - Refined typography (font-medium, no uppercase)
 * - Keyboard accessible
 */

"use client";

import { geistSans } from "@/app/fonts";
import type { TimeRange } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

type Props = {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
};

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

export function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex justify-end gap-1">
      {TIME_RANGES.map((range) => (
        <button
          aria-label={`Filter analytics by ${range.label}`}
          className={cn(
            "rounded-lg border px-4 py-2.5 font-medium text-xs tracking-wider transition-all",
            geistSans.className,
            value === range.value
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-neutral-200 bg-white text-neutral-900 hover:border-orange-500 hover:text-orange-600"
          )}
          key={range.value}
          onClick={() => onChange(range.value)}
          type="button"
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
