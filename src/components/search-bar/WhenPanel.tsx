"use client";

import { ArrowLeft01Icon, ArrowRight01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuickDatePills } from "./QuickDatePills";

// Simple calendar implementation
function MiniCalendar({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get days in month and first day of week
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Generate calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelected = (day: number) => {
    if (!(selectedDate && day)) {
      return false;
    }
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (!isPast(day)) {
      onDateSelect(new Date(year, month, day));
    }
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-muted"
          onClick={handlePrevMonth}
          type="button"
        >
          <HugeiconsIcon
            className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
            icon={ArrowLeft01Icon}
          />
        </button>
        <span className="font-semibold text-neutral-900 dark:text-neutral-50">
          {format(viewDate, "MMMM yyyy")}
        </span>
        <button
          className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-muted"
          onClick={handleNextMonth}
          type="button"
        >
          <HugeiconsIcon
            className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
            icon={ArrowRight01Icon}
          />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div
            className="py-2 text-center font-medium text-neutral-500 text-xs dark:text-neutral-400"
            key={i}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div className="aspect-square" key={i}>
            {day !== null && (
              <button
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-full text-sm transition-all",
                  isPast(day)
                    ? "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
                    : "cursor-pointer text-neutral-900 hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-muted",
                  isSelected(day) && "bg-rausch-500 font-semibold text-white hover:bg-rausch-600",
                  isToday(day) &&
                    !isSelected(day) &&
                    "font-semibold text-rausch-600 dark:text-rausch-400"
                )}
                disabled={isPast(day)}
                onClick={() => handleDayClick(day)}
                type="button"
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type WhenPanelProps = {
  /** Currently selected date */
  selectedDate: Date | null;
  /** Callback when a date is selected */
  onDateSelect: (date: Date) => void;
  /** Callback when panel should close */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
};

/**
 * Airbnb-style date selection panel with quick picks and calendar.
 */
export function WhenPanel({ selectedDate, onDateSelect, onClose, className }: WhenPanelProps) {
  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose?.();
  };

  return (
    <div
      className={cn(
        "w-[520px] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-neutral-200/50 dark:bg-card dark:shadow-none dark:ring-border",
        className
      )}
    >
      <div className="grid grid-cols-[140px_1fr] gap-8">
        {/* Quick picks column */}
        <div className="border-neutral-200 border-r pr-6 dark:border-border">
          <QuickDatePills onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>

        {/* Calendar column */}
        <div>
          <MiniCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>
      </div>

      {/* Flexible option */}
      <div className="mt-6 border-neutral-200 border-t pt-4 dark:border-border">
        <button
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:bg-neutral-100 dark:hover:bg-muted"
          onClick={() => {
            // For flexible dates, we'll just close the panel without setting a date
            onClose?.();
          }}
          type="button"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-muted">
            <HugeiconsIcon
              className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
              icon={Calendar01Icon}
            />
          </div>
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">I'm flexible</div>
            <div className="text-neutral-500 text-sm dark:text-neutral-400">
              Browse without specific dates
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
