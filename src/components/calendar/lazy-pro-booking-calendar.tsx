"use client";

/**
 * Lazy Pro Booking Calendar
 *
 * Dynamic import wrapper for ProBookingCalendar to reduce initial bundle size.
 * FullCalendar (~150KB) is loaded only when this component is rendered.
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton that matches calendar layout
function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="ml-4 h-6 w-48 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Legend */}
      <Skeleton className="h-14 w-full rounded-lg" />

      {/* Calendar */}
      <Skeleton className="h-[500px] w-full rounded-lg" />

      {/* Instructions */}
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

// Dynamic import with no SSR (FullCalendar requires browser APIs)
export const LazyProBookingCalendar = dynamic(
  () =>
    import("./pro-booking-calendar").then((mod) => ({
      default: mod.ProBookingCalendar,
    })),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
);

// Re-export props type for consumers
export type { ProBookingCalendarProps } from "./pro-booking-calendar";
