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
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-200"
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
      <label className="font-medium text-neutral-700 text-sm">Availability</label>

      {/* Quick option: Available today */}
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 font-medium text-sm transition-colors",
          availableToday
            ? "border-orange-500 bg-orange-50 text-orange-600"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-neutral-50"
        )}
        onClick={handleTodayClick}
        type="button"
      >
        Available Today
      </button>

      {/* Date picker */}
      <div className="space-y-1.5">
        <label className="text-neutral-500 text-xs">Or select a date</label>
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
