/**
 * DateRangeFilter - Period Selection Component
 *
 * A compact date range selector for dashboard analytics.
 * Options: 7d (Last 7 days), 30d (Last 30 days), 90d (Last 90 days)
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Orange accent for selected state
 * - Neutral colors for unselected
 */

"use client";

import { cn } from "@/lib/utils";

export type DatePeriod = "7d" | "30d" | "90d";

type DateRangeFilterProps = {
  value: DatePeriod;
  onChange: (period: DatePeriod) => void;
  className?: string;
  size?: "sm" | "default";
};

const periodLabels: Record<DatePeriod, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

const periodShortLabels: Record<DatePeriod, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
};

export function DateRangeFilter({
  value,
  onChange,
  className,
  size = "default",
}: DateRangeFilterProps) {
  const periods: DatePeriod[] = ["7d", "30d", "90d"];

  return (
    <div
      aria-label="Select time period"
      className={cn(
        "inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-1",
        className
      )}
      role="group"
    >
      {periods.map((period) => {
        const isSelected = value === period;
        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              "rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-1",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              isSelected
                ? "bg-white text-neutral-900 shadow-sm"
                : "bg-transparent text-neutral-600 hover:text-neutral-900"
            )}
            key={period}
            onClick={() => onChange(period)}
            type="button"
          >
            {size === "sm" ? periodShortLabels[period] : periodLabels[period]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * DateRangeDropdown - Alternative dropdown style
 * Use when horizontal space is limited
 */
type DateRangeDropdownProps = {
  value: DatePeriod;
  onChange: (period: DatePeriod) => void;
  className?: string;
};

function DateRangeDropdown({ value, onChange, className }: DateRangeDropdownProps) {
  return (
    <select
      aria-label="Select time period"
      className={cn(
        "rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 text-sm",
        "focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
        "cursor-pointer appearance-none bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat pr-8",
        className
      )}
      onChange={(e) => onChange(e.target.value as DatePeriod)}
      value={value}
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
    </select>
  );
}
