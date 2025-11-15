"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Dynamic import for modal (lazy load on demand)
const RatingPromptModal = dynamic(() => import("./Rating").then((mod) => mod.RatingPromptModal), {
  ssr: false,
});

type CompletedBooking = {
  id: string;
  service_name: string | null;
  scheduled_start: string | null;
  customer: { id: string } | null;
  hasReview?: boolean;
};

type Props = {
  completedBookings: CompletedBooking[];
};

export function PendingRatingsList({ completedBookings }: Props) {
  const t = useTranslations("dashboard.pro.pendingRatings");
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);

  // Filter out bookings that already have reviews
  const bookingsNeedingReviews = completedBookings.filter((b) => !b.hasReview);

  if (bookingsNeedingReviews.length === 0) {
    return null;
  }

  return (
    <div className="border border-[neutral-200] bg-[neutral-50]/90 p-6 shadow-sm">
      <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
      <p className="mt-1 text-[neutral-400] text-sm">{t("description")}</p>

      <div className="mt-4 space-y-3">
        {bookingsNeedingReviews.map((booking) => {
          const date = booking.scheduled_start
            ? new Date(booking.scheduled_start).toLocaleDateString("es-CO", {
                dateStyle: "medium",
              })
            : t("dateRecent");

          return (
            <div
              className="flex items-center justify-between border border-[neutral-200] bg-[neutral-50] p-4"
              key={booking.id}
            >
              <div>
                <p className="font-medium text-[neutral-900]">
                  {booking.service_name || t("defaultService")}
                </p>
                <p className="text-[neutral-400] text-sm">
                  {t("customer")} • {date}
                </p>
              </div>
              <button
                className="bg-[neutral-500] px-4 py-2 font-semibold text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
                onClick={() => setSelectedBooking(booking)}
                type="button"
              >
                {t("rateButton")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      {selectedBooking?.customer && (
        <RatingPromptModal
          bookingId={selectedBooking.id}
          customerId={selectedBooking.customer.id}
          customerName={t("customer")}
          isOpen={selectedBooking !== null}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
