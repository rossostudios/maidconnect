"use client";

import { Calendar03Icon, Menu01Icon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import {
  CustomerBookingCalendar,
  type CustomerCalendarBooking,
} from "@/components/bookings/customer-booking-calendar";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { type Trip, TripsItinerary } from "@/components/trips";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  created_at: string;
  professional: { full_name: string | null; profile_id: string } | null;
};

type Props = {
  bookings: Booking[];
};

/**
 * Customer Bookings View with List/Calendar Toggle
 *
 * Provides a tabbed interface to switch between list and calendar views
 * of customer bookings.
 */
export function CustomerBookingsView({ bookings }: Props) {
  const t = useTranslations("dashboard.customer.bookingsPage");
  const [view, setView] = useState<"trips" | "list" | "calendar">("trips");

  // Transform bookings for calendar component
  const calendarBookings: CustomerCalendarBooking[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduled_start: booking.scheduled_start,
    duration_minutes: booking.duration_minutes,
    amount_authorized: booking.amount_authorized,
    amount_captured: booking.amount_captured,
    currency: booking.currency,
    professional_name: booking.professional?.full_name ?? undefined,
    service_type: booking.service_name ?? undefined,
  }));

  // Transform bookings for trips itinerary
  const trips: Trip[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduled_start: booking.scheduled_start,
    duration_minutes: booking.duration_minutes,
    service_name: booking.service_name,
    amount_authorized: booking.amount_authorized,
    amount_captured: booking.amount_captured,
    currency: booking.currency,
    created_at: booking.created_at,
    professional: booking.professional,
  }));

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition",
              view === "trips"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
              geistSans.className
            )}
            onClick={() => setView("trips")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Rocket01Icon} />
            Trips
          </button>
          <button
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition",
              view === "list"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
              geistSans.className
            )}
            onClick={() => setView("list")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Menu01Icon} />
            {t("viewToggle.list")}
          </button>
          <button
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition",
              view === "calendar"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
              geistSans.className
            )}
            onClick={() => setView("calendar")}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
            {t("viewToggle.calendar")}
          </button>
        </div>
      </div>

      {/* Content based on view */}
      {view === "trips" ? (
        <TripsItinerary trips={trips} />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          {view === "list" ? (
            <div className="p-8">
              <CustomerBookingList bookings={bookings} />
            </div>
          ) : (
            <CustomerBookingCalendar bookings={calendarBookings} />
          )}
        </div>
      )}
    </div>
  );
}
