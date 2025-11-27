"use client";

import {
  Alert01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState } from "react";
import type { CustomerDispute } from "@/app/[locale]/dashboard/customer/disputes/page";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";

type Props = {
  disputes: CustomerDispute[];
};

const disputeReasonLabels: Record<string, string> = {
  incomplete_service: "Service was incomplete",
  quality_issues: "Quality issues",
  late_arrival: "Late arrival",
  no_show: "No show",
  property_damage: "Property damage",
  unprofessional_conduct: "Unprofessional conduct",
  safety_concern: "Safety concern",
  other: "Other issue",
};

const statusConfig: Record<
  string,
  {
    label: string;
    icon: typeof Clock01Icon;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  pending: {
    label: "Under Review",
    icon: Clock01Icon,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  investigating: {
    label: "Investigating",
    icon: InformationCircleIcon,
    bgColor: "bg-babu-50",
    textColor: "text-babu-700",
    borderColor: "border-babu-200",
  },
  resolved: {
    label: "Resolved",
    icon: CheckmarkCircle02Icon,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  rejected: {
    label: "Closed",
    icon: Cancel01Icon,
    bgColor: "bg-neutral-100",
    textColor: "text-neutral-600",
    borderColor: "border-neutral-200",
  },
};

function DisputeCard({ dispute }: { dispute: CustomerDispute }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[dispute.status] || statusConfig.pending;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDisputeAmount = (cents: number | null, currency: string | null) => {
    if (!cents) {
      return "—";
    }
    return formatFromMinorUnits(cents, (currency || "USD") as Currency);
  };

  return (
    <div className={cn("rounded-lg border bg-white p-6 transition-all", status.borderColor)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Professional Avatar */}
          {dispute.professional?.avatar_url ? (
            <Image
              alt={dispute.professional.full_name || "Professional"}
              className="h-12 w-12 rounded-lg border border-neutral-200 object-cover"
              height={48}
              src={dispute.professional.avatar_url}
              width={48}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100">
              <HugeiconsIcon className="h-6 w-6 text-neutral-400" icon={Alert01Icon} />
            </div>
          )}

          <div>
            <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
              {dispute.booking?.service_name || "Unknown Service"}
            </h3>
            <p className="text-neutral-600 text-sm">
              with {dispute.professional?.full_name || "Unknown Professional"}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1",
            status.bgColor,
            status.borderColor,
            "border"
          )}
        >
          <HugeiconsIcon className={cn("h-4 w-4", status.textColor)} icon={status.icon} />
          <span className={cn("font-medium text-sm", status.textColor)}>{status.label}</span>
        </div>
      </div>

      {/* Reason & Date */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-neutral-500">Reason:</span>{" "}
          <span className="font-medium text-neutral-900">
            {disputeReasonLabels[dispute.reason] || dispute.reason}
          </span>
        </div>
        <div>
          <span className="text-neutral-500">Filed:</span>{" "}
          <span className="font-medium text-neutral-900">{formatDate(dispute.created_at)}</span>
        </div>
        {dispute.booking?.scheduled_start && (
          <div>
            <span className="text-neutral-500">Service Date:</span>{" "}
            <span className="font-medium text-neutral-900">
              {formatDate(dispute.booking.scheduled_start)}
            </span>
          </div>
        )}
        {dispute.booking?.total_amount_cents && (
          <div>
            <span className="text-neutral-500">Amount:</span>{" "}
            <span className="font-medium text-neutral-900">
              {formatDisputeAmount(dispute.booking.total_amount_cents, dispute.booking.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      <button
        className="mt-4 font-medium text-rausch-600 text-sm hover:text-rausch-700"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? "Hide Details" : "View Details"}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-neutral-200 border-t pt-4">
          {/* Description */}
          <div>
            <p className="mb-1 font-medium text-neutral-700 text-xs uppercase tracking-wider">
              Your Description
            </p>
            <p className="text-neutral-900 text-sm leading-relaxed">{dispute.description}</p>
          </div>

          {/* Resolution Notes (if resolved) */}
          {(dispute.status === "resolved" || dispute.status === "rejected") &&
            dispute.resolution_notes && (
              <div
                className={cn(
                  "rounded-lg p-4",
                  dispute.status === "resolved" ? "bg-green-50" : "bg-neutral-50"
                )}
              >
                <p className="mb-1 font-medium text-neutral-700 text-xs uppercase tracking-wider">
                  Resolution
                </p>
                <p className="text-neutral-900 text-sm leading-relaxed">
                  {dispute.resolution_notes}
                </p>
                {dispute.resolved_at && (
                  <p className="mt-2 text-neutral-500 text-xs">
                    Resolved on {formatDate(dispute.resolved_at)}
                  </p>
                )}
              </div>
            )}

          {/* Pending Status Info */}
          {dispute.status === "pending" && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Our support team is reviewing your dispute. We typically respond within 24-48 hours.
                You&apos;ll receive an email notification when there&apos;s an update.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CustomerDisputesList({ disputes }: Props) {
  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
        <HugeiconsIcon className="mx-auto h-12 w-12 text-neutral-400" icon={Alert01Icon} />
        <p className={cn("mt-4 font-medium text-neutral-900", geistSans.className)}>
          No disputes filed
        </p>
        <p className="mt-1 text-neutral-600 text-sm">
          If you have an issue with a completed booking, you can file a dispute from the booking
          details page within 48 hours of completion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <DisputeCard dispute={dispute} key={dispute.id} />
      ))}
    </div>
  );
}
