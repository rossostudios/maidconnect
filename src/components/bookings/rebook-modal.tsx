"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type { CustomerBooking } from "./customer-booking-list";

type Props = {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
};

export function RebookModal({ booking, isOpen, onClose }: Props) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prevState: { success: boolean; error?: string }, formData: FormData) => {
      try {
        // Create new booking with same details
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            professional_id: booking.professional?.profile_id,
            service_name: booking.service_name,
            duration_minutes: booking.duration_minutes,
            scheduled_start: formData.get("scheduled_start"),
            scheduled_end: formData.get("scheduled_end"),
            // Can add more fields as needed
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, error: error.error || "Failed to rebook service" };
        }

        const data = await response.json();

        // Close modal and redirect to booking details
        onClose();
        router.push(`/dashboard/customer/bookings`);
        router.refresh();

        return { success: true };
      } catch (error) {
        return { success: false, error: "An unexpected error occurred" };
      }
    },
    { success: false }
  );

  if (!isOpen) {
    return null;
  }

  // Calculate suggested date (1 week from now)
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + 7);
  const defaultDate = suggestedDate.toISOString().slice(0, 16);

  // Calculate default end time based on duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + durationMinutes);
    return start.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <RefreshCw className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-[#211f1a] text-2xl">Book Again</h2>
            <p className="text-[#7a6d62] text-sm">Rebook your service with the same professional</p>
          </div>
        </div>

        {/* Pre-filled Details */}
        <div className="mb-6 rounded-xl border border-[#ebe5d8] bg-[#fbfafa] p-4">
          <h3 className="mb-3 font-semibold text-[#211f1a] text-sm">Service Details</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-[#7a6d62]">Service:</span>{" "}
              <span className="text-[#211f1a]">{booking.service_name}</span>
            </p>
            <p>
              <span className="font-medium text-[#7a6d62]">Professional:</span>{" "}
              <span className="text-[#211f1a]">{booking.professional?.full_name}</span>
            </p>
            {booking.duration_minutes && (
              <p>
                <span className="font-medium text-[#7a6d62]">Duration:</span>{" "}
                <span className="text-[#211f1a]">{booking.duration_minutes} minutes</span>
              </p>
            )}
            {booking.amount_captured && (
              <p>
                <span className="font-medium text-[#7a6d62]">Amount:</span>{" "}
                <span className="text-[#211f1a]">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: booking.currency || "COP",
                    maximumFractionDigits: 0,
                  }).format((booking.amount_captured || 0) / 100)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Date/Time Selection */}
        <form action={formAction}>
          <div className="mb-6">
            <label className="mb-2 block font-medium text-[#211f1a] text-sm">
              When would you like to schedule?
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a]/20"
              defaultValue={defaultDate}
              min={new Date().toISOString().slice(0, 16)}
              name="scheduled_start"
              onChange={(e) => {
                if (booking.duration_minutes) {
                  const endTimeInput = document.querySelector(
                    'input[name="scheduled_end"]'
                  ) as HTMLInputElement;
                  if (endTimeInput) {
                    endTimeInput.value = calculateEndTime(e.target.value, booking.duration_minutes);
                  }
                }
              }}
              required
              type="datetime-local"
            />
            <input name="scheduled_end" type="hidden" />
          </div>

          {state.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
              {state.error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full border-2 border-[#ebe5d8] px-6 py-3 font-semibold text-[#211f1a] transition hover:border-[#211f1a] disabled:opacity-50"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-white shadow-[0_4px_12px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
