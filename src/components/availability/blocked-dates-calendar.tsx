"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  initialBlockedDates?: string[];
  onChange?: (blockedDates: string[]) => void;
};

export function BlockedDatesCalendar({ initialBlockedDates = [], onChange }: Props) {
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleChange = (newDates: string[]) => {
    setBlockedDates(newDates);
    onChange?.(newDates);
  };

  const handleToggleDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
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

  const handleBlockWeek = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const weekDates = allDays.map((d) => format(d, "yyyy-MM-dd"));

    const newBlocked = [...new Set([...blockedDates, ...weekDates])];
    handleChange(newBlocked);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get calendar grid (including days from previous/next month for full weeks)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = monthStart.getDay();
    const daysToShow: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysToShow.push(null);
    }

    // Add all days of the month
    daysToShow.push(...monthDays);

    return daysToShow;
  }, [monthStart, monthDays]);

  const blockedInCurrentMonth = blockedDates.filter((dateStr) => {
    const date = parseISO(dateStr);
    return isSameMonth(date, currentMonth);
  }).length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="min-w-[180px] text-center font-semibold text-[#211f1a] text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 rounded-lg border-2 border-[#ebe5d8] bg-white px-3 py-2 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            onClick={handleBlockWeek}
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
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div className="aspect-square bg-[#fbfaf9]" key={`empty-${index}`} />;
            }

            const dateStr = format(day, "yyyy-MM-dd");
            const isBlocked = blockedDates.includes(dateStr);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <button
                className={`aspect-square p-2 text-sm transition ${
                  isCurrentMonth
                    ? isBlocked
                      ? "bg-red-500 font-semibold text-white hover:bg-red-600"
                      : isTodayDate
                        ? "bg-[#fff5f2] font-semibold text-[#ff5d46] hover:bg-[#ff5d46] hover:text-white"
                        : "bg-white font-medium text-[#211f1a] hover:bg-[#ff5d46] hover:text-white"
                    : "cursor-not-allowed bg-[#fbfaf9] text-[#d4cec0]"
                }`}
                disabled={!isCurrentMonth}
                key={dateStr}
                onClick={() => handleToggleDate(day)}
                type="button"
              >
                {format(day, "d")}
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
            {format(currentMonth, "MMMM")}
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
