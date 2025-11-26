/**
 * Analytics Empty State Component - Anthropic Lia Design System
 *
 * Beautiful empty state for analytics dashboard when no data is available.
 * Following Anthropic design principles with thoughtful rounded corners,
 * Geist typography, and warm neutrals with orange accents.
 */

"use client";

import { ChartColumnIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

type AnalyticsEmptyStateProps = {
  /** Custom className */
  className?: string;
};

export function AnalyticsEmptyState({ className }: AnalyticsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-12",
        className
      )}
    >
      {/* Icon Container */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-rausch-50">
        <HugeiconsIcon className="h-8 w-8 text-rausch-500" icon={ChartColumnIcon} />
      </div>

      {/* Heading */}
      <h3
        className={cn(
          "mb-2 font-semibold text-neutral-900 text-xl tracking-tight",
          geistSans.className
        )}
      >
        No Analytics Data Yet
      </h3>

      {/* Description */}
      <p className={cn("mb-6 max-w-md text-center text-neutral-500 text-sm", geistSans.className)}>
        Your analytics dashboard will display metrics once bookings and activity data is available.
        Start by creating your first booking or waiting for professional signups.
      </p>

      {/* Helpful Steps */}
      <div className="w-full max-w-md space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
        <p className={cn("mb-3 font-semibold text-neutral-900 text-sm", geistSans.className)}>
          To get started:
        </p>
        <ol className="space-y-2">
          <li
            className={cn("flex items-start gap-3 text-neutral-700 text-sm", geistSans.className)}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rausch-50 font-semibold text-rausch-600 text-xs">
              1
            </span>
            <span>Approve professionals through the vetting dashboard</span>
          </li>
          <li
            className={cn("flex items-start gap-3 text-neutral-700 text-sm", geistSans.className)}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rausch-50 font-semibold text-rausch-600 text-xs">
              2
            </span>
            <span>Create test bookings or wait for customer requests</span>
          </li>
          <li
            className={cn("flex items-start gap-3 text-neutral-700 text-sm", geistSans.className)}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rausch-50 font-semibold text-rausch-600 text-xs">
              3
            </span>
            <span>Return here to view platform performance and trends</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
