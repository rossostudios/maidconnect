"use client";

import {
  Calendar01Icon,
  Clock01Icon,
  MagicWand01Icon,
  RepeatIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { formatCOP, formatDate } from "@/lib/format";

type PreviousBooking = {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalPhoto?: string;
  serviceName: string;
  durationHours: number;
  amount: number;
  scheduledDate: string;
  scheduledTime: string;
};

type BookAgainCardProps = {
  booking: PreviousBooking;
  onBookAgain?: (bookingId: string) => void;
};

/**
 * BookAgainCard - One-tap rebook for previous customers
 *
 * Research insights applied:
 * - Xanh SM doubled repeat orders with optimized re-engagement
 * - Hyatt saw 2.5% conversion lift with "Complete Your Booking" feature
 * - Pre-filled forms reduce booking time by 70%
 * - Repeat bookings are 5x easier to convert than new bookings
 *
 * Performance optimizations:
 * - React.memo: Prevents re-renders when booking prop unchanged
 */
const BookAgainCardComponent = memo(
  function BookAgainCardInner({ booking, onBookAgain }: BookAgainCardProps) {
    const [isRebooking, setIsRebooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const oneTapEnabled = isFeatureEnabled("one_tap_rebook");

    const handleBookAgain = async () => {
      setIsRebooking(true);
      setError(null);

      try {
        if (oneTapEnabled) {
          // New one-tap rebook flow
          const response = await fetch("/api/bookings/rebook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              originalBookingId: booking.id,
              // Don't set scheduledStart - let user pick new date
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to create rebook");
          }

          const data = await response.json();

          // Redirect to scheduling or payment page
          router.push(data.redirectTo);
        } else {
          // Legacy flow - call the provided callback
          if (onBookAgain) {
            await onBookAgain(booking.id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to rebook");
        setIsRebooking(false);
      }
    };

    return (
      <div className="group rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:border-[#E85D48] hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#ebe5d8]">
              {booking.professionalPhoto ? (
                <Image
                  alt={booking.professionalName}
                  className="h-full w-full object-cover"
                  height={56}
                  loading="lazy"
                  src={booking.professionalPhoto}
                  width={56}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#E85D48] font-semibold text-lg text-white">
                  {booking.professionalName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{booking.professionalName}</h3>
              <p className="text-[#7d7566] text-sm">{booking.serviceName}</p>
            </div>
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700 text-xs">
            <HugeiconsIcon className="h-3.5 w-3.5" icon={Tick02Icon} />
            Completed
          </span>
        </div>

        {/* Booking Details */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[#7d7566] text-sm">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            <span>{formatDate(booking.scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span>{booking.durationHours}h session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{formatCOP(booking.amount)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-[#E85D48]/10 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Quick Rebook Button */}
        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D64A36] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRebooking}
          onClick={handleBookAgain}
          type="button"
        >
          {oneTapEnabled ? (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={MagicWand01Icon} />
              {isRebooking ? "Creating booking..." : "Book Again (1-Tap)"}
            </>
          ) : (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={RepeatIcon} />
              {isRebooking ? "Preparing..." : "Book Again"}
            </>
          )}
        </button>

        <p className="mt-2 text-center text-[#7d7566] text-xs">
          {oneTapEnabled
            ? "All details pre-filled. Just pick a new date!"
            : "Same service, new date. We'll prefill your preferences."}
        </p>
      </div>
    );
  },
  // Custom comparison: only re-render if booking ID changes
  (prevProps, nextProps) =>
    prevProps.booking.id === nextProps.booking.id && prevProps.onBookAgain === nextProps.onBookAgain
);

// Export the memoized component
export const BookAgainCard = BookAgainCardComponent;

/**
 * BookAgainSection - Display recent bookings for quick rebook
 */
type BookAgainSectionProps = {
  previousBookings: PreviousBooking[];
  onBookAgain?: (bookingId: string) => void;
};

export function BookAgainSection({ previousBookings, onBookAgain }: BookAgainSectionProps) {
  if (previousBookings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl text-gray-900">Book Again</h2>
        <p className="text-[#7d7566] text-sm">Your recent professionals</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {previousBookings.slice(0, 3).map((booking) => (
          <BookAgainCard booking={booking} key={booking.id} onBookAgain={onBookAgain} />
        ))}
      </div>
    </div>
  );
}
