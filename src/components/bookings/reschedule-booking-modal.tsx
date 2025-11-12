"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/form-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

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

type RescheduleFormData = {
  newDate: string;
  newTime: string;
};

export function RescheduleBookingModal({ isOpen, onClose, booking }: RescheduleBookingModalProps) {
  const t = useTranslations("dashboard.customer.rescheduleBookingModal");

  // Initialize form with current booking date/time
  const getInitialFormData = (): RescheduleFormData => {
    if (booking.scheduled_start) {
      const currentStart = new Date(booking.scheduled_start);
      const dateStr = currentStart.toISOString().split("T")[0] || "";
      const timeStr = currentStart.toTimeString().slice(0, 5);
      return { newDate: dateStr, newTime: timeStr };
    }
    return { newDate: "", newTime: "" };
  };

  const form = useModalForm<RescheduleFormData>({
    initialData: getInitialFormData(),
    resetOnClose: true,
  });

  // Update form data when booking changes
  useEffect(() => {
    if (isOpen && booking.scheduled_start) {
      const currentStart = new Date(booking.scheduled_start);
      const dateStr = currentStart.toISOString().split("T")[0] || "";
      const timeStr = currentStart.toTimeString().slice(0, 5);
      form.setFormData({ newDate: dateStr, newTime: timeStr });
    }
  }, [isOpen, booking.scheduled_start, form.setFormData]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form.reset]);

  const rescheduleMutation = useApiMutation({
    url: "/api/bookings/reschedule",
    method: "POST",
    refreshOnSuccess: true,
  });

  const handleSubmit = async () => {
    const { newDate, newTime } = form.formData;

    // Validation
    if (!(newDate && newTime)) {
      form.setError(t("validation.selectDateTime"));
      return;
    }

    const newScheduledStart = new Date(`${newDate}T${newTime}`).toISOString();

    if (new Date(newScheduledStart) <= new Date()) {
      form.setError(t("validation.futureDateRequired"));
      return;
    }

    try {
      const result = await rescheduleMutation.mutate({
        bookingId: booking.id,
        newScheduledStart,
        newDurationMinutes: booking.duration_minutes,
      });

      toast.success(result.message || t("success.rescheduled"), {
        duration: 5000,
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error.failed"));
    }
  };

  return (
    <FormModal
      cancelLabel={t("buttons.cancel")}
      closeOnBackdropClick={!rescheduleMutation.isLoading}
      closeOnEscape={!rescheduleMutation.isLoading}
      isOpen={isOpen}
      isSubmitting={rescheduleMutation.isLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
      size="md"
      submitLabel={t("buttons.reschedule")}
      title={t("title")}
    >
      <p className="text-[neutral-400] text-base">{booking.service_name || "Service"}</p>

      {/* Current Schedule */}
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-6">
        <p className="font-semibold text-[neutral-400] text-xs uppercase tracking-[0.2em]">
          {t("currentScheduleLabel")}
        </p>
        <p className="mt-2 text-[neutral-900] text-base">
          {booking.scheduled_start
            ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </p>
      </div>

      {/* New Schedule Form */}
      <div className="space-y-6">
        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="newDate"
          >
            {t("newDateLabel")}
          </label>
          <input
            className="w-full rounded-xl border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="newDate"
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => form.updateField("newDate", e.target.value)}
            type="date"
            value={form.formData.newDate}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="newTime"
          >
            {t("newTimeLabel")}
          </label>
          <input
            className="w-full rounded-xl border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="newTime"
            onChange={(e) => form.updateField("newTime", e.target.value)}
            type="time"
            value={form.formData.newTime}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-6">
        <p className="font-semibold text-[neutral-500] text-base">{t("notice.title")}</p>
        <p className="mt-3 text-[neutral-500] text-base leading-relaxed">
          {t("notice.description")}
        </p>
      </div>

      {/* Message */}
      {form.message && (
        <div
          className={`rounded-2xl p-4 text-base ${
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
