"use client";

import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type Currency, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Pro Booking Calendar
 *
 * Drag-and-drop calendar for professionals to manage their bookings.
 * Uses FullCalendar.js with Lia Design System styling.
 *
 * Features:
 * - View bookings in day/week/month view
 * - Drag bookings to reschedule
 * - Resize bookings to change duration
 * - Click to view booking details
 * - Working hours displayed as background
 */

type BookingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  customer_name: string;
  service_name: string;
  amount: number;
  currency: Currency;
  address: string;
};

type WorkingHours = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type ProBookingCalendarProps = {
  initialBookings?: BookingEvent[];
  workingHours?: WorkingHours[];
  blockedDates?: string[];
  onBookingMove?: (bookingId: string, newStart: Date, newEnd: Date) => Promise<boolean>;
  onBookingClick?: (booking: BookingEvent) => void;
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700" },
  confirmed: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" },
  in_progress: { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
  completed: { bg: "bg-neutral-100", border: "border-neutral-400", text: "text-neutral-600" },
  cancelled: { bg: "bg-red-100", border: "border-red-400", text: "text-red-500" },
};

const VIEW_OPTIONS = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
];

export function ProBookingCalendar({
  initialBookings = [],
  workingHours = [],
  blockedDates = [],
  onBookingMove,
  onBookingClick,
}: ProBookingCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [bookings, setBookings] = useState<BookingEvent[]>(initialBookings);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);

  // Convert bookings to FullCalendar events
  const calendarEvents = bookings.map((booking) => {
    const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
    return {
      id: booking.id,
      title: `${booking.customer_name} - ${booking.service_name}`,
      start: booking.start,
      end: booking.end,
      extendedProps: booking,
      classNames: [colors.bg, colors.border, colors.text, "rounded-lg", "border-2"],
      editable: booking.status === "pending" || booking.status === "confirmed",
    };
  });

  // Convert blocked dates to background events
  const blockedEvents = blockedDates.map((date) => ({
    start: date,
    end: date,
    display: "background",
    classNames: ["bg-red-100"],
  }));

  // Convert working hours to business hours format
  const businessHours = workingHours
    .filter((wh) => wh.enabled)
    .map((wh) => {
      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      return {
        daysOfWeek: [dayMap[wh.day] ?? 1],
        startTime: wh.start,
        endTime: wh.end,
      };
    });

  // Handle event drop (drag)
  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      const { event, revert } = info;
      const booking = event.extendedProps as BookingEvent;

      if (!onBookingMove) {
        revert();
        return;
      }

      const newStart = event.start!;
      const newEnd = event.end!;

      setIsLoading(true);
      try {
        const success = await onBookingMove(booking.id, newStart, newEnd);
        if (success) {
          toast.success("Booking rescheduled successfully");
          // Update local state
          setBookings((prev) =>
            prev.map((b) =>
              b.id === booking.id
                ? { ...b, start: newStart.toISOString(), end: newEnd.toISOString() }
                : b
            )
          );
        } else {
          revert();
          toast.error("Failed to reschedule booking");
        }
      } catch {
        revert();
        toast.error("Failed to reschedule booking");
      } finally {
        setIsLoading(false);
      }
    },
    [onBookingMove]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    async (info: EventResizeDoneArg) => {
      const { event, revert } = info;
      const booking = event.extendedProps as BookingEvent;

      if (!onBookingMove) {
        revert();
        return;
      }

      const newStart = event.start!;
      const newEnd = event.end!;

      setIsLoading(true);
      try {
        const success = await onBookingMove(booking.id, newStart, newEnd);
        if (success) {
          toast.success("Booking duration updated");
          setBookings((prev) =>
            prev.map((b) =>
              b.id === booking.id
                ? { ...b, start: newStart.toISOString(), end: newEnd.toISOString() }
                : b
            )
          );
        } else {
          revert();
          toast.error("Failed to update booking duration");
        }
      } catch {
        revert();
        toast.error("Failed to update booking duration");
      } finally {
        setIsLoading(false);
      }
    },
    [onBookingMove]
  );

  // Handle event click
  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const booking = info.event.extendedProps as BookingEvent;
      setSelectedBooking(booking);
      onBookingClick?.(booking);
    },
    [onBookingClick]
  );

  // Handle date select (for creating new bookings)
  const handleDateSelect = useCallback((info: DateSelectArg) => {
    // Could be used for creating new bookings in the future
    console.log("Selected:", info.startStr, info.endStr);
    info.view.calendar.unselect();
  }, []);

  // Calendar navigation
  const goToToday = () => calendarRef.current?.getApi().today();
  const goToPrev = () => calendarRef.current?.getApi().prev();
  const goToNext = () => calendarRef.current?.getApi().next();
  const changeView = (view: string) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  // Refresh bookings from server
  const refreshBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pro/bookings/calendar");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        toast.success("Calendar refreshed");
      }
    } catch {
      toast.error("Failed to refresh calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current title from calendar
  const [title, setTitle] = useState("");
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      setTitle(api.view.title);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-2 text-neutral-500 transition hover:border-orange-500 hover:text-neutral-900"
            onClick={goToPrev}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
          </button>
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-sm transition hover:border-orange-500 hover:bg-orange-50"
            onClick={goToToday}
            type="button"
          >
            Today
          </button>
          <button
            className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-2 text-neutral-500 transition hover:border-orange-500 hover:text-neutral-900"
            onClick={goToNext}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </button>
          <h2 className="ml-4 min-w-[200px] font-semibold text-lg text-neutral-900">{title}</h2>
        </div>

        {/* View Options & Actions */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border-2 border-neutral-200 bg-neutral-50">
            {VIEW_OPTIONS.map((view) => (
              <button
                className={cn(
                  "px-4 py-2 font-semibold text-sm transition",
                  currentView === view.key
                    ? "bg-orange-500 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                key={view.key}
                onClick={() => changeView(view.key)}
                type="button"
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            className="flex items-center gap-2 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-700 text-sm transition hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50"
            disabled={isLoading}
            onClick={refreshBookings}
            type="button"
          >
            <HugeiconsIcon
              className={cn("h-4 w-4", isLoading && "animate-spin")}
              icon={RefreshIcon}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <span className="font-semibold text-neutral-900 text-sm">Status:</span>
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div className="flex items-center gap-2" key={status}>
            <span className={cn("h-3 w-3 rounded-full border-2", colors.bg, colors.border)} />
            <span className="text-neutral-700 text-sm capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <FullCalendar
          allDaySlot={false}
          businessHours={businessHours}
          datesSet={(info) => setTitle(info.view.title)}
          dayMaxEvents={true}
          editable={true}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div className="overflow-hidden p-1">
              <div className="truncate font-semibold text-xs">{eventInfo.event.title}</div>
              <div className="truncate text-xs opacity-75">{eventInfo.timeText}</div>
            </div>
          )}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          events={[...calendarEvents, ...blockedEvents]}
          expandRows={true}
          headerToolbar={false}
          height="auto"
          initialView={currentView}
          nowIndicator={true}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          ref={calendarRef}
          select={handleDateSelect}
          selectable={true}
          selectMirror={true}
          slotDuration="00:30:00"
          slotMaxTime="22:00:00"
          slotMinTime="06:00:00"
          snapDuration="00:15:00"
          stickyHeaderDates={true}
          weekends={true}
        />
      </div>

      {/* Selected Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80">
          <div className="mx-4 w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-bold text-lg text-neutral-900">Booking Details</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <HugeiconsIcon className="h-5 w-5 text-orange-600" icon={Calendar01Icon} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{selectedBooking.customer_name}</p>
                  <p className="text-neutral-500 text-sm">{selectedBooking.service_name}</p>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg bg-neutral-50 p-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500 text-sm">Date</span>
                  <span className="font-medium text-neutral-900 text-sm">
                    {new Date(selectedBooking.start).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 text-sm">Time</span>
                  <span className="font-medium text-neutral-900 text-sm">
                    {new Date(selectedBooking.start).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(selectedBooking.end).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 text-sm">Amount</span>
                  <span className="font-semibold text-green-600 text-sm">
                    {formatCurrency(selectedBooking.amount, { currency: selectedBooking.currency })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 text-sm">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold text-xs capitalize",
                      STATUS_COLORS[selectedBooking.status]?.bg,
                      STATUS_COLORS[selectedBooking.status]?.text
                    )}
                  >
                    {selectedBooking.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <HugeiconsIcon
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500"
                  icon={Clock01Icon}
                />
                <p className="text-neutral-700">{selectedBooking.address}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 transition hover:border-neutral-300"
                onClick={() => setSelectedBooking(null)}
                type="button"
              >
                Close
              </button>
              <a
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-orange-600"
                href={`/dashboard/pro/bookings/${selectedBooking.id}`}
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h4 className="font-semibold text-neutral-900 text-sm">How to use:</h4>
        <ul className="mt-2 space-y-1 text-neutral-500 text-sm">
          <li>• Drag bookings to reschedule them (pending/confirmed only)</li>
          <li>• Drag the bottom edge of a booking to change duration</li>
          <li>• Click on a booking to view details</li>
          <li>• Use the view buttons to switch between month, week, and day views</li>
        </ul>
      </div>
    </div>
  );
}
