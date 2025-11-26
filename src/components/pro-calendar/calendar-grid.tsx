"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "./calendar-day-cell";
import type { CalendarGridProps } from "./types";

/**
 * Calendar grid component - 7-column week layout with day headers
 * Follows Airbnb's clean, minimal calendar aesthetic
 */
export const CalendarGrid = memo(function CalendarGrid({
  days,
  selectedDates,
  hoveredDate,
  selectionStart,
  selectionEnd,
  onDateClick,
  onDateHover,
  currency,
  className,
}: CalendarGridProps) {
  const t = useTranslations("datePicker.weekdays");

  // Weekday headers (Sunday-Saturday)
  const weekdays = useMemo(
    () => [
      t("sunday").slice(0, 1), // S
      t("monday").slice(0, 1), // M
      t("tuesday").slice(0, 1), // T
      t("wednesday").slice(0, 1), // W
      t("thursday").slice(0, 1), // T
      t("friday").slice(0, 1), // F
      t("saturday").slice(0, 1), // S
    ],
    [t]
  );

  // Create a set of selected date keys for O(1) lookup
  const selectedDateSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  // Check if a date is selected
  const isDateSelected = useCallback(
    (dateKey: string) => selectedDateSet.has(dateKey),
    [selectedDateSet]
  );

  // Check if date is the selection start
  const isSelectionStart = useCallback(
    (date: Date) => {
      if (!selectionStart) {
        return false;
      }
      return (
        date.getFullYear() === selectionStart.getFullYear() &&
        date.getMonth() === selectionStart.getMonth() &&
        date.getDate() === selectionStart.getDate()
      );
    },
    [selectionStart]
  );

  // Check if date is the selection end
  const isSelectionEnd = useCallback(
    (date: Date) => {
      if (!selectionEnd) {
        return false;
      }
      return (
        date.getFullYear() === selectionEnd.getFullYear() &&
        date.getMonth() === selectionEnd.getMonth() &&
        date.getDate() === selectionEnd.getDate()
      );
    },
    [selectionEnd]
  );

  // Check if date is in hover preview range
  const isDateInRange = useCallback(
    (date: Date) => {
      if (!selectionStart || selectionEnd || !hoveredDate) {
        return false;
      }

      const start = selectionStart <= hoveredDate ? selectionStart : hoveredDate;
      const end = selectionStart <= hoveredDate ? hoveredDate : selectionStart;

      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      return normalizedDate > normalizedStart && normalizedDate < normalizedEnd;
    },
    [selectionStart, selectionEnd, hoveredDate]
  );

  // Check if date is being hovered
  const isDateHovered = useCallback(
    (date: Date) => {
      if (!hoveredDate) {
        return false;
      }
      return (
        date.getFullYear() === hoveredDate.getFullYear() &&
        date.getMonth() === hoveredDate.getMonth() &&
        date.getDate() === hoveredDate.getDate()
      );
    },
    [hoveredDate]
  );

  return (
    <div aria-label="Calendar" className={cn("w-full", className)} role="grid">
      {/* Weekday headers */}
      <div aria-hidden="true" className="mb-2 grid grid-cols-7 gap-1" role="row">
        {weekdays.map((day, index) => (
          <div
            className={cn(
              "flex h-8 items-center justify-center",
              "font-semibold text-neutral-500 text-xs uppercase tracking-wider dark:text-neutral-400",
              geistSans.className
            )}
            key={index}
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar day cells */}
      <div className="grid grid-cols-7 gap-1" role="rowgroup">
        {days.map((day) => (
          <CalendarDayCell
            currency={currency}
            day={day}
            isHovered={isDateHovered(day.date)}
            isInRange={isDateInRange(day.date)}
            isSelected={isDateSelected(day.key)}
            isSelectionEnd={isSelectionEnd(day.date)}
            isSelectionStart={isSelectionStart(day.date)}
            key={day.key}
            onClick={() => onDateClick(day.date)}
            onHover={() => onDateHover(day.date)}
            onHoverEnd={() => onDateHover(null)}
          />
        ))}
      </div>
    </div>
  );
});
