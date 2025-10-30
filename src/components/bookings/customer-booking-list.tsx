"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CancelBookingModal } from "./cancel-booking-modal";
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
        <p className="text-base text-[#5d574b]">{t("emptyState.noBookings")}</p>
        <p className="mt-3 text-base text-[#5d574b]">
          {t("emptyState.browseText")}{" "}
          <a href="/professionals" className="font-semibold text-[#ff5d46] hover:text-[#eb6c65]">
            {t("emptyState.professionalDirectory")}
          </a>{" "}
          {t("emptyState.bookFirstService")}
        </p>
      </div>
    );
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (!b.scheduled_start) return false;
    return (
      new Date(b.scheduled_start) > now && !["declined", "canceled", "completed"].includes(b.status)
    );
  });
  const pastBookings = bookings.filter((b) => {
    if (!b.scheduled_start) return true;
    return (
      new Date(b.scheduled_start) <= now || ["declined", "canceled", "completed"].includes(b.status)
    );
  });

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="mb-6 text-xl font-semibold text-[#211f1a]">
            {t("sections.upcomingServices")}
          </h3>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="mb-6 text-xl font-semibold text-[#211f1a]">
            {t("sections.pastServices")}
          </h3>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
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
            <h4 className="text-lg font-semibold text-[#211f1a]">
              {booking.service_name || t("card.service")}
            </h4>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-base text-[#5d574b]">
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
                type="button"
                onClick={() => setShowRescheduleModal(true)}
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              >
                {t("card.actions.reschedule")}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center justify-center rounded-full border-2 border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                {t("card.actions.cancel")}
              </button>
            </>
          )}
          {booking.status === "completed" && !isUpcoming && (
            <>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
              >
                {t("card.actions.leaveReview")}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              >
                {t("card.actions.bookAgain")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={booking}
      />

      {/* Reschedule Modal */}
      <RescheduleBookingModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        booking={booking}
      />
    </div>
  );
}
