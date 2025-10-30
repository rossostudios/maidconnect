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
        <div className="sticky top-0 border-b border-[#f0ece5] bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#211f1a]">
                Review Application
              </h2>
              <p className="mt-1 text-sm text-[#7a6d62]">
                {professional.full_name || "Unnamed Professional"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#7a6d62] transition hover:bg-[#f0ece5]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Professional Details */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ff5d46]">
              Professional Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Name</label>
                <p className="text-sm text-[#211f1a]">{professional.full_name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Experience</label>
                <p className="text-sm text-[#211f1a]">
                  {professional.experience_years
                    ? `${professional.experience_years} years`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Location</label>
                <p className="text-sm text-[#211f1a]">
                  {professional.profile?.city
                    ? `${professional.profile.city}, ${professional.profile.country}`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Phone</label>
                <p className="text-sm text-[#211f1a]">
                  {professional.profile?.phone || "—"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Hourly Rate</label>
                <p className="text-sm text-[#211f1a]">
                  {formatMoney(professional.rate_expectations?.hourly_cop)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#7a6d62]">Languages</label>
                <p className="text-sm text-[#211f1a]">
                  {professional.languages?.join(", ") || "—"}
                </p>
              </div>
            </div>

            {professional.bio && (
              <div className="mt-4">
                <label className="text-xs font-medium text-[#7a6d62]">Bio</label>
                <p className="mt-1 text-sm text-[#211f1a]">{professional.bio}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-medium text-[#7a6d62]">Services</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {professional.primary_services?.map((service, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-[#ff5d46]/10 px-2 py-1 text-xs font-medium text-[#ff5d46]"
                  >
                    {service}
                  </span>
                )) || <p className="text-sm text-[#7a6d62]">None listed</p>}
              </div>
            </div>
          </section>

          {/* References */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ff5d46]">
              References ({professional.references_data?.length || 0})
            </h3>
            {professional.references_data && professional.references_data.length > 0 ? (
              <div className="space-y-2">
                {professional.references_data.map((ref: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3"
                  >
                    <p className="text-sm font-medium text-[#211f1a]">
                      {ref.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-[#7a6d62]">{ref.contact || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7a6d62]">No references provided</p>
            )}
          </section>

          {/* Documents */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ff5d46]">
              Documents ({professional.documents.length})
            </h3>
            {professional.documents.length > 0 ? (
              <div className="space-y-2">
                {professional.documents.map((doc: any) => (
                  <div
                    key={doc.profile_id + doc.document_type}
                    className="flex items-center justify-between rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#211f1a]">
                        {doc.document_type}
                      </p>
                      <p className="text-xs text-[#7a6d62]">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-green-700">✓ Uploaded</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7a6d62]">No documents uploaded</p>
            )}
          </section>

          {/* Review Form */}
          <section className="rounded-xl border-2 border-[#ff5d46]/20 bg-[#ff5d46]/5 p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ff5d46]">
              Review Decision
            </h3>

            {/* Action Selection */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setAction("approve")}
                className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                  action === "approve"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setAction("reject")}
                className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                  action === "reject"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                }`}
              >
                ✕ Reject
              </button>
              <button
                onClick={() => setAction("request_info")}
                className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition ${
                  action === "request_info"
                    ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-yellow-300"
                }`}
              >
                ? Request Info
              </button>
            </div>

            {/* Verification Checkboxes */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={documentsVerified}
                  onChange={(e) => setDocumentsVerified(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[#211f1a]">Documents verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={referencesVerified}
                  onChange={(e) => setReferencesVerified(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[#211f1a]">References verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backgroundCheckPassed === true}
                  onChange={(e) =>
                    setBackgroundCheckPassed(e.target.checked ? true : undefined)
                  }
                  className="rounded"
                />
                <span className="text-sm text-[#211f1a]">Background check passed</span>
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#211f1a]">
                  Notes (visible to professional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[#ebe5d8] p-2 text-sm"
                  placeholder="Optional feedback for the professional..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#211f1a]">
                  Internal Notes (admin only)
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[#ebe5d8] p-2 text-sm"
                  placeholder="Internal notes not visible to professional..."
                />
              </div>

              {action === "reject" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-red-700">
                    Rejection Reason (required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-red-300 p-2 text-sm"
                    placeholder="Explain why the application is being rejected..."
                    required
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-[#f0ece5] bg-white px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[#ebe5d8] px-6 py-2 text-sm font-semibold text-[#211f1a] transition hover:bg-[#f0ece5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-[#ff5d46] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#eb6c65] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : `Submit ${action === "approve" ? "Approval" : action === "reject" ? "Rejection" : "Request"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
