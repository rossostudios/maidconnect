"use client";

import { useLocale } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { type CalendarDay, useCalendarGrid } from "@/hooks/use-calendar-grid";
import { useCalendarMonth } from "@/hooks/use-calendar-month";
import { cn } from "@/lib/utils";
import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { useCalendarAvailability } from "./hooks/use-calendar-availability";
import { useCalendarPricing } from "./hooks/use-calendar-pricing";
import { useDateRangeSelection } from "./hooks/use-date-range-selection";
import { PriceEditorModal } from "./price-editor-modal";
import { SelectionActionPanel } from "./selection-action-panel";
import type { AirbnbBookingCalendarProps, CalendarCellData, DateAvailabilityStatus } from "./types";

/**
 * Main Airbnb-style booking calendar component
 * Features:
 * - Custom lightweight calendar grid (no FullCalendar.js)
 * - Inline hourly rate display per date cell
 * - Date range selection with visual feedback
 * - Bottom action panel for quick operations (Block/Open dates)
 */
export function AirbnbBookingCalendar({
  professionalId,
  defaultHourlyRateCents,
  currency,
  onBookingClick,
  className,
}: AirbnbBookingCalendarProps) {
  const locale = useLocale();
  const [isPriceEditorOpen, setIsPriceEditorOpen] = useState(false);

  // Month navigation
  const { currentMonth, goToNextMonth, goToPreviousMonth, goToToday, getMonthBounds } =
    useCalendarMonth();

  // Get month bounds for data fetching
  const { startOfMonth: monthStart, endOfMonth: monthEnd } = useMemo(
    () => getMonthBounds(),
    [getMonthBounds]
  );

  // Generate calendar grid
  const calendarDays = useCalendarGrid({ currentMonth });

  // Date range selection
  const {
    selectionStart,
    selectionEnd,
    selectedDates,
    hoveredDate,
    handleDateClick,
    handleDateHover,
    clearSelection,
  } = useDateRangeSelection();

  // Fetch pricing data
  const {
    pricingByDate,
    defaultRateCents,
    updatePricing,
    isUpdating: isPricingUpdating,
  } = useCalendarPricing({
    professionalId,
    startDate: monthStart,
    endDate: monthEnd,
    initialDefaultRate: defaultHourlyRateCents,
  });

  // Fetch availability data (blocked dates + bookings)
  const {
    blockedDates,
    bookingsByDate,
    updateBlockedDates,
    isUpdating: isAvailabilityUpdating,
  } = useCalendarAvailability({
    professionalId,
    startDate: monthStart,
    endDate: monthEnd,
  });

  // Combined loading state
  const isUpdating = isPricingUpdating || isAvailabilityUpdating;

  // Format month label
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(currentMonth),
    [currentMonth, locale]
  );

  // Get effective hourly rate for a date
  const getEffectiveRate = useCallback(
    (dateKey: string): number => pricingByDate[dateKey] ?? defaultRateCents,
    [pricingByDate, defaultRateCents]
  );

  // Get availability status for a date
  const getDateStatus = useCallback(
    (dateKey: string): DateAvailabilityStatus => {
      if (blockedDates.has(dateKey)) {
        return "blocked";
      }
      const bookings = bookingsByDate.get(dateKey);
      if (bookings && bookings.length > 0) {
        // Check if any booking is confirmed or in_progress
        const activeBookings = bookings.filter(
          (b) => b.status === "confirmed" || b.status === "in_progress"
        );
        return activeBookings.length > 0 ? "booked" : "partial";
      }
      return "available";
    },
    [blockedDates, bookingsByDate]
  );

  // Transform calendar days to include pricing and availability
  const enrichedDays: CalendarCellData[] = useMemo(
    () =>
      calendarDays.map((day: CalendarDay) => {
        const status = getDateStatus(day.key);
        const bookings = bookingsByDate.get(day.key) || [];

        return {
          ...day,
          status,
          hourlyRateCents: day.inCurrentMonth && !day.isPast ? getEffectiveRate(day.key) : null,
          bookingCount: bookings.length,
          bookings,
        };
      }),
    [calendarDays, getDateStatus, getEffectiveRate, bookingsByDate]
  );

  // Get selected rate (use the rate from first selected date or default)
  const selectedRate = useMemo(() => {
    const firstDate = selectedDates[0];
    if (!firstDate) {
      return defaultRateCents;
    }
    return getEffectiveRate(firstDate);
  }, [selectedDates, getEffectiveRate, defaultRateCents]);

  // Handle block action
  const handleBlock = useCallback(async () => {
    if (selectedDates.length === 0) {
      return;
    }
    await updateBlockedDates(selectedDates, "block");
    clearSelection();
  }, [selectedDates, updateBlockedDates, clearSelection]);

  // Handle open (unblock) action
  const handleOpen = useCallback(async () => {
    if (selectedDates.length === 0) {
      return;
    }
    await updateBlockedDates(selectedDates, "unblock");
    clearSelection();
  }, [selectedDates, updateBlockedDates, clearSelection]);

  // Handle edit rate
  const handleEditRate = useCallback(() => {
    setIsPriceEditorOpen(true);
  }, []);

  // Handle save rate
  const handleSaveRate = useCallback(
    async (newRateCents: number) => {
      if (selectedDates.length === 0) {
        return;
      }
      await updatePricing(selectedDates, newRateCents);
      setIsPriceEditorOpen(false);
      clearSelection();
    },
    [selectedDates, updatePricing, clearSelection]
  );

  // Check if selection panel should be visible
  const isSelectionPanelVisible = selectedDates.length > 0 && selectionEnd !== null;

  return (
    <div className={cn("relative", className)}>
      {/* Calendar container */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        {/* Header with month navigation */}
        <CalendarHeader
          monthLabel={monthLabel}
          onNext={goToNextMonth}
          onPrevious={goToPreviousMonth}
          onToday={goToToday}
        />

        {/* Calendar grid */}
        <CalendarGrid
          currency={currency}
          days={enrichedDays}
          hoveredDate={hoveredDate}
          onBookingClick={onBookingClick}
          onDateClick={handleDateClick}
          onDateHover={handleDateHover}
          selectedDates={selectedDates}
          selectionEnd={selectionEnd}
          selectionStart={selectionStart}
        />

        {/* Legend */}
        <div className="mt-4 border-border border-t pt-4">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-border bg-card" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-border bg-muted" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-foreground" />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action panel (slides up when dates selected) */}
      <SelectionActionPanel
        currency={currency}
        hourlyRateCents={selectedRate}
        isLoading={isUpdating}
        isVisible={isSelectionPanelVisible}
        onBlock={handleBlock}
        onClear={clearSelection}
        onEditRate={handleEditRate}
        onOpen={handleOpen}
        selectedDates={selectedDates}
      />

      {/* Price editor modal */}
      <PriceEditorModal
        currency={currency}
        currentRateCents={selectedRate}
        isOpen={isPriceEditorOpen}
        onClose={() => setIsPriceEditorOpen(false)}
        onSave={handleSaveRate}
        selectedDates={selectedDates}
      />

      {/* Spacer for bottom panel when visible */}
      {isSelectionPanelVisible && <div className="h-32" />}
    </div>
  );
}
