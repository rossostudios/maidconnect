/**
 * Booking Summary RSC Component
 *
 * Displays a summary of a booking that the user is about to create.
 * Rendered in Amara chat after user selects a date and time from AvailabilitySelector.
 *
 * Features:
 * - Professional info with photo
 * - Service details
 * - Date/time confirmation
 * - Price estimate
 * - Booking type (instant vs. request)
 * - Confirm/cancel actions
 */

import Image from "next/image";
import { BookingSummaryActions } from "../client/booking-summary-actions";

export type BookingSummaryProps = {
  professionalId: string;
  professionalName: string;
  professionalPhoto?: string;
  serviceType: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:MM
  estimatedDuration: number; // in hours
  estimatedPrice: number; // in cents
  instantBooking: boolean;
  conversationId?: string;
};

export function BookingSummary({
  professionalId,
  professionalName,
  professionalPhoto,
  serviceType,
  selectedDate,
  selectedTime,
  estimatedDuration,
  estimatedPrice,
  instantBooking,
  conversationId,
}: BookingSummaryProps) {
  const bookingDate = new Date(selectedDate);
  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const priceInDollars = (estimatedPrice / 100).toFixed(2);
  const endTime = calculateEndTime(selectedTime, estimatedDuration);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-neutral-200 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-neutral-900">Booking Summary</h3>
          {instantBooking && (
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="font-medium text-orange-700 text-xs">Instant Booking</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info */}
      <div className="border-neutral-200 border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
            {professionalPhoto ? (
              <Image alt={professionalName} className="object-cover" fill src={professionalPhoto} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-700">
                <span className="font-semibold text-lg">{professionalName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-neutral-900">{professionalName}</h4>
            <p className="text-neutral-600 text-sm">{serviceType}</p>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Calendar</title>
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <div>
                <div className="font-medium text-neutral-900 text-sm">{formattedDate}</div>
                <div className="text-neutral-600 text-sm">
                  {selectedTime} - {endTime} ({estimatedDuration}h)
                </div>
              </div>
            </div>
          </div>

          {/* Price Estimate */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Price</title>
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <div>
                <div className="font-medium text-neutral-900 text-sm">Estimated Total</div>
                <div className="text-neutral-600 text-sm">${priceInDollars}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="border-neutral-200 border-t bg-neutral-50 px-6 py-4">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Information</title>
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <div className="text-neutral-600 text-xs">
            {instantBooking ? (
              <p>
                <strong>Instant Booking:</strong> Your booking will be confirmed immediately. The
                professional will receive your request and can start preparing.
              </p>
            ) : (
              <p>
                <strong>Booking Request:</strong> {professionalName} will review your request and
                respond within 24 hours. You will be notified once they accept.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-neutral-200 border-t px-6 py-4">
        <BookingSummaryActions
          conversationId={conversationId}
          estimatedDuration={estimatedDuration}
          estimatedPrice={estimatedPrice}
          instantBooking={instantBooking}
          professionalId={professionalId}
          professionalName={professionalName}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          serviceType={serviceType}
        />
      </div>
    </div>
  );
}

/**
 * Error state for booking summary
 */
export type BookingSummaryErrorProps = {
  error: string;
  professionalId?: string;
};

export function BookingSummaryError({ error }: BookingSummaryErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
      <svg
        aria-hidden="true"
        className="mx-auto h-12 w-12 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <title>Error</title>
        <path
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
      <h3 className="mt-4 font-medium text-lg text-red-900">Unable to create booking summary</h3>
      <p className="mt-2 text-red-700 text-sm">{error}</p>
      <button
        className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 text-sm transition-colors hover:bg-red-50"
        type="button"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime: string, durationHours: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const endHours = endDate.getHours().toString().padStart(2, "0");
  const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

  return `${endHours}:${endMinutes}`;
}
