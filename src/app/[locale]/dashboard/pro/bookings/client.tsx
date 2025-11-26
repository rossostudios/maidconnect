"use client";

import { Calendar01Icon, Clock01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { geistSans } from "@/app/fonts";
import { AvailabilitySheet } from "@/components/availability/availability-sheet";
import { ProBookingList } from "@/components/bookings/pro-booking-list";
import { AirbnbBookingCalendar } from "@/components/pro-calendar";
import type { Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  address?: string | Record<string, unknown> | null;
  customer?: { id: string; full_name: string | null } | null;
};

type ViewType = "calendar" | "list";

type Props = {
  bookings: FullBooking[];
  professionalId: string;
  defaultHourlyRateCents: number;
  currency: Currency;
};

const VIEW_OPTIONS: { key: ViewType; label: string; icon: typeof Calendar01Icon }[] = [
  { key: "calendar", label: "Calendar", icon: Calendar01Icon },
  { key: "list", label: "List", icon: Menu01Icon },
];

export function ProBookingsClient({
  bookings,
  professionalId,
  defaultHourlyRateCents,
  currency,
}: Props) {
  const t = useTranslations("dashboard.pro.bookings");
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("calendar");
  const [isAvailabilitySheetOpen, setIsAvailabilitySheetOpen] = useState(false);

  // Handle booking click from calendar
  const handleBookingClick = useCallback(
    (bookingId: string) => {
      // Navigate to booking details or open sheet
      router.push(`/dashboard/pro/bookings/${bookingId}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      {/* View Toggle + Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex rounded-lg border-2 border-border bg-muted p-1">
          {VIEW_OPTIONS.map((view) => (
            <button
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-sm transition-all",
                activeView === view.key
                  ? "bg-rausch-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background"
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

        {/* Update Availability Button */}
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5",
            "border-2 border-rausch-500 bg-rausch-500 text-white",
            "font-semibold text-sm transition-all",
            "hover:border-rausch-600 hover:bg-rausch-600",
            "focus:outline-none focus:ring-2 focus:ring-rausch-500/50 focus:ring-offset-2",
            "dark:focus:ring-offset-neutral-900",
            geistSans.className
          )}
          onClick={() => setIsAvailabilitySheetOpen(true)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} strokeWidth={2} />
          {t("updateAvailability")}
        </button>
      </div>

      {/* Airbnb-Style Calendar View */}
      {activeView === "calendar" && (
        <AirbnbBookingCalendar
          currency={currency}
          defaultHourlyRateCents={defaultHourlyRateCents}
          onBookingClick={handleBookingClick}
          professionalId={professionalId}
        />
      )}

      {/* List View */}
      {activeView === "list" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b bg-muted/50 px-6 py-4">
            <h2
              className={cn(
                "font-semibold text-foreground text-xs uppercase tracking-wider",
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

      {/* Help Text for Calendar */}
      {activeView === "calendar" && (
        <div className="rounded-lg border border-rausch-200 bg-rausch-50 p-4 dark:border-rausch-900/50 dark:bg-rausch-900/20">
          <p className="font-medium text-rausch-900 text-sm dark:text-rausch-200">
            {t("calendarTip")}
          </p>
        </div>
      )}

      {/* Availability Sheet */}
      <AvailabilitySheet
        isOpen={isAvailabilitySheetOpen}
        onClose={() => setIsAvailabilitySheetOpen(false)}
        onSaveSuccess={() => {
          // Optionally refresh calendar data after save
          router.refresh();
        }}
      />
    </div>
  );
}
