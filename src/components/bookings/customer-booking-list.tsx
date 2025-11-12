"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";
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
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-12 text-center">
        <p className="text-[neutral-400] text-base">{t("emptyState.noBookings")}</p>
        <p className="mt-3 text-[neutral-400] text-base">
          {t("emptyState.browseText")}{" "}
          <Link
            className="font-semibold text-[neutral-500] hover:text-[neutral-500]"
            href="/professionals"
          >
            {t("emptyState.professionalDirectory")}
          </Link>{" "}
          {t("emptyState.bookFirstService")}
        </p>
      </div>
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
          <h3 className="mb-6 font-semibold text-[neutral-900] text-xl">
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
          <h3 className="mb-6 font-semibold text-[neutral-900] text-xl">
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
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: booking.currency || "COP",
        maximumFractionDigits: 0,
      }).format(amount / 100)
    : "—";

  const statusColor =
    {
      pending_payment: "bg-[neutral-200]/30 text-[neutral-900]",
      authorized: "bg-[neutral-500]/10 text-[neutral-500]",
      confirmed: "bg-[neutral-500]/10 text-[neutral-500]",
      declined: "bg-[neutral-500]/10 text-[neutral-500]",
      canceled: "bg-[neutral-200]/30 text-[neutral-900]",
      completed: "bg-[neutral-50] text-[neutral-500]",
    }[booking.status] || "bg-[neutral-200]/30 text-[neutral-900]";

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
    <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-[neutral-900] text-lg">
              {booking.service_name || t("card.service")}
            </h4>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-[neutral-400] text-base">
            <p>
              <span className="font-semibold text-[neutral-900]">{t("card.professional")}</span>{" "}
              {booking.professional?.full_name || t("card.notAssigned")}
            </p>
            <p>
              <span className="font-semibold text-[neutral-900]">{t("card.scheduled")}</span>{" "}
              {scheduled}
            </p>
            {booking.duration_minutes && (
              <p>
                <span className="font-semibold text-[neutral-900]">{t("card.duration")}</span>{" "}
                {t("card.minutes", { minutes: booking.duration_minutes })}
              </p>
            )}
            <p>
              <span className="font-semibold text-[neutral-900]">{t("card.amount")}</span>{" "}
              {amountDisplay}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(booking.status === "confirmed" || booking.status === "authorized") && isUpcoming && (
            <>
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[neutral-200] px-5 py-2.5 font-semibold text-[neutral-900] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
                onClick={() => setShowRescheduleModal(true)}
                type="button"
              >
                {t("card.actions.reschedule")}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[neutral-500]/20 px-5 py-2.5 font-semibold text-[neutral-500] text-sm transition hover:bg-[neutral-500]/10"
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
                className="inline-flex items-center justify-center rounded-full bg-[neutral-500] px-5 py-2.5 font-semibold text-[neutral-50] text-sm shadow-[0_4px_12px_rgba(244,74,34,0.22)] transition hover:bg-[neutral-500]"
                type="button"
              >
                {t("card.actions.leaveReview")}
              </button>
              {canReportIssue && (
                <button
                  className="inline-flex items-center justify-center rounded-full border-2 border-[neutral-500]/20 px-5 py-2.5 font-semibold text-[neutral-500] text-sm transition hover:bg-[neutral-500]/10"
                  onClick={() => setShowDisputeModal(true)}
                  type="button"
                >
                  Report Issue
                </button>
              )}
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[neutral-200] px-5 py-2.5 font-semibold text-[neutral-900] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
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
    </div>
  );
}
