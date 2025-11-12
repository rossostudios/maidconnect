"use client";

import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use";
import { useApiMutation } from "@/hooks/useMutation";
import type { CustomerBooking } from "./CustomerBooking";

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
            className="flex-1 rounded-full border-2 border-[#e2e8f0] px-6 py-3 font-semibold text-[#0f172a] text-base transition hover:border-[#0f172a]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-full bg-[#64748b] px-6 py-3 font-semibold text-[#f8fafc] text-base shadow-[0_4px_12px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-xl border border-[#64748b]/40 bg-[#64748b]/10 p-6 text-center">
          <p className="font-semibold text-[#64748b]">Dispute submitted successfully!</p>
          <p className="mt-2 text-[#64748b] text-sm">
            Our support team will review your report and contact you within 24 hours.
          </p>
        </div>
      ) : (
        <>
          {/* Header with Icon */}
          <div className="mb-6 flex items-center gap-3">
            <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={Alert01Icon} />
            <h2 className="font-semibold text-[#0f172a] text-xl">Report an Issue</h2>
          </div>

          {/* Info Banner */}
          <div className="rounded-xl border border-[#f8fafc] bg-[#f8fafc] p-4">
            <p className="text-[#0f172a] text-sm leading-relaxed">
              <span className="font-semibold text-[#0f172a]">48-Hour Protection Period</span> – You
              have up to 48 hours after service completion to report any issues. Our team will
              investigate and work with you to resolve the matter fairly.
            </p>
          </div>

          {/* Booking Details */}
          <div className="mt-6 rounded-xl border border-[#f8fafc] bg-[#f8fafc] p-4">
            <p className="font-semibold text-[#0f172a] text-sm">Booking Details</p>
            <div className="mt-2 space-y-1 text-[#0f172a] text-sm">
              <p>
                <span className="font-medium">Service:</span> {booking.service_name}
              </p>
              <p>
                <span className="font-medium">Professional:</span>{" "}
                {booking.professional?.full_name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
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
            <label className="block font-semibold text-[#0f172a] text-sm" htmlFor="dispute-reason">
              What went wrong? <span className="text-[#64748b]">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] text-base transition focus:border-[#0f172a] focus:outline-none"
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
              className="block font-semibold text-[#0f172a] text-sm"
              htmlFor="dispute-description"
            >
              Please describe what happened <span className="text-[#64748b]">*</span>
            </label>
            <textarea
              className="min-h-32 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] text-base leading-relaxed transition focus:border-[#0f172a] focus:outline-none"
              id="dispute-description"
              onChange={(e) => form.updateField("description", e.target.value)}
              placeholder="Include specific details about the issue, when it occurred, and any relevant context..."
              value={form.formData.description}
            />
            <p className="text-[#94a3b8] text-xs">
              Tip: Be as specific as possible. Include photos if you have them (contact support to
              send photos).
            </p>
          </div>

          {/* Error Display */}
          {form.error && (
            <div className="mt-6 rounded-xl border border-[#64748b]/30 bg-[#64748b]/10 p-4">
              <p className="text-[#64748b] text-sm">{form.error}</p>
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
