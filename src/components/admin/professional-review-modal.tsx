"use client";

import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";

type ProfessionalInQueue = {
  profile_id: string;
  full_name: string | null;
  status: string;
  bio: string | null;
  primary_services: string[] | null;
  experience_years: number | null;
  rate_expectations: { hourly_cop?: number } | null;
  languages: string[] | null;
  references_data: any[] | null;
  consent_background_check: boolean;
  profile: {
    onboarding_status: string;
    phone: string | null;
    country: string | null;
    city: string | null;
  } | null;
  documents: any[];
  reviews: any[];
};

type Props = {
  professional: ProfessionalInQueue;
  onClose: () => void;
  onComplete: () => void;
};

type ReviewFormData = {
  action: "approve" | "reject" | "request_info";
  notes: string;
  internalNotes: string;
  rejectionReason: string;
  documentsVerified: boolean;
  referencesVerified: boolean;
  backgroundCheckPassed: boolean | undefined;
};

export function ProfessionalReviewModal({ professional, onClose, onComplete }: Props) {
  const form = useModalForm<ReviewFormData>({
    initialData: {
      action: "approve",
      notes: "",
      internalNotes: "",
      rejectionReason: "",
      documentsVerified: false,
      referencesVerified: false,
      backgroundCheckPassed: undefined,
    },
    resetOnClose: true,
  });

  const reviewMutation = useApiMutation({
    url: "/api/admin/professionals/review",
    method: "POST",
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = async () => {
    if (form.formData.action === "reject" && !form.formData.rejectionReason) {
      form.setError("Rejection reason is required");
      return;
    }

    try {
      await reviewMutation.mutate({
        professionalId: professional.profile_id,
        action: form.formData.action,
        notes: form.formData.notes,
        internalNotes: form.formData.internalNotes,
        rejectionReason:
          form.formData.action === "reject" ? form.formData.rejectionReason : undefined,
        documentsVerified: form.formData.documentsVerified,
        referencesVerified: form.formData.referencesVerified,
        backgroundCheckPassed: form.formData.backgroundCheckPassed,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to submit review");
    }
  };

  const formatMoney = (amount?: number) => {
    if (!amount) {
      return "—";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <BaseModal
      closeOnBackdropClick={!reviewMutation.isLoading}
      closeOnEscape={!reviewMutation.isLoading}
      description={professional.full_name || "Unnamed Professional"}
      isOpen={true}
      onClose={onClose}
      size="2xl"
      title="Review Application"
    >
      <div className="space-y-6">
        {/* Professional Details */}
        <section>
          <h3 className="mb-3 font-semibold text-[var(--red)] text-sm uppercase tracking-wide">
            Professional Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Name</div>
              <p className="text-[var(--foreground)] text-sm">{professional.full_name || "—"}</p>
            </div>
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Experience</div>
              <p className="text-[var(--foreground)] text-sm">
                {professional.experience_years ? `${professional.experience_years} years` : "—"}
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Location</div>
              <p className="text-[var(--foreground)] text-sm">
                {professional.profile?.city
                  ? `${professional.profile.city}, ${professional.profile.country}`
                  : "—"}
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Phone</div>
              <p className="text-[var(--foreground)] text-sm">
                {professional.profile?.phone || "—"}
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Hourly Rate</div>
              <p className="text-[var(--foreground)] text-sm">
                {formatMoney(professional.rate_expectations?.hourly_cop)}
              </p>
            </div>
            <div>
              <div className="font-medium text-[var(--label-muted)] text-xs">Languages</div>
              <p className="text-[var(--foreground)] text-sm">
                {professional.languages?.join(", ") || "—"}
              </p>
            </div>
          </div>

          {professional.bio && (
            <div className="mt-4">
              <div className="font-medium text-[var(--label-muted)] text-xs">Bio</div>
              <p className="mt-1 text-[var(--foreground)] text-sm">{professional.bio}</p>
            </div>
          )}

          <div className="mt-4">
            <div className="font-medium text-[var(--label-muted)] text-xs">Services</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {professional.primary_services?.map((service, idx) => (
                <span
                  className="rounded-md bg-[var(--red)]/10 px-2 py-1 font-medium text-[var(--red)] text-xs"
                  key={idx}
                >
                  {service}
                </span>
              )) || <p className="text-[var(--label-muted)] text-sm">None listed</p>}
            </div>
          </div>
        </section>

        {/* References */}
        <section>
          <h3 className="mb-3 font-semibold text-[var(--red)] text-sm uppercase tracking-wide">
            References ({professional.references_data?.length || 0})
          </h3>
          {professional.references_data && professional.references_data.length > 0 ? (
            <div className="space-y-2">
              {professional.references_data.map((ref: any, idx: number) => (
                <div
                  className="rounded-lg border border-[var(--border-light)] bg-[var(--border-lighter)] p-3"
                  key={idx}
                >
                  <p className="font-medium text-[var(--foreground)] text-sm">
                    {ref.name || "Unnamed"}
                  </p>
                  <p className="text-[var(--label-muted)] text-xs">{ref.contact || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--label-muted)] text-sm">No references provided</p>
          )}
        </section>

        {/* Documents */}
        <section>
          <h3 className="mb-3 font-semibold text-[var(--red)] text-sm uppercase tracking-wide">
            Documents ({professional.documents.length})
          </h3>
          {professional.documents.length > 0 ? (
            <div className="space-y-2">
              {professional.documents.map((doc: any) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--border-lighter)] p-3"
                  key={doc.profile_id + doc.document_type}
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)] text-sm">
                      {doc.document_type}
                    </p>
                    <p className="text-[var(--label-muted)] text-xs">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[var(--status-success-text)] text-xs">✓ Uploaded</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--label-muted)] text-sm">No documents uploaded</p>
          )}
        </section>

        {/* Review Form */}
        <section className="rounded-xl border-2 border-[var(--red)]/20 bg-[var(--red)]/5 p-4">
          <h3 className="mb-4 font-semibold text-[var(--red)] text-sm uppercase tracking-wide">
            Review Decision
          </h3>

          {/* Action Selection */}
          <div className="mb-4 flex gap-2">
            <button
              className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                form.formData.action === "approve"
                  ? "border-[var(--status-success-text)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[var(--status-success-bg)]"
              }`}
              onClick={() => form.updateField("action", "approve")}
              type="button"
            >
              ✓ Approve
            </button>
            <button
              className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                form.formData.action === "reject"
                  ? "border-[var(--status-error-text)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[var(--status-error-bg)]"
              }`}
              onClick={() => form.updateField("action", "reject")}
              type="button"
            >
              ✕ Reject
            </button>
            <button
              className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                form.formData.action === "request_info"
                  ? "border-[var(--status-warning-text)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[var(--status-warning-bg)]"
              }`}
              onClick={() => form.updateField("action", "request_info")}
              type="button"
            >
              ? Request Info
            </button>
          </div>

          {/* Verification Checkboxes */}
          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                checked={form.formData.documentsVerified}
                className="rounded"
                onChange={(e) => form.updateField("documentsVerified", e.target.checked)}
                type="checkbox"
              />
              <span className="text-[var(--foreground)] text-sm">Documents verified</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={form.formData.referencesVerified}
                className="rounded"
                onChange={(e) => form.updateField("referencesVerified", e.target.checked)}
                type="checkbox"
              />
              <span className="text-[var(--foreground)] text-sm">References verified</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={form.formData.backgroundCheckPassed === true}
                className="rounded"
                onChange={(e) =>
                  form.updateField("backgroundCheckPassed", e.target.checked ? true : undefined)
                }
                type="checkbox"
              />
              <span className="text-[var(--foreground)] text-sm">Background check passed</span>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <div>
              <label
                className="mb-1 block font-medium text-[var(--foreground)] text-xs"
                htmlFor="review-notes"
              >
                Notes (visible to professional)
              </label>
              <textarea
                className="w-full rounded-lg border border-[var(--border-light)] p-2 text-sm"
                id="review-notes"
                onChange={(e) => form.updateField("notes", e.target.value)}
                placeholder="Optional feedback for the professional..."
                rows={2}
                value={form.formData.notes}
              />
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-[var(--foreground)] text-xs"
                htmlFor="review-internal-notes"
              >
                Internal Notes (admin only)
              </label>
              <textarea
                className="w-full rounded-lg border border-[var(--border-light)] p-2 text-sm"
                id="review-internal-notes"
                onChange={(e) => form.updateField("internalNotes", e.target.value)}
                placeholder="Internal notes not visible to professional..."
                rows={2}
                value={form.formData.internalNotes}
              />
            </div>

            {form.formData.action === "reject" && (
              <div>
                <label
                  className="mb-1 block font-medium text-[var(--status-error-text)] text-xs"
                  htmlFor="rejection-reason"
                >
                  Rejection Reason (required)
                </label>
                <textarea
                  className="w-full rounded-lg border border-[var(--status-error-bg)] p-2 text-sm"
                  id="rejection-reason"
                  onChange={(e) => form.updateField("rejectionReason", e.target.value)}
                  placeholder="Explain why the application is being rejected..."
                  required
                  rows={3}
                  value={form.formData.rejectionReason}
                />
              </div>
            )}
          </div>

          {form.error && (
            <div className="mt-3 rounded-lg border border-[var(--status-error-bg)] bg-[var(--status-error-bg)] p-3">
              <p className="text-[var(--status-error-text)] text-sm">{form.error}</p>
            </div>
          )}
        </section>
      </div>

      {/* Custom Footer Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="rounded-lg border border-[var(--border-light)] px-6 py-2 font-semibold text-[var(--foreground)] text-sm transition hover:bg-[var(--border-lighter)] disabled:opacity-50"
          disabled={reviewMutation.isLoading}
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-[var(--red)] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)] disabled:opacity-50"
          disabled={reviewMutation.isLoading}
          onClick={handleSubmit}
          type="button"
        >
          {(() => {
            if (reviewMutation.isLoading) {
              return "Submitting...";
            }

            let actionText = "Request";
            if (form.formData.action === "approve") {
              actionText = "Approval";
            } else if (form.formData.action === "reject") {
              actionText = "Rejection";
            }

            return `Submit ${actionText}`;
          })()}
        </button>
      </div>
    </BaseModal>
  );
}
