"use client";

/**
 * AvailabilityFilter - Minimal Lia Design System
 *
 * Clean availability filter for boutique marketplace.
 */

import { format, parse } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

type AvailabilityFilterProps = {
  availableToday: boolean;
  date: string | null;
  onAvailableTodayChange: (value: boolean) => void;
  onDateChange: (value: string | null) => void;
  className?: string;
  compact?: boolean;
};

export function AvailabilityFilter({
  availableToday,
  date,
  onAvailableTodayChange,
  onDateChange,
  className,
  compact = false,
}: AvailabilityFilterProps) {
  // Convert string date to Date object for DatePicker
  const dateValue = date ? parse(date, "yyyy-MM-dd", new Date()) : null;

  const handleDateChange = (newDate: Date | null) => {
    const value = newDate ? format(newDate, "yyyy-MM-dd") : null;
    onDateChange(value);
    // If a specific date is selected, turn off "available today"
    if (value) {
      onAvailableTodayChange(false);
    }
  };

  const handleTodayClick = () => {
    const newValue = !availableToday;
    onAvailableTodayChange(newValue);
    // If "available today" is turned on, clear specific date
    if (newValue) {
      onDateChange(null);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          className={cn(
            "flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-sm transition-colors",
            availableToday
              ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-200 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500"
          )}
          onClick={handleTodayClick}
          type="button"
        >
          Today
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section label */}
      <label className="font-medium text-neutral-700 text-sm dark:text-rausch-100">
        Availability
      </label>

      {/* Quick option: Available today */}
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 font-medium text-sm transition-colors",
          availableToday
            ? "border-rausch-500 bg-rausch-50 text-rausch-600 dark:border-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-100"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-rausch-300 hover:bg-neutral-50 dark:border-rausch-700 dark:bg-rausch-800/30 dark:text-rausch-200 dark:hover:border-rausch-500 dark:hover:bg-rausch-800/50"
        )}
        onClick={handleTodayClick}
        type="button"
      >
        Available Today
      </button>

      {/* Date picker */}
      <div className="space-y-1.5">
        <label className="text-neutral-500 text-xs dark:text-rausch-200">Or select a date</label>
        <DatePicker
          onChange={handleDateChange}
          placeholder="Select date"
          value={dateValue}
          variant="default"
        />
      </div>
    </div>
  );
}
