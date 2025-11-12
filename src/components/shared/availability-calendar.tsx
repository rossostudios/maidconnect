"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import {
  type AvailabilityData,
  type DayAvailability,
  useAvailabilityData,
} from "@/hooks/use-availability-data";
import { useCalendarGrid } from "@/hooks/use-calendar-grid";
import { useCalendarMonth } from "@/hooks/use-calendar-month";
import { cn } from "@/lib/utils";

/**
 * Calendar view size variants
 */
export type CalendarSize = "compact" | "medium" | "large";

/**
 * Calendar visual theme variants
 */
export type CalendarTheme = "default" | "professional" | "customer";

/**
 * Data source configuration
 */
export type CalendarDataSource =
  | {
      type: "api";
      professionalId: string;
      onDataLoad?: (data: AvailabilityData) => void;
    }
  | {
      type: "props";
      availability: DayAvailability[];
      getDateAvailability: (date: Date) => DayAvailability | null;
    };

/**
 * Props for the unified AvailabilityCalendar component
 */
export type AvailabilityCalendarProps = {
  /**
   * Data source configuration (API or props-based)
   */
  dataSource: CalendarDataSource;

  /**
   * Calendar size variant
   * @default "medium"
   */
  size?: CalendarSize;

  /**
   * Visual theme variant
   * @default "default"
   */
  theme?: CalendarTheme;

  /**
   * Selected date (controlled)
   */
  selectedDate?: Date | null;

  /**
   * Callback when date is selected
   */
  onDateSelect?: (date: Date | null) => void;

  /**
   * Selected time slot (controlled)
   */
  selectedTime?: string | null;

  /**
   * Callback when time slot is selected
   */
  onTimeSelect?: (time: string | null) => void;

  /**
   * Show time slot selector
   * @default true
   */
  showTimeSlots?: boolean;

  /**
   * Show availability legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Show "Today" button
   * @default true
   */
  showTodayButton?: boolean;

  /**
   * Use UTC dates (for server-rendered calendars)
   * @default false
   */
  useUTC?: boolean;

  /**
   * Locale for date formatting
   * @default "en-US"
   */
  locale?: string;

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Initial month to display
   */
  initialMonth?: Date;

  /**
   * Render custom day cell content
   */
  renderDayContent?: (day: Date, availability: DayAvailability | null) => React.ReactNode;

  /**
   * Render custom time slot button
   */
  renderTimeSlot?: (time: string, isSelected: boolean) => React.ReactNode;
};

/**
 * Unified Availability Calendar Component
 *
 * A flexible, configurable calendar component that supports multiple views,
 * data sources, and use cases. Consolidates all calendar implementations
 * into a single, maintainable component.
 *
 * @example
 * ```tsx
 * // API-based calendar with time slots
 * <AvailabilityCalendar
 *   dataSource={{
 *     type: "api",
 *     professionalId: "123"
 *   }}
 *   size="large"
 *   selectedDate={selectedDate}
 *   onDateSelect={setSelectedDate}
 *   selectedTime={selectedTime}
 *   onTimeSelect={setSelectedTime}
 * />
 *
 * // Props-based calendar (custom data)
 * <AvailabilityCalendar
 *   dataSource={{
 *     type: "props",
 *     availability: customAvailability,
 *     getDateAvailability: (date) => findAvailability(date)
 *   }}
 *   size="compact"
 *   theme="professional"
 *   showTimeSlots={false}
 * />
 * ```
 */
export function AvailabilityCalendar({
  dataSource,
  size = "medium",
  theme = "default",
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  showTimeSlots = true,
  showLegend = true,
  showTodayButton = true,
  useUTC = false,
  locale = "en-US",
  className,
  initialMonth,
  renderDayContent,
  renderTimeSlot,
}: AvailabilityCalendarProps) {
  // Month navigation
  const {
    currentMonth,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getMonthLabel,
    getMonthBounds,
  } = useCalendarMonth(initialMonth);

  // Calendar grid generation
  const calendarDays = useCalendarGrid({ currentMonth, useUTC });

  // Data fetching (for API-based calendars)
  const { startOfMonth, endOfMonth } = getMonthBounds();
  const apiData = useAvailabilityData({
    professionalId: dataSource.type === "api" ? dataSource.professionalId : undefined,
    startDate: formatDate(startOfMonth),
    endDate: formatDate(endOfMonth),
    enabled: dataSource.type === "api",
    onSuccess: dataSource.type === "api" ? dataSource.onDataLoad : undefined,
  });

  // Get availability for a specific date
  const getDateAvailability = useMemo(() => {
    if (dataSource.type === "api") {
      return apiData.getDateAvailability;
    }
    return dataSource.getDateAvailability;
  }, [dataSource, apiData]);

  // Loading and error states (for API-based calendars)
  const isLoading = dataSource.type === "api" && apiData.loading;
  const error = dataSource.type === "api" ? apiData.error : null;

  // Selected date availability
  const selectedDateAvailability = selectedDate ? getDateAvailability(selectedDate) : null;

  // Theme configurations
  const themeConfig = getThemeConfig(theme);
  const sizeConfig = getSizeConfig(size);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className={cn("font-semibold text-[neutral-900]", sizeConfig.headerText)}>
          {getMonthLabel(locale)}
        </h3>
        <div className={cn("flex gap-2", sizeConfig.buttonGap)}>
          {showTodayButton && (
            <button
              className={cn(
                "rounded-md border border-[neutral-200] font-medium text-[neutral-400] transition hover:border-[neutral-500] hover:text-[neutral-500]",
                sizeConfig.button
              )}
              onClick={goToToday}
              type="button"
            >
              Today
            </button>
          )}
          <button
            aria-label="Previous month"
            className={cn(
              "rounded-md border border-[neutral-200] text-[neutral-400] transition hover:border-[neutral-500] hover:text-[neutral-500]",
              sizeConfig.navButton
            )}
            onClick={goToPreviousMonth}
            type="button"
          >
            <HugeiconsIcon className={sizeConfig.icon} icon={ArrowLeft01Icon} />
          </button>
          <button
            aria-label="Next month"
            className={cn(
              "rounded-md border border-[neutral-200] text-[neutral-400] transition hover:border-[neutral-500] hover:text-[neutral-500]",
              sizeConfig.navButton
            )}
            onClick={goToNextMonth}
            type="button"
          >
            <HugeiconsIcon className={sizeConfig.icon} icon={ArrowRight01Icon} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            "rounded-lg border border-[neutral-200] bg-[neutral-50]/90 text-center",
            sizeConfig.loadingPadding
          )}
        >
          <p className={cn("text-[neutral-400]", sizeConfig.text)}>Loading availability...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-[neutral-500]/30 bg-[neutral-500]/10 p-4 text-center">
          <p className={cn("text-[neutral-500]", sizeConfig.text)}>{error.message}</p>
          {dataSource.type === "api" && (
            <button
              className={cn(
                "mt-2 font-semibold text-[neutral-500] hover:text-[neutral-500]",
                sizeConfig.smallText
              )}
              onClick={apiData.refetch}
              type="button"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      {!(isLoading || error) && (
        <>
          <div
            className={cn(
              "grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-[neutral-200] bg-[neutral-200]",
              themeConfig.gridBorder
            )}
          >
            {/* Day Headers */}
            {getDayHeaders(size).map((day) => (
              <div
                className={cn(
                  "bg-[neutral-200] text-center font-semibold text-[neutral-400] uppercase",
                  sizeConfig.headerPadding,
                  sizeConfig.smallText
                )}
                key={day}
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((calendarDay) => {
              const availability = getDateAvailability(calendarDay.date);
              const isSelected = selectedDate && calendarDay.key === formatDate(selectedDate);

              const canSelect =
                !calendarDay.isPast &&
                availability &&
                availability.status !== "blocked" &&
                availability.availableSlots.length > 0;

              const statusColors = getStatusColors(availability?.status);

              const bgColor = calendarDay.isPast
                ? "bg-[neutral-50]"
                : calendarDay.inCurrentMonth
                  ? availability
                    ? statusColors.bg
                    : "bg-[neutral-50]"
                  : "bg-[neutral-50]";

              return (
                <button
                  className={cn(
                    "relative text-left transition",
                    sizeConfig.dayCell,
                    bgColor,
                    isSelected && themeConfig.selected,
                    calendarDay.isToday && themeConfig.today,
                    canSelect ? themeConfig.selectable : "cursor-not-allowed opacity-60",
                    calendarDay.isPast && "text-[neutral-400]/70",
                    !calendarDay.isPast && "text-[neutral-900]",
                    !calendarDay.inCurrentMonth && "opacity-40"
                  )}
                  disabled={!canSelect}
                  key={calendarDay.key}
                  onClick={() => {
                    if (canSelect) {
                      onDateSelect?.(calendarDay.date);
                      onTimeSelect?.(null); // Reset time when date changes
                    }
                  }}
                  type="button"
                >
                  {renderDayContent ? (
                    renderDayContent(calendarDay.date, availability)
                  ) : (
                    <DefaultDayContent availability={availability} day={calendarDay} size={size} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className={cn("flex flex-wrap gap-3 text-[neutral-400]", sizeConfig.smallText)}>
              <LegendItem icon="🟢" label="Available" />
              <LegendItem icon="🟡" label="Limited" />
              <LegendItem icon="🔴" label="Booked" />
              <LegendItem icon="⚫" label="Unavailable" />
            </div>
          )}
        </>
      )}

      {/* Time Slots for Selected Date */}
      {showTimeSlots &&
        selectedDate &&
        selectedDateAvailability &&
        selectedDateAvailability.availableSlots.length > 0 && (
          <div className="rounded-lg border border-[neutral-200] bg-[neutral-50]/90 p-4">
            <h4 className={cn("mb-3 font-semibold text-[neutral-900]", sizeConfig.text)}>
              Available times on{" "}
              {selectedDate.toLocaleDateString(locale, { month: "long", day: "numeric" })}
            </h4>
            <div
              className={cn(
                "grid gap-2",
                size === "large"
                  ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
                  : "grid-cols-3 sm:grid-cols-4"
              )}
            >
              {selectedDateAvailability.availableSlots.map((time) => {
                const isTimeSelected = selectedTime === time;
                return renderTimeSlot ? (
                  <div
                    key={time}
                    onClick={() => onTimeSelect?.(time)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTimeSelect?.(time);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {renderTimeSlot(time, isTimeSelected)}
                  </div>
                ) : (
                  <button
                    className={cn(
                      "rounded-md border font-medium transition",
                      sizeConfig.timeSlotButton,
                      isTimeSelected
                        ? "border-[neutral-500] bg-[neutral-500] text-[neutral-50]"
                        : "border-[neutral-200] bg-[neutral-50] text-[neutral-900] hover:border-[neutral-500] hover:text-[neutral-500]"
                    )}
                    key={time}
                    onClick={() => onTimeSelect?.(time)}
                    type="button"
                  >
                    {formatTime(time)}
                  </button>
                );
              })}
            </div>
            {selectedDateAvailability.bookingCount > 0 && (
              <p className={cn("mt-3 text-[neutral-400]", sizeConfig.smallText)}>
                {selectedDateAvailability.bookingCount} of {selectedDateAvailability.maxBookings}{" "}
                slots booked today
              </p>
            )}
          </div>
        )}

      {/* No Slots Message */}
      {showTimeSlots &&
        selectedDate &&
        selectedDateAvailability &&
        selectedDateAvailability.availableSlots.length === 0 && (
          <div className="rounded-lg border border-[neutral-200] bg-[neutral-50]/90 p-4 text-center">
            <p className={cn("text-[neutral-400]", sizeConfig.text)}>
              No available time slots on this date. Please choose another day.
            </p>
          </div>
        )}
    </div>
  );
}

/**
 * Default day cell content
 */
function DefaultDayContent({
  day,
  availability,
  size,
}: {
  day: { date: Date; label: number; isPast: boolean; inCurrentMonth: boolean };
  availability: DayAvailability | null;
  size: CalendarSize;
}) {
  const sizeConfig = getSizeConfig(size);
  const statusIndicators = {
    available: "🟢",
    limited: "🟡",
    booked: "🔴",
    blocked: "⚫",
  };

  return (
    <div className="flex h-full flex-col">
      <span className={sizeConfig.dayNumber}>{day.label}</span>
      {availability && !day.isPast && day.inCurrentMonth && (
        <span className="mt-auto text-xs">{statusIndicators[availability.status]}</span>
      )}
    </div>
  );
}

/**
 * Legend item component
 */
function LegendItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/**
 * Theme configuration
 */
function getThemeConfig(theme: CalendarTheme) {
  const configs = {
    default: {
      gridBorder: "border-[neutral-200]",
      selected: "ring-2 ring-[neutral-500] ring-inset",
      today: "font-bold",
      selectable: "cursor-pointer hover:ring-2 hover:ring-[neutral-500]/20",
    },
    professional: {
      gridBorder: "border-[neutral-200]",
      selected: "border-[neutral-500] ring-2 ring-[neutral-500]/20",
      today: "font-bold text-[neutral-500]",
      selectable: "cursor-pointer hover:border-[neutral-500]",
    },
    customer: {
      gridBorder: "border-[neutral-200]",
      selected: "scale-105 ring-4 ring-[neutral-500] ring-offset-2",
      today: "border-[neutral-500]",
      selectable: "hover:-tranneutral-y-1 cursor-pointer hover:scale-105 hover:shadow-lg",
    },
  };

  return configs[theme];
}

/**
 * Size configuration
 */
function getSizeConfig(size: CalendarSize) {
  const configs = {
    compact: {
      headerText: "text-base",
      text: "text-sm",
      smallText: "text-xs",
      button: "px-3 py-1 text-xs",
      navButton: "px-2 py-1 text-sm",
      icon: "h-4 w-4",
      buttonGap: "gap-2",
      headerPadding: "px-2 py-2",
      loadingPadding: "p-6",
      dayCell: "min-h-[50px] p-2",
      dayNumber: "text-sm",
      timeSlotButton: "px-2 py-1.5 text-sm",
    },
    medium: {
      headerText: "text-lg",
      text: "text-sm",
      smallText: "text-xs",
      button: "px-3 py-1 text-xs",
      navButton: "px-2 py-1 text-sm",
      icon: "h-4 w-4",
      buttonGap: "gap-2",
      headerPadding: "px-2 py-2",
      loadingPadding: "p-8",
      dayCell: "min-h-[60px] p-2",
      dayNumber: "text-sm",
      timeSlotButton: "px-3 py-2 text-sm",
    },
    large: {
      headerText: "text-4xl",
      text: "text-base",
      smallText: "text-sm",
      button: "px-5 py-2.5 text-base",
      navButton: "p-2.5 text-base",
      icon: "h-6 w-6",
      buttonGap: "gap-3",
      headerPadding: "pb-4",
      loadingPadding: "p-16",
      dayCell: "min-h-[120px] p-4",
      dayNumber: "text-2xl",
      timeSlotButton: "px-4 py-2.5 text-base",
    },
  };

  return configs[size];
}

/**
 * Status color configuration
 */
function getStatusColors(status: DayAvailability["status"] | undefined) {
  const colors = {
    available: {
      bg: "bg-[neutral-500]/10 border-[neutral-500]/40",
      text: "text-[neutral-500]",
    },
    limited: {
      bg: "bg-[neutral-500]/5 border-[neutral-500]/30",
      text: "text-[neutral-500]",
    },
    booked: {
      bg: "bg-[neutral-500]/10 border-[neutral-500]/30",
      text: "text-[neutral-500]",
    },
    blocked: {
      bg: "bg-[neutral-200]/30 border-[neutral-200]",
      text: "text-[neutral-400]",
    },
  };

  return status ? colors[status] : { bg: "bg-[neutral-50]", text: "text-[neutral-900]" };
}

/**
 * Get day headers based on size
 */
function getDayHeaders(size: CalendarSize): string[] {
  if (size === "large") {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  }
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

/**
 * Helper functions
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
