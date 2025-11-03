"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProfessionalBookingSummary } from "@/components/professionals/types";
import type { AvailabilitySlot } from "@/lib/professionals/transformers";
import { cn } from "@/lib/utils";

type Props = {
  availability: AvailabilitySlot[];
  bookings: ProfessionalBookingSummary[];
};

type CalendarDay = {
  date: Date;
  label: number;
  key: string;
  inCurrentMonth: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  authorized: "Authorized hold",
  confirmed: "Confirmed visit",
  completed: "Completed",
  cancelled: "Canceled",
  canceled: "Canceled",
};

function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function toStartOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildCalendarMatrix(reference: Date): CalendarDay[] {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekDay = firstOfMonth.getUTCDay();

  const days: CalendarDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - startWeekDay;
    const current = new Date(Date.UTC(year, month, 1));
    current.setUTCDate(current.getUTCDate() + dayOffset);
    days.push({
      date: current,
      label: current.getUTCDate(),
      key: formatDateKey(current),
      inCurrentMonth: current.getUTCMonth() === month,
    });
  }

  return days;
}

function formatCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeWeekdayLabel(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();
}

function normalizeSlotWeekday(slot: AvailabilitySlot) {
  return slot.day ? slot.day.toLowerCase() : null;
}

export function ProfessionalAvailabilityCalendar({ availability, bookings }: Props) {
  const initialDate = toStartOfDayUTC(new Date());
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDayKey, setSelectedDayKey] = useState(formatDateKey(initialDate));

  const availabilityByDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    availability.forEach((slot) => {
      const dayKey = normalizeSlotWeekday(slot);
      if (!dayKey) {
        return;
      }
      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)?.push(slot);
    });
    return map;
  }, [availability]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, ProfessionalBookingSummary[]>();
    bookings.forEach((booking) => {
      if (!booking.scheduledStart) {
        return;
      }
      const date = new Date(booking.scheduledStart);
      const key = formatDateKey(toStartOfDayUTC(date));
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(booking);
    });
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => buildCalendarMatrix(currentMonth), [currentMonth]);
  const selectedBookings = bookingsByDay.get(selectedDayKey) ?? [];
  const selectedDate = new Date(selectedDayKey);
  const selectedAvailability = availabilityByDay.get(normalizeWeekdayLabel(selectedDate)) ?? [];

  const monthLabel = currentMonth.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    setCurrentMonth((prev) => {
      const updated = new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 1));
      return updated;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[#7a6d62] text-sm">Browse upcoming availability and see booked dates</p>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full border border-[#ebe5d8] p-2 text-[#5d574b] text-sm transition hover:border-[#8B7355] hover:text-[#8B7355]"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-semibold text-[#211f1a] text-sm capitalize">{monthLabel}</p>
          <button
            className="inline-flex items-center justify-center rounded-full border border-[#ebe5d8] p-2 text-[#5d574b] text-sm transition hover:border-[#8B7355] hover:text-[#8B7355]"
            onClick={() => changeMonth(1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <div
              className="text-center font-semibold text-[#a49c90] text-xs uppercase tracking-wide"
              key={label}
            >
              {label}
            </div>
          ))}
          {calendarDays.map((day) => {
            const hasBookings = bookingsByDay.has(day.key);
            const bookingsCount = bookingsByDay.get(day.key)?.length ?? 0;
            const isSelected = selectedDayKey === day.key;
            const weekdayAvailability = availabilityByDay.get(normalizeWeekdayLabel(day.date));
            const hasAvailability = Boolean(weekdayAvailability && weekdayAvailability.length > 0);

            return (
              <button
                className={cn(
                  "flex h-20 flex-col items-center justify-center rounded-lg border text-sm transition",
                  day.inCurrentMonth
                    ? "border-[#efe7dc] bg-white"
                    : "border-transparent bg-[#fbfafa] text-[#c4bbaf]",
                  hasAvailability ? "ring-1 ring-[#8B7355]/30 ring-inset" : "",
                  hasBookings ? "shadow-[0_6px_14px_rgba(18,17,15,0.08)]" : "",
                  isSelected ? "border-[#8B7355] ring-2 ring-[#8B735533]" : ""
                )}
                key={day.key}
                onClick={() => setSelectedDayKey(day.key)}
                type="button"
              >
                <span className="font-semibold text-sm">{day.label}</span>
                {hasAvailability ? (
                  <span className="mt-1 rounded-full bg-[#8B7355]/12 px-2 py-0.5 font-semibold text-[#8a3934] text-xs">
                    Open
                  </span>
                ) : null}
                {hasBookings ? (
                  <span className="mt-1 font-medium text-[#7a6d62] text-[11px]">
                    {bookingsCount} {bookingsCount === 1 ? "booking" : "bookings"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-[#efe7dc] bg-[#fbfafa] p-4 text-[#5d574b] text-sm">
          <h4 className="font-semibold text-[#211f1a] text-sm">Day details</h4>
          <p className="mt-1 text-[#7a6d62] text-xs">
            {selectedDate.toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          {selectedAvailability.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-[#a49c90] text-xs uppercase tracking-[0.18em]">
                Available windows
              </p>
              <ul className="space-y-1 text-[#211f1a] text-sm">
                {selectedAvailability.map((slot, index) => (
                  <li
                    className="flex items-center gap-2"
                    key={`${slot.day}-${slot.start}-${slot.end}-${index}`}
                  >
                    <Clock aria-hidden="true" className="h-3.5 w-3.5 text-[#8B7355]" />
                    <span>
                      {slot.start ?? "--"} – {slot.end ?? "--"}
                    </span>
                    {slot.notes ? (
                      <span className="text-[#7a6d62] text-xs">· {slot.notes}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-[#7a6d62] text-sm">
              No published availability. Request a booking and we&apos;ll coordinate directly with
              the professional.
            </p>
          )}

          <div className="mt-4">
            <p className="font-semibold text-[#a49c90] text-xs uppercase tracking-[0.18em]">
              Bookings
            </p>
            {selectedBookings.length === 0 ? (
              <p className="mt-2 text-[#7a6d62] text-sm">No bookings scheduled for this day.</p>
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
                        className="rounded-2xl border border-[#efe7dc] bg-white px-3 py-2 text-[#5d574b] text-sm"
                        key={booking.id}
                      >
                        <p className="font-semibold text-[#211f1a]">
                          {startDate ? formatTime(startDate) : "Scheduled"} ·{" "}
                          {booking.serviceName ?? "Service"}
                        </p>
                        <p className="text-[#7a6d62] text-xs">{label}</p>
                        {formatCOP(
                          booking.amountEstimated ??
                            booking.amountAuthorized ??
                            booking.amountCaptured
                        ) ? (
                          <p className="text-[#7a6d62] text-xs">
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
