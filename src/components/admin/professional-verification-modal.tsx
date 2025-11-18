"use client";

import { useState } from "react";
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

type Props = {
  userId: string;
  userName: string | null;
  onClose: () => void;
  onComplete: () => void;
};

type VerificationFormData = {
  approved: boolean;
  reason: string;
  identityVerified: boolean;
  backgroundCheckPassed: boolean;
  documentsVerified: boolean;
  skillsAssessed: boolean;
  notes: string;
};

export function ProfessionalVerificationModal({ userId, userName, onClose, onComplete }: Props) {
  const [step, setStep] = useState<"review" | "decision">("review");

  const form = useModalForm<VerificationFormData>({
    initialData: {
      approved: true,
      reason: "",
      identityVerified: false,
      backgroundCheckPassed: false,
      documentsVerified: false,
      skillsAssessed: false,
      notes: "",
    },
    resetOnClose: true,
  });

  const verificationMutation = useApiMutation({
    url: `/api/admin/users/${userId}/verify`,
    method: "POST",
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = async () => {
    // Validate checklist items if approving
    if (
      form.formData.approved &&
      !(
        form.formData.identityVerified &&
        form.formData.backgroundCheckPassed &&
        form.formData.documentsVerified &&
        form.formData.skillsAssessed
      )
    ) {
      form.setError("All verification checklist items must be completed to approve");
      return;
    }

    // Validate reason if rejecting
    if (!(form.formData.approved || form.formData.reason)) {
      form.setError("Reason is required when rejecting verification");
      return;
    }

    try {
      await verificationMutation.mutate({
        approved: form.formData.approved,
        reason: form.formData.reason,
        notes: form.formData.notes,
        checklist: {
          identityVerified: form.formData.identityVerified,
          backgroundCheckPassed: form.formData.backgroundCheckPassed,
          documentsVerified: form.formData.documentsVerified,
          skillsAssessed: form.formData.skillsAssessed,
        },
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to process verification");
    }
  };

  return (
    <BaseModal
      description={`Review and verify professional credentials for ${userName || "User"}`}
      isOpen={true}
      onClose={onClose}
      size="xl"
      title="Professional Verification"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <button
            className={
              "type-ui-sm flex-1 rounded-lg px-4 py-2 font-medium transition" +
              (step === "review"
                ? "border border-neutral-900 bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-700")
            }
            onClick={() => setStep("review")}
            type="button"
          >
            1. Review Checklist
          </button>
          <button
            className={
              "type-ui-sm flex-1 rounded-lg px-4 py-2 font-medium transition" +
              (step === "decision"
                ? "border border-neutral-900 bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-700")
            }
            onClick={() => setStep("decision")}
            type="button"
          >
            2. Decision
          </button>
        </div>

        {/* Review Checklist Step */}
        {step === "review" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="type-ui-md mb-4 font-medium text-neutral-900">
                Verification Checklist
              </h3>
              <p className="type-body-sm mb-6 text-neutral-700">
                Complete all verification steps before approving this professional.
              </p>

              <div className="space-y-4">
                {/* Identity Verification */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      checked={form.formData.identityVerified}
                      className="mt-1 h-5 w-5 border-neutral-200 focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => form.updateField("identityVerified", e.target.checked)}
                      type="checkbox"
                    />
                    <div className="flex-1">
                      <p className="type-ui-sm font-medium text-neutral-900">
                        Identity Verification
                      </p>
                      <p className="type-body-sm mt-1 text-neutral-600">
                        Government-issued ID verified and selfie photo matches
                      </p>
                    </div>
                  </label>
                </div>

                {/* Background Check */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      checked={form.formData.backgroundCheckPassed}
                      className="mt-1 h-5 w-5 border-neutral-200 focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => form.updateField("backgroundCheckPassed", e.target.checked)}
                      type="checkbox"
                    />
                    <div className="flex-1">
                      <p className="type-ui-sm font-medium text-neutral-900">
                        Background Check Status
                      </p>
                      <p className="type-body-sm mt-1 text-neutral-600">
                        Criminal background check completed with no major issues
                      </p>
                    </div>
                  </label>
                </div>

                {/* Documents Verified */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      checked={form.formData.documentsVerified}
                      className="mt-1 h-5 w-5 border-neutral-200 focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => form.updateField("documentsVerified", e.target.checked)}
                      type="checkbox"
                    />
                    <div className="flex-1">
                      <p className="type-ui-sm font-medium text-neutral-900">
                        Documents & Certifications
                      </p>
                      <p className="type-body-sm mt-1 text-neutral-600">
                        Professional licenses, certifications, and insurance documents verified
                      </p>
                    </div>
                  </label>
                </div>

                {/* Skills Assessment */}
                <div className="rounded-lg border border-neutral-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      checked={form.formData.skillsAssessed}
                      className="mt-1 h-5 w-5 border-neutral-200 focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => form.updateField("skillsAssessed", e.target.checked)}
                      type="checkbox"
                    />
                    <div className="flex-1">
                      <p className="type-ui-sm font-medium text-neutral-900">Skills Assessment</p>
                      <p className="type-body-sm mt-1 text-neutral-600">
                        Professional skills and experience validated through interview or portfolio
                        review
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <button
                className="type-ui-sm rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-800"
                onClick={() => setStep("decision")}
                type="button"
              >
                Continue to Decision
              </button>
            </div>
          </div>
        )}

        {/* Decision Step */}
        {step === "decision" && (
          <div className="space-y-6">
            {/* Checklist Summary */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="type-ui-sm mb-2 font-medium text-neutral-900">Checklist Summary:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      form.formData.identityVerified ? "text-green-600" : "text-neutral-400"
                    }
                  >
                    {form.formData.identityVerified ? "✓" : "○"}
                  </span>
                  <span className="type-body-sm text-neutral-700">Identity Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      form.formData.backgroundCheckPassed ? "text-green-600" : "text-neutral-400"
                    }
                  >
                    {form.formData.backgroundCheckPassed ? "✓" : "○"}
                  </span>
                  <span className="type-body-sm text-neutral-700">Background Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      form.formData.documentsVerified ? "text-green-600" : "text-neutral-400"
                    }
                  >
                    {form.formData.documentsVerified ? "✓" : "○"}
                  </span>
                  <span className="type-body-sm text-neutral-700">Documents Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={form.formData.skillsAssessed ? "text-green-600" : "text-neutral-400"}
                  >
                    {form.formData.skillsAssessed ? "✓" : "○"}
                  </span>
                  <span className="type-body-sm text-neutral-700">Skills Assessed</span>
                </div>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
                Verification Decision
              </label>
              <div className="flex gap-3">
                <button
                  className={
                    "type-ui-sm flex-1 rounded-lg border-2 px-4 py-3 font-medium transition" +
                    (form.formData.approved
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900")
                  }
                  onClick={() => form.updateField("approved", true)}
                  type="button"
                >
                  ✓ Approve Verification
                </button>
                <button
                  className={
                    "type-ui-sm flex-1 rounded-lg border-2 px-4 py-3 font-medium transition" +
                    (form.formData.approved
                      ? "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900"
                      : "border-red-600 bg-red-50 text-red-700")
                  }
                  onClick={() => form.updateField("approved", false)}
                  type="button"
                >
                  ✕ Reject Verification
                </button>
              </div>
            </div>

            {/* Reason (required for rejection) */}
            {!form.formData.approved && (
              <div>
                <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => form.updateField("reason", e.target.value)}
                  placeholder="Explain why this professional cannot be verified at this time..."
                  rows={4}
                  value={form.formData.reason}
                />
              </div>
            )}

            {/* Additional Notes (optional) */}
            <div>
              <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
                Additional Notes (optional)
              </label>
              <textarea
                className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => form.updateField("notes", e.target.value)}
                placeholder="Any additional context or observations..."
                rows={3}
                value={form.formData.notes}
              />
            </div>

            {/* Error Display */}
            {form.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="type-body-sm text-red-700">{form.error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 border-neutral-200 border-t pt-6">
              <button
                className="type-ui-sm flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-900 transition hover:bg-neutral-50"
                onClick={() => setStep("review")}
                type="button"
              >
                ← Back to Checklist
              </button>
              <button
                className="type-ui-sm rounded-lg border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={verificationMutation.isLoading}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className={
                  "type-ui-sm flex-1 rounded-lg px-6 py-3 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50" +
                  (form.formData.approved
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700")
                }
                disabled={verificationMutation.isLoading}
                onClick={handleSubmit}
                type="button"
              >
                {verificationMutation.isLoading
                  ? "Processing..."
                  : form.formData.approved
                    ? "Approve Professional"
                    : "Reject Verification"}
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
