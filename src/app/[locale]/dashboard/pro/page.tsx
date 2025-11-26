import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { EarningsOverview } from "@/components/professional/dashboard/EarningsOverview";
import { PerformanceCharts } from "@/components/professional/dashboard/PerformanceCharts";
import { UrgencyTaskBoard } from "@/components/professional/dashboard/UrgencyTaskBoard";
import { PendingRatingsList } from "@/components/reviews/pending-ratings-list";
import { PendingRatingsSkeleton } from "@/components/skeletons/dashboard-skeletons";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

/**
 * Professional Dashboard Page - Airbnb-Style Focused Design
 *
 * Answers ONE question: "What should I do next?"
 *
 * Information hierarchy (simplified):
 * - UrgencyTaskBoard: Single hero task with "X more" collapsed
 * - EarningsOverview: Two-column (Available | Coming)
 * - PerformanceCharts: Collapsed by default (analytics for weekly review)
 * - PendingRatings: Customers awaiting rating
 *
 * All analytics components fetch their own data via client-side APIs.
 */

type CompletedBooking = {
  id: string;
  service_name: string | null;
  scheduled_start: string | null;
  customer: { id: string } | null;
  hasReview: boolean;
};

export default async function ProfessionalDashboardPage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch user name for greeting
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profileData?.full_name?.split(" ")[0] || "Professional";

  // Fetch completed bookings for pending ratings section only
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, service_name,
      customer:profiles!customer_id(id)`
    )
    .eq("professional_id", user.id)
    .eq("status", "completed")
    .order("scheduled_start", { ascending: false })
    .limit(10);

  const { data: customerReviewsData } = await supabase
    .from("customer_reviews")
    .select("booking_id")
    .eq("professional_id", user.id);

  const reviewedBookingIds = new Set((customerReviewsData ?? []).map((r) => r.booking_id));

  const completedBookings: CompletedBooking[] = (bookingsData ?? [])
    .map((b) => ({
      id: b.id,
      service_name: b.service_name,
      scheduled_start: b.scheduled_start,
      // Supabase returns relations as arrays - extract first element
      customer: Array.isArray(b.customer)
        ? ((b.customer[0] as { id: string } | undefined) ?? null)
        : null,
      hasReview: reviewedBookingIds.has(b.id),
    }))
    .filter((b) => !b.hasReview)
    .slice(0, 5);

  return (
    <>
      <NotificationPermissionPrompt variant="banner" />

      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <h1 className={cn("font-bold text-2xl text-neutral-900", geistSans.className)}>
            Welcome back, {userName}
          </h1>
        </div>

        {/* Next Up - Single hero task (Airbnb-style) */}
        <UrgencyTaskBoard />

        {/* Earnings - Two-column Available/Coming */}
        <EarningsOverview />

        {/* Analytics - Collapsed by default for weekly review */}
        <details className="group rounded-lg border border-neutral-200 bg-white">
          <summary className="flex cursor-pointer select-none items-center justify-between px-6 py-4 text-neutral-900 marker:content-none">
            <h2 className={cn("font-semibold text-lg", geistSans.className)}>
              Performance Analytics
            </h2>
            <span className="text-neutral-500 text-sm group-open:hidden">View analytics →</span>
            <span className="hidden text-neutral-500 text-sm group-open:block">Hide analytics</span>
          </summary>
          <div className="border-neutral-200 border-t">
            <PerformanceCharts />
          </div>
        </details>

        {/* Pending Customer Ratings */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className={cn("mb-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
              Rate Your Customers
            </h2>
            <Suspense fallback={<PendingRatingsSkeleton />}>
              <PendingRatingsList completedBookings={completedBookings} />
            </Suspense>
          </div>
        )}
      </div>
    </>
  );
}
