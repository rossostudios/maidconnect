import { Alert01Icon, Calendar03Icon, ClockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { LiaButton } from "@/components/admin/lia-dashboard-components";
import { RealtimeStatsPanel } from "@/components/admin/realtime-stats-panel";
import { UserActivityPanel } from "@/components/admin/user-activity-panel";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

/**
 * Admin Dashboard - Anthropic-Inspired Lia Design
 *
 * Warm, approachable design with thoughtful rounded corners:
 * - Anthropic rounded corners (rounded-lg for 12px radius)
 * - Geist Sans for UI text (font-normal to font-medium)
 * - Geist Mono for data display
 * - Warm neutral backgrounds with refined typography
 * - Orange (orange-500/600) for primary actions
 * - Soft borders with rounded corners for approachable aesthetic
 */
export default async function AdminHomePage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["admin"] });
  const supabase = await createSupabaseServerClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profileData?.full_name?.split(" ")[0] || "Admin";

  // Fetch critical metrics for action items
  // TODO: Add concierge requests queue here (briefs table) once UI is built
  const [
    { count: pendingBookingsCount },
    { count: pendingProfessionals },
    { count: activeDisputesCount },
  ] = await Promise.all([
    // Critical: Pending assignments needing professional matching
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    // Pending professional reviews
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional")
      .eq("onboarding_status", "pending_review"),

    // Active disputes
    supabase
      .from("booking_disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  // Calculate action items count
  const actionItemsCount =
    (pendingBookingsCount ?? 0) + (pendingProfessionals ?? 0) + (activeDisputesCount ?? 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className={cn(
              "font-medium text-3xl text-neutral-900 tracking-tight leading-none",
              geistSans.className
            )}
          >
            Good morning, {userName}
          </h1>
          <p className={cn("text-neutral-600 text-sm leading-none", geistSans.className)}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Action Items Alert - Anthropic rounded design */}
        {actionItemsCount > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-orange-500 bg-orange-50 px-4 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-orange-500 bg-orange-500">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Alert01Icon} />
            </div>
            <div>
              <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                {actionItemsCount} {actionItemsCount === 1 ? "Item" : "Items"} Need Attention
              </p>
              <p className={cn("mt-0.5 text-neutral-600 text-xs", geistSans.className)}>
                Review pending items below
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Platform Metrics */}
      <RealtimeStatsPanel />

      {/* Live User Activity */}
      <UserActivityPanel currentUserId={user.id} />

      {/* Action Required - Critical Tasks */}
      {actionItemsCount > 0 && (
        <div>
          <h2 className={cn("mb-2 font-medium text-base text-neutral-900", geistSans.className)}>
            Action Required
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Pending Bookings */}
            {(pendingBookingsCount ?? 0) > 0 && (
              <Link href="/admin/bookings?status=pending">
                <div className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                      <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Calendar03Icon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                      <span className={cn("font-medium text-white text-xs", geistSans.className)}>
                        {pendingBookingsCount}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-medium text-base text-neutral-900", geistSans.className)}>
                    Pending Assignments
                  </h3>
                  <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                    Concierge Matching
                  </p>
                </div>
              </Link>
            )}

            {/* Pending Professionals */}
            {(pendingProfessionals ?? 0) > 0 && (
              <Link href="/admin/users?role=professional&status=pending">
                <div className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                      <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={ClockIcon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                      <span className={cn("font-medium text-white text-xs", geistSans.className)}>
                        {pendingProfessionals}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-medium text-base text-neutral-900", geistSans.className)}>
                    Pending Reviews
                  </h3>
                  <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                    Professional applications
                  </p>
                </div>
              </Link>
            )}

            {/* Active Disputes */}
            {(activeDisputesCount ?? 0) > 0 && (
              <Link href="/admin/disputes">
                <div className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                      <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Alert01Icon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                      <span className={cn("font-medium text-white text-xs", geistSans.className)}>
                        {activeDisputesCount}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-medium text-base text-neutral-900", geistSans.className)}>
                    Active Disputes
                  </h3>
                  <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                    Require resolution
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className={cn("mb-2 font-medium text-base text-neutral-900", geistSans.className)}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/admin/users">
            <LiaButton className="w-full" size="md" variant="secondary">
              Manage Users
            </LiaButton>
          </Link>
          <Link href="/admin/disputes">
            <LiaButton className="w-full" size="md" variant="secondary">
              View Disputes
            </LiaButton>
          </Link>
          <Link href="/admin/analytics">
            <LiaButton className="w-full" size="md" variant="secondary">
              Analytics
            </LiaButton>
          </Link>
          <Link href="/admin/settings">
            <LiaButton className="w-full" size="md" variant="secondary">
              Settings
            </LiaButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
