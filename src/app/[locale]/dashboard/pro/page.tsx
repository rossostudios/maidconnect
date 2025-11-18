import {
  Calendar03Icon,
  Clock01Icon,
  DollarCircleIcon,
  FileAttachmentIcon,
  Image02Icon,
  Settings02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { PendingRatingsList } from "@/components/reviews/pending-ratings-list";
import {
  BookingCalendarSkeleton,
  PendingRatingsSkeleton,
} from "@/components/skeletons/dashboard-skeletons";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

type ProfessionalBookingRow = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_estimated: number | null;
  amount_captured: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  currency: string | null;
  created_at: string | null;
  service_name: string | null;
  service_hourly_rate: number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  time_extension_minutes: number | null;
  address: Record<string, any> | null;
  customer: { id: string } | null;
};

type CompletedBooking = {
  id: string;
  service_name: string | null;
  scheduled_start: string | null;
  customer: { id: string } | null;
  hasReview: boolean;
};

function isBookingCompletedThisWeek(booking: ProfessionalBookingRow): boolean {
  if (booking.status !== "completed" || !booking.scheduled_start) {
    return false;
  }
  const bookingDate = new Date(booking.scheduled_start);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return bookingDate >= weekAgo;
}

function calculateMetrics(bookings: ProfessionalBookingRow[]): {
  activeBookings: number;
  pendingBookings: number;
  completedThisWeek: number;
  weeklyEarnings: number;
} {
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const completedThisWeek = bookings.filter(isBookingCompletedThisWeek).length;
  const weeklyEarnings = bookings
    .filter((b) => isBookingCompletedThisWeek(b) && b.amount_captured)
    .reduce((sum, b) => sum + (b.amount_captured || 0), 0);

  return { activeBookings, pendingBookings, completedThisWeek, weeklyEarnings };
}

function formatCOPWithFallback(value?: number | null) {
  if (!value || Number.isNaN(value)) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function prepareCompletedBookings(
  bookings: ProfessionalBookingRow[],
  reviewedBookingIds: Set<string>
): CompletedBooking[] {
  return bookings
    .filter((b) => b.status === "completed")
    .map((b) => ({
      id: b.id,
      service_name: b.service_name,
      scheduled_start: b.scheduled_start,
      customer: b.customer,
      hasReview: reviewedBookingIds.has(b.id),
    }))
    .slice(0, 5);
}

export default async function ProfessionalDashboardPage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profileData?.full_name?.split(" ")[0] || "Professional";

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
      customer:profiles!customer_id(id)`
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as ProfessionalBookingRow[] | null) ?? [];

  const { data: customerReviewsData } = await supabase
    .from("customer_reviews")
    .select("booking_id")
    .eq("professional_id", user.id);

  const customerReviews = (customerReviewsData as { booking_id: string }[] | null) ?? [];
  const reviewedBookingIds = new Set(customerReviews.map((r) => r.booking_id));
  const completedBookings = prepareCompletedBookings(bookings, reviewedBookingIds);

  const metrics = calculateMetrics(bookings);
  const { activeBookings, pendingBookings, completedThisWeek, weeklyEarnings } = metrics;

  return (
    <>
      <NotificationPermissionPrompt variant="banner" />

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
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LiaMetricCard
            icon={UserMultiple02Icon}
            label="Pending Assignments"
            value={pendingBookings.toString()}
          />
          <LiaMetricCard
            icon={Calendar03Icon}
            label="Active Bookings"
            value={activeBookings.toString()}
          />
          <LiaMetricCard
            icon={Clock01Icon}
            label="Completed This Week"
            value={completedThisWeek.toString()}
          />
          <LiaMetricCard
            icon={DollarCircleIcon}
            label="Weekly Earnings"
            value={formatCOPWithFallback(weeklyEarnings)}
          />
        </div>

        {/* Pending Customer Ratings */}
        {completedBookings.length > 0 && (
          <div>
            <h2
              className={cn(
                "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                geistSans.className
              )}
            >
              Pending Customer Ratings
            </h2>
            <Suspense fallback={<PendingRatingsSkeleton />}>
              <PendingRatingsList completedBookings={completedBookings} />
            </Suspense>
          </div>
        )}

        {/* Booking Calendar */}
        <div>
          <h2
            className={cn(
              "mb-4 font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            Booking Calendar
          </h2>
          <div className="border border-neutral-200 bg-white p-6">
            <Suspense fallback={<BookingCalendarSkeleton />}>
              <ProBookingCalendar
                bookings={bookings.map((booking) => ({
                  id: booking.id,
                  status: booking.status,
                  scheduled_start: booking.scheduled_start,
                  duration_minutes: booking.duration_minutes,
                  amount_authorized: booking.amount_authorized,
                  amount_captured: booking.amount_captured,
                  currency: booking.currency,
                }))}
              />
            </Suspense>
          </div>
        </div>

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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/bookings"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={Calendar03Icon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                View All Bookings
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Complete booking history
              </p>
            </Link>

            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/availability"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={Clock01Icon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                Manage Availability
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Update your schedule
              </p>
            </Link>

            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/portfolio"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={Image02Icon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                Portfolio
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Showcase your work
              </p>
            </Link>

            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/finances"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={DollarCircleIcon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                Finances
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Track earnings & payouts
              </p>
            </Link>

            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/documents"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={FileAttachmentIcon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                Documents
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Manage verification
              </p>
            </Link>

            <Link
              className="group border border-neutral-200 bg-white p-6 transition-all hover:border-[#FF5200] hover:shadow-sm"
              href="/dashboard/pro/onboarding"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={Settings02Icon} />
                </div>
              </div>
              <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                Profile Settings
              </h3>
              <p
                className={cn(
                  "mt-1 font-normal text-[10px] text-neutral-700 uppercase tracking-wide",
                  geistSans.className
                )}
              >
                Update your profile
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function LiaMetricCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-900">
          <HugeiconsIcon className="h-5 w-5 text-white" icon={icon} />
        </div>
      </div>
      <dt
        className={cn(
          "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
          geistSans.className
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "mt-3 font-semibold text-5xl text-neutral-900 tracking-tighter",
          geistSans.className
        )}
      >
        {value}
      </dd>
    </div>
  );
}
