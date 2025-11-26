"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

// Dynamic import for modal (lazy load on demand)
const RatingPromptModal = dynamic(
  () => import("./rating-prompt-modal").then((mod) => mod.RatingPromptModal),
  { ssr: false }
);

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
    <div className="border border-neutral-200 bg-white">
      <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3
          className={cn(
            "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          {t("title")}
        </h3>
        <p
          className={cn(
            "mt-1 font-normal text-neutral-700 text-xs tracking-tighter",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {bookingsNeedingReviews.map((booking) => {
            const date = booking.scheduled_start
              ? new Date(booking.scheduled_start).toLocaleDateString("es-CO", {
                  dateStyle: "medium",
                })
              : t("dateRecent");

            return (
              <div
                className="flex items-center justify-between border border-neutral-200 bg-white p-4"
                key={booking.id}
              >
                <div>
                  <p className={cn("font-semibold text-neutral-900", geistSans.className)}>
                    {booking.service_name || t("defaultService")}
                  </p>
                  <p
                    className={cn("text-neutral-700 text-sm tracking-tighter", geistSans.className)}
                  >
                    {t("customer")} • {date}
                  </p>
                </div>
                <button
                  className={cn(
                    "border border-neutral-200 bg-[#FF5200] px-4 py-2 font-semibold text-white text-xs uppercase tracking-wider transition-all hover:bg-rausch-600",
                    geistSans.className
                  )}
                  onClick={() => setSelectedBooking(booking)}
                  type="button"
                >
                  {t("rateButton")}
                </button>
              </div>
            );
          })}
        </div>
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
