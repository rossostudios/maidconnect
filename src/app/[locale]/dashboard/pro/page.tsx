import {
  Calendar03Icon,
  Clock01Icon,
  DollarCircleIcon,
  FileAttachmentIcon,
  Image02Icon,
  Settings02Icon,
  UserCircleIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { Suspense } from "react";
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
  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const avatarUrl = profileData?.avatar_url;

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  const userName = profileData?.full_name?.split(" ")[0] || "Professional";

  // Fetch bookings
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
      customer:profiles!customer_id(id)`
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as ProfessionalBookingRow[] | null) ?? [];

  // Fetch customer reviews
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
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      {/* Greeting & Quick Stats */}
      <section className="mb-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Photo Circle */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <Image
                  alt={userName}
                  className="h-12 w-12 rounded-full border-2 border-[#E5E5E5] object-cover"
                  height={48}
                  src={avatarUrl}
                  width={48}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-[#E63946]/10">
                  <HugeiconsIcon className="h-6 w-6 text-[#E63946]" icon={UserCircleIcon} />
                </div>
              )}
            </div>

            {/* Greeting Text */}
            <div>
              <h1 className="mb-1 font-bold text-3xl text-[#171717]">
                {greeting}, {userName}
              </h1>
              <p className="text-[#737373]">Here's your business overview for today</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            color="warning"
            icon={UserMultiple02Icon}
            label="Pending Requests"
            value={pendingBookings.toString()}
          />
          <MetricCard
            color="info"
            icon={Calendar03Icon}
            label="Active Bookings"
            value={activeBookings.toString()}
          />
          <MetricCard
            color="success"
            icon={Clock01Icon}
            label="Completed This Week"
            value={completedThisWeek.toString()}
          />
          <MetricCard
            color="primary"
            icon={DollarCircleIcon}
            label="Weekly Earnings"
            value={formatCOPWithFallback(weeklyEarnings)}
          />
        </div>
      </section>

      {/* Pending Customer Ratings */}
      {completedBookings.length > 0 ? (
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="mb-2 font-bold text-2xl text-[#171717]">Pending Customer Ratings</h2>
            <p className="text-[#737373] text-sm">Request feedback from recent customers</p>
          </div>
          <Suspense fallback={<PendingRatingsSkeleton />}>
            <PendingRatingsList completedBookings={completedBookings} />
          </Suspense>
        </section>
      ) : null}

      {/* Booking Calendar */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#171717]">Booking Calendar</h2>
          <p className="text-[#737373] text-sm">Manage your schedule and upcoming bookings</p>
        </div>
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
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
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#171717]">Quick Actions</h2>
          <p className="text-[#737373] text-sm">Manage your professional profile and settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* View All Bookings */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/bookings"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Calendar03Icon} />
              <h3 className="font-semibold text-[#171717] text-base">View All Bookings</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              See your complete booking history and manage upcoming appointments
            </p>
          </Link>

          {/* Manage Availability */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/availability"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Clock01Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Manage Availability</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              Update your schedule and set when you're available for bookings
            </p>
          </Link>

          {/* Portfolio */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/portfolio"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Image02Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Portfolio</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              Showcase your best work with photos and descriptions
            </p>
          </Link>

          {/* Finances */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/finances"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={DollarCircleIcon} />
              <h3 className="font-semibold text-[#171717] text-base">Finances</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Track your earnings and manage payout settings</p>
          </Link>

          {/* Documents */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/documents"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={FileAttachmentIcon} />
              <h3 className="font-semibold text-[#171717] text-base">Documents</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Upload and manage your verification documents</p>
          </Link>

          {/* Settings */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/dashboard/pro/onboarding"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Settings02Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Profile Settings</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">
              Update your profile, services, and account settings
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color = "default",
}: {
  icon: any;
  label: string;
  value: string;
  color?: "default" | "primary" | "success" | "warning" | "info";
}) {
  const colorClasses = {
    default: "bg-[#F5F5F5] text-[#737373]",
    primary: "bg-[#E63946]/10 text-[#E63946]",
    success: "bg-[#28a745]/10 text-[#28a745]",
    warning: "bg-[#ffc107]/10 text-[#ffc107]",
    info: "bg-[#17a2b8]/10 text-[#17a2b8]",
  };

  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
        >
          <HugeiconsIcon className="h-5 w-5" icon={icon} />
        </div>
      </div>
      <dt className="text-[#737373] text-sm">{label}</dt>
      <dd className="mt-1 font-bold text-2xl text-[#171717]">{value}</dd>
    </div>
  );
}
