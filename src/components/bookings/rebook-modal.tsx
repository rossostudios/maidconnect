"use client";

import { RefreshIcon } from "hugeicons-react";
import { FormModal } from "@/components/shared/form-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import { useRouter } from "@/i18n/routing";
import type { CustomerBooking } from "./customer-booking-list";

type Props = {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
};

type RebookFormData = {
  scheduled_start: string;
  scheduled_end: string;
};

export function RebookModal({ booking, isOpen, onClose }: Props) {
  const router = useRouter();

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

  const form = useModalForm<RebookFormData>({
    initialData: {
      scheduled_start: defaultDate,
      scheduled_end: booking.duration_minutes
        ? calculateEndTime(defaultDate, booking.duration_minutes)
        : defaultDate,
    },
    resetOnClose: true,
  });

  const rebookMutation = useApiMutation({
    url: "/api/bookings",
    method: "POST",
    refreshOnSuccess: true,
  });

  const handleSubmit = async () => {
    try {
      await rebookMutation.mutate({
        professional_id: booking.professional?.profile_id,
        service_name: booking.service_name,
        duration_minutes: booking.duration_minutes,
        scheduled_start: form.formData.scheduled_start,
        scheduled_end: form.formData.scheduled_end,
      });

      onClose();
      router.push("/dashboard/customer/bookings");
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleStartTimeChange = (value: string) => {
    form.updateField("scheduled_start", value);
    if (booking.duration_minutes) {
      form.updateField("scheduled_end", calculateEndTime(value, booking.duration_minutes));
    }
  };

  return (
    <FormModal
      cancelLabel="Cancel"
      closeOnBackdropClick={!rebookMutation.isLoading}
      closeOnEscape={!rebookMutation.isLoading}
      description="Rebook your service with the same professional"
      isOpen={isOpen}
      isSubmitting={rebookMutation.isLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
      size="lg"
      submitLabel={rebookMutation.isLoading ? "Booking..." : "Confirm Booking"}
      title="Book Again"
    >
      {/* Header Icon */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <RefreshIcon className="h-6 w-6 text-green-600" />
        </div>
      </div>

      {/* Pre-filled Details */}
      <div className="rounded-xl border border-[#ebe5d8] bg-[#fbfafa] p-4">
        <h3 className="mb-3 font-semibold text-[var(--foreground)] text-sm">Service Details</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-[#7a6d62]">Service:</span>{" "}
            <span className="text-[var(--foreground)]">{booking.service_name}</span>
          </p>
          <p>
            <span className="font-medium text-[#7a6d62]">Professional:</span>{" "}
            <span className="text-[var(--foreground)]">{booking.professional?.full_name}</span>
          </p>
          {booking.duration_minutes && (
            <p>
              <span className="font-medium text-[#7a6d62]">Duration:</span>{" "}
              <span className="text-[var(--foreground)]">{booking.duration_minutes} minutes</span>
            </p>
          )}
          {booking.amount_captured && (
            <p>
              <span className="font-medium text-[#7a6d62]">Amount:</span>{" "}
              <span className="text-[var(--foreground)]">
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
      <div>
        <label
          className="mb-2 block font-medium text-[var(--foreground)] text-sm"
          htmlFor="rebook-schedule"
        >
          When would you like to schedule?
        </label>
        <input
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
          id="rebook-schedule"
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          required
          type="datetime-local"
          value={form.formData.scheduled_start}
        />
      </div>

      {/* Error Message */}
      {form.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          {form.error}
        </div>
      )}
    </FormModal>
  );
}
