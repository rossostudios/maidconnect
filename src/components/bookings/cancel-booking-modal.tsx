"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/form-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import {
  calculateCancellationPolicy,
  getCancellationPolicyDescription,
} from "@/lib/cancellation-policy";

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
  const t = useTranslations("dashboard.customer.cancelBookingModal");
  const [policy, setPolicy] = useState<ReturnType<typeof calculateCancellationPolicy> | null>(null);

  // Form state management
  const form = useModalForm({
    initialData: { reason: "" },
    resetOnClose: true,
  });

  // API mutation for cancellation
  const cancelMutation = useApiMutation({
    url: "/api/bookings/cancel",
    method: "POST",
    refreshOnSuccess: true,
    onSuccess: (result) => {
      toast.success(t("messages.success", { refund: result.refund.formatted_refund }), {
        duration: 5000,
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || t("errors.failedToCancel"));
    },
  });

  // Calculate policy when modal opens
  useEffect(() => {
    if (isOpen && booking.scheduled_start) {
      const calculatedPolicy = calculateCancellationPolicy(booking.scheduled_start, booking.status);
      setPolicy(calculatedPolicy);
    }
  }, [isOpen, booking.scheduled_start, booking.status]);

  // Reset policy when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPolicy(null);
      form.reset();
    }
  }, [isOpen, form.reset]);

  const handleCancel = async () => {
    if (!policy?.canCancel) {
      form.setError(t("errors.cannotCancel"));
      return;
    }

    await form.handleSubmit(
      async (data) =>
        await cancelMutation.mutate({
          bookingId: booking.id,
          reason: data.reason || undefined,
        })
    );
  };

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) {
      return "—";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
    }).format(amount / 100);
  };

  const refundAmount =
    booking.amount_authorized && policy
      ? (booking.amount_authorized * policy.refundPercentage) / 100
      : 0;

  return (
    <FormModal
      cancelLabel={t("buttons.keepBooking")}
      customActions={
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 font-semibold text-[#0f172a] text-base transition hover:border-[#64748b] hover:text-[#64748b] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={form.isSubmitting}
            onClick={onClose}
            type="button"
          >
            {t("buttons.keepBooking")}
          </button>
          {policy?.canCancel && (
            <button
              className="flex-1 rounded-full bg-[#64748b] px-6 py-3 font-semibold text-[#f8fafc] text-base transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={form.isSubmitting}
              onClick={handleCancel}
              type="button"
            >
              {form.isSubmitting ? t("buttons.canceling") : t("buttons.cancelBooking")}
            </button>
          )}
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
      showActions={false}
      size="lg"
      title={t("title")}
    >
      <p className="text-[#94a3b8] text-base">
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
        <div
          className={`mt-6 rounded-2xl border p-6 ${
            policy.canCancel
              ? "border-[#64748b]/30 bg-[#64748b]/5"
              : "border-[#64748b]/30 bg-[#64748b]/10"
          }`}
        >
          <p
            className={`font-semibold text-base ${
              policy.canCancel ? "text-[#64748b]" : "text-[#64748b]"
            }`}
          >
            {policy.reason}
          </p>
          {policy.canCancel && (
            <div className="mt-3 space-y-1 text-[#64748b] text-base">
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
        <summary className="cursor-pointer font-semibold text-[#0f172a] text-base">
          {t("policy.viewPolicy")}
        </summary>
        <pre className="mt-3 whitespace-pre-wrap text-[#94a3b8] text-sm leading-relaxed">
          {getCancellationPolicyDescription()}
        </pre>
      </details>

      {/* Reason Input */}
      {policy?.canCancel && (
        <div className="mt-6">
          <label className="mb-2 block font-semibold text-[#0f172a] text-base" htmlFor="reason">
            {t("form.reasonLabel")}
          </label>
          <textarea
            className="w-full rounded-xl border border-[#e2e8f0] px-4 py-4 text-base shadow-sm focus:border-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#64748b]/20"
            id="reason"
            onChange={(e) => form.updateField("reason", e.target.value)}
            placeholder={t("form.reasonPlaceholder")}
            rows={4}
            value={form.formData.reason}
          />
        </div>
      )}

      {/* Message */}
      {form.message && (
        <div
          className={`mt-6 rounded-2xl p-4 text-base ${
            form.success ? "bg-[#64748b]/10 text-[#64748b]" : "bg-[#64748b]/10 text-[#64748b]"
          }`}
        >
          {form.message}
        </div>
      )}
    </FormModal>
  );
}
