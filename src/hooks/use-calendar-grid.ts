import { useMemo } from "react";

/**
 * Calendar day type for grid display
 */
export type CalendarDay = {
  date: Date;
  label: number;
  key: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

/**
 * Options for calendar grid generation
 */
export type UseCalendarGridOptions = {
  currentMonth: Date;
  /**
   * Whether to use UTC dates (default: false)
   * Set to true for server-rendered calendars
   */
  useUTC?: boolean;
  /**
   * Number of weeks to display (default: 6)
   * 6 weeks = 42 days ensures all months fit
   */
  weeks?: number;
};

/**
 * Custom hook for generating calendar grid data
 *
 * Generates an array of calendar days including padding days from previous/next months
 * to create a complete grid layout.
 *
 * @param options - Configuration options for calendar grid
 * @returns Array of CalendarDay objects representing the full grid
 *
 * @example
 * ```tsx
 * const { currentMonth } = useCalendarMonth();
 * const calendarDays = useCalendarGrid({ currentMonth });
 *
 * // Render grid
 * {calendarDays.map((day) => (
 *   <div key={day.key}>
 *     {day.inCurrentMonth ? day.label : ''}
 *   </div>
 * ))}
 * ```
 */
export function useCalendarGrid({
  currentMonth,
  useUTC = false,
  weeks = 6,
}: UseCalendarGridOptions): CalendarDay[] {
  return useMemo(() => {
    const today = useUTC ? getUTCToday() : getLocalToday();

    if (useUTC) {
      return buildUTCCalendarGrid(currentMonth, today, weeks);
    } else {
      return buildLocalCalendarGrid(currentMonth, today, weeks);
    }
  }, [currentMonth, useUTC, weeks]);
}

/**
 * Build calendar grid using local timezone
 */
function buildLocalCalendarGrid(
  currentMonth: Date,
  today: Date,
  weeks: number
): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  // Add days from previous month (empty padding)
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -(startingDayOfWeek - i - 1));
    days.push({
      date: prevMonthDay,
      label: prevMonthDay.getDate(),
      key: formatDateKey(prevMonthDay),
      inCurrentMonth: false,
      isToday: isSameDay(prevMonthDay, today),
      isPast: prevMonthDay < today,
    });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      label: day,
      key: formatDateKey(date),
      inCurrentMonth: true,
      isToday: isSameDay(date, today),
      isPast: date < today,
    });
  }

  // Add days from next month to complete grid
  const totalCells = weeks * 7;
  const remainingCells = totalCells - days.length;

  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDay = new Date(year, month + 1, i);
    days.push({
      date: nextMonthDay,
      label: nextMonthDay.getDate(),
      key: formatDateKey(nextMonthDay),
      inCurrentMonth: false,
      isToday: isSameDay(nextMonthDay, today),
      isPast: nextMonthDay < today,
    });
  }

  return days;
}

/**
 * Build calendar grid using UTC timezone
 */
function buildUTCCalendarGrid(
  currentMonth: Date,
  today: Date,
  weeks: number
): CalendarDay[] {
  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth();

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekDay = firstOfMonth.getUTCDay(); // 0 (Sun) - 6 (Sat)

  const days: CalendarDay[] = [];

  // Calendar grid (typically 6 weeks = 42 days)
  const totalCells = weeks * 7;
  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - startWeekDay;
    const current = new Date(Date.UTC(year, month, 1));
    current.setUTCDate(current.getUTCDate() + dayOffset);

    days.push({
      date: current,
      label: current.getUTCDate(),
      key: formatUTCDateKey(current),
      inCurrentMonth: current.getUTCMonth() === month,
      isToday: isSameDayUTC(current, today),
      isPast: current < today,
    });
  }

  return days;
}

/**
 * Helper functions
 */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatUTCDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getUTCToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isSameDayUTC(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Export helper functions for use in components
 */
export const calendarUtils = {
  formatDateKey,
  formatUTCDateKey,
  getLocalToday,
  getUTCToday,
  isSameDay,
  isSameDayUTC,
};
