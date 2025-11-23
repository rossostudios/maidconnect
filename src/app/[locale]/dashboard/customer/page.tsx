import {
  Calendar03Icon,
  CreditCardIcon,
  FavouriteIcon,
  Home09Icon,
  Location01Icon,
  Settings02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { RebookButton } from "@/components/bookings/rebook-button";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import {
  BookingsListSkeleton,
  FavoritesListSkeleton,
} from "@/components/skeletons/dashboard-skeletons";
import { CardLink } from "@/components/ui/card-link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

type BookingData = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  created_at: string;
  professional: { full_name: string | null; profile_id: string } | null;
};

function isBookingThisMonth(booking: BookingData): boolean {
  if (!booking.scheduled_start) {
    return false;
  }
  const bookingDate = new Date(booking.scheduled_start);
  const now = new Date();
  return (
    bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
  );
}

function calculateMetrics(bookings: BookingData[]): {
  activeBookings: number;
  upcomingBookings: number;
  completedThisMonth: number;
  totalSaved: number;
} {
  const now = new Date();
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  ).length;

  const upcomingBookings = bookings.filter((b) => {
    if (!b.scheduled_start) {
      return false;
    }
    const bookingDate = new Date(b.scheduled_start);
    return bookingDate > now && b.status === "confirmed";
  }).length;

  const completedThisMonth = bookings.filter(
    (b) => b.status === "completed" && isBookingThisMonth(b)
  ).length;

  // Calculate total saved from completed bookings (could be enhanced later)
  const totalSaved = bookings
    .filter((b) => b.status === "completed" && b.amount_captured)
    .reduce((sum, b) => sum + (b.amount_captured || 0), 0);

  return { activeBookings, upcomingBookings, completedThisMonth, totalSaved };
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

export default async function CustomerDashboardPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  const user = await requireUser({ allowedRoles: ["customer"] });
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

  const userName = profileData?.full_name?.split(" ")[0] || "Customer";

  // Fetch bookings
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, duration_minutes, service_name, amount_authorized, amount_captured, currency, created_at,
      professional:professional_profiles!professional_id(full_name, profile_id)`
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as BookingData[] | null) ?? [];

  const metrics = calculateMetrics(bookings);
  const { activeBookings, upcomingBookings, completedThisMonth, totalSaved } = metrics;

  // Get upcoming bookings for display
  const now = new Date();
  const upcomingBookingsList = bookings
    .filter((b) => {
      if (!b.scheduled_start) {
        return false;
      }
      const bookingDate = new Date(b.scheduled_start);
      return bookingDate > now && (b.status === "confirmed" || b.status === "pending");
    })
    .slice(0, 5);

  // Get recent completed bookings for repeat booking CTA
  const completedBookingsList = bookings.filter((b) => b.status === "completed").slice(0, 3);

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
                  className="h-12 w-12 rounded-lg border-2 border-neutral-200 object-cover"
                  height={48}
                  src={avatarUrl}
                  width={48}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-orange-200 bg-orange-50">
                  <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={UserCircleIcon} />
                </div>
              )}
            </div>

            {/* Greeting Text */}
            <div>
              <h1 className={cn("mb-1 font-bold text-3xl text-neutral-900", geistSans.className)}>
                {greeting}, {userName}
              </h1>
              <p className="text-neutral-600">Manage your bookings and home services</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            color="info"
            icon={Calendar03Icon}
            label="Active Bookings"
            value={activeBookings.toString()}
          />
          <MetricCard
            color="warning"
            icon={Home09Icon}
            label="Upcoming Bookings"
            value={upcomingBookings.toString()}
          />
          <MetricCard
            color="success"
            icon={Calendar03Icon}
            label="Completed This Month"
            value={completedThisMonth.toString()}
          />
          <MetricCard
            color="primary"
            icon={CreditCardIcon}
            label="Total Spent"
            value={formatCOPWithFallback(totalSaved)}
          />
        </div>
      </section>

      {/* Upcoming Bookings */}
      {upcomingBookingsList.length > 0 ? (
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="mb-2 font-bold text-2xl text-neutral-900">Upcoming Bookings</h2>
            <p className="text-neutral-600 text-sm">Your scheduled appointments</p>
          </div>
          <Suspense fallback={<BookingsListSkeleton />}>
            <CustomerBookingList bookings={upcomingBookingsList} />
          </Suspense>
        </section>
      ) : null}

      {/* Recent Completed Bookings - E-2: Repeat Booking CTA */}
      {completedBookingsList.length > 0 && (
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="mb-2 font-bold text-2xl text-neutral-900">Recent Completed Bookings</h2>
            <p className="text-neutral-600 text-sm">Book your favorite services again</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedBookingsList.map((booking) => (
              <div
                className="group rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-orange-500 hover:shadow-md"
                key={booking.id}
              >
                <div className="mb-4">
                  <h3 className="mb-1 font-semibold text-neutral-900">
                    {booking.service_name || "Service"}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {booking.professional?.full_name || "Professional"}
                  </p>
                  {booking.scheduled_start && (
                    <p className="mt-2 text-neutral-700 text-xs">
                      {new Date(booking.scheduled_start).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <RebookButton booking={booking} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorite Professionals */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-neutral-900">Favorite Professionals</h2>
          <p className="text-neutral-600 text-sm">Your trusted service providers</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <Suspense fallback={<FavoritesListSkeleton />}>
            <FavoritesList />
          </Suspense>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="font-bold text-2xl text-neutral-900">Quick Actions</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CardLink
            description="Submit a service request and get matched"
            href="/brief"
            icon={Home09Icon}
            title="Request Service"
          />
          <CardLink
            description="View booking history and upcoming appointments"
            href="/dashboard/customer/bookings"
            icon={Calendar03Icon}
            title="View All Bookings"
          />
          <CardLink
            description="Add and update your saved service locations"
            href="/dashboard/customer/addresses"
            icon={Location01Icon}
            title="Manage Addresses"
          />
          <CardLink
            description="Update payment methods and billing"
            href="/dashboard/customer/payments"
            icon={CreditCardIcon}
            title="Manage Payments"
          />
          <CardLink
            description="View your favorite professionals"
            href="/dashboard/customer/favorites"
            icon={FavouriteIcon}
            title="Favorites"
          />
          <CardLink
            description="Update profile and account preferences"
            href="/dashboard/customer/settings"
            icon={Settings02Icon}
            title="Settings"
          />
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
    default: "bg-neutral-100 text-neutral-600",
    primary: "bg-orange-50 text-orange-600 border-orange-200",
    success: "bg-green-50 text-green-600 border-green-200",
    warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorClasses[color]}`}
        >
          <HugeiconsIcon className="h-5 w-5" icon={icon} />
        </div>
      </div>
      <dt className="text-neutral-600 text-sm">{label}</dt>
      <dd className={cn("mt-1 font-bold text-2xl text-neutral-900", geistSans.className)}>
        {value}
      </dd>
    </div>
  );
}
