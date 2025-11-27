"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use";
import { useApiMutation } from "@/hooks/useMutation";
import {
  calculateCancellationPolicy,
  getCancellationPolicyDescription,
} from "@/lib/cancellationPolicy";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";

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
    return formatFromMinorUnits(amount, (currency || "COP") as Currency);
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
            className="flex-1 border-2 border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-900] text-base transition hover:border-[neutral-500] hover:text-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={form.isSubmitting}
            onClick={onClose}
            type="button"
          >
            {t("buttons.keepBooking")}
          </button>
          {policy?.canCancel && (
            <button
              className="flex-1 bg-[neutral-500] px-6 py-3 font-semibold text-[neutral-50] text-base transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
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
      <p className="text-[neutral-400] text-base">
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
          className={`mt-6 border p-6 ${
            policy.canCancel
              ? "border-[neutral-500]/30 bg-[neutral-500]/5"
              : "border-[neutral-500]/30 bg-[neutral-500]/10"
          }`}
        >
          <p
            className={`font-semibold text-base ${
              policy.canCancel ? "text-[neutral-500]" : "text-[neutral-500]"
            }`}
          >
            {policy.reason}
          </p>
          {policy.canCancel && (
            <div className="mt-3 space-y-1 text-[neutral-500] text-base">
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
        <summary className="cursor-pointer font-semibold text-[neutral-900] text-base">
          {t("policy.viewPolicy")}
        </summary>
        <pre className="mt-3 whitespace-pre-wrap text-[neutral-400] text-sm leading-relaxed">
          {getCancellationPolicyDescription()}
        </pre>
      </details>

      {/* Reason Input */}
      {policy?.canCancel && (
        <div className="mt-6">
          <label className="mb-2 block font-semibold text-[neutral-900] text-base" htmlFor="reason">
            {t("form.reasonLabel")}
          </label>
          <textarea
            className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
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
          className={`mt-6 p-4 text-base ${
            form.success
              ? "bg-[neutral-500]/10 text-[neutral-500]"
              : "bg-[neutral-500]/10 text-[neutral-500]"
          }`}
        >
          {form.message}
        </div>
      )}
    </FormModal>
  );
}
