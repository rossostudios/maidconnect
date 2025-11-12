"use client";

import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { BackgroundCheckResult } from "@/lib/background-checks/types";

type BackgroundCheckWithProfile = BackgroundCheckResult & {
  professional: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  };
  daysWaiting: number;
};

type BackgroundCheckDetailModalProps = {
  check: BackgroundCheckWithProfile;
  onClose: () => void;
  onComplete: () => void;
};

export function BackgroundCheckDetailModal({
  check,
  onClose,
  onComplete,
}: BackgroundCheckDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/admin/background-checks/${check.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve professional");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process approval");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/admin/background-checks/${check.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Background check findings",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject professional");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process rejection");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 dark:bg-stone-100/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 rounded-lg p-2 text-stone-600 transition-colors hover:bg-white hover:text-stone-900 dark:bg-stone-950 dark:text-stone-100 dark:text-stone-400"
          disabled={isProcessing}
          onClick={onClose}
          type="button"
        >
          <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 dark:bg-stone-950">
              <HugeiconsIcon
                className="h-8 w-8 text-stone-900 dark:text-stone-100"
                icon={SecurityCheckIcon}
              />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
                Background Check Details
              </h2>
              <p className="text-stone-600 text-sm dark:text-stone-400">
                {check.provider.toUpperCase()} • Check ID: {check.providerCheckId}
              </p>
            </div>
          </div>

          {/* Professional Info */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white p-3 dark:bg-stone-950">
                <HugeiconsIcon
                  className="h-6 w-6 text-stone-900 dark:text-stone-100"
                  icon={UserAccountIcon}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
                  {check.professional.full_name || "Unnamed Professional"}
                </h3>
                <p className="text-stone-600 text-sm dark:text-stone-400">
                  {check.professional.email} • {check.professional.phone}
                </p>
                {check.professional.city && check.professional.country && (
                  <p className="text-stone-600 text-sm dark:text-stone-400">
                    {check.professional.city}, {check.professional.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Recommendation */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
            <p className="mb-2 font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Status
            </p>
            <div className="flex items-center gap-2">
              {check.status === "clear" && (
                <HugeiconsIcon
                  className="h-5 w-5 text-stone-900 dark:text-stone-100"
                  icon={CheckmarkCircle02Icon}
                />
              )}
              {check.status === "consider" && (
                <HugeiconsIcon
                  className="h-5 w-5 text-stone-900 dark:text-stone-100"
                  icon={AlertCircleIcon}
                />
              )}
              {check.status === "suspended" && (
                <HugeiconsIcon
                  className="h-5 w-5 text-stone-900 dark:text-stone-100"
                  icon={SecurityCheckIcon}
                />
              )}
              <p className="font-bold text-stone-900 text-xl capitalize dark:text-stone-100">
                {check.status}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
            <p className="mb-2 font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Recommendation
            </p>
            <p className="font-bold text-stone-900 text-xl dark:text-stone-100">
              {check.recommendation === "approved" && "✓ Approve"}
              {check.recommendation === "review_required" && "⚠ Review Required"}
              {check.recommendation === "rejected" && "✗ Reject"}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
            <p className="mb-2 font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Completed
            </p>
            <p className="font-bold text-stone-900 text-xl dark:text-stone-100">
              {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
            </p>
          </div>
        </div>

        {/* Checks Performed */}
        {check.checksPerformed && check.checksPerformed.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
              Checks Performed
            </h3>
            <div className="flex flex-wrap gap-3">
              {check.checksPerformed.map((checkType) => (
                <div
                  className="rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950"
                  key={checkType}
                >
                  <p className="font-medium text-red-700 text-sm dark:text-red-200">
                    {checkType === "criminal" && "Criminal Background Check"}
                    {checkType === "identity" && "Identity Verification"}
                    {checkType === "disciplinary" && "Disciplinary Records Check"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Criminal Records */}
        {check.results.criminal && (
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
              Criminal Background Check
            </h3>
            {check.results.criminal.records.length === 0 ? (
              <div className="rounded-lg border border-stone-900 bg-stone-900 p-6 dark:border-stone-100/40 dark:bg-stone-100/10">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    className="h-6 w-6 text-stone-900 dark:text-stone-100"
                    icon={CheckmarkCircle02Icon}
                  />
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    No criminal records found
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {check.results.criminal.records.map((record, index) => (
                  <div
                    className="rounded-lg border border-stone-900 bg-white p-6 dark:border-stone-100/30 dark:bg-stone-950"
                    key={index}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          className="h-5 w-5 text-stone-900 dark:text-stone-100"
                          icon={AlertCircleIcon}
                        />
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          Record #{index + 1}
                          {record.severity && (
                            <span className="ml-2 rounded bg-stone-900 px-2 py-0.5 text-xs uppercase dark:bg-stone-100/20">
                              {record.severity} severity
                            </span>
                          )}
                        </p>
                      </div>
                      {record.date && (
                        <p className="text-red-700 text-sm dark:text-red-200">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="text-red-700 text-sm dark:text-red-200">{record.description}</p>
                    {record.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer font-medium text-red-700 text-sm dark:text-red-200">
                          View full details
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-white p-3 text-stone-900 text-xs dark:bg-stone-950 dark:text-stone-100">
                          {JSON.stringify(record.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Identity Verification */}
        {check.results.identity && (
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
              Identity Verification
            </h3>
            {check.results.identity.records.length === 0 ? (
              <div className="rounded-lg border border-stone-900 bg-stone-900 p-6 dark:border-stone-100/30 dark:bg-stone-100/5">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    className="h-6 w-6 text-stone-900 dark:text-stone-100"
                    icon={AlertCircleIcon}
                  />
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    Identity not verified
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {check.results.identity.records.map((record, index) => (
                  <div
                    className="rounded-lg border border-stone-900 bg-stone-900 p-6 dark:border-stone-100/40 dark:bg-stone-100/10"
                    key={index}
                  >
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        className="h-5 w-5 text-stone-900 dark:text-stone-100"
                        icon={CheckmarkCircle02Icon}
                      />
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {record.description}
                      </p>
                    </div>
                    {record.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer font-medium text-red-700 text-sm dark:text-red-200">
                          View details
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-white p-3 text-stone-900 text-xs dark:bg-stone-950 dark:text-stone-100">
                          {JSON.stringify(record.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Raw Data */}
        {check.rawData && (
          <div className="mb-8">
            <details>
              <summary className="cursor-pointer font-semibold text-lg text-stone-900 dark:text-stone-100">
                Raw Provider Data
              </summary>
              <div className="mt-4 overflow-auto rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                <pre className="text-stone-900 text-xs dark:text-stone-100">
                  {JSON.stringify(check.rawData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-stone-900 bg-white p-4 dark:border-stone-100/30 dark:bg-stone-950">
            <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {check.status === "consider" && (
          <div className="flex gap-4">
            <button
              className="flex-1 rounded-lg bg-stone-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-stone-900 disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
              disabled={isProcessing}
              onClick={handleApprove}
              type="button"
            >
              <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={CheckmarkCircle02Icon} />
              {isProcessing ? "Processing..." : "Approve Professional"}
            </button>
            <button
              className="flex-1 rounded-lg bg-stone-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-stone-900 disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
              disabled={isProcessing}
              onClick={handleReject}
              type="button"
            >
              <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={Cancel01Icon} />
              {isProcessing ? "Processing..." : "Reject Professional"}
            </button>
          </div>
        )}

        {check.status === "clear" && check.recommendation === "approved" && (
          <div className="rounded-lg border border-stone-900 bg-stone-900 p-6 dark:border-stone-100/40 dark:bg-stone-100/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  className="h-6 w-6 text-stone-900 dark:text-stone-100"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Background check passed. Ready to approve professional.
                </p>
              </div>
              <button
                className="rounded-lg bg-stone-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-stone-900 disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
                disabled={isProcessing}
                onClick={handleApprove}
                type="button"
              >
                {isProcessing ? "Processing..." : "Approve Professional"}
              </button>
            </div>
          </div>
        )}

        {check.status === "suspended" && (
          <div className="rounded-lg border border-stone-900 bg-white p-6 dark:border-stone-100/30 dark:bg-stone-950">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                className="h-6 w-6 text-stone-900 dark:text-stone-100"
                icon={SecurityCheckIcon}
              />
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                This professional has been suspended due to background check findings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
