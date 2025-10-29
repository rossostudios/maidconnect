"use client";

import { useState } from "react";
import { RatingPromptModal } from "./rating-prompt-modal";

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
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);

  // Filter out bookings that already have reviews
  const bookingsNeedingReviews = completedBookings.filter((b) => !b.hasReview);

  if (bookingsNeedingReviews.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#211f1a]">Rate Your Recent Customers</h3>
      <p className="mt-1 text-sm text-[#7a6d62]">
        Share your feedback to help build a trusted community.
      </p>

      <div className="mt-4 space-y-3">
        {bookingsNeedingReviews.map((booking) => {
          const date = booking.scheduled_start
            ? new Date(booking.scheduled_start).toLocaleDateString("es-CO", {
                dateStyle: "medium",
              })
            : "Recent";

          return (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-4"
            >
              <div>
                <p className="font-medium text-[#211f1a]">
                  {booking.service_name || "Service"}
                </p>
                <p className="text-sm text-[#7a6d62]">
                  Customer • {date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(booking)}
                className="rounded-lg bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#eb6c65]"
              >
                Rate Customer
              </button>
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      {selectedBooking?.customer && (
        <RatingPromptModal
          isOpen={selectedBooking !== null}
          onClose={() => setSelectedBooking(null)}
          customerId={selectedBooking.customer.id}
          customerName="Customer"
          bookingId={selectedBooking.id}
        />
      )}
    </div>
  );
}
