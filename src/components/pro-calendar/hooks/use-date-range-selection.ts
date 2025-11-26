"use client";

import { useCallback, useMemo, useState } from "react";
import { calendarUtils } from "@/hooks/use-calendar-grid";
import type { UseDateRangeSelectionReturn } from "../types";

/**
 * Selection state machine for date range picking
 *
 * Selection Logic:
 * 1. First click → set start, no end
 * 2. Second click → set end (swap if before start)
 * 3. Third click → start new selection
 * 4. Click same date twice → single-day selection
 */
export function useDateRangeSelection(): UseDateRangeSelectionReturn {
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  /**
   * Generates array of date keys (YYYY-MM-DD) between start and end inclusive
   */
  const selectedDates = useMemo(() => {
    if (!selectionStart) {
      return [];
    }
    if (!selectionEnd) {
      return [calendarUtils.formatDateKey(selectionStart)];
    }

    const dates: string[] = [];
    const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart;

    const current = new Date(start);
    while (current <= end) {
      dates.push(calendarUtils.formatDateKey(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [selectionStart, selectionEnd]);

  /**
   * Handle date click following Airbnb selection pattern
   */
  const handleDateClick = useCallback(
    (date: Date) => {
      // If no selection started, start new selection
      if (!selectionStart) {
        setSelectionStart(date);
        setSelectionEnd(null);
        return;
      }

      // If selection already complete (has both start and end), start new selection
      if (selectionStart && selectionEnd) {
        setSelectionStart(date);
        setSelectionEnd(null);
        return;
      }

      // Complete the selection (selectionStart exists but no end)
      // Clicking the same date = single-day selection
      if (calendarUtils.isSameDay(date, selectionStart)) {
        setSelectionEnd(date);
        return;
      }

      // If clicked date is before start, swap them
      if (date < selectionStart) {
        setSelectionEnd(selectionStart);
        setSelectionStart(date);
      } else {
        setSelectionEnd(date);
      }
    },
    [selectionStart, selectionEnd]
  );

  /**
   * Handle date hover for visual range preview
   */
  const handleDateHover = useCallback((date: Date | null) => {
    setHoveredDate(date);
  }, []);

  /**
   * Clear all selection state
   */
  const clearSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setHoveredDate(null);
  }, []);

  /**
   * Check if a date is selected (part of final selection)
   */
  const isDateSelected = useCallback(
    (date: Date): boolean => {
      if (!selectionStart) {
        return false;
      }

      // Single date selected (start only, no end yet)
      if (!selectionEnd) {
        return calendarUtils.isSameDay(date, selectionStart);
      }

      // Range selected
      const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart;

      // Normalize dates for comparison (strip time)
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    },
    [selectionStart, selectionEnd]
  );

  /**
   * Check if a date is in the hover preview range
   * (only when selection started but not completed)
   */
  const isDateInRange = useCallback(
    (date: Date): boolean => {
      // Only show range preview when we have start but no end, and we're hovering
      if (!selectionStart || selectionEnd || !hoveredDate) {
        return false;
      }

      const start = selectionStart <= hoveredDate ? selectionStart : hoveredDate;
      const end = selectionStart <= hoveredDate ? hoveredDate : selectionStart;

      // Normalize dates for comparison
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      return normalizedDate > normalizedStart && normalizedDate < normalizedEnd;
    },
    [selectionStart, selectionEnd, hoveredDate]
  );

  /**
   * Check if date is the selection start
   */
  const isSelectionStart = useCallback(
    (date: Date): boolean => {
      if (!selectionStart) {
        return false;
      }
      return calendarUtils.isSameDay(date, selectionStart);
    },
    [selectionStart]
  );

  /**
   * Check if date is the selection end
   */
  const isSelectionEnd = useCallback(
    (date: Date): boolean => {
      if (!selectionEnd) {
        return false;
      }
      return calendarUtils.isSameDay(date, selectionEnd);
    },
    [selectionEnd]
  );

  return {
    selectionStart,
    selectionEnd,
    selectedDates,
    hoveredDate,
    handleDateClick,
    handleDateHover,
    clearSelection,
    isDateSelected,
    isDateInRange,
    isSelectionStart,
    isSelectionEnd,
  };
}
