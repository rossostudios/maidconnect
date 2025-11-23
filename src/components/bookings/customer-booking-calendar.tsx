"use client";

import { Calendar03Icon, Clock01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import type { DayAvailability } from "@/hooks/use-availability-data";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Booking data structure for the customer dashboard calendar
 */
export type CustomerCalendarBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  professional_name?: string;
  service_type?: string;
};

/**
 * Props for the customer booking calendar
 */
type Props = {
  bookings: CustomerCalendarBooking[];
};

/**
 * Customer Booking Calendar
 *
 * Calendar view for customers to see their upcoming and past bookings.
 * Uses the unified availability calendar component with a custom sidebar
 * showing booking details for the selected date.
 */
export function CustomerBookingCalendar({ bookings }: Props) {
  const t = useTranslations("dashboard.customer.bookingCalendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Calculate bookings by date using useMemo
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CustomerCalendarBooking[]>();
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
        availableSlots: [],
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

  // Status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending_payment":
      case "authorized":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending_payment":
        return t("status.pendingPayment");
      case "authorized":
        return t("status.confirmed");
      case "completed":
        return t("status.completed");
      case "canceled":
        return t("status.canceled");
      case "in_progress":
        return t("status.inProgress");
      default:
        return status.replace(/_/g, " ");
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        {/* Calendar Grid */}
        <div className="border-neutral-200 bg-white p-6 lg:border-r">
          <AvailabilityCalendar
            dataSource={{
              type: "props",
              availability,
              getDateAvailability,
            }}
            locale="en-US"
            onDateSelect={setSelectedDate}
            renderDayContent={(calendarDate, _dayAvailability) => (
              <CustomDayContent
                bookingsCount={bookingsByDate.get(formatDateKey(calendarDate))?.length ?? 0}
                date={calendarDate}
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
        <div className="flex flex-col bg-neutral-50">
          <div className="border-neutral-200 border-b bg-white px-6 py-4">
            <h4 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
              {t("details")}
            </h4>
            {selectedDate && (
              <p className={cn("mt-1 font-normal text-neutral-500 text-xs", geistSans.className)}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-100 bg-orange-50">
                  <HugeiconsIcon className="h-7 w-7 text-orange-500" icon={Calendar03Icon} />
                </div>
                <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                  {t("noBookings")}
                </p>
                <p className="mt-1 text-neutral-500 text-xs">{t("selectDate")}</p>
              </div>
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
                      <li
                        className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
                        key={booking.id}
                      >
                        <Link
                          className="block p-4"
                          href={`/dashboard/customer/bookings/${booking.id}`}
                        >
                          {/* Time and Status */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-4 w-4 text-neutral-400"
                                icon={Clock01Icon}
                              />
                              <span
                                className={cn(
                                  "font-semibold text-neutral-900 text-sm",
                                  geistSans.className
                                )}
                              >
                                {timeLabel}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 font-medium text-xs",
                                getStatusStyle(booking.status)
                              )}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          {/* Professional Name */}
                          {booking.professional_name && (
                            <div className="mt-2 flex items-center gap-2">
                              <HugeiconsIcon
                                className="h-3.5 w-3.5 text-neutral-400"
                                icon={UserIcon}
                              />
                              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                                {booking.professional_name}
                              </span>
                            </div>
                          )}

                          {/* Service Type */}
                          {booking.service_type && (
                            <p className="mt-1 text-neutral-500 text-xs">{booking.service_type}</p>
                          )}

                          {/* Amount */}
                          {amount && (
                            <div className="mt-3 border-neutral-100 border-t pt-3">
                              <span
                                className={cn(
                                  "font-semibold text-neutral-900 text-sm",
                                  geistSans.className
                                )}
                              >
                                {formatCurrency(amount, booking.currency)}
                              </span>
                            </div>
                          )}
                        </Link>
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
function CustomDayContent({ date, bookingsCount }: { date: Date; bookingsCount: number }) {
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="flex h-full min-h-[50px] flex-col items-center justify-center gap-1.5">
      <span
        className={cn(
          "font-semibold text-sm",
          isToday ? "text-orange-600" : "text-neutral-900",
          geistSans.className
        )}
      >
        {date.getDate()}
      </span>
      {bookingsCount > 0 && (
        <span
          className={cn(
            "rounded-full border border-orange-500 bg-orange-50 px-2 py-0.5 font-semibold text-orange-600 text-xs",
            geistSans.className
          )}
        >
          {bookingsCount}
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

function formatCurrency(value: number | null | undefined, currency?: string | null): string | null {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
