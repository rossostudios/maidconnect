"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { useCalendarGrid } from "@/hooks/use-calendar-grid";
import { useCalendarMonth } from "@/hooks/use-calendar-month";
import { confirm } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Props = {
  initialBlockedDates?: string[];
  onChange?: (blockedDates: string[]) => void;
};

/**
 * Blocked Dates Calendar (V2 - Unified)
 *
 * This component replaces the original blocked-dates-calendar.tsx
 * with an implementation using the unified calendar hooks.
 *
 * Key improvements:
 * - Uses shared calendar navigation hook (use-calendar-month)
 * - Uses shared calendar grid generation hook (use-calendar-grid)
 * - Maintains all original functionality
 * - Cleaner, more maintainable code
 *
 * Note: This calendar has unique requirements (blocking/unblocking dates)
 * that make it unsuitable for the main AvailabilityCalendar component,
 * but it still benefits from the shared hooks.
 *
 * @example
 * ```tsx
 * <BlockedDatesCalendar
 *   initialBlockedDates={["2025-01-15", "2025-01-16"]}
 *   onChange={(dates) => console.log("Blocked dates:", dates)}
 * />
 * ```
 */
export function BlockedDatesCalendar({ initialBlockedDates = [], onChange }: Props) {
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);

  // Use shared calendar month navigation
  const { currentMonth, goToNextMonth, goToPreviousMonth, getMonthLabel, getMonthBounds } =
    useCalendarMonth();

  // Use shared calendar grid generation
  const calendarDays = useCalendarGrid({ currentMonth, useUTC: false });

  const handleChange = (newDates: string[]) => {
    setBlockedDates(newDates);
    onChange?.(newDates);
  };

  const handleToggleDate = (date: Date) => {
    const dateStr = formatDate(date);
    const isBlocked = blockedDates.includes(dateStr);

    if (isBlocked) {
      handleChange(blockedDates.filter((d) => d !== dateStr));
    } else {
      handleChange([...blockedDates, dateStr]);
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm("Clear all blocked dates?", "Clear Blocked Dates");
    if (confirmed) {
      handleChange([]);
    }
  };

  const handleBlockMonth = () => {
    const days = calendarDays.filter((day) => day.inCurrentMonth);
    const monthDates = days.map((day) => formatDate(day.date));

    const newBlocked = [...new Set([...blockedDates, ...monthDates])];
    handleChange(newBlocked);
  };

  const blockedInCurrentMonth = useMemo(
    () =>
      blockedDates.filter((dateStr) => {
        const date = parseDate(dateStr);
        const { startOfMonth, endOfMonth } = getMonthBounds();
        return date >= startOfMonth && date <= endOfMonth;
      }).length,
    [blockedDates, getMonthBounds]
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
            onClick={goToPreviousMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
          </button>
          <h3 className="min-w-[180px] text-center font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            {getMonthLabel()}
          </h3>
          <button
            aria-label="Next month"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
            onClick={goToNextMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:bg-rausch-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-rausch-400 dark:hover:bg-rausch-900/30"
            onClick={handleBlockMonth}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            Block entire month
          </button>
          {blockedDates.length > 0 && (
            <button
              className="flex items-center gap-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-700 text-sm transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              onClick={handleClearAll}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Delete01Icon} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px border-neutral-200 border-b bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              className="py-3 text-center font-semibold text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-700">
          {calendarDays.map((day) => {
            const dateStr = formatDate(day.date);
            const isBlocked = blockedDates.includes(dateStr);

            const getButtonClassName = () => {
              if (!day.inCurrentMonth) {
                return "cursor-not-allowed bg-neutral-50 text-neutral-300 dark:bg-neutral-800/50 dark:text-neutral-600";
              }
              if (isBlocked) {
                return "bg-red-500 font-semibold text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500";
              }
              if (day.isToday) {
                return "bg-rausch-50 font-semibold text-rausch-600 ring-2 ring-inset ring-rausch-500 hover:bg-rausch-100 dark:bg-rausch-900/30 dark:text-rausch-400 dark:ring-rausch-400 dark:hover:bg-rausch-900/50";
              }
              return "bg-white font-medium text-neutral-900 hover:bg-rausch-50 hover:text-rausch-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-rausch-900/30 dark:hover:text-rausch-400";
            };

            return (
              <button
                className={cn("aspect-square p-2 text-sm transition", getButtonClassName())}
                disabled={!day.inCurrentMonth}
                key={day.key}
                onClick={() => handleToggleDate(day.date)}
                type="button"
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            <strong className="text-neutral-900 dark:text-neutral-100">
              {blockedInCurrentMonth} days
            </strong>{" "}
            blocked in {getMonthLabel("en-US", { month: "long" })}
          </p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            <strong className="text-neutral-900 dark:text-neutral-100">
              {blockedDates.length} total days
            </strong>{" "}
            blocked across all months
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <h4 className="font-semibold text-neutral-900 text-sm dark:text-neutral-100">
          How to use:
        </h4>
        <ul className="mt-2 space-y-1 text-neutral-500 text-sm dark:text-neutral-400">
          <li>• Click any date to block it (turns red)</li>
          <li>• Click a blocked date to unblock it</li>
          <li>• Use "Block entire month" for vacations</li>
          <li>• Blocked dates won't show as available for bookings</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Helper functions
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}
