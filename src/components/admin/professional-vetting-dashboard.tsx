"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic import for modal (lazy load on demand)
const ProfessionalReviewModal = dynamic(
  () => import("./professional-review-modal").then((mod) => mod.ProfessionalReviewModal),
  { ssr: false }
);

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
  stripe_connect_account_id: string | null;
  created_at: string;
  profile: {
    id: string;
    onboarding_status: string;
    phone: string | null;
    country: string | null;
    city: string | null;
    created_at: string;
  } | null;
  documents: any[];
  reviews: any[];
  documentsCount: number;
  latestReview: any | null;
  waitingDays: number;
};

type VettingQueueData = {
  professionals: ProfessionalInQueue[];
  grouped: {
    application_in_review: ProfessionalInQueue[];
    approved: ProfessionalInQueue[];
    application_pending: ProfessionalInQueue[];
  };
  counts: {
    application_in_review: number;
    approved: number;
    application_pending: number;
    total: number;
  };
};

export function ProfessionalVettingDashboard() {
  const [data, setData] = useState<VettingQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalInQueue | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "application_in_review" | "approved" | "application_pending"
  >("application_in_review");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/professionals/queue");

      if (!response.ok) {
        throw new Error("Failed to load vetting queue");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchQueue is intentionally excluded to prevent infinite re-renders
  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReviewComplete = () => {
    setSelectedProfessional(null);
    fetchQueue(); // Refresh the queue
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-lighter)] bg-white/90 p-8 text-center">
        <p className="text-[var(--label-muted)] text-sm">Loading vetting queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--status-error-bg)] bg-[var(--status-error-bg)] p-8 text-center">
        <p className="text-[var(--status-error-text)] text-sm">{error}</p>
        <button
          className="mt-4 rounded-lg bg-[var(--red)] px-4 py-2 font-semibold text-sm text-white hover:bg-[var(--red-hover)]"
          onClick={fetchQueue}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const tabs = [
    {
      key: "application_in_review" as const,
      label: "Needs Review",
      count: data.counts.application_in_review,
      color: "text-[var(--status-warning-text)]",
    },
    {
      key: "approved" as const,
      label: "Approved",
      count: data.counts.approved,
      color: "text-[var(--status-success-text)]",
    },
    {
      key: "application_pending" as const,
      label: "Incomplete",
      count: data.counts.application_pending,
      color: "text-gray-600",
    },
  ];

  const activeProfessionals = data.grouped[activeTab];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-[var(--border-lighter)] border-b">
        {tabs.map((tab) => (
          <button
            className={`relative px-4 py-2 font-semibold text-sm transition ${
              activeTab === tab.key
                ? "border-[var(--red)] border-b-2 text-[var(--red)]"
                : "text-[var(--label-muted)] hover:text-[var(--foreground)]"
            }`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-xs ${tab.color} bg-current/10`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Professional List */}
      {activeProfessionals.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-lighter)] bg-white/90 p-8 text-center">
          <p className="text-[var(--label-muted)] text-sm">No professionals in this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeProfessionals.map((professional) => (
            <div
              className="rounded-xl border border-[var(--border-lighter)] bg-white/90 p-4 shadow-sm transition hover:shadow-md"
              key={professional.profile_id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-[var(--foreground)]">
                      {professional.full_name || "Unnamed Professional"}
                    </h4>
                    <span className="rounded-full bg-[var(--status-info-bg)] px-2 py-0.5 font-semibold text-[var(--status-info-text)] text-xs">
                      Waiting {professional.waitingDays}d
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[var(--label-muted)] text-sm md:grid-cols-4">
                    <div>
                      <span className="font-medium">Services:</span>{" "}
                      {professional.primary_services?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>{" "}
                      {professional.experience_years ? `${professional.experience_years}y` : "—"}
                    </div>
                    <div>
                      <span className="font-medium">Documents:</span> {professional.documentsCount}
                    </div>
                    <div>
                      <span className="font-medium">References:</span>{" "}
                      {professional.references_data?.length || 0}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {professional.consent_background_check && (
                      <span className="rounded-md bg-[var(--status-success-bg)] px-2 py-0.5 text-[var(--status-success-text)] text-xs">
                        ✓ Consent to background check
                      </span>
                    )}
                    {professional.profile?.city && (
                      <span className="rounded-md bg-gray-50 px-2 py-0.5 text-gray-700 text-xs">
                        {professional.profile.city}
                        {professional.profile.country ? `, ${professional.profile.country}` : ""}
                      </span>
                    )}
                    {professional.stripe_connect_account_id && (
                      <span className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-700 text-xs">
                        Stripe Connected
                      </span>
                    )}
                  </div>

                  {professional.latestReview && (
                    <div className="mt-2 rounded-md border border-[var(--border-light)] bg-[var(--border-lighter)] p-2">
                      <p className="text-[var(--label-muted)] text-xs">
                        <span className="font-medium">Latest Review:</span>{" "}
                        {professional.latestReview.status} •{" "}
                        {new Date(professional.latestReview.created_at).toLocaleDateString()}
                      </p>
                      {professional.latestReview.notes && (
                        <p className="mt-1 text-[var(--foreground)] text-xs">
                          {professional.latestReview.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="ml-4 rounded-lg bg-[var(--red)] px-4 py-2 font-semibold text-sm text-white transition hover:bg-[var(--red-hover)]"
                  onClick={() => setSelectedProfessional(professional)}
                  type="button"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedProfessional && (
        <ProfessionalReviewModal
          onClose={() => setSelectedProfessional(null)}
          onComplete={handleReviewComplete}
          professional={selectedProfessional}
        />
      )}
    </div>
  );
}
