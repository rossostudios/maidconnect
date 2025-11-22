"use client";

import { Calendar01Icon, GridViewIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { ProBookingCalendar as SimpleCalendar } from "@/components/bookings/pro-booking-calendar";
import { ProBookingList } from "@/components/bookings/pro-booking-list";
import { ProBookingCalendar as AdvancedCalendar } from "@/components/calendar/pro-booking-calendar";
import type { Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

type SimpleBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
};

type AdvancedBooking = {
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

type FullBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_estimated: number | null;
  amount_captured: number | null;
  amount_final: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  currency: string | null;
  created_at: string | null;
  service_name: string | null;
  service_hourly_rate: number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  time_extension_minutes: number | null;
  address: string | null;
  customer: { id: string; full_name: string | null } | null;
};

type ViewType = "simple" | "advanced" | "list";

type Props = {
  bookings: FullBooking[];
  simpleCalendarBookings: SimpleBooking[];
  advancedCalendarBookings: AdvancedBooking[];
};

const VIEW_OPTIONS: { key: ViewType; label: string; icon: typeof Calendar01Icon }[] = [
  { key: "simple", label: "Simple", icon: Calendar01Icon },
  { key: "advanced", label: "Advanced", icon: GridViewIcon },
  { key: "list", label: "List", icon: Menu01Icon },
];

export function ProBookingsClient({
  bookings,
  simpleCalendarBookings,
  advancedCalendarBookings,
}: Props) {
  const t = useTranslations("dashboard.pro.bookings");
  const [activeView, setActiveView] = useState<ViewType>("advanced");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Handle booking reschedule from drag-drop
  const handleBookingMove = useCallback(
    async (bookingId: string, newStart: Date, newEnd: Date): Promise<boolean> => {
      setIsRescheduling(true);
      try {
        const response = await fetch("/api/pro/bookings/reschedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            newStart: newStart.toISOString(),
            newEnd: newEnd.toISOString(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.message || "Failed to reschedule booking");
          return false;
        }

        toast.success("Booking rescheduled successfully");
        return true;
      } catch {
        toast.error("Failed to reschedule booking");
        return false;
      } finally {
        setIsRescheduling(false);
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border-2 border-neutral-200 bg-neutral-50 p-1">
          {VIEW_OPTIONS.map((view) => (
            <button
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-sm transition-all",
                activeView === view.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
              key={view.key}
              onClick={() => setActiveView(view.key)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={view.icon} />
              {view.label}
            </button>
          ))}
        </div>

        {isRescheduling && (
          <span className="animate-pulse text-neutral-500 text-sm">Rescheduling...</span>
        )}
      </div>

      {/* Simple Calendar View */}
      {activeView === "simple" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <SimpleCalendar bookings={simpleCalendarBookings} />
        </div>
      )}

      {/* Advanced Calendar View (FullCalendar with drag-drop) */}
      {activeView === "advanced" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <AdvancedCalendar
            initialBookings={advancedCalendarBookings}
            onBookingMove={handleBookingMove}
          />
        </div>
      )}

      {/* List View */}
      {activeView === "list" && (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
            <h2
              className={cn(
                "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                geistSans.className
              )}
            >
              {t("allBookings")}
            </h2>
          </div>
          <div className="p-6">
            <ProBookingList bookings={bookings} />
          </div>
        </div>
      )}

      {/* Help Text */}
      {activeView === "advanced" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-900 text-sm">
            💡 Tip: Use the Advanced calendar to drag and drop bookings to reschedule them. Only
            pending and confirmed bookings can be rescheduled.
          </p>
        </div>
      )}
    </div>
  );
}
