"use client";

import { memo, useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { formatFromMinorUnits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalendarDayCellProps } from "./types";

/**
 * Visual States (Airbnb-style with Dark Mode):
 * | State      | Light Background | Dark Background        | Light Text        | Dark Text          |
 * |------------|------------------|------------------------|-------------------|-------------------|
 * | Available  | bg-white         | dark:bg-neutral-800/50 | text-neutral-900  | dark:text-neutral-100 |
 * | Blocked    | bg-neutral-100   | dark:bg-neutral-700/50 | text-neutral-400  | dark:text-neutral-500 |
 * | Booked     | bg-green-50      | dark:bg-green-900/30   | text-neutral-900  | dark:text-neutral-100 |
 * | Selected   | bg-neutral-900   | dark:bg-white          | text-white        | dark:text-neutral-900 (INVERTED) |
 * | In Range   | bg-neutral-200   | dark:bg-neutral-700/50 | text-neutral-900  | dark:text-neutral-100 |
 * | Today      | -                | -                      | ring-rausch-500   | ring-rausch-400 |
 * | Past       | bg-neutral-50    | dark:bg-neutral-800/30 | text-neutral-400  | dark:text-neutral-500 |
 */
export const CalendarDayCell = memo(function CalendarDayCell({
  day,
  isSelected,
  isInRange,
  isSelectionStart,
  isSelectionEnd,
  isHovered,
  onClick,
  onHover,
  onHoverEnd,
  currency,
  className,
}: CalendarDayCellProps) {
  const { date, label, inCurrentMonth, isToday, isPast, status, hourlyRateCents, bookingCount } =
    day;

  // Determine if cell is interactive
  const isInteractive = inCurrentMonth && !isPast;

  // Format hourly rate for display
  const formattedRate = useMemo(() => {
    if (!hourlyRateCents) {
      return null;
    }
    // Use compact format for cell display
    const formatted = formatFromMinorUnits(hourlyRateCents, currency);
    // Extract just the number part for compact display
    return formatted;
  }, [hourlyRateCents, currency]);

  // Build cell classes based on state
  const cellClasses = useMemo(() => {
    const base = [
      "relative flex flex-col items-center justify-center",
      "h-14 sm:h-16 w-full min-w-0",
      "rounded-lg transition-all duration-150",
      "select-none",
      geistSans.className,
    ];

    // Outside current month
    if (!inCurrentMonth) {
      return cn(...base, "cursor-default text-neutral-300 dark:text-neutral-600", className);
    }

    // Past dates (non-interactive)
    if (isPast) {
      return cn(
        ...base,
        "cursor-default bg-neutral-50 text-neutral-400 dark:bg-neutral-800/30 dark:text-neutral-500",
        className
      );
    }

    // Selected state (highest priority after past) - INVERTED for dark mode
    if (isSelected || isSelectionStart || isSelectionEnd) {
      return cn(
        ...base,
        "cursor-pointer bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
        // Rounded corners based on selection position
        isSelectionStart && !isSelectionEnd && "rounded-r-none",
        isSelectionEnd && !isSelectionStart && "rounded-l-none",
        className
      );
    }

    // In range (between start and end)
    if (isInRange) {
      return cn(
        ...base,
        "cursor-pointer rounded-none bg-neutral-200 text-neutral-900 dark:bg-neutral-700/50 dark:text-neutral-100",
        className
      );
    }

    // Blocked
    if (status === "blocked") {
      return cn(
        ...base,
        "cursor-pointer bg-neutral-100 text-neutral-400 dark:bg-neutral-700/50 dark:text-neutral-500",
        // Diagonal stripes pattern via CSS (light and dark variants)
        "bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(0,0,0,0.05)_4px,rgba(0,0,0,0.05)_8px)]",
        "dark:bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]",
        className
      );
    }

    // Booked (has bookings)
    if (status === "booked" || status === "partial") {
      return cn(
        ...base,
        "cursor-pointer bg-green-50 text-neutral-900 dark:bg-green-900/30 dark:text-neutral-100",
        isHovered && "bg-green-100 dark:bg-green-900/50",
        className
      );
    }

    // Available (default interactive state)
    return cn(
      ...base,
      "cursor-pointer border border-neutral-100 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100",
      isHovered &&
        "border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700/50",
      className
    );
  }, [
    inCurrentMonth,
    isPast,
    isSelected,
    isSelectionStart,
    isSelectionEnd,
    isInRange,
    isHovered,
    status,
    className,
  ]);

  // Today indicator ring
  const todayRingClasses =
    isToday && !isSelected && !isInRange
      ? "ring-2 ring-rausch-500 dark:ring-rausch-400 ring-offset-1 dark:ring-offset-neutral-900"
      : "";

  return (
    <button
      aria-label={`${date.toLocaleDateString()}, ${status}${hourlyRateCents ? `, ${formattedRate}` : ""}`}
      aria-selected={isSelected}
      className={cn(cellClasses, todayRingClasses)}
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      onMouseEnter={isInteractive ? onHover : undefined}
      onMouseLeave={isInteractive ? onHoverEnd : undefined}
      role="gridcell"
      tabIndex={isInteractive ? 0 : -1}
      type="button"
    >
      {/* Day number */}
      <span
        className={cn(
          "font-medium text-sm leading-none",
          !inCurrentMonth && "text-neutral-300 dark:text-neutral-600",
          (isSelected || isSelectionStart || isSelectionEnd) &&
            "font-semibold text-white dark:text-neutral-900"
        )}
      >
        {label}
      </span>

      {/* Hourly rate (only show for current month, non-past dates) */}
      {inCurrentMonth && !isPast && formattedRate && (
        <span
          className={cn(
            "mt-0.5 font-medium text-[10px] leading-none sm:text-xs",
            isSelected || isSelectionStart || isSelectionEnd
              ? "text-white/80 dark:text-neutral-900/70"
              : status === "blocked"
                ? "text-neutral-400 dark:text-neutral-500"
                : "text-neutral-500 dark:text-neutral-400"
          )}
        >
          {formattedRate}
        </span>
      )}

      {/* Booking indicator dot (green dot for booked dates) */}
      {inCurrentMonth && !isPast && bookingCount > 0 && !isSelected && !isInRange && (
        <span
          aria-label={`${bookingCount} booking${bookingCount > 1 ? "s" : ""}`}
          className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-green-500"
        />
      )}

      {/* Blocked indicator (X icon for blocked dates) */}
      {inCurrentMonth && !isPast && status === "blocked" && !isSelected && !isInRange && (
        <span
          aria-label="Blocked"
          className="absolute top-1.5 right-1.5 font-bold text-[8px] text-neutral-400 dark:text-neutral-500"
        >
          ✕
        </span>
      )}
    </button>
  );
});
