"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RescheduleBookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    service_name: string | null;
    scheduled_start: string | null;
    duration_minutes: number | null;
  };
};

export function RescheduleBookingModal({ isOpen, onClose, booking }: RescheduleBookingModalProps) {
  const router = useRouter();
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize with current booking date/time
  useEffect(() => {
    if (isOpen && booking.scheduled_start) {
      const currentStart = new Date(booking.scheduled_start);
      // Format for date input (YYYY-MM-DD)
      const dateStr = currentStart.toISOString().split("T")[0];
      // Format for time input (HH:MM)
      const timeStr = currentStart.toTimeString().slice(0, 5);
      setNewDate(dateStr);
      setNewTime(timeStr);
    }
  }, [isOpen, booking.scheduled_start]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewDate("");
      setNewTime("");
      setMessage(null);
    }
  }, [isOpen]);

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setMessage({ type: "error", text: "Please select a new date and time" });
      return;
    }

    // Combine date and time into ISO string
    const newScheduledStart = new Date(`${newDate}T${newTime}`).toISOString();

    // Validate future date
    if (new Date(newScheduledStart) <= new Date()) {
      setMessage({ type: "error", text: "New time must be in the future" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          newScheduledStart,
          newDurationMinutes: booking.duration_minutes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reschedule booking");
      }

      setMessage({
        type: "success",
        text: result.message || "Booking rescheduled successfully!",
      });

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to reschedule booking",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-[#211f1a]">Reschedule Booking</h2>
        <p className="mt-2 text-sm text-[#7a6d62]">
          {booking.service_name || "Service"}
        </p>

        {/* Current Schedule */}
        <div className="mt-4 rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">
            Current Schedule
          </p>
          <p className="mt-1 text-sm text-[#211f1a]">
            {booking.scheduled_start
              ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </div>

        {/* New Schedule Form */}
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="newDate" className="mb-2 block text-sm font-medium text-[#211f1a]">
              New Date
            </label>
            <input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f]/20"
            />
          </div>

          <div>
            <label htmlFor="newTime" className="mb-2 block text-sm font-medium text-[#211f1a]">
              New Time
            </label>
            <input
              id="newTime"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f]/20"
            />
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-semibold text-blue-900">Important</p>
          <p className="mt-1 text-xs text-blue-800">
            The professional will need to confirm the new time. Your booking will be reset to
            "pending confirmation" status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#ebe5d8] bg-white px-4 py-2 font-semibold text-[#7a6d62] transition hover:border-[#fd857f] hover:text-[#fd857f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#fd857f] px-4 py-2 font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Rescheduling..." : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
