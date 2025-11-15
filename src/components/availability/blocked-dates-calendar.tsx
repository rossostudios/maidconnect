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
            className="p-2 text-[neutral-400] transition hover:bg-[neutral-200] hover:text-[neutral-900]"
            onClick={goToPreviousMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
          </button>
          <h3 className="min-w-[180px] text-center font-semibold text-[neutral-900] text-lg">
            {getMonthLabel()}
          </h3>
          <button
            aria-label="Next month"
            className="p-2 text-[neutral-400] transition hover:bg-[neutral-200] hover:text-[neutral-900]"
            onClick={goToNextMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 border-2 border-[neutral-200] bg-[neutral-50] px-3 py-2 font-semibold text-[neutral-900] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
            onClick={handleBlockMonth}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            Block entire month
          </button>
          {blockedDates.length > 0 && (
            <button
              className="flex items-center gap-1 border-2 border-[neutral-200] bg-[neutral-50] px-3 py-2 font-semibold text-[neutral-500] text-sm transition hover:border-[neutral-500]/100 hover:bg-[neutral-500]/10"
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
      <div className="overflow-hidden border border-[neutral-200] bg-[neutral-50]">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px border-[neutral-200] border-b bg-[neutral-50]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              className="py-3 text-center font-semibold text-[neutral-400] text-xs uppercase tracking-wide"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-[neutral-200]">
          {calendarDays.map((day) => {
            const dateStr = formatDate(day.date);
            const isBlocked = blockedDates.includes(dateStr);

            const getButtonClassName = () => {
              if (!day.inCurrentMonth) {
                return "cursor-not-allowed bg-[neutral-50] text-[neutral-200]";
              }
              if (isBlocked) {
                return "bg-[neutral-500]/100 font-semibold text-[neutral-50] hover:bg-[neutral-500]";
              }
              if (day.isToday) {
                return "bg-[neutral-50] font-semibold text-[neutral-500] hover:bg-[neutral-500] hover:text-[neutral-50]";
              }
              return "bg-[neutral-50] font-medium text-[neutral-900] hover:bg-[neutral-500] hover:text-[neutral-50]";
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
        <div className="bg-[neutral-50] p-4">
          <p className="text-[neutral-400] text-sm">
            <strong className="text-[neutral-900]">{blockedInCurrentMonth} days</strong> blocked in{" "}
            {getMonthLabel("en-US", { month: "long" })}
          </p>
        </div>
        <div className="bg-[neutral-50] p-4">
          <p className="text-[neutral-400] text-sm">
            <strong className="text-[neutral-900]">{blockedDates.length} total days</strong> blocked
            across all months
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="border border-[neutral-200] bg-[neutral-50] p-4">
        <h4 className="font-semibold text-[neutral-900] text-sm">How to use:</h4>
        <ul className="mt-2 space-y-1 text-[neutral-400] text-sm">
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
