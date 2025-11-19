"use client";

/**
 * Booking Summary Client Actions
 *
 * Client component that handles booking confirmation and cancellation.
 * Tracks user interactions with PostHog analytics.
 *
 * Features:
 * - Confirm booking button (creates booking draft)
 * - Cancel button (dismisses summary)
 * - Loading states
 * - PostHog analytics tracking
 * - Optimistic UI updates
 */

import { useState } from "react";
import { createBookingFromAmara } from "@/app/actions/amara/create-booking";
import { trackAmaraComponentClicked } from "@/lib/analytics/amara-events";

type BookingSummaryActionsProps = {
  professionalId: string;
  professionalName: string;
  serviceType: string;
  selectedDate: string;
  selectedTime: string;
  estimatedPrice: number;
  estimatedDuration: number;
  instantBooking: boolean;
  conversationId?: string;
};

export function BookingSummaryActions({
  professionalId,
  professionalName,
  serviceType,
  selectedDate,
  selectedTime,
  estimatedPrice,
  estimatedDuration,
  instantBooking,
  conversationId,
}: BookingSummaryActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    setBookingError(null);

    // Track analytics
    trackAmaraComponentClicked("booking_summary", "confirm_booking", {
      professional_id: professionalId,
      professional_name: professionalName,
      conversation_id: conversationId,
      service_type: serviceType,
      selected_date: selectedDate,
      selected_time: selectedTime,
      estimated_price: estimatedPrice,
      instant_booking: instantBooking,
    });

    try {
      const result = await createBookingFromAmara({
        professionalId,
        professionalName,
        serviceType,
        selectedDate,
        selectedTime,
        estimatedDuration,
        estimatedPrice,
        conversationId,
      });

      if (result.success) {
        setBookingSuccess(true);
        // TODO: Navigate to booking confirmation page or show success message
        // For now, show success state in the UI
      } else {
        setBookingError(result.error);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      setBookingError("An unexpected error occurred. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    // Track analytics
    trackAmaraComponentClicked("booking_summary", "cancel_booking", {
      professional_id: professionalId,
      conversation_id: conversationId,
    });

    // TODO: Dismiss the booking summary component
    // This would typically be handled by the parent component
    // For now, we'll just track the cancellation
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Success state
  if (bookingSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-4">
        <div className="flex items-start gap-3">
          <svg
            aria-hidden="true"
            className="h-6 w-6 flex-shrink-0 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <div>
            <h4 className="font-semibold text-green-900 text-sm">
              {instantBooking ? "Booking Confirmed!" : "Booking Request Sent!"}
            </h4>
            <p className="mt-1 text-green-700 text-sm">
              {instantBooking
                ? `Your booking with ${professionalName} is confirmed. You'll receive a confirmation email shortly.`
                : `Your booking request has been sent to ${professionalName}. They will respond within 24 hours.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (bookingError) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4">
          <div className="flex items-start gap-3">
            <svg
              aria-hidden="true"
              className="h-6 w-6 flex-shrink-0 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 text-sm">Booking Failed</h4>
              <p className="mt-1 text-red-700 text-sm">{bookingError}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-700 text-sm transition-all hover:bg-neutral-50 hover:shadow-sm active:scale-95"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-sm text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-95"
            onClick={() => {
              setBookingError(null);
              handleConfirmBooking();
            }}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Default state: action buttons
  return (
    <div className="flex gap-3">
      {/* Cancel Button */}
      <button
        className="flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-700 text-sm transition-all hover:bg-neutral-50 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isConfirming}
        onClick={handleCancel}
        type="button"
      >
        Cancel
      </button>

      {/* Confirm Button */}
      <button
        className="flex-1 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-sm text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isConfirming}
        onClick={handleConfirmBooking}
        type="button"
      >
        {isConfirming ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Confirming...</span>
          </div>
        ) : instantBooking ? (
          "Confirm Instant Booking"
        ) : (
          "Send Booking Request"
        )}
      </button>
    </div>
  );
}
