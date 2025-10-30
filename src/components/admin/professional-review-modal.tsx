"use client";

import { useState } from "react";

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

export function ProfessionalReviewModal({ professional, onClose, onComplete }: Props) {
  const [action, setAction] = useState<"approve" | "reject" | "request_info">("approve");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentsVerified, setDocumentsVerified] = useState(false);
  const [referencesVerified, setReferencesVerified] = useState(false);
  const [backgroundCheckPassed, setBackgroundCheckPassed] = useState<boolean | undefined>(
    undefined
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (action === "reject" && !rejectionReason) {
      setError("Rejection reason is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/professionals/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.profile_id,
          action,
          notes,
          internalNotes,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
          documentsVerified,
          referencesVerified,
          backgroundCheckPassed,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit review");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 border-[#f0ece5] border-b bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-[#211f1a] text-xl">Review Application</h2>
              <p className="mt-1 text-[#7a6d62] text-sm">
                {professional.full_name || "Unnamed Professional"}
              </p>
            </div>
            <button
              className="rounded-lg p-2 text-[#7a6d62] transition hover:bg-[#f0ece5]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Professional Details */}
          <section>
            <h3 className="mb-3 font-semibold text-[#ff5d46] text-sm uppercase tracking-wide">
              Professional Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Name</label>
                <p className="text-[#211f1a] text-sm">{professional.full_name || "—"}</p>
              </div>
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Experience</label>
                <p className="text-[#211f1a] text-sm">
                  {professional.experience_years ? `${professional.experience_years} years` : "—"}
                </p>
              </div>
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Location</label>
                <p className="text-[#211f1a] text-sm">
                  {professional.profile?.city
                    ? `${professional.profile.city}, ${professional.profile.country}`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Phone</label>
                <p className="text-[#211f1a] text-sm">{professional.profile?.phone || "—"}</p>
              </div>
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Hourly Rate</label>
                <p className="text-[#211f1a] text-sm">
                  {formatMoney(professional.rate_expectations?.hourly_cop)}
                </p>
              </div>
              <div>
                <label className="font-medium text-[#7a6d62] text-xs">Languages</label>
                <p className="text-[#211f1a] text-sm">
                  {professional.languages?.join(", ") || "—"}
                </p>
              </div>
            </div>

            {professional.bio && (
              <div className="mt-4">
                <label className="font-medium text-[#7a6d62] text-xs">Bio</label>
                <p className="mt-1 text-[#211f1a] text-sm">{professional.bio}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="font-medium text-[#7a6d62] text-xs">Services</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {professional.primary_services?.map((service, idx) => (
                  <span
                    className="rounded-md bg-[#ff5d46]/10 px-2 py-1 font-medium text-[#ff5d46] text-xs"
                    key={idx}
                  >
                    {service}
                  </span>
                )) || <p className="text-[#7a6d62] text-sm">None listed</p>}
              </div>
            </div>
          </section>

          {/* References */}
          <section>
            <h3 className="mb-3 font-semibold text-[#ff5d46] text-sm uppercase tracking-wide">
              References ({professional.references_data?.length || 0})
            </h3>
            {professional.references_data && professional.references_data.length > 0 ? (
              <div className="space-y-2">
                {professional.references_data.map((ref: any, idx: number) => (
                  <div className="rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3" key={idx}>
                    <p className="font-medium text-[#211f1a] text-sm">{ref.name || "Unnamed"}</p>
                    <p className="text-[#7a6d62] text-xs">{ref.contact || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#7a6d62] text-sm">No references provided</p>
            )}
          </section>

          {/* Documents */}
          <section>
            <h3 className="mb-3 font-semibold text-[#ff5d46] text-sm uppercase tracking-wide">
              Documents ({professional.documents.length})
            </h3>
            {professional.documents.length > 0 ? (
              <div className="space-y-2">
                {professional.documents.map((doc: any) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3"
                    key={doc.profile_id + doc.document_type}
                  >
                    <div>
                      <p className="font-medium text-[#211f1a] text-sm">{doc.document_type}</p>
                      <p className="text-[#7a6d62] text-xs">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-700 text-xs">✓ Uploaded</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#7a6d62] text-sm">No documents uploaded</p>
            )}
          </section>

          {/* Review Form */}
          <section className="rounded-xl border-2 border-[#ff5d46]/20 bg-[#ff5d46]/5 p-4">
            <h3 className="mb-4 font-semibold text-[#ff5d46] text-sm uppercase tracking-wide">
              Review Decision
            </h3>

            {/* Action Selection */}
            <div className="mb-4 flex gap-2">
              <button
                className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                  action === "approve"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                }`}
                onClick={() => setAction("approve")}
              >
                ✓ Approve
              </button>
              <button
                className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                  action === "reject"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                }`}
                onClick={() => setAction("reject")}
              >
                ✕ Reject
              </button>
              <button
                className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition ${
                  action === "request_info"
                    ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-yellow-300"
                }`}
                onClick={() => setAction("request_info")}
              >
                ? Request Info
              </button>
            </div>

            {/* Verification Checkboxes */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  checked={documentsVerified}
                  className="rounded"
                  onChange={(e) => setDocumentsVerified(e.target.checked)}
                  type="checkbox"
                />
                <span className="text-[#211f1a] text-sm">Documents verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={referencesVerified}
                  className="rounded"
                  onChange={(e) => setReferencesVerified(e.target.checked)}
                  type="checkbox"
                />
                <span className="text-[#211f1a] text-sm">References verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={backgroundCheckPassed === true}
                  className="rounded"
                  onChange={(e) => setBackgroundCheckPassed(e.target.checked ? true : undefined)}
                  type="checkbox"
                />
                <span className="text-[#211f1a] text-sm">Background check passed</span>
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-medium text-[#211f1a] text-xs">
                  Notes (visible to professional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-[#ebe5d8] p-2 text-sm"
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional feedback for the professional..."
                  rows={2}
                  value={notes}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-[#211f1a] text-xs">
                  Internal Notes (admin only)
                </label>
                <textarea
                  className="w-full rounded-lg border border-[#ebe5d8] p-2 text-sm"
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes not visible to professional..."
                  rows={2}
                  value={internalNotes}
                />
              </div>

              {action === "reject" && (
                <div>
                  <label className="mb-1 block font-medium text-red-700 text-xs">
                    Rejection Reason (required)
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-red-300 p-2 text-sm"
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the application is being rejected..."
                    required
                    rows={3}
                    value={rejectionReason}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-[#f0ece5] border-t bg-white px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-[#ebe5d8] px-6 py-2 font-semibold text-[#211f1a] text-sm transition hover:bg-[#f0ece5] disabled:opacity-50"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-[#ff5d46] px-6 py-2 font-semibold text-sm text-white transition hover:bg-[#eb6c65] disabled:opacity-50"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? "Submitting..."
                : `Submit ${action === "approve" ? "Approval" : action === "reject" ? "Rejection" : "Request"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
