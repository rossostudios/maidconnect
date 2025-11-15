"use client";

import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useCallback, useState } from "react";
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

type CheckDetailProps = {
  check: BackgroundCheckWithProfile;
  onClose: () => void;
  onComplete: () => void;
};

export function CheckDetail({ check, onClose, onComplete }: CheckDetailProps) {
  const { error, handleApprove, handleReject, isProcessing } = useCheckDetailActions({
    checkId: check.id,
    onComplete,
  });

  return (
    <ModalOverlay>
      <CheckDetailHeader check={check} isProcessing={isProcessing} onClose={onClose} />
      <div className="space-y-8">
        <CheckSummaryGrid check={check} />
        <ChecksPerformedSection checks={check.checksPerformed} />
        <CriminalRecordsSection records={check.results.criminal} />
        <IdentityVerificationSection records={check.results.identity} />
        <RawDataSection data={check.rawData} />
      </div>
      <CheckDetailError message={error} />
      <CheckDetailActions
        check={check}
        isProcessing={isProcessing}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </ModalOverlay>
  );
}

function useCheckDetailActions({
  checkId,
  onComplete,
}: {
  checkId: string;
  onComplete: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(
    async (action: "approve" | "reject", body?: Record<string, unknown>) => {
      try {
        setIsProcessing(true);
        setError(null);

        const response = await fetch(`/api/admin/background-checks/${checkId}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || `Failed to ${action} professional`);
        }

        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process request");
      } finally {
        setIsProcessing(false);
      }
    },
    [checkId, onComplete]
  );

  return {
    isProcessing,
    error,
    handleApprove: () => performAction("approve"),
    handleReject: () =>
      performAction("reject", {
        reason: "Background check findings",
      }),
  };
}

function ModalOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 dark:bg-neutral-100/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto border border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}

function CheckDetailHeader({
  check,
  isProcessing,
  onClose,
}: {
  check: BackgroundCheckWithProfile;
  isProcessing: boolean;
  onClose: () => void;
}) {
  return (
    <div className="mb-8">
      <button
        className="absolute top-6 right-6 p-2 text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
        disabled={isProcessing}
        onClick={onClose}
        type="button"
      >
        <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
      </button>
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-white p-3 dark:bg-neutral-950">
          <HugeiconsIcon
            className="h-8 w-8 text-neutral-900 dark:text-neutral-100"
            icon={SecurityCheckIcon}
          />
        </div>
        <div>
          <h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Background Check Details
          </h2>
          <p className="text-neutral-600 text-sm dark:text-neutral-400">
            {check.provider.toUpperCase()} • Check ID: {check.providerCheckId}
          </p>
        </div>
      </div>
      <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 dark:bg-neutral-950">
            <HugeiconsIcon
              className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
              icon={UserAccountIcon}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
              {check.professional.full_name || "Unnamed Professional"}
            </h3>
            <p className="text-neutral-600 text-sm dark:text-neutral-400">
              {check.professional.email} • {check.professional.phone}
            </p>
            {check.professional.city && check.professional.country && (
              <p className="text-neutral-600 text-sm dark:text-neutral-400">
                {check.professional.city}, {check.professional.country}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckSummaryGrid({ check }: { check: BackgroundCheckWithProfile }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SummaryCard label="Status">
        <div className="flex items-center gap-2">
          <StatusIcon status={check.status} />
          <p className="font-bold text-neutral-900 text-xl capitalize dark:text-neutral-100">
            {check.status}
          </p>
        </div>
      </SummaryCard>
      <SummaryCard label="Recommendation">
        <p className="font-bold text-neutral-900 text-xl dark:text-neutral-100">
          {check.recommendation === "approved" && "✓ Approve"}
          {check.recommendation === "review_required" && "⚠ Review Required"}
          {check.recommendation === "rejected" && "✗ Reject"}
        </p>
      </SummaryCard>
      <SummaryCard label="Completed">
        <p className="font-bold text-neutral-900 text-xl dark:text-neutral-100">
          {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
        </p>
      </SummaryCard>
    </div>
  );
}

function SummaryCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="mb-2 font-semibold text-neutral-600 text-xs uppercase tracking-wider dark:text-neutral-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "clear") {
    return (
      <HugeiconsIcon
        className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
        icon={CheckmarkCircle02Icon}
      />
    );
  }

  if (status === "consider") {
    return (
      <HugeiconsIcon
        className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
        icon={AlertCircleIcon}
      />
    );
  }

  if (status === "suspended") {
    return (
      <HugeiconsIcon
        className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
        icon={SecurityCheckIcon}
      />
    );
  }

  return null;
}

function ChecksPerformedSection({
  checks,
}: {
  checks: BackgroundCheckWithProfile["checksPerformed"];
}) {
  if (!checks || checks.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 dark:text-neutral-100">
        Checks Performed
      </h3>
      <div className="flex flex-wrap gap-3">
        {checks.map((checkType) => (
          <div
            className="border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950"
            key={checkType}
          >
            <p className="font-medium text-neutral-800 text-sm dark:text-neutral-300">
              {checkType === "criminal" && "Criminal Background Check"}
              {checkType === "identity" && "Identity Verification"}
              {checkType === "disciplinary" && "Disciplinary Records Check"}
              {!["criminal", "identity", "disciplinary"].includes(checkType) && checkType}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

type CheckRecord = BackgroundCheckResult["results"]["criminal"] | undefined;

function CriminalRecordsSection({ records }: { records: CheckRecord }) {
  if (!records) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 dark:text-neutral-100">
        Criminal Background Check
      </h3>
      {records.records.length === 0 ? (
        <div className="border border-neutral-900 bg-neutral-900 p-6 dark:border-neutral-100/40 dark:bg-neutral-100/10">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
              icon={CheckmarkCircle02Icon}
            />
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              No criminal records found
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {records.records.map((record, index) => (
            <div
              className="border border-neutral-900 bg-white p-6 dark:border-neutral-100/30 dark:bg-neutral-950"
              key={`${record.description}-${index}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
                    icon={AlertCircleIcon}
                  />
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Record #{index + 1}
                    {record.severity && (
                      <span className="ml-2 bg-neutral-900 px-2 py-0.5 text-xs uppercase dark:bg-neutral-100/20">
                        {record.severity} severity
                      </span>
                    )}
                  </p>
                </div>
                {record.date && (
                  <p className="text-neutral-800 text-sm dark:text-neutral-300">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <p className="text-neutral-800 text-sm dark:text-neutral-300">{record.description}</p>
              {record.details && (
                <RecordDetails details={record.details} summary="View full details" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type IdentityRecord = BackgroundCheckResult["results"]["identity"] | undefined;

function IdentityVerificationSection({ records }: { records: IdentityRecord }) {
  if (!records) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 dark:text-neutral-100">
        Identity Verification
      </h3>
      {records.records.length === 0 ? (
        <div className="border border-neutral-900 bg-neutral-900 p-6 dark:border-neutral-100/30 dark:bg-neutral-100/5">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
              icon={AlertCircleIcon}
            />
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Identity not verified
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {records.records.map((record, index) => (
            <div
              className="border border-neutral-900 bg-neutral-900 p-6 dark:border-neutral-100/40 dark:bg-neutral-100/10"
              key={`${record.description}-${index}`}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {record.description}
                </p>
              </div>
              {record.details && <RecordDetails details={record.details} summary="View details" />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecordDetails({ details, summary }: { details: unknown; summary: string }) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer font-medium text-neutral-800 text-sm dark:text-neutral-300">
        {summary}
      </summary>
      <pre className="mt-2 overflow-auto bg-white p-3 text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100">
        {JSON.stringify(details, null, 2)}
      </pre>
    </details>
  );
}

function RawDataSection({ data }: { data: BackgroundCheckResult["rawData"] }) {
  if (!data) {
    return null;
  }

  return (
    <section>
      <details>
        <summary className="cursor-pointer font-semibold text-lg text-neutral-900 dark:text-neutral-100">
          Raw Provider Data
        </summary>
        <div className="mt-4 overflow-auto border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <pre className="text-neutral-900 text-xs dark:text-neutral-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </details>
    </section>
  );
}

function CheckDetailError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="border border-neutral-900 bg-white p-4 dark:border-neutral-100/30 dark:bg-neutral-950">
      <p className="text-neutral-800 text-sm dark:text-neutral-300">{message}</p>
    </div>
  );
}

function CheckDetailActions({
  check,
  isProcessing,
  onApprove,
  onReject,
}: {
  check: BackgroundCheckWithProfile;
  isProcessing: boolean;
  onApprove: () => Promise<void> | void;
  onReject: () => Promise<void> | void;
}) {
  if (check.status === "consider") {
    return (
      <div className="flex gap-4">
        <ActionButton
          icon={CheckmarkCircle02Icon}
          isProcessing={isProcessing}
          label="Approve Professional"
          onClick={onApprove}
        />
        <ActionButton
          icon={Cancel01Icon}
          isProcessing={isProcessing}
          label="Reject Professional"
          onClick={onReject}
        />
      </div>
    );
  }

  if (check.status === "clear" && check.recommendation === "approved") {
    return (
      <div className="border border-neutral-900 bg-neutral-900 p-6 dark:border-neutral-100/40 dark:bg-neutral-100/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
              icon={CheckmarkCircle02Icon}
            />
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Background check passed. Ready to approve professional.
            </p>
          </div>
          <button
            className="bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950"
            disabled={isProcessing}
            onClick={onApprove}
            type="button"
          >
            {isProcessing ? "Processing..." : "Approve Professional"}
          </button>
        </div>
      </div>
    );
  }

  if (check.status === "suspended") {
    return (
      <div className="border border-neutral-900 bg-white p-6 dark:border-neutral-100/30 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            className="h-6 w-6 text-neutral-900 dark:text-neutral-100"
            icon={SecurityCheckIcon}
          />
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            This professional has been suspended due to background check findings.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function ActionButton({
  icon,
  isProcessing,
  label,
  onClick,
}: {
  icon: typeof Cancel01Icon;
  isProcessing: boolean;
  label: string;
  onClick: () => Promise<void> | void;
}) {
  return (
    <button
      className="flex-1 bg-neutral-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950"
      disabled={isProcessing}
      onClick={onClick}
      type="button"
    >
      <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={icon} />
      {isProcessing ? "Processing..." : label}
    </button>
  );
}
