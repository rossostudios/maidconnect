"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { CancelBookingModal } from "./cancel-booking-modal";
import { DisputeModal, isWithinDisputeWindow } from "./dispute-modal";
import { RebookModal } from "./rebook-modal";
import { RescheduleBookingModal } from "./reschedule-booking-modal";

export type CustomerBooking = {
  id: string;
  status: string;
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
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
        <p className="text-[#5d574b] text-base">{t("emptyState.noBookings")}</p>
        <p className="mt-3 text-[#5d574b] text-base">
          {t("emptyState.browseText")}{" "}
          <Link className="font-semibold text-[#ff5d46] hover:text-[#eb6c65]" href="/professionals">
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
          <h3 className="mb-6 font-semibold text-[#211f1a] text-xl">
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
          <h3 className="mb-6 font-semibold text-[#211f1a] text-xl">
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
      pending_payment: "bg-gray-100 text-gray-800",
      authorized: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      canceled: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800",
    }[booking.status] || "bg-gray-100 text-gray-800";

  const statusLabel =
    t(`card.status.${booking.status}` as any) || booking.status.replace(/_/g, " ");

  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-[#211f1a] text-lg">
              {booking.service_name || t("card.service")}
            </h4>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-[#5d574b] text-base">
            <p>
              <span className="font-semibold text-[#211f1a]">{t("card.professional")}</span>{" "}
              {booking.professional?.full_name || t("card.notAssigned")}
            </p>
            <p>
              <span className="font-semibold text-[#211f1a]">{t("card.scheduled")}</span>{" "}
              {scheduled}
            </p>
            {booking.duration_minutes && (
              <p>
                <span className="font-semibold text-[#211f1a]">{t("card.duration")}</span>{" "}
                {t("card.minutes", { minutes: booking.duration_minutes })}
              </p>
            )}
            <p>
              <span className="font-semibold text-[#211f1a]">{t("card.amount")}</span>{" "}
              {amountDisplay}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(booking.status === "confirmed" || booking.status === "authorized") && isUpcoming && (
            <>
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
                onClick={() => setShowRescheduleModal(true)}
                type="button"
              >
                {t("card.actions.reschedule")}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-red-200 px-5 py-2.5 font-semibold text-red-700 text-sm transition hover:bg-red-50"
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
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-5 py-2.5 font-semibold text-sm text-white shadow-[0_4px_12px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
                type="button"
              >
                {t("card.actions.leaveReview")}
              </button>
              {canReportIssue && (
                <button
                  className="inline-flex items-center justify-center rounded-full border-2 border-orange-200 px-5 py-2.5 font-semibold text-orange-700 text-sm transition hover:bg-orange-50"
                  onClick={() => setShowDisputeModal(true)}
                  type="button"
                >
                  Report Issue
                </button>
              )}
              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
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
