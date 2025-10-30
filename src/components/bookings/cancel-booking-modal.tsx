"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.customer.cancelBookingModal");
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
      setMessage({ type: "error", text: t("errors.cannotCancel") });
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
        text: t("messages.success", { refund: result.refund.formatted_refund }),
      });

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("errors.failedToCancel"),
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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-[#211f1a]">{t("title")}</h2>
        <p className="mt-3 text-base text-[#5d574b]">
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
          <div className={`mt-6 rounded-2xl border p-6 ${
            policy.canCancel
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
          }`}>
            <p className={`text-base font-semibold ${
              policy.canCancel ? "text-yellow-900" : "text-red-900"
            }`}>
              {policy.reason}
            </p>
            {policy.canCancel && (
              <div className="mt-3 space-y-1 text-base text-yellow-800">
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
        <details className="mt-6">
          <summary className="cursor-pointer text-base font-semibold text-[#211f1a]">
            {t("policy.viewPolicy")}
          </summary>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#5d574b]">
            {getCancellationPolicyDescription()}
          </pre>
        </details>

        {/* Reason Input */}
        {policy?.canCancel && (
          <div className="mt-6">
            <label htmlFor="reason" className="mb-2 block text-base font-semibold text-[#211f1a]">
              {t("form.reasonLabel")}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("form.reasonPlaceholder")}
              rows={4}
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`mt-6 rounded-2xl p-4 text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 text-base font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("buttons.keepBooking")}
          </button>
          {policy?.canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 rounded-full bg-red-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("buttons.canceling") : t("buttons.cancelBooking")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
