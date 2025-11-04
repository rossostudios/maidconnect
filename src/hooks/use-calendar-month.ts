import { useState, useCallback } from "react";

/**
 * Custom hook for managing calendar month navigation state
 *
 * @param initialDate - The initial date to display (defaults to today)
 * @returns Object containing current month, navigation functions, and helper methods
 *
 * @example
 * ```tsx
 * const { currentMonth, goToNextMonth, goToPreviousMonth, goToToday, monthLabel } = useCalendarMonth();
 * ```
 */
export function useCalendarMonth(initialDate?: Date) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const date = initialDate || new Date();
    // Normalize to start of month
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return nextMonth;
    });
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const prevMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return prevMonth;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  const goToMonth = useCallback((date: Date) => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const changeMonth = useCallback((offset: number) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return newMonth;
    });
  }, []);

  const getMonthLabel = useCallback(
    (locale = "en-US", options?: Intl.DateTimeFormatOptions) => {
      return currentMonth.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
        ...options,
      });
    },
    [currentMonth]
  );

  const getMonthBounds = useCallback(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    return { startOfMonth, endOfMonth };
  }, [currentMonth]);

  return {
    currentMonth,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    goToMonth,
    changeMonth,
    monthLabel: getMonthLabel(),
    getMonthLabel,
    getMonthBounds,
  };
}
