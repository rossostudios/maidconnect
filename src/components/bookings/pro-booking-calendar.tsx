"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export type CalendarBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
};

type CalendarDay = {
  date: Date;
  label: number;
  key: string;
  inCurrentMonth: boolean;
};

type Props = {
  bookings: CalendarBooking[];
};

function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function toStartOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildCalendarMatrix(reference: Date): CalendarDay[] {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekDay = firstOfMonth.getUTCDay(); // 0 (Sun) - 6 (Sat)

  const days: CalendarDay[] = [];
  // Calendar grid of 6 weeks (42 days)
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
  if (!value || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProBookingCalendar({ bookings }: Props) {
  const t = useTranslations("dashboard.pro.bookingCalendar");
  const initialDate = toStartOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDayKey, setSelectedDayKey] = useState(formatDateKey(initialDate));

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

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    bookings.forEach((booking) => {
      if (!booking.scheduled_start) return;
      const date = new Date(booking.scheduled_start);
      const key = formatDateKey(toStartOfDay(date));
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(booking);
    });
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => buildCalendarMatrix(currentMonth), [currentMonth]);
  const selectedBookings = bookingsByDay.get(selectedDayKey) ?? [];

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
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
    <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="inline-flex items-center justify-center rounded-full border border-[#ebe5d8] p-2 text-sm text-[#5d574b] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-base font-semibold text-[#211f1a] capitalize">{monthLabel}</p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="inline-flex items-center justify-center rounded-full border border-[#ebe5d8] p-2 text-sm text-[#5d574b] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        <div className="grid grid-cols-7 gap-2">
          {[
            { key: "sun", label: t("days.sun") },
            { key: "mon", label: t("days.mon") },
            { key: "tue", label: t("days.tue") },
            { key: "wed", label: t("days.wed") },
            { key: "thu", label: t("days.thu") },
            { key: "fri", label: t("days.fri") },
            { key: "sat", label: t("days.sat") },
          ].map((day) => (
            <div key={day.key} className="text-center text-xs font-semibold uppercase tracking-wide text-[#a49c90]">
              {day.label}
            </div>
          ))}
          {calendarDays.map((day) => {
            const hasBookings = bookingsByDay.has(day.key);
            const bookingsCount = bookingsByDay.get(day.key)?.length ?? 0;
            const isSelected = selectedDayKey === day.key;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayKey(day.key)}
                className={cn(
                  "flex h-20 flex-col items-center justify-center rounded-lg border text-sm transition",
                  day.inCurrentMonth ? "border-[#efe7dc] bg-white" : "border-transparent bg-[#fbfafa] text-[#c4bbaf]",
                  hasBookings ? "shadow-[0_6px_14px_rgba(18,17,15,0.08)]" : "",
                  isSelected ? "border-[#ff5d46] ring-2 ring-[#ff5d4633]" : "",
                )}
              >
                <span className="text-sm font-semibold">{day.label}</span>
                {hasBookings ? (
                  <span className="mt-1 rounded-full bg-[#ff5d46]/15 px-2 py-0.5 text-xs font-semibold text-[#8a3934]">
                    {bookingsCount} {bookingsCount === 1 ? t("booking") : t("bookings")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-[#efe7dc] bg-[#fbfafa] p-4">
          <h4 className="text-sm font-semibold text-[#211f1a]">{t("details")}</h4>
          <p className="mt-1 text-xs text-[#7a6d62]">
            {new Date(selectedDayKey).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          {selectedBookings.length === 0 ? (
            <p className="mt-4 text-sm text-[#7a6d62]">{t("noBookings")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedBookings
                .slice()
                .sort((a, b) => {
                  const dateA = a.scheduled_start ? new Date(a.scheduled_start).getTime() : 0;
                  const dateB = b.scheduled_start ? new Date(b.scheduled_start).getTime() : 0;
                  return dateA - dateB;
                })
                .map((booking) => {
                  const start = booking.scheduled_start ? new Date(booking.scheduled_start) : null;
                  const timeLabel = start ? formatTime(start) : t("timeTbd");
                  const statusLabel = getStatusLabel(booking.status);
                  const amount =
                    booking.amount_captured ?? booking.amount_authorized ?? null;
                  return (
                    <li key={booking.id} className="rounded-md border border-[#efe7dc] bg-white p-3">
                      <div className="flex items-center justify-between text-sm text-[#211f1a]">
                        <span className="font-semibold">{timeLabel}</span>
                        {amount ? (
                          <span className="text-xs font-semibold text-[#5d574b]">{formatCOP(amount)}</span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#7a6d62]">
                        <Clock className="h-3.5 w-3.5 text-[#ff5d46]" />
                        <span>{statusLabel}</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
