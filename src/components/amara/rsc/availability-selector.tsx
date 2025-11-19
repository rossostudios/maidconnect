/**
 * AvailabilitySelector RSC Component
 *
 * Server Component that displays a professional's availability calendar
 * and time slot selector for booking through Amara chat.
 *
 * Features:
 * - Color-coded calendar (available, limited, booked, blocked)
 * - Time slot selection
 * - Instant booking indicator
 * - Lia Design System styling (Anthropic rounded corners, orange accents)
 */

import type { DayAvailability } from "@/lib/utils/availability";
import { AvailabilitySelectorClient } from "../client/availability-selector-actions";

export type AvailabilitySelectorProps = {
  professionalId: string;
  professionalName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  availability: DayAvailability[];
  instantBooking?: {
    enabled: boolean;
    minNoticeHours: number;
    maxDurationHours: number;
  };
  conversationId?: string;
};

/**
 * AvailabilitySelector Server Component
 *
 * Renders the availability calendar and delegates interactions to client component.
 */
export function AvailabilitySelector({
  professionalId,
  professionalName,
  startDate,
  endDate,
  availability,
  instantBooking,
  conversationId,
}: AvailabilitySelectorProps) {
  // Calculate summary stats
  const totalDays = availability.length;
  const availableDays = availability.filter((day) => day.status === "available").length;
  const limitedDays = availability.filter((day) => day.status === "limited").length;

  // Check if instant booking is available for any slots
  const hasInstantBooking = instantBooking?.enabled;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="border-neutral-200 border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">
              {professionalName}'s Availability
            </h3>
            <p className="mt-1 text-neutral-600 text-sm">
              {availableDays + limitedDays} days available ({totalDays} days shown)
            </p>
          </div>

          {hasInstantBooking && (
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span className="font-medium text-orange-700 text-xs">Instant Booking</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <AvailabilitySelectorClient
          availability={availability}
          conversationId={conversationId}
          instantBooking={hasInstantBooking}
          professionalId={professionalId}
          professionalName={professionalName}
        />
      </div>

      {/* Legend */}
      <div className="border-neutral-200 border-t px-6 py-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-neutral-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-neutral-600">Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-neutral-400" />
            <span className="text-neutral-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-neutral-200" />
            <span className="text-neutral-600">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AvailabilitySelectorLoading - Loading state
 */
export function AvailabilitySelectorLoading() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-6 py-8">
      <div className="flex items-center justify-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-neutral-700">Loading availability...</span>
      </div>
    </div>
  );
}

/**
 * AvailabilitySelectorError - Error state
 */
export function AvailabilitySelectorError({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
      <svg
        aria-hidden="true"
        className="mx-auto h-12 w-12 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
      <h3 className="mt-4 font-medium text-lg text-red-900">Availability Error</h3>
      <p className="mt-2 text-red-700 text-sm">{error}</p>
    </div>
  );
}
