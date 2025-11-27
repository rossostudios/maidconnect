"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { EmptyState, EmptyStateInlineLink } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { formatFromMinorUnits } from "@/lib/utils/format";
import { isWithinDisputeWindow } from "./dispute-modal";

// Dynamic imports for modals (lazy load on demand)
const CancelBookingModal = dynamic(
  () => import("./cancel-booking-modal").then((mod) => mod.CancelBookingModal),
  { ssr: false }
);
const DisputeModal = dynamic(() => import("./dispute-modal").then((mod) => mod.DisputeModal), {
  ssr: false,
});
const RebookModal = dynamic(() => import("./rebook-modal").then((mod) => mod.RebookModal), {
  ssr: false,
});
const RescheduleBookingModal = dynamic(
  () => import("./reschedule-booking-modal").then((mod) => mod.RescheduleBookingModal),
  { ssr: false }
);
const ReceiptModal = dynamic(() => import("./receipt-modal").then((mod) => mod.ReceiptModal), {
  ssr: false,
});

type BookingStatus =
  | "pending_payment"
  | "authorized"
  | "confirmed"
  | "declined"
  | "canceled"
  | "completed"
  | "in_progress";

export type CustomerBooking = {
  id: string;
  status: BookingStatus | string; // Allow both typed and fallback for backward compatibility
  scheduled_start: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  created_at: string;
  completed_at?: string | null; // Week 3-4: For dispute window calculation
  professional: { full_name: string | null; profile_id: string } | null;
};

type Props = {
  bookings: CustomerBooking[];
};

export function CustomerBookingList({ bookings }: Props) {
  const t = useTranslations("dashboard.customer.bookingList");

  if (bookings.length === 0) {
    return (
      <EmptyState
        description={
          <>
            {t("emptyState.browseText")}{" "}
            <EmptyStateInlineLink href="/professionals">
              {t("emptyState.professionalDirectory")}
            </EmptyStateInlineLink>{" "}
            {t("emptyState.bookFirstService")}
          </>
        }
        title={t("emptyState.noBookings")}
        variant="bookings"
      />
    );
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (!b.scheduled_start) {
      return false;
    }
    return (
      new Date(b.scheduled_start) > now && !["declined", "canceled", "completed"].includes(b.status)
    );
  });
  const pastBookings = bookings.filter((b) => {
    if (!b.scheduled_start) {
      return true;
    }
    return (
      new Date(b.scheduled_start) <= now || ["declined", "canceled", "completed"].includes(b.status)
    );
  });

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("sections.upcomingServices")}
          </h3>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard booking={booking} isUpcoming key={booking.id} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("sections.pastServices")}
          </h3>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard booking={booking} isUpcoming={false} key={booking.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, isUpcoming }: { booking: CustomerBooking; isUpcoming: boolean }) {
  const t = useTranslations("dashboard.customer.bookingList");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Week 3-4: Check if booking is within 48-hour dispute window
  const canReportIssue = isWithinDisputeWindow(booking, booking.completed_at);

  const scheduled = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : t("card.notScheduled");

  const amount = booking.amount_captured || booking.amount_authorized;
  const amountDisplay = amount
    ? formatFromMinorUnits(amount, booking.currency || "COP")
    : "—";

  const statusColor =
    {
      pending_payment: "bg-yellow-50 text-yellow-600 border border-yellow-200",
      authorized: "bg-babu-50 text-babu-600 border border-babu-200",
      confirmed: "bg-green-50 text-green-600 border border-green-200",
      declined: "bg-neutral-100 text-neutral-600 border border-neutral-200",
      canceled: "bg-neutral-100 text-neutral-600 border border-neutral-200",
      completed: "bg-green-50 text-green-600 border border-green-200",
    }[booking.status] || "bg-neutral-100 text-neutral-600 border border-neutral-200";

  // Type-safe translation key lookup
  const statusTranslationKey = `card.status.${booking.status}` as const;
  const statusLabel =
    (booking.status in
    {
      pending_payment: 1,
      authorized: 1,
      confirmed: 1,
      declined: 1,
      canceled: 1,
      completed: 1,
      in_progress: 1,
    }
      ? t(statusTranslationKey)
      : booking.status.replace(/_/g, " ")) || booking.status.replace(/_/g, " ");

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-rausch-500 hover:shadow-md">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              {booking.service_name || t("card.service")}
            </h4>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-base text-neutral-600">
            <p>
              <span className="font-semibold text-neutral-900">{t("card.professional")}</span>{" "}
              {booking.professional?.full_name || t("card.notAssigned")}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">{t("card.scheduled")}</span>{" "}
              {scheduled}
            </p>
            {booking.duration_minutes && (
              <p>
                <span className="font-semibold text-neutral-900">{t("card.duration")}</span>{" "}
                {t("card.minutes", { minutes: booking.duration_minutes })}
              </p>
            )}
            <p>
              <span className="font-semibold text-neutral-900">{t("card.amount")}</span>{" "}
              {amountDisplay}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(booking.status === "confirmed" || booking.status === "authorized") && isUpcoming && (
            <>
              <button
                className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:text-rausch-600"
                onClick={() => setShowRescheduleModal(true)}
                type="button"
              >
                {t("card.actions.reschedule")}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-700 text-sm transition hover:bg-neutral-50"
                onClick={() => setShowCancelModal(true)}
                type="button"
              >
                {t("card.actions.cancel")}
              </button>
            </>
          )}
          {booking.status === "completed" && !isUpcoming && (
            <>
              <button
                className="inline-flex items-center justify-center rounded-lg bg-rausch-500 px-5 py-2.5 font-semibold text-sm text-white shadow-[0_4px_12px_rgba(217,119,87,0.22)] transition hover:bg-rausch-600"
                type="button"
              >
                {t("card.actions.leaveReview")}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:text-rausch-600"
                onClick={() => setShowReceiptModal(true)}
                type="button"
              >
                {t("card.actions.downloadReceipt")}
              </button>
              {canReportIssue && (
                <button
                  className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-700 text-sm transition hover:bg-neutral-50"
                  onClick={() => setShowDisputeModal(true)}
                  type="button"
                >
                  Report Issue
                </button>
              )}
              <button
                className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 px-5 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-rausch-500 hover:text-rausch-600"
                onClick={() => setShowRebookModal(true)}
                type="button"
              >
                {t("card.actions.bookAgain")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        booking={booking}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />

      {/* Reschedule Modal */}
      <RescheduleBookingModal
        booking={booking}
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
      />

      {/* Dispute Modal - Week 3-4 */}
      <DisputeModal
        booking={booking}
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
      />

      {/* Rebook Modal - Week 5-6 */}
      <RebookModal
        booking={booking}
        isOpen={showRebookModal}
        onClose={() => setShowRebookModal(false)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        booking={booking}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
