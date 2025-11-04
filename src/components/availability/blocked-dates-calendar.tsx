"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useCalendarMonth } from "@/hooks/use-calendar-month";
import { useCalendarGrid } from "@/hooks/use-calendar-grid";
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
  const {
    currentMonth,
    goToNextMonth,
    goToPreviousMonth,
    getMonthLabel,
    getMonthBounds,
  } = useCalendarMonth();

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

  const handleClearAll = () => {
    if (confirm("Clear all blocked dates?")) {
      handleChange([]);
    }
  };

  const handleBlockMonth = () => {
    const days = calendarDays.filter((day) => day.inCurrentMonth);
    const monthDates = days.map((day) => formatDate(day.date));

    const newBlocked = [...new Set([...blockedDates, ...monthDates])];
    handleChange(newBlocked);
  };

  const blockedInCurrentMonth = useMemo(() => blockedDates.filter((dateStr) => {
      const date = parseDate(dateStr);
      const { startOfMonth, endOfMonth } = getMonthBounds();
      return date >= startOfMonth && date <= endOfMonth;
    }).length, [blockedDates, getMonthBounds]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
            onClick={goToPreviousMonth}
            type="button"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="min-w-[180px] text-center font-semibold text-[#211f1a] text-lg">
            {getMonthLabel()}
          </h3>
          <button
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
            onClick={goToNextMonth}
            type="button"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 rounded-lg border-2 border-[#ebe5d8] bg-white px-3 py-2 font-semibold text-[#211f1a] text-sm transition hover:border-[#8B7355] hover:text-[#8B7355]"
            onClick={handleBlockMonth}
            type="button"
          >
            <Calendar className="h-4 w-4" />
            Block entire month
          </button>
          {blockedDates.length > 0 && (
            <button
              className="flex items-center gap-1 rounded-lg border-2 border-[#ebe5d8] bg-white px-3 py-2 font-semibold text-red-600 text-sm transition hover:border-red-500 hover:bg-red-50"
              onClick={handleClearAll}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-[#ebe5d8] bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px border-[#ebe5d8] border-b bg-[#fbfaf9]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              className="py-3 text-center font-semibold text-[#7d7566] text-xs uppercase tracking-wide"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-[#ebe5d8]">
          {calendarDays.map((day) => {
            const dateStr = formatDate(day.date);
            const isBlocked = blockedDates.includes(dateStr);

            return (
              <button
                className={cn(
                  "aspect-square p-2 text-sm transition",
                  day.inCurrentMonth
                    ? isBlocked
                      ? "bg-red-500 font-semibold text-white hover:bg-red-600"
                      : day.isToday
                        ? "bg-[#fff5f2] font-semibold text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
                        : "bg-white font-medium text-[#211f1a] hover:bg-[#8B7355] hover:text-white"
                    : "cursor-not-allowed bg-[#fbfaf9] text-[#d4cec0]"
                )}
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
        <div className="rounded-xl bg-[#fbfaf9] p-4">
          <p className="text-[#7d7566] text-sm">
            <strong className="text-[#211f1a]">{blockedInCurrentMonth} days</strong> blocked in{" "}
            {getMonthLabel("en-US", { month: "long" })}
          </p>
        </div>
        <div className="rounded-xl bg-[#fbfaf9] p-4">
          <p className="text-[#7d7566] text-sm">
            <strong className="text-[#211f1a]">{blockedDates.length} total days</strong> blocked
            across all months
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-[#ebe5d8] bg-white p-4">
        <h4 className="font-semibold text-[#211f1a] text-sm">How to use:</h4>
        <ul className="mt-2 space-y-1 text-[#7d7566] text-sm">
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
