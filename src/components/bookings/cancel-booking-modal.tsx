"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateCancellationPolicy, getCancellationPolicyDescription } from "@/lib/cancellation-policy";

type CancelBookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    service_name: string | null;
    scheduled_start: string | null;
    status: string;
    amount_authorized: number | null;
    currency: string | null;
  };
};

export function CancelBookingModal({ isOpen, onClose, booking }: CancelBookingModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [policy, setPolicy] = useState<ReturnType<typeof calculateCancellationPolicy> | null>(null);

  // Calculate policy when modal opens
  useEffect(() => {
    if (isOpen && booking.scheduled_start) {
      const calculatedPolicy = calculateCancellationPolicy(booking.scheduled_start, booking.status);
      setPolicy(calculatedPolicy);
    }
  }, [isOpen, booking.scheduled_start, booking.status]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setMessage(null);
      setPolicy(null);
    }
  }, [isOpen]);

  const handleCancel = async () => {
    if (!policy?.canCancel) {
      setMessage({ type: "error", text: "Cannot cancel this booking" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          reason: reason || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel booking");
      }

      setMessage({
        type: "success",
        text: `Booking canceled successfully! ${result.refund.formatted_refund} will be refunded.`,
      });

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to cancel booking",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
    }).format(amount / 100);
  };

  const refundAmount = booking.amount_authorized && policy
    ? (booking.amount_authorized * policy.refundPercentage) / 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-[#211f1a]">Cancel Booking</h2>
        <p className="mt-2 text-sm text-[#7a6d62]">
          {booking.service_name || "Service"} •{" "}
          {booking.scheduled_start
            ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </p>

        {/* Cancellation Policy Info */}
        {policy && (
          <div className={`mt-4 rounded-lg border p-4 ${
            policy.canCancel
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
          }`}>
            <p className={`text-sm font-semibold ${
              policy.canCancel ? "text-yellow-900" : "text-red-900"
            }`}>
              {policy.reason}
            </p>
            {policy.canCancel && (
              <div className="mt-2 text-sm text-yellow-800">
                <p>
                  <strong>Refund:</strong> {policy.refundPercentage}% (
                  {formatAmount(refundAmount, booking.currency)})
                </p>
                <p>
                  <strong>Time until service:</strong> {Math.floor(policy.hoursUntilService)} hours
                </p>
              </div>
            )}
          </div>
        )}

        {/* Policy Details */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-[#7a6d62]">
            View Cancellation Policy
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-[#5d574b]">
            {getCancellationPolicyDescription()}
          </pre>
        </details>

        {/* Reason Input */}
        {policy?.canCancel && (
          <div className="mt-4">
            <label htmlFor="reason" className="mb-2 block text-sm font-medium text-[#211f1a]">
              Reason for cancellation (optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let the professional know why you need to cancel..."
              rows={3}
              className="w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f]/20"
            />
          </div>
        )}

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
            Keep Booking
          </button>
          {policy?.canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Canceling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
