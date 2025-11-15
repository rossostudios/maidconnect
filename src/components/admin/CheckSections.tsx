/**
 * Background Check Modal Section Components
 * Extracted from background-check-detail-modal to reduce complexity
 */

import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getCheckTypeLabel } from "@/lib/integrations/background-checks/badgeHelpers";

/**
 * Status icon component with conditional rendering
 */
export function StatusIcon({ status }: { status: string }) {
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

/**
 * Checks performed section
 */
export function ChecksPerformedSection({ checks }: { checks: string[] }) {
  if (!checks || checks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
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
              {getCheckTypeLabel(checkType)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

type CriminalRecord = {
  severity?: string;
  date?: string;
  description: string;
  details?: any;
};

/**
 * Criminal records section
 */
export function CriminalRecordsSection({ records }: { records: CriminalRecord[] }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 dark:text-neutral-100">
        Criminal Background Check
      </h3>
      {records.length === 0 ? (
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
          {records.map((record, index) => (
            <div
              className="border border-neutral-900 bg-white p-6 dark:border-neutral-100/30 dark:bg-neutral-950"
              key={index}
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
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium text-neutral-800 text-sm dark:text-neutral-300">
                    View full details
                  </summary>
                  <pre className="mt-2 overflow-auto bg-white p-3 text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100">
                    {JSON.stringify(record.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type IdentityRecord = {
  description: string;
  details?: any;
};

/**
 * Identity verification section
 */
export function IdentityVerificationSection({ records }: { records: IdentityRecord[] }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 dark:text-neutral-100">
        Identity Verification
      </h3>
      {records.length === 0 ? (
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
          {records.map((record, index) => (
            <div
              className="border border-neutral-900 bg-neutral-900 p-6 dark:border-neutral-100/40 dark:bg-neutral-100/10"
              key={index}
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
              {record.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium text-neutral-800 text-sm dark:text-neutral-300">
                    View details
                  </summary>
                  <pre className="mt-2 overflow-auto bg-white p-3 text-neutral-900 text-xs dark:bg-neutral-950 dark:text-neutral-100">
                    {JSON.stringify(record.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Action buttons section
 */
export function ActionButtonsSection({
  status,
  recommendation,
  isProcessing,
  onApprove,
  onReject,
}: {
  status: string;
  recommendation: string;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (status === "consider") {
    return (
      <div className="flex gap-4">
        <button
          className="flex-1 bg-neutral-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
          disabled={isProcessing}
          onClick={onApprove}
          type="button"
        >
          <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={CheckmarkCircle02Icon} />
          {isProcessing ? "Processing..." : "Approve Professional"}
        </button>
        <button
          className="flex-1 bg-neutral-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
          disabled={isProcessing}
          onClick={onReject}
          type="button"
        >
          <HugeiconsIcon className="mr-2 inline h-5 w-5" icon={Cancel01Icon} />
          {isProcessing ? "Processing..." : "Reject Professional"}
        </button>
      </div>
    );
  }

  if (status === "clear" && recommendation === "approved") {
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
            className="bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
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

  if (status === "suspended") {
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
