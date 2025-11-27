/**
 * User Details Tabs - Shared Utility Components
 *
 * Reusable components used across multiple tabs
 */

import type { ReactNode } from "react";

/**
 * DataField - Label/value pair for displaying user data
 */
export function DataField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs tracking-wider">
        {label}
      </dt>
      <dd className="font-[family-name:var(--font-geist-sans)] text-neutral-900">{value}</dd>
    </div>
  );
}

/**
 * MetricCard - Displays a single metric with label and large value
 */
export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <dt className="mb-2 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-600 text-xs tracking-wider">
        {label}
      </dt>
      <dd className="font-[family-name:var(--font-geist-sans)] font-medium text-3xl text-neutral-900 tabular-nums">
        {value}
      </dd>
    </div>
  );
}

/**
 * VerificationBadge - Shows verification status with color-coded badge
 */
export function VerificationBadge({ label, status }: { label: string; status: string }) {
  const statusConfig = {
    verified: { color: "bg-green-50 border-green-600 text-green-900", text: "Verified" },
    pending: { color: "bg-rausch-50 border-rausch-600 text-rausch-900", text: "Pending" },
    rejected: { color: "bg-red-50 border-red-600 text-red-900", text: "Rejected" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-3 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm">
        {label}
      </p>
      <span
        className={`inline-block rounded-full border px-3 py-1 font-[family-name:var(--font-geist-sans)] font-medium text-xs tracking-wider ${config.color}`}
      >
        {config.text}
      </span>
    </div>
  );
}

/**
 * SectionCard - Container for card sections with header
 */
export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        <h3 className="font-[family-name:var(--font-geist-sans)] font-medium text-neutral-900 text-sm tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
