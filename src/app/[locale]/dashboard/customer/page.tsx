import {
  ArrowRight01Icon,
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
import { RebookButton } from "@/components/bookings/rebook-button";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { FavoritesListSkeleton } from "@/components/skeletons/dashboard-skeletons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

/**
 * Customer Dashboard Page - Airbnb-Style Focused Design
 *
 * Answers ONE question: "What's my next booking?"
 *
 * Information hierarchy (simplified):
 * - Hero: Your Next Booking (or prompt to book if none)
 * - Book Again: Recent pros + favorites merged
 * - Footer Links: Settings, Payments, Addresses, Help
 */

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

  const userName = profileData?.full_name?.split(" ")[0] || "there";

  // Fetch bookings
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, duration_minutes, service_name, amount_authorized, amount_captured, currency, created_at,
      professional:professional_profiles!professional_id(full_name, profile_id)`
    )
    .eq("customer_id", user.id)
    .order("scheduled_start", { ascending: true });

  const bookings = (bookingsData as BookingData[] | null) ?? [];

  // Get the NEXT upcoming booking (hero)
  const now = new Date();
  const nextBooking = bookings.find((b) => {
    if (!b.scheduled_start) {
      return false;
    }
    const bookingDate = new Date(b.scheduled_start);
    return bookingDate > now && (b.status === "confirmed" || b.status === "pending");
  });

  // Get recent completed bookings for "Book Again" (limit 3)
  const recentPros = bookings
    .filter((b) => b.status === "completed" && b.professional?.full_name)
    .slice(0, 3);

  return (
    <>
      <NotificationPermissionPrompt variant="banner" />

      <div className="space-y-8">
        {/* Greeting - Simplified */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              alt={userName}
              className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
              height={40}
              src={avatarUrl}
              width={40}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-50">
              <HugeiconsIcon className="h-5 w-5 text-rausch-600" icon={UserCircleIcon} />
            </div>
          )}
          <h1 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {greeting}, {userName}
          </h1>
        </div>

        {/* Hero: Your Next Booking */}
        {nextBooking ? <NextBookingHero booking={nextBooking} /> : <NoBookingPrompt />}

        {/* Book Again - Recent pros + Favorites merged */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              Book Again
            </h2>
            <Link
              className="flex items-center gap-1 font-medium text-rausch-600 text-sm hover:text-rausch-700"
              href="/pros"
            >
              Browse all
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </Link>
          </div>

          {recentPros.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPros.map((booking) => (
                <RecentProCard booking={booking} key={booking.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
              <Suspense fallback={<FavoritesListSkeleton />}>
                <FavoritesList />
              </Suspense>
            </div>
          )}
        </section>

        {/* Footer Links - Collapsed Quick Actions */}
        <footer className="border-neutral-200 border-t pt-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <FooterLink
              href="/dashboard/customer/payments"
              icon={CreditCardIcon}
              label="Payments"
            />
            <FooterLink
              href="/dashboard/customer/addresses"
              icon={Location01Icon}
              label="Addresses"
            />
            <FooterLink
              href="/dashboard/customer/favorites"
              icon={FavouriteIcon}
              label="Favorites"
            />
            <FooterLink
              href="/dashboard/customer/settings"
              icon={Settings02Icon}
              label="Settings"
            />
            <FooterLink href="/help" icon={Home09Icon} label="Help" />
          </div>
        </footer>
      </div>
    </>
  );
}

function NextBookingHero({ booking }: { booking: BookingData }) {
  const scheduledDate = booking.scheduled_start ? new Date(booking.scheduled_start) : null;

  const formattedDate = scheduledDate
    ? scheduledDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Pending confirmation";

  const formattedTime = scheduledDate
    ? scheduledDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  // Calculate time until booking
  const now = new Date();
  const diffMs = scheduledDate ? scheduledDate.getTime() - now.getTime() : 0;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let timeUntil = "";
  if (diffDays > 0) {
    timeUntil = `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    timeUntil = `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  } else {
    timeUntil = "starting soon";
  }

  return (
    <div className="rounded-lg border border-rausch-200 bg-rausch-50/50 p-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium text-rausch-700 text-xs uppercase tracking-wide">
          Your Next Booking
        </span>
        <span className="rounded-full bg-rausch-100 px-2 py-0.5 font-medium text-rausch-700 text-xs">
          {timeUntil}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {booking.service_name || "Home Service"}
          </h3>
          <p className="mt-1 text-neutral-600">
            {booking.professional?.full_name || "Professional"}
          </p>
          <p className="mt-2 flex items-center gap-2 text-neutral-700 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
            {formattedDate} {formattedTime && `at ${formattedTime}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/customer/bookings/${booking.id}`}>View Details</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/messages?booking=${booking.id}`}>
              Message Pro
              <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NoBookingPrompt() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <HugeiconsIcon className="h-6 w-6 text-neutral-500" icon={Calendar03Icon} />
      </div>
      <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
        No upcoming bookings
      </h3>
      <p className="mt-1 text-neutral-600 text-sm">Ready to schedule your next home service?</p>
      <Button asChild className="mt-4">
        <Link href="/brief">
          Request Service
          <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
        </Link>
      </Button>
    </div>
  );
}

function RecentProCard({ booking }: { booking: BookingData }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-rausch-300 hover:shadow-sm">
      <div className="mb-3">
        <h3 className="font-medium text-neutral-900 text-sm">
          {booking.service_name || "Service"}
        </h3>
        <p className="text-neutral-600 text-sm">
          {booking.professional?.full_name || "Professional"}
        </p>
        {booking.scheduled_start && (
          <p className="mt-1 text-neutral-500 text-xs">
            Last: {new Date(booking.scheduled_start).toLocaleDateString()}
          </p>
        )}
      </div>
      <RebookButton booking={booking} />
    </div>
  );
}

function FooterLink({ href, icon, label }: { href: string; icon: HugeIcon; label: string }) {
  return (
    <Link
      className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-rausch-600"
      href={href}
    >
      <HugeiconsIcon className="h-4 w-4" icon={icon} />
      {label}
    </Link>
  );
}
