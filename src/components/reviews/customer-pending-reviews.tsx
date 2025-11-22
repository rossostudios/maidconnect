"use client";

import { StarIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

// Lazy load the modal
const CustomerReviewModal = dynamic(
  () => import("./customer-review-modal").then((mod) => mod.CustomerReviewModal),
  { ssr: false }
);

type BookingWithProfessional = {
  id: string;
  status: string;
  scheduled_start: string | null;
  service_name: string | null;
  professional: {
    profile_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = {
  bookings: BookingWithProfessional[];
};

export function CustomerPendingReviews({ bookings }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfessional | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <HugeiconsIcon className="h-6 w-6 text-neutral-400" icon={StarIcon} />
        </div>
        <p className={cn("font-medium text-neutral-900", geistSans.className)}>
          No pending reviews
        </p>
        <p className="mt-1 text-neutral-600 text-sm">
          Complete a booking to leave a review for your professional
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const date = booking.scheduled_start
            ? new Date(booking.scheduled_start).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })
            : "Recent";

          return (
            <div
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-200 hover:shadow-sm"
              key={booking.id}
            >
              <div className="flex items-center gap-4">
                {/* Professional Avatar */}
                {booking.professional?.avatar_url ? (
                  <Image
                    alt={booking.professional.full_name ?? "Professional"}
                    className="h-12 w-12 rounded-lg border border-neutral-200 object-cover"
                    height={48}
                    src={booking.professional.avatar_url}
                    width={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                    <HugeiconsIcon className="h-6 w-6 text-neutral-400" icon={UserCircleIcon} />
                  </div>
                )}

                {/* Booking Info */}
                <div>
                  <p className={cn("font-semibold text-neutral-900", geistSans.className)}>
                    {booking.professional?.full_name ?? "Professional"}
                  </p>
                  <p className="text-neutral-600 text-sm">
                    {booking.service_name ?? "Service"} • {date}
                  </p>
                </div>
              </div>

              {/* Rate Button */}
              <button
                className={cn(
                  "rounded-lg border border-orange-200 bg-orange-500 px-4 py-2 font-semibold text-sm text-white transition-all hover:bg-orange-600",
                  geistSans.className
                )}
                onClick={() => setSelectedBooking(booking)}
                type="button"
              >
                Leave Review
              </button>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedBooking?.professional && (
        <CustomerReviewModal
          bookingId={selectedBooking.id}
          isOpen={selectedBooking !== null}
          onClose={() => setSelectedBooking(null)}
          professionalId={selectedBooking.professional.profile_id}
          professionalName={selectedBooking.professional.full_name ?? "Professional"}
        />
      )}
    </>
  );
}
