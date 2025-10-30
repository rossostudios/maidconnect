"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  const t = useTranslations("dashboard.customer.rescheduleBookingModal");
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
    if (!(newDate && newTime)) {
      setMessage({ type: "error", text: t("validation.selectDateTime") });
      return;
    }

    // Combine date and time into ISO string
    const newScheduledStart = new Date(`${newDate}T${newTime}`).toISOString();

    // Validate future date
    if (new Date(newScheduledStart) <= new Date()) {
      setMessage({ type: "error", text: t("validation.futureDateRequired") });
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
        text: result.message || t("success.rescheduled"),
      });

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("error.failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-8 shadow-xl">
        <h2 className="font-semibold text-2xl text-[#211f1a]">{t("title")}</h2>
        <p className="mt-3 text-[#5d574b] text-base">{booking.service_name || "Service"}</p>

        {/* Current Schedule */}
        <div className="mt-6 rounded-2xl border border-[#ebe5d8] bg-white p-6">
          <p className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
            {t("currentScheduleLabel")}
          </p>
          <p className="mt-2 text-[#211f1a] text-base">
            {booking.scheduled_start
              ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </div>

        {/* New Schedule Form */}
        <div className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-[#211f1a] text-base" htmlFor="newDate">
              {t("newDateLabel")}
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
              id="newDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNewDate(e.target.value)}
              type="date"
              value={newDate}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#211f1a] text-base" htmlFor="newTime">
              {t("newTimeLabel")}
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
              id="newTime"
              onChange={(e) => setNewTime(e.target.value)}
              type="time"
              value={newTime}
            />
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <p className="font-semibold text-base text-blue-900">{t("notice.title")}</p>
          <p className="mt-3 text-base text-blue-800 leading-relaxed">{t("notice.description")}</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 rounded-2xl p-4 text-base ${
              message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            className="flex-1 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            {t("buttons.cancel")}
          </button>
          <button
            className="flex-1 rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={handleReschedule}
            type="button"
          >
            {loading ? t("buttons.rescheduling") : t("buttons.reschedule")}
          </button>
        </div>
      </div>
    </div>
  );
}
