"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { useCalendarGrid } from "@/hooks/useCalendar";
import { useCalendarMonth } from "@/hooks/useCalendarMonth";
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
 * - Uses shared calendar navigation hook (useCalendarMonth)
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
            className="rounded-lg p-2 text-[#94a3b8] transition hover:bg-[#e2e8f0] hover:text-[#0f172a]"
            onClick={goToPreviousMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
          </button>
          <h3 className="min-w-[180px] text-center font-semibold text-[#0f172a] text-lg">
            {getMonthLabel()}
          </h3>
          <button
            aria-label="Next month"
            className="rounded-lg p-2 text-[#94a3b8] transition hover:bg-[#e2e8f0] hover:text-[#0f172a]"
            onClick={goToNextMonth}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 rounded-lg border-2 border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 font-semibold text-[#0f172a] text-sm transition hover:border-[#64748b] hover:text-[#64748b]"
            onClick={handleBlockMonth}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            Block entire month
          </button>
          {blockedDates.length > 0 && (
            <button
              className="flex items-center gap-1 rounded-lg border-2 border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 font-semibold text-[#64748b] text-sm transition hover:border-[#64748b]/100 hover:bg-[#64748b]/10"
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
      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px border-[#e2e8f0] border-b bg-[#f8fafc]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              className="py-3 text-center font-semibold text-[#94a3b8] text-xs uppercase tracking-wide"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-[#e2e8f0]">
          {calendarDays.map((day) => {
            const dateStr = formatDate(day.date);
            const isBlocked = blockedDates.includes(dateStr);

            const getButtonClassName = () => {
              if (!day.inCurrentMonth) {
                return "cursor-not-allowed bg-[#f8fafc] text-[#e2e8f0]";
              }
              if (isBlocked) {
                return "bg-[#64748b]/100 font-semibold text-[#f8fafc] hover:bg-[#64748b]";
              }
              if (day.isToday) {
                return "bg-[#f8fafc] font-semibold text-[#64748b] hover:bg-[#64748b] hover:text-[#f8fafc]";
              }
              return "bg-[#f8fafc] font-medium text-[#0f172a] hover:bg-[#64748b] hover:text-[#f8fafc]";
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
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="text-[#94a3b8] text-sm">
            <strong className="text-[#0f172a]">{blockedInCurrentMonth} days</strong> blocked in{" "}
            {getMonthLabel("en-US", { month: "long" })}
          </p>
        </div>
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="text-[#94a3b8] text-sm">
            <strong className="text-[#0f172a]">{blockedDates.length} total days</strong> blocked
            across all months
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
        <h4 className="font-semibold text-[#0f172a] text-sm">How to use:</h4>
        <ul className="mt-2 space-y-1 text-[#94a3b8] text-sm">
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
