"use client";

import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import type { DayAvailability } from "@/hooks/use-availability-data";
import { cn } from "@/lib/utils";

/**
 * Booking data structure for the professional dashboard
 */
export type CalendarBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
};

/**
 * Props for the professional booking calendar
 */
type Props = {
  bookings: CalendarBooking[];
};

/**
 * Professional Booking Calendar (V2 - Unified)
 *
 * This component replaces the original pro-booking-calendar.tsx with a cleaner
 * implementation that uses the unified calendar component for rendering and
 * provides a custom sidebar for booking details.
 *
 * Key features:
 * - Uses unified calendar component for grid rendering
 * - Props-based data source (bookings provided as props)
 * - Custom sidebar showing booking details for selected date
 * - Maintains original styling and user experience
 * - Supports internationalization
 *
 * Migration: Replace imports of `ProBookingCalendar` from
 * `@/components/bookings/pro-booking-calendar` with this component.
 *
 * @example
 * ```tsx
 * // Before:
 * import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
 *
 * // After:
 * import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar-v2";
 * ```
 */
export function ProBookingCalendar({ bookings }: Props) {
  const t = useTranslations("dashboard.pro.bookingCalendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Calculate bookings by date using useMemo
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const booking of bookings) {
      if (!booking.scheduled_start) {
        continue;
      }
      const date = new Date(booking.scheduled_start);
      const key = formatDateKey(date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(booking);
    }
    return map;
  }, [bookings]);

  // Convert bookings to availability data for the calendar
  const availability = useMemo(() => {
    const availabilityArray: DayAvailability[] = [];
    bookingsByDate.forEach((dayBookings, dateKey) => {
      availabilityArray.push({
        date: dateKey,
        status: "booked",
        availableSlots: [], // No time slots for booking calendar
        bookingCount: dayBookings.length,
        maxBookings: dayBookings.length,
      });
    });
    return availabilityArray;
  }, [bookingsByDate]);

  // Get availability for a specific date
  const getDateAvailability = (date: Date): DayAvailability | null => {
    const key = formatDateKey(date);
    const dayBookings = bookingsByDate.get(key);
    if (!dayBookings || dayBookings.length === 0) {
      return null;
    }
    return {
      date: key,
      status: "booked",
      availableSlots: [],
      bookingCount: dayBookings.length,
      maxBookings: dayBookings.length,
    };
  };

  // Get bookings for selected date
  const selectedBookings = selectedDate
    ? (bookingsByDate.get(formatDateKey(selectedDate)) ?? [])
    : [];

  // Status label translation
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending_payment":
        return t("status.pendingPayment");
      case "authorized":
        return t("status.authorized");
      case "completed":
        return t("status.completed");
      case "canceled":
        return t("status.canceled");
      default:
        return status.replace(/_/g, " ");
    }
  };

  return (
    <div className="border border-neutral-200 bg-white p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        {/* Calendar Grid */}
        <div>
          <AvailabilityCalendar
            dataSource={{
              type: "props",
              availability,
              getDateAvailability,
            }}
            locale="en-US"
            onDateSelect={setSelectedDate}
            renderDayContent={(calendarDate, dayAvailability) => (
              <CustomDayContent
                availability={dayAvailability}
                bookingsCount={bookingsByDate.get(formatDateKey(calendarDate))?.length ?? 0}
                date={calendarDate}
                t={t}
              />
            )}
            selectedDate={selectedDate}
            showLegend={false}
            showTimeSlots={false}
            showTodayButton={true}
            size="compact"
            theme="professional"
          />
        </div>

        {/* Booking Details Sidebar */}
        <div className="border border-neutral-200 bg-white">
          <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
            <h4
              className={cn(
                "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                geistSans.className
              )}
            >
              {t("details")}
            </h4>
            {selectedDate && (
              <p
                className={cn(
                  "mt-1 font-normal text-neutral-700 text-xs tracking-tighter",
                  geistSans.className
                )}
              >
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="p-6">
            {selectedBookings.length === 0 ? (
              <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
                {t("noBookings")}
              </p>
            ) : (
              <ul className="space-y-3">
                {selectedBookings
                  .slice()
                  .sort((a, b) => {
                    const dateA = a.scheduled_start ? new Date(a.scheduled_start).getTime() : 0;
                    const dateB = b.scheduled_start ? new Date(b.scheduled_start).getTime() : 0;
                    return dateA - dateB;
                  })
                  .map((booking) => {
                    const start = booking.scheduled_start
                      ? new Date(booking.scheduled_start)
                      : null;
                    const timeLabel = start ? formatTime(start) : t("timeTbd");
                    const statusLabel = getStatusLabel(booking.status);
                    const amount = booking.amount_captured ?? booking.amount_authorized ?? null;
                    return (
                      <li className="border border-neutral-200 bg-white p-3" key={booking.id}>
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-semibold text-neutral-900 text-sm tracking-tighter",
                              geistSans.className
                            )}
                          >
                            {timeLabel}
                          </span>
                          {amount ? (
                            <span
                              className={cn(
                                "font-semibold text-neutral-700 text-xs tracking-tighter",
                                geistSans.className
                              )}
                            >
                              {formatCOP(amount)}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <HugeiconsIcon
                            className="h-3.5 w-3.5 text-neutral-500"
                            icon={Clock01Icon}
                          />
                          <span
                            className={cn(
                              "text-neutral-700 text-xs tracking-tighter",
                              geistSans.className
                            )}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom day cell content showing booking count
 */
function CustomDayContent({
  date,
  availability: _availability,
  bookingsCount,
  t,
}: {
  date: Date;
  availability: DayAvailability | null;
  bookingsCount: number;
  t: (key: string) => string;
}) {
  return (
    <div className="flex h-full min-h-[50px] flex-col items-center justify-center">
      <span className={cn("font-semibold text-sm", geistSans.className)}>{date.getDate()}</span>
      {bookingsCount > 0 && (
        <span
          className={cn(
            "mt-1 border border-[#FF5200] bg-orange-50 px-2 py-0.5 font-semibold text-[#FF5200] text-xs",
            geistSans.className
          )}
        >
          {bookingsCount} {bookingsCount === 1 ? t("booking") : t("bookings")}
        </span>
      )}
    </div>
  );
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

function formatCOP(value: number | null | undefined): string | null {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
