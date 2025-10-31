"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { CustomerBooking } from "./customer-booking-list";

type DisputeModalProps = {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Dispute Modal Component
 * Allows customers to report issues within 48-hour window after service completion
 * Part of Week 3-4 dispute window messaging feature
 */
export function DisputeModal({ booking, isOpen, onClose }: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason for the dispute");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a detailed description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          reason,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit dispute");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[#ebe5d8] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-[#ebe5d8] border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#ff5d46]" />
            <h2 className="font-semibold text-[#211f1a] text-xl">Report an Issue</h2>
          </div>
          <button
            className="text-[#7a6d62] transition hover:text-[#211f1a]"
            onClick={onClose}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <p className="font-semibold text-green-800">Dispute submitted successfully!</p>
              <p className="mt-2 text-green-700 text-sm">
                Our support team will review your report and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="rounded-xl border border-[#e8e4db] bg-[#fbfafa] p-4">
                <p className="text-[#5a5549] text-sm leading-relaxed">
                  <span className="font-semibold text-[#211f1a]">48-Hour Protection Period</span> –
                  You have up to 48 hours after service completion to report any issues. Our team
                  will investigate and work with you to resolve the matter fairly.
                </p>
              </div>

              {/* Booking Details */}
              <div className="rounded-xl border border-[#e8e4db] bg-[#f7f4f0] p-4">
                <p className="font-semibold text-[#211f1a] text-sm">Booking Details</p>
                <div className="mt-2 space-y-1 text-[#5a5549] text-sm">
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
              <div className="space-y-2">
                <label className="block font-semibold text-[#211f1a] text-sm">
                  What went wrong? <span className="text-[#ff5d46]">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-[#e2ddd2] bg-[#fbfafa] px-4 py-3 text-[#211f1a] text-base transition focus:border-[#211f1a] focus:outline-none"
                  onChange={(e) => setReason(e.target.value)}
                  value={reason}
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
              <div className="space-y-2">
                <label className="block font-semibold text-[#211f1a] text-sm">
                  Please describe what happened <span className="text-[#ff5d46]">*</span>
                </label>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-[#e2ddd2] bg-[#fbfafa] px-4 py-3 text-[#211f1a] text-base leading-relaxed transition focus:border-[#211f1a] focus:outline-none"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include specific details about the issue, when it occurred, and any relevant context..."
                  value={description}
                />
                <p className="text-[#7a6d62] text-xs">
                  Tip: Be as specific as possible. Include photos if you have them (contact support
                  to send photos).
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-full border-2 border-[#ebe5d8] px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#211f1a]"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white shadow-[0_4px_12px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting || !reason || !description.trim()}
                  onClick={handleSubmit}
                  type="button"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
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

  // Use completed_at timestamp if available, otherwise fall back to scheduled_start
  const referenceTime = completedAt || booking.scheduled_start;
  if (!referenceTime) {
    return false;
  }

  const completionDate = new Date(referenceTime);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceCompletion <= 48;
}
