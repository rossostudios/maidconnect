"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import type { CustomerBooking } from "../customer-booking-list";

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
      form.setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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
      isOpen={isOpen}
      onClose={onClose}
      title="Book Again"
      description="Rebook your service with the same professional"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={rebookMutation.isLoading ? "Booking..." : "Confirm Booking"}
      cancelLabel="Cancel"
      isSubmitting={rebookMutation.isLoading}
      closeOnBackdropClick={!rebookMutation.isLoading}
      closeOnEscape={!rebookMutation.isLoading}
    >
      {/* Header Icon */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <RefreshCw className="h-6 w-6 text-green-600" />
        </div>
      </div>

      {/* Pre-filled Details */}
      <div className="rounded-xl border border-[#ebe5d8] bg-[#fbfafa] p-4">
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
      <div>
        <label className="mb-2 block font-medium text-[#211f1a] text-sm">
          When would you like to schedule?
        </label>
        <input
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a]/20"
          value={form.formData.scheduled_start}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          required
          type="datetime-local"
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
