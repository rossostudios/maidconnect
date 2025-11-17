"use client";

import { BaseModal } from "@/components/shared/base-modal";
import { type UseModalFormReturn, useModalForm } from "@/hooks/use";
import { useApiMutation } from "@/hooks/useMutation";

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

  const handleSubmit = useReviewSubmission({
    form,
    professional,
    reviewMutation,
  });

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
        <ProfessionalInfoSection professional={professional} />
        <ProfessionalReferencesSection professional={professional} />
        <ProfessionalDocumentsSection professional={professional} />
        <ReviewDecisionSection form={form} />
      </div>

      <ProfessionalReviewFooter
        action={form.formData.action}
        isLoading={reviewMutation.isLoading}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </BaseModal>
  );
}

type ReviewFormHandle = UseModalFormReturn<ReviewFormData>;
type ReviewMutation = ReturnType<typeof useApiMutation>;

function ProfessionalInfoSection({ professional }: { professional: ProfessionalInQueue }) {
  return (
    <section>
      <h3 className="mb-3 font-semibold text-neutral-800 text-sm uppercase tracking-wide dark:text-neutral-300">
        Professional Information
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoField label="Name" value={professional.full_name || "—"} />
        <InfoField
          label="Experience"
          value={professional.experience_years ? `${professional.experience_years} years` : "—"}
        />
        <InfoField
          label="Location"
          value={
            professional.profile?.city
              ? `${professional.profile.city}, ${professional.profile.country}`
              : "—"
          }
        />
        <InfoField label="Phone" value={professional.profile?.phone || "—"} />
        <InfoField
          label="Hourly Rate"
          value={formatMoney(professional.rate_expectations?.hourly_cop)}
        />
        <InfoField label="Languages" value={professional.languages?.join(", ") || "—"} />
      </div>
      {professional.bio && (
        <div className="mt-4">
          <div className="font-medium text-neutral-600 text-xs dark:text-neutral-300">Bio</div>
          <p className="mt-1 text-neutral-800 text-sm dark:text-neutral-300">{professional.bio}</p>
        </div>
      )}
      <div className="mt-4">
        <div className="font-medium text-neutral-600 text-xs dark:text-neutral-300">Services</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {professional.primary_services?.length ? (
            professional.primary_services.map((service, idx) => (
              <span
                className="bg-neutral-900 px-2 py-1 font-medium text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100"
                key={`${service}-${idx}`}
              >
                {service}
              </span>
            ))
          ) : (
            <p className="text-neutral-600 text-sm dark:text-neutral-300">None listed</p>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-medium text-neutral-600 text-xs dark:text-neutral-300">{label}</div>
      <p className="text-neutral-800 text-sm dark:text-neutral-300">{value}</p>
    </div>
  );
}

function ProfessionalReferencesSection({ professional }: { professional: ProfessionalInQueue }) {
  return (
    <section>
      <h3 className="mb-3 font-semibold text-neutral-800 text-sm uppercase tracking-wide dark:text-neutral-300">
        References ({professional.references_data?.length || 0})
      </h3>
      {professional.references_data && professional.references_data.length > 0 ? (
        <div className="space-y-2">
          {professional.references_data.map((ref: any, idx: number) => (
            <div
              className="border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
              key={`${ref.name}-${idx}`}
            >
              <p className="font-medium text-neutral-800 text-sm dark:text-neutral-300">
                {ref.name || "Unnamed"}
              </p>
              <p className="text-neutral-600 text-xs dark:text-neutral-300">{ref.contact || "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-600 text-sm dark:text-neutral-300">No references provided</p>
      )}
    </section>
  );
}

function ProfessionalDocumentsSection({ professional }: { professional: ProfessionalInQueue }) {
  return (
    <section>
      <h3 className="mb-3 font-semibold text-neutral-800 text-sm uppercase tracking-wide dark:text-neutral-300">
        Documents ({professional.documents.length})
      </h3>
      {professional.documents.length > 0 ? (
        <div className="space-y-2">
          {professional.documents.map((doc: any) => (
            <div
              className="flex items-center justify-between border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
              key={doc.profile_id + doc.document_type}
            >
              <div>
                <p className="font-medium text-neutral-800 text-sm dark:text-neutral-300">
                  {doc.document_type}
                </p>
                <p className="text-neutral-600 text-xs dark:text-neutral-300">
                  Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-neutral-900 text-xs dark:text-neutral-100">✓ Uploaded</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-600 text-sm dark:text-neutral-300">No documents uploaded</p>
      )}
    </section>
  );
}

function ReviewDecisionSection({ form }: { form: ReviewFormHandle }) {
  return (
    <section className="border-2 border-neutral-900 bg-neutral-900 p-4 dark:border-neutral-100/20 dark:bg-neutral-100/5">
      <h3 className="mb-4 font-semibold text-neutral-800 text-sm uppercase tracking-wide dark:text-neutral-300">
        Review Decision
      </h3>
      <ReviewActionButtons action={form.formData.action} updateField={form.updateField} />
      <VerificationChecklist form={form} />
      <ReviewNotesFields form={form} />
      {form.error && (
        <div className="mt-3 border border-neutral-300 bg-neutral-100 p-3 dark:border-red-800 dark:bg-red-950">
          <p className="text-neutral-800 text-sm dark:text-neutral-300">{form.error}</p>
        </div>
      )}
    </section>
  );
}

function ReviewActionButtons({
  action,
  updateField,
}: {
  action: ReviewFormData["action"];
  updateField: ReviewFormHandle["updateField"];
}) {
  const buttons: { label: string; value: ReviewFormData["action"]; prefix: string }[] = [
    { label: "Approve", value: "approve", prefix: "✓" },
    { label: "Reject", value: "reject", prefix: "✕" },
    { label: "Request Info", value: "request_info", prefix: "?" },
  ];

  return (
    <div className="mb-4 flex gap-2">
      {buttons.map((btn) => (
        <button
          className={`flex-1 border-2 px-4 py-2 font-semibold text-sm transition ${
            action === btn.value
              ? "border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-neutral-100"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-900 dark:border-neutral-100/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
          }`}
          key={btn.value}
          onClick={() => updateField("action", btn.value)}
          type="button"
        >
          {btn.prefix} {btn.label}
        </button>
      ))}
    </div>
  );
}

function VerificationChecklist({ form }: { form: ReviewFormHandle }) {
  return (
    <div className="mb-4 space-y-2">
      <label className="flex items-center gap-2">
        <input
          checked={form.formData.documentsVerified}
          onChange={(e) => form.updateField("documentsVerified", e.target.checked)}
          type="checkbox"
        />
        <span className="text-neutral-800 text-sm dark:text-neutral-300">Documents verified</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          checked={form.formData.referencesVerified}
          onChange={(e) => form.updateField("referencesVerified", e.target.checked)}
          type="checkbox"
        />
        <span className="text-neutral-800 text-sm dark:text-neutral-300">References verified</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          checked={form.formData.backgroundCheckPassed === true}
          onChange={(e) =>
            form.updateField("backgroundCheckPassed", e.target.checked ? true : undefined)
          }
          type="checkbox"
        />
        <span className="text-neutral-800 text-sm dark:text-neutral-300">
          Background check passed
        </span>
      </label>
    </div>
  );
}

function ReviewNotesFields({ form }: { form: ReviewFormHandle }) {
  return (
    <div className="space-y-3">
      <div>
        <label
          className="mb-1 block font-medium text-neutral-900 text-xs dark:text-neutral-100"
          htmlFor="review-notes"
        >
          Notes (visible to professional)
        </label>
        <textarea
          className="w-full border border-neutral-200 p-2 text-sm dark:border-neutral-800"
          id="review-notes"
          onChange={(e) => form.updateField("notes", e.target.value)}
          placeholder="Optional feedback for the professional..."
          rows={2}
          value={form.formData.notes}
        />
      </div>
      <div>
        <label
          className="mb-1 block font-medium text-neutral-900 text-xs dark:text-neutral-100"
          htmlFor="review-internal-notes"
        >
          Internal Notes (admin only)
        </label>
        <textarea
          className="w-full border border-neutral-200 p-2 text-sm dark:border-neutral-800"
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
            className="mb-1 block font-medium text-neutral-900 text-xs dark:text-neutral-100"
            htmlFor="rejection-reason"
          >
            Rejection Reason (required)
          </label>
          <textarea
            className="w-full border border-neutral-900 p-2 text-sm dark:border-neutral-100/30"
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
  );
}

function ProfessionalReviewFooter({
  action,
  isLoading,
  onCancel,
  onSubmit,
}: {
  action: ReviewFormData["action"];
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void> | void;
}) {
  const actionLabel = getActionLabel(action);

  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        className="border border-neutral-200 px-6 py-2 font-semibold text-neutral-800 text-sm transition hover:bg-white disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
        disabled={isLoading}
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="bg-neutral-900 px-6 py-2 font-semibold text-sm text-white transition hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950"
        disabled={isLoading}
        onClick={onSubmit}
        type="button"
      >
        {isLoading ? "Submitting..." : `Submit ${actionLabel}`}
      </button>
    </div>
  );
}

function getActionLabel(action: ReviewFormData["action"]) {
  switch (action) {
    case "approve":
      return "Approval";
    case "reject":
      return "Rejection";
    default:
      return "Request";
  }
}

function useReviewSubmission({
  form,
  professional,
  reviewMutation,
}: {
  form: ReviewFormHandle;
  professional: ProfessionalInQueue;
  reviewMutation: ReviewMutation;
}) {
  return async () => {
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
}

function formatMoney(amount?: number) {
  if (!amount) {
    return "—";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}
