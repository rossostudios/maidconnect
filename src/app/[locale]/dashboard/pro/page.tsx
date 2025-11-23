import {
  Calendar03Icon,
  Clock01Icon,
  DollarCircleIcon,
  FileAttachmentIcon,
  Image02Icon,
  Message01Icon,
  Settings02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { TodayOverview } from "@/components/professional/today-tab";
import { WalletEarningsSummary } from "@/components/professionals/wallet-earnings-summary";
import { PendingRatingsList } from "@/components/reviews/pending-ratings-list";
import {
  BookingCalendarSkeleton,
  PendingRatingsSkeleton,
} from "@/components/skeletons/dashboard-skeletons";
import { IconBox } from "@/components/ui/icon-box";
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
  customer: { id: string; full_name?: string } | null;
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
      customer:profiles!customer_id(id, full_name)`
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as ProfessionalBookingRow[] | null) ?? [];

  // Get unread message count for Today tab
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  const { data: customerReviewsData } = await supabase
    .from("customer_reviews")
    .select("booking_id")
    .eq("professional_id", user.id);

  const customerReviews = (customerReviewsData as { booking_id: string }[] | null) ?? [];
  const reviewedBookingIds = new Set(customerReviews.map((r) => r.booking_id));
  const completedBookings = prepareCompletedBookings(bookings, reviewedBookingIds);

  const metrics = calculateMetrics(bookings);
  const { activeBookings, pendingBookings, completedThisWeek, weeklyEarnings } = metrics;

  // Calculate pending reviews count
  const pendingReviewsCount = completedBookings.filter((b) => !b.hasReview).length;

  return (
    <>
      <NotificationPermissionPrompt variant="banner" />

      <div className="space-y-8">
        {/* Airbnb-Inspired Today Tab */}
        <TodayOverview
          bookings={bookings.map((b) => ({
            id: b.id,
            status: b.status,
            scheduled_start: b.scheduled_start,
            scheduled_end: b.scheduled_end,
            duration_minutes: b.duration_minutes,
            service_name: b.service_name,
            customer: b.customer,
          }))}
          pendingMessages={unreadMessagesCount ?? 0}
          pendingReviews={pendingReviewsCount}
          userName={userName}
        />

        {/* Career Earnings & Achievement Badge */}
        <WalletEarningsSummary />

        {/* Pending Customer Ratings */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className={cn("mb-4 font-medium text-neutral-600 text-sm", geistSans.className)}>
              Pending Customer Ratings
            </h2>
            <Suspense fallback={<PendingRatingsSkeleton />}>
              <PendingRatingsList completedBookings={completedBookings} />
            </Suspense>
          </div>
        )}

        {/* Booking Calendar */}
        <div>
          <h2 className={cn("mb-4 font-medium text-neutral-600 text-sm", geistSans.className)}>
            Booking Calendar
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
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
          <h2 className={cn("mb-4 font-medium text-neutral-600 text-sm", geistSans.className)}>
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/bookings"
            >
              <div className="mb-4">
                <IconBox icon={Calendar03Icon} size="lg" variant="primary" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">
                View All Bookings
              </h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">
                Complete booking history
              </p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/availability"
            >
              <div className="mb-4">
                <IconBox icon={Clock01Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">
                Manage Availability
              </h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">Update your schedule</p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/portfolio"
            >
              <div className="mb-4">
                <IconBox icon={Image02Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">Portfolio</h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">Showcase your work</p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/finances"
            >
              <div className="mb-4">
                <IconBox icon={DollarCircleIcon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">Finances</h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">
                Track earnings & payouts
              </p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/messages"
            >
              <div className="mb-4">
                <IconBox icon={Message01Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">Messages</h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">Chat with customers</p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/service-addons"
            >
              <div className="mb-4">
                <IconBox icon={Settings02Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">
                Service Add-ons
              </h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">
                Create upsells & extras
              </p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/documents"
            >
              <div className="mb-4">
                <IconBox icon={FileAttachmentIcon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">Documents</h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">Manage verification</p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/onboarding"
            >
              <div className="mb-4">
                <IconBox icon={Settings02Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">
                Profile Settings
              </h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">Update your profile</p>
            </Link>

            <Link
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm"
              href="/dashboard/pro/settings/profile"
            >
              <div className="mb-4">
                <IconBox icon={Settings02Icon} size="lg" variant="neutral" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-none">Settings</h3>
              <p className="mt-0.5 text-neutral-600 text-xs leading-none">
                Vanity URL & visibility
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
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4">
        <IconBox icon={icon} size="lg" variant="primary" />
      </div>
      <dt className="text-neutral-600 text-sm leading-none">{label}</dt>
      <dd className="mt-3 font-semibold text-5xl text-neutral-900 tracking-tighter">{value}</dd>
    </div>
  );
}
