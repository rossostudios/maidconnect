"use client";

import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import type { ProfessionalBookingSummary } from "@/components/professionals/types";
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import type { DayAvailability } from "@/hooks/use-availability-data";
import type { AvailabilitySlot } from "@/lib/professionals/transformers";

/**
 * Props for the professional availability calendar
 */
type Props = {
  availability: AvailabilitySlot[];
  bookings: ProfessionalBookingSummary[];
};

/**
 * Status labels for bookings
 */
const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  authorized: "Authorized hold",
  confirmed: "Confirmed visit",
  completed: "Completed",
  cancelled: "Canceled",
  canceled: "Canceled",
};

/**
 * Professional Availability Calendar (V2 - Unified)
 *
 * This component replaces the original professional-availability-calendar.tsx
 * with a cleaner implementation that uses the unified calendar component.
 *
 * Key features:
 * - Uses unified calendar component for grid rendering
 * - Props-based data source (availability and bookings provided as props)
 * - Custom sidebar showing availability windows and bookings
 * - Maintains original styling and user experience
 * - Shows recurring availability patterns by weekday
 *
 * Migration: Replace imports of `ProfessionalAvailabilityCalendar` from
 * `@/components/professionals/professional-availability-calendar` with this component.
 *
 * @example
 * ```tsx
 * // Before:
 * import { ProfessionalAvailabilityCalendar } from "@/components/professionals/professional-availability-calendar";
 *
 * // After:
 * import { ProfessionalAvailabilityCalendar } from "@/components/professionals/professional-availability-calendar-v2";
 * ```
 */
export function ProfessionalAvailabilityCalendar({ availability, bookings }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Map availability by weekday
  const availabilityByWeekday = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of availability) {
      const dayKey = normalizeSlotWeekday(slot);
      if (!dayKey) {
        continue;
      }
      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)?.push(slot);
    }
    return map;
  }, [availability]);

  // Map bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, ProfessionalBookingSummary[]>();
    for (const booking of bookings) {
      if (!booking.scheduledStart) {
        continue;
      }
      const date = new Date(booking.scheduledStart);
      const key = formatDateKey(date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(booking);
    }
    return map;
  }, [bookings]);

  // Get availability for a specific date
  const getDateAvailability = (date: Date): DayAvailability | null => {
    const weekdayKey = normalizeWeekdayLabel(date);
    const weekdayAvailability = availabilityByWeekday.get(weekdayKey);
    const hasAvailability = Boolean(weekdayAvailability && weekdayAvailability.length > 0);

    const dateKey = formatDateKey(date);
    const dateBookings = bookingsByDate.get(dateKey);
    const hasBookings = Boolean(dateBookings && dateBookings.length > 0);

    // Determine status
    let status: DayAvailability["status"];
    if (!hasAvailability) {
      status = "blocked";
    } else if (hasBookings) {
      status = "limited"; // Has bookings but may still have availability
    } else {
      status = "available";
    }

    // Only return availability data if the date has availability or bookings
    if (!(hasAvailability || hasBookings)) {
      return null;
    }

    return {
      date: dateKey,
      status,
      availableSlots: [], // No specific time slots for this view
      bookingCount: dateBookings?.length ?? 0,
      maxBookings: 10, // Arbitrary max for display
    };
  };

  // Get availability and bookings for selected date
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedWeekday = selectedDate ? normalizeWeekdayLabel(selectedDate) : null;
  const selectedAvailability = selectedWeekday
    ? (availabilityByWeekday.get(selectedWeekday) ?? [])
    : [];
  const selectedBookings = selectedDateKey ? (bookingsByDate.get(selectedDateKey) ?? []) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[neutral-400] text-sm">
          Browse upcoming availability and see booked dates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        {/* Calendar Grid */}
        <div>
          <AvailabilityCalendar
            dataSource={{
              type: "props",
              availability: [], // Not used for this calendar
              getDateAvailability,
            }}
            locale="es-CO"
            onDateSelect={setSelectedDate}
            renderDayContent={(calendarDate, dayAvailability) => (
              <CustomDayContent
                availability={dayAvailability}
                bookingsCount={bookingsByDate.get(formatDateKey(calendarDate))?.length ?? 0}
                date={calendarDate}
                hasAvailability={Boolean(
                  availabilityByWeekday.get(normalizeWeekdayLabel(calendarDate))?.length
                )}
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

        {/* Details Sidebar */}
        <div className="rounded-lg border border-[neutral-200] bg-[neutral-50] p-4 text-[neutral-400] text-sm">
          <h4 className="font-semibold text-[neutral-900] text-sm">Day details</h4>
          {selectedDate && (
            <p className="mt-1 text-[neutral-400] text-xs">
              {selectedDate.toLocaleDateString("es-CO", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}

          {/* Available Windows */}
          {selectedAvailability.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-[neutral-400] text-xs uppercase tracking-[0.18em]">
                Available windows
              </p>
              <ul className="space-y-1 text-[neutral-900] text-sm">
                {selectedAvailability.map((slot, index) => (
                  <li
                    className="flex items-center gap-2"
                    key={`${slot.day}-${slot.start}-${slot.end}-${index}`}
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-[neutral-500]"
                      icon={Clock01Icon}
                    />
                    <span>
                      {slot.start ?? "--"} – {slot.end ?? "--"}
                    </span>
                    {slot.notes ? (
                      <span className="text-[neutral-400] text-xs">· {slot.notes}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-[neutral-400] text-sm">
              No published availability. Request a booking and we&apos;ll coordinate directly with
              the professional.
            </p>
          )}

          {/* Bookings */}
          <div className="mt-4">
            <p className="font-semibold text-[neutral-400] text-xs uppercase tracking-[0.18em]">
              Bookings
            </p>
            {selectedBookings.length === 0 ? (
              <p className="mt-2 text-[neutral-400] text-sm">No bookings scheduled for this day.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {selectedBookings
                  .slice()
                  .sort((a, b) => {
                    const timeA = a.scheduledStart ? new Date(a.scheduledStart).getTime() : 0;
                    const timeB = b.scheduledStart ? new Date(b.scheduledStart).getTime() : 0;
                    return timeA - timeB;
                  })
                  .map((booking) => {
                    const startDate = booking.scheduledStart
                      ? new Date(booking.scheduledStart)
                      : null;
                    const label =
                      booking.status in STATUS_LABELS
                        ? STATUS_LABELS[booking.status]
                        : (booking.status ?? "Booking");
                    return (
                      <li
                        className="rounded-2xl border border-[neutral-200] bg-[neutral-50] px-3 py-2 text-[neutral-400] text-sm"
                        key={booking.id}
                      >
                        <p className="font-semibold text-[neutral-900]">
                          {startDate ? formatTime(startDate) : "Scheduled"} ·{" "}
                          {booking.serviceName ?? "Service"}
                        </p>
                        <p className="text-[neutral-400] text-xs">{label}</p>
                        {formatCOP(
                          booking.amountEstimated ??
                            booking.amountAuthorized ??
                            booking.amountCaptured
                        ) ? (
                          <p className="text-[neutral-400] text-xs">
                            Hold{" "}
                            {formatCOP(
                              booking.amountEstimated ??
                                booking.amountAuthorized ??
                                booking.amountCaptured
                            )}
                          </p>
                        ) : null}
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
 * Custom day cell content showing availability and booking indicators
 */
function CustomDayContent({
  date,
  availability: _availability,
  hasAvailability,
  bookingsCount,
}: {
  date: Date;
  availability: DayAvailability | null;
  hasAvailability: boolean;
  bookingsCount: number;
}) {
  return (
    <div className="flex h-full min-h-[50px] flex-col items-center justify-center">
      <span className="font-semibold text-sm">{date.getDate()}</span>
      {hasAvailability && (
        <span className="mt-1 rounded-full bg-[neutral-500]/12 px-2 py-0.5 font-semibold text-[neutral-500] text-xs">
          Open
        </span>
      )}
      {bookingsCount > 0 && (
        <span className="mt-1 font-medium text-[11px] text-[neutral-400]">
          {bookingsCount} {bookingsCount === 1 ? "booking" : "bookings"}
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

function normalizeWeekdayLabel(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();
}

function normalizeSlotWeekday(slot: AvailabilitySlot): string | null {
  return slot.day ? slot.day.toLowerCase() : null;
}

function formatCOP(value: number | null | undefined): string | null {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
