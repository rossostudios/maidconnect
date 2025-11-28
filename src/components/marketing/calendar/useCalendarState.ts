"use client";

import { useCallback, useMemo, useState } from "react";
import type { CalendarDay, CalendarState } from "../types";

type UseCalendarStateOptions = {
  /** Initial selected date */
  initialDate?: Date | null;
  /** Initial view date (month/year to display) */
  initialViewDate?: Date;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Callback when selection changes */
  onSelect?: (date: Date | null) => void;
};

/**
 * Hook for managing calendar state
 * Handles month navigation, date selection, and day generation
 */
export function useCalendarState({
  initialDate = null,
  initialViewDate,
  minDate,
  maxDate,
  onSelect,
}: UseCalendarStateOptions = {}): CalendarState {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [viewDate, setViewDate] = useState<Date>(initialViewDate ?? initialDate ?? new Date());

  const previousMonth = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const selectDate = useCallback(
    (date: Date | null) => {
      setSelectedDate(date);
      onSelect?.(date);
    },
    [onSelect]
  );

  const calendarDays = useMemo(
    () => generateCalendarDays(viewDate, minDate, maxDate),
    [viewDate, minDate, maxDate]
  );

  return {
    viewDate,
    selectedDate,
    previousMonth,
    nextMonth,
    selectDate,
    calendarDays,
  };
}

/**
 * Generate all days to display in a calendar month grid
 * Includes padding days from previous/next months
 */
function generateCalendarDays(viewDate: Date, minDate?: Date, maxDate?: Date): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Day of week the month starts on (0 = Sunday)
  const startDayOfWeek = firstDay.getDay();
  // Total days in the month
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  // Add padding days from previous month
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  // Add padding days from next month to complete the grid (6 rows × 7 days = 42)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  return days;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is outside the allowed range
 */
function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate) {
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    if (date < min) {
      return true;
    }
  }
  if (maxDate) {
    const max = new Date(maxDate);
    max.setHours(23, 59, 59, 999);
    if (date > max) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two dates are the same day (exported for use elsewhere)
 */
export function areSameDays(date1: Date | null, date2: Date | null): boolean {
  if (!(date1 && date2)) {
    return false;
  }
  return isSameDay(date1, date2);
}
