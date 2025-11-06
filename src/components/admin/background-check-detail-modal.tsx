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

interface BackgroundCheckDetailModalProps {
  check: BackgroundCheckWithProfile;
  onClose: () => void;
  onComplete: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-2xl">
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 rounded-lg p-2 text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#171717]"
          disabled={isProcessing}
          onClick={onClose}
          type="button"
        >
          <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-[#F5F5F5] p-3">
              <HugeiconsIcon className="h-8 w-8 text-[#171717]" icon={SecurityCheckIcon} />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-[#171717]">Background Check Details</h2>
              <p className="text-[#737373] text-sm">
                {check.provider.toUpperCase()} • Check ID: {check.providerCheckId}
              </p>
            </div>
          </div>

          {/* Professional Info */}
          <div className="rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white p-3">
                <HugeiconsIcon className="h-6 w-6 text-[#171717]" icon={UserAccountIcon} />
              </div>
              <div>
                <h3 className="font-semibold text-[#171717] text-lg">
                  {check.professional.full_name || "Unnamed Professional"}
                </h3>
                <p className="text-[#737373] text-sm">
                  {check.professional.email} • {check.professional.phone}
                </p>
                {check.professional.city && check.professional.country && (
                  <p className="text-[#737373] text-sm">
                    {check.professional.city}, {check.professional.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Recommendation */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
            <p className="mb-2 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              Status
            </p>
            <div className="flex items-center gap-2">
              {check.status === "clear" && (
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle02Icon} />
              )}
              {check.status === "consider" && (
                <HugeiconsIcon className="h-5 w-5 text-yellow-600" icon={AlertCircleIcon} />
              )}
              {check.status === "suspended" && (
                <HugeiconsIcon className="h-5 w-5 text-red-600" icon={SecurityCheckIcon} />
              )}
              <p className="font-bold text-[#171717] text-xl capitalize">{check.status}</p>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
            <p className="mb-2 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              Recommendation
            </p>
            <p className="font-bold text-[#171717] text-xl">
              {check.recommendation === "approved" && "✓ Approve"}
              {check.recommendation === "review_required" && "⚠ Review Required"}
              {check.recommendation === "rejected" && "✗ Reject"}
            </p>
          </div>

          <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
            <p className="mb-2 font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              Completed
            </p>
            <p className="font-bold text-[#171717] text-xl">
              {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
            </p>
          </div>
        </div>

        {/* Checks Performed */}
        {check.checksPerformed && check.checksPerformed.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-[#171717] text-lg">Checks Performed</h3>
            <div className="flex flex-wrap gap-3">
              {check.checksPerformed.map((checkType) => (
                <div
                  className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3"
                  key={checkType}
                >
                  <p className="font-medium text-[#171717] text-sm">
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
            <h3 className="mb-4 font-semibold text-[#171717] text-lg">Criminal Background Check</h3>
            {check.results.criminal.records.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon className="h-6 w-6 text-green-600" icon={CheckmarkCircle02Icon} />
                  <p className="font-semibold text-green-800">No criminal records found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {check.results.criminal.records.map((record, index) => (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6" key={index}>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon className="h-5 w-5 text-red-600" icon={AlertCircleIcon} />
                        <p className="font-semibold text-red-800">
                          Record #{index + 1}
                          {record.severity && (
                            <span className="ml-2 rounded bg-red-200 px-2 py-0.5 text-xs uppercase">
                              {record.severity} severity
                            </span>
                          )}
                        </p>
                      </div>
                      {record.date && (
                        <p className="text-red-700 text-sm">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="text-red-800 text-sm">{record.description}</p>
                    {record.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer font-medium text-red-800 text-sm">
                          View full details
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-white p-3 text-red-900 text-xs">
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
            <h3 className="mb-4 font-semibold text-[#171717] text-lg">Identity Verification</h3>
            {check.results.identity.records.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon className="h-6 w-6 text-yellow-600" icon={AlertCircleIcon} />
                  <p className="font-semibold text-yellow-800">Identity not verified</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {check.results.identity.records.map((record, index) => (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6" key={index}>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        className="h-5 w-5 text-green-600"
                        icon={CheckmarkCircle02Icon}
                      />
                      <p className="font-semibold text-green-800">{record.description}</p>
                    </div>
                    {record.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer font-medium text-green-800 text-sm">
                          View details
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-white p-3 text-green-900 text-xs">
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
              <summary className="cursor-pointer font-semibold text-[#171717] text-lg">
                Raw Provider Data
              </summary>
              <div className="mt-4 overflow-auto rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-4">
                <pre className="text-[#171717] text-xs">
                  {JSON.stringify(check.rawData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {check.status === "consider" && (
          <div className="flex gap-4">
            <button
              className="flex-1 rounded-lg bg-green-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              disabled={isProcessing}
              onClick={handleApprove}
              type="button"
            >
              <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={CheckmarkCircle02Icon} />
              {isProcessing ? "Processing..." : "Approve Professional"}
            </button>
            <button
              className="flex-1 rounded-lg bg-red-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HugeiconsIcon className="h-6 w-6 text-green-600" icon={CheckmarkCircle02Icon} />
                <p className="font-semibold text-green-800">
                  Background check passed. Ready to approve professional.
                </p>
              </div>
              <button
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50"
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <HugeiconsIcon className="h-6 w-6 text-red-600" icon={SecurityCheckIcon} />
              <p className="font-semibold text-red-800">
                This professional has been suspended due to background check findings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
