import { Alert01Icon, Calendar03Icon, ClockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { geistMono, geistSans } from "@/app/fonts";
import { PrecisionButton } from "@/components/admin/precision-dashboard-components";
import { RealtimeStatsPanel } from "@/components/admin/realtime-stats-panel";
import { UserActivityPanel } from "@/components/admin/user-activity-panel";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

/**
 * Admin Dashboard - Lia Design
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for maximum readability (WCAG AAA)
 * - Geist Sans for UI text, Geist Mono for data
 * - Pure white backgrounds with deep black borders
 * - Electric blue accents for primary actions
 * - Sharp geometric design language
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
  const [{ count: pendingBookingsCount }, { count: pendingProfessionals }, { count: activeDisputesCount }] =
    await Promise.all([
      // Critical: Pending bookings needing approval
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),

      // Pending professional reviews
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "professional")
        .eq("onboarding_status", "pending_review"),

      // Active disputes
      supabase.from("booking_disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
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
              "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Good morning, {userName}
          </h1>
          <p
            className={cn(
              "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
              geistSans.className
            )}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Action Items Alert */}
        {actionItemsCount > 0 && (
          <div className="flex items-center gap-3 border border-[#FF5200] bg-orange-50 px-4 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#FF5200] bg-[#FF5200]">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Alert01Icon} />
            </div>
            <div>
              <p
                className={cn(
                  "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                {actionItemsCount} {actionItemsCount === 1 ? "Item" : "Items"} Need Attention
              </p>
              <p
                className={cn(
                  "mt-0.5 font-normal text-[10px] text-neutral-700 tracking-tighter",
                  geistMono.className
                )}
              >
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
          <h2
            className={cn(
              "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Action Required
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Pending Bookings */}
            {(pendingBookingsCount ?? 0) > 0 && (
              <Link href="/admin/bookings?status=pending">
                <div className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={Calendar03Icon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center bg-[#FF5200]">
                      <span
                        className={cn(
                          "font-semibold text-[10px] text-white tracking-tighter",
                          geistMono.className
                        )}
                      >
                        {pendingBookingsCount}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                    Pending Bookings
                  </h3>
                  <p
                    className={cn(
                      "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                      geistSans.className
                    )}
                  >
                    Awaiting confirmation
                  </p>
                </div>
              </Link>
            )}

            {/* Pending Professionals */}
            {(pendingProfessionals ?? 0) > 0 && (
              <Link href="/admin/users?role=professional&status=pending">
                <div className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={ClockIcon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center bg-[#FF5200]">
                      <span
                        className={cn(
                          "font-semibold text-[10px] text-white tracking-tighter",
                          geistMono.className
                        )}
                      >
                        {pendingProfessionals}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                    Pending Reviews
                  </h3>
                  <p
                    className={cn(
                      "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                      geistSans.className
                    )}
                  >
                    Professional applications
                  </p>
                </div>
              </Link>
            )}

            {/* Active Disputes */}
            {(activeDisputesCount ?? 0) > 0 && (
              <Link href="/admin/disputes">
                <div className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={Alert01Icon} />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center bg-[#FF5200]">
                      <span
                        className={cn(
                          "font-semibold text-[10px] text-white tracking-tighter",
                          geistMono.className
                        )}
                      >
                        {activeDisputesCount}
                      </span>
                    </div>
                  </div>
                  <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                    Active Disputes
                  </h3>
                  <p
                    className={cn(
                      "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                      geistSans.className
                    )}
                  >
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
        <h2
          className={cn(
            "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/admin/users">
            <PrecisionButton className="w-full" size="md" variant="secondary">
              Manage Users
            </PrecisionButton>
          </Link>
          <Link href="/admin/disputes">
            <PrecisionButton className="w-full" size="md" variant="secondary">
              View Disputes
            </PrecisionButton>
          </Link>
          <Link href="/admin/analytics">
            <PrecisionButton className="w-full" size="md" variant="secondary">
              Analytics
            </PrecisionButton>
          </Link>
          <Link href="/admin/settings">
            <PrecisionButton className="w-full" size="md" variant="secondary">
              Settings
            </PrecisionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
