"use client";

import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/form-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import type { CustomerBooking } from "./customer-booking-list";

type DisputeModalProps = {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
};

const disputeReasons = [
  { value: "incomplete_service", label: "Service was incomplete or not performed" },
  { value: "quality_issues", label: "Quality of service did not meet expectations" },
  { value: "late_arrival", label: "Professional arrived significantly late" },
  { value: "no_show", label: "Professional did not show up" },
  { value: "property_damage", label: "Damage to property or belongings" },
  { value: "unprofessional_conduct", label: "Unprofessional or inappropriate behavior" },
  { value: "safety_concern", label: "Safety or security concern" },
  { value: "other", label: "Other issue" },
];

/**
 * Dispute Modal Component - REFACTORED
 * Uses new modal primitives and hooks for cleaner, more maintainable code
 */
export function DisputeModal({ booking, isOpen, onClose }: DisputeModalProps) {
  // Form state management with useModalForm hook
  const form = useModalForm({
    initialData: { reason: "", description: "" },
    resetOnClose: true,
  });

  // API mutation with useApiMutation hook
  const submitDispute = useApiMutation({
    url: "/api/bookings/disputes",
    method: "POST",
    onSuccess: () => {
      toast.success("Dispute submitted successfully!", {
        duration: 5000,
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit dispute");
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!form.formData.reason) {
      form.setError("Please select a reason for the dispute");
      return;
    }

    if (!form.formData.description.trim()) {
      form.setError("Please provide a detailed description");
      return;
    }

    // Submit using the form hook's handleSubmit
    await form.handleSubmit(
      async (data) =>
        await submitDispute.mutate({
          bookingId: booking.id,
          reason: data.reason,
          description: data.description.trim(),
        })
    );
  };

  return (
    <FormModal
      customActions={
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg border-2 border-neutral-200 px-6 py-3 font-semibold text-base text-neutral-900 transition hover:border-neutral-900"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-base text-white shadow-sm transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              form.isSubmitting || !form.formData.reason || !form.formData.description.trim()
            }
            onClick={handleSubmit}
            type="button"
          >
            {form.isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
      showActions={false}
      size="2xl"
    >
      {/* Success State */}
      {form.success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-semibold text-green-700">Dispute submitted successfully!</p>
          <p className="mt-2 text-green-600 text-sm">
            Our support team will review your report and contact you within 24 hours.
          </p>
        </div>
      ) : (
        <>
          {/* Header with Icon */}
          <div className="mb-6 flex items-center gap-3">
            <HugeiconsIcon className="h-6 w-6 text-rausch-500" icon={Alert01Icon} />
            <h2 className="font-semibold text-neutral-900 text-xl">Report an Issue</h2>
          </div>

          {/* Info Banner */}
          <div className="rounded-lg border border-babu-200 bg-babu-50 p-4">
            <p className="text-babu-800 text-sm leading-relaxed">
              <span className="font-semibold">48-Hour Protection Period</span> – You have up to 48
              hours after service completion to report any issues. Our team will investigate and
              work with you to resolve the matter fairly.
            </p>
          </div>

          {/* Booking Details */}
          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900 text-sm">Booking Details</p>
            <div className="mt-2 space-y-1 text-neutral-700 text-sm">
              <p>
                <span className="font-medium text-neutral-900">Service:</span>{" "}
                {booking.service_name}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Professional:</span>{" "}
                {booking.professional?.full_name || "N/A"}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Date:</span>{" "}
                {booking.scheduled_start
                  ? new Date(booking.scheduled_start).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mt-6 space-y-2">
            <label
              className="block font-semibold text-neutral-900 text-sm"
              htmlFor="dispute-reason"
            >
              What went wrong? <span className="text-rausch-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
              id="dispute-reason"
              onChange={(e) => form.updateField("reason", e.target.value)}
              value={form.formData.reason}
            >
              <option value="">Select a reason...</option>
              {disputeReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mt-6 space-y-2">
            <label
              className="block font-semibold text-neutral-900 text-sm"
              htmlFor="dispute-description"
            >
              Please describe what happened <span className="text-rausch-500">*</span>
            </label>
            <textarea
              className="min-h-32 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 leading-relaxed transition focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
              id="dispute-description"
              onChange={(e) => form.updateField("description", e.target.value)}
              placeholder="Include specific details about the issue, when it occurred, and any relevant context..."
              value={form.formData.description}
            />
            <p className="text-neutral-500 text-xs">
              Tip: Be as specific as possible. Include photos if you have them (contact support to
              send photos).
            </p>
          </div>

          {/* Error Display */}
          {form.error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-700 text-sm">{form.error}</p>
            </div>
          )}
        </>
      )}
    </FormModal>
  );
}

/**
 * Check if booking is within dispute window (48 hours after completion)
 */
export function isWithinDisputeWindow(
  booking: CustomerBooking,
  completedAt?: string | null
): boolean {
  if (booking.status !== "completed") {
    return false;
  }

  const referenceTime = completedAt || booking.scheduled_start;
  if (!referenceTime) {
    return false;
  }

  const completionDate = new Date(referenceTime);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceCompletion <= 48;
}
