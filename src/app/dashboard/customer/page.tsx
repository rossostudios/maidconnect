import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PaymentAuthorizationCard } from "@/components/payments/payment-authorization-card";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { SavedAddressesManager } from "@/components/addresses/saved-addresses-manager";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";

const QUICK_LINKS = [
  {
    title: "Book a professional",
    description: "Browse verified experts by service, language, and availability.",
    href: "/professionals",
  },
  {
    title: "View past visits",
    description: "Download receipts, add tips, or rebook your favorites.",
    href: "#",
  },
  {
    title: "Update payment method",
    description: "Manage cards and local payment options securely.",
    href: "#",
  },
];

const VERIFICATION_ORDER = ["basic", "standard", "enhanced"] as const;

const CUSTOMER_TASKS = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your contact details and where services will take place so professionals can prepare.",
    cta: { href: "/dashboard/customer", label: "Edit profile" },
  },
  {
    id: "verification",
    title: "Verify your identity",
    description: "Upload a passport or government ID to earn a verified badge and faster bookings.",
    cta: { href: "#", label: "Start verification" },
  },
  {
    id: "payment",
    title: "Add a payment method",
    description: "Securely store a card or local payment option to confirm bookings instantly.",
    cta: { href: "#", label: "Add payment method" },
  },
  {
    id: "booking",
    title: "Book your first visit",
    description: "Choose a trusted professional and schedule your first home service.",
    cta: { href: "/professionals", label: "Find professionals" },
  },
] as const;

function isVerificationTierAtLeast(current: string | null, target: string) {
  const currentIndex = VERIFICATION_ORDER.indexOf((current ?? "") as (typeof VERIFICATION_ORDER)[number]);
  const targetIndex = VERIFICATION_ORDER.indexOf(target as (typeof VERIFICATION_ORDER)[number]);
  if (targetIndex === -1) return false;
  if (currentIndex === -1) return false;
  return currentIndex >= targetIndex;
}

function formatPropertyType(propertyType?: string | null) {
  if (!propertyType) return "Not set";
  const map: Record<string, string> = {
    apartment: "Apartment",
    house: "House",
    office: "Office",
    other: "Other",
  };
  return map[propertyType] ?? propertyType;
}

export default async function CustomerDashboardPage() {
  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  const [{ data: profileData }, { data: customerData }, { data: bookingsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("phone, city, country, full_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("verification_tier, property_preferences, saved_addresses")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select(`
        id,
        status,
        scheduled_start,
        duration_minutes,
        service_name,
        amount_authorized,
        amount_captured,
        currency,
        created_at,
        professional:professional_profiles!professional_id(full_name, profile_id)
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = (profileData as {
    phone: string | null;
    city: string | null;
    country: string | null;
    full_name: string | null;
    stripe_customer_id: string | null;
  } | null) ?? null;
  const customerProfile = (customerData as {
    verification_tier: string | null;
    property_preferences: Record<string, unknown> | null;
    saved_addresses: unknown;
  } | null) ?? null;

  const verificationTier = customerProfile?.verification_tier ?? "basic";
  const propertyType = (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;
  const savedAddresses = (customerProfile?.saved_addresses as any[]) || [];

  const hasProfileDetails = Boolean(profile?.phone && profile.city);
  let hasPaymentMethod = false;
  if (profile?.stripe_customer_id) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: profile.stripe_customer_id,
        type: "card",
        limit: 1,
      });
      hasPaymentMethod = paymentMethods.data.length > 0;
    } catch (error) {
      console.error("Failed to load Stripe payment methods", error);
    }
  }
  const bookings = (bookingsData as Array<{
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
  }> | null) ?? [];

  const hasCompletedBooking = bookings.some(b => b.status === "completed");

  const completedTasks = {
    profile: hasProfileDetails,
    verification: isVerificationTierAtLeast(verificationTier, "standard"),
    payment: hasPaymentMethod,
    booking: hasCompletedBooking,
  } as Record<(typeof CUSTOMER_TASKS)[number]["id"], boolean>;

  return (
    <section className="flex-1 space-y-8">
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      <header className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">CUSTOMER DASHBOARD</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#5d574b]">
              Explore vetted professionals, review upcoming visits, and manage payments in one place.
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            Sign out
          </Link>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Account email" value={user.email ?? "—"} />
          <SummaryCard label="Phone" value={profile?.phone ?? "Add your phone"} />
          <SummaryCard label="City" value={profile?.city ?? "Add your city"} />
          <SummaryCard label="Verification tier" value={verificationTier.toUpperCase()} />
        </dl>
      </header>

      <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[#211f1a]">Get ready to book</h2>
            <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
              Complete these quick steps to unlock instant booking confirmations and top-rated professionals.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
          >
            Update profile
          </Link>
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {CUSTOMER_TASKS.map((task, index) => {
            const isComplete = completedTasks[task.id];
            return (
              <li
                key={task.id}
                className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5d46] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <span className="text-base font-semibold text-[#211f1a]">{task.title}</span>
                  </div>
                  {isComplete ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      Action needed
                    </span>
                  )}
                </div>
                <p className="mt-4 text-base leading-relaxed text-[#5d574b]">{task.description}</p>
                {task.id === "payment" ? (
                  <PaymentAuthorizationCard hasPaymentMethod={hasPaymentMethod} />
                ) : !isComplete ? (
                  <Link
                    href={task.cta.href}
                    className="mt-4 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
                  >
                    {task.cta.label} →
                  </Link>
                ) : null}
                {task.id === "verification" && !isComplete ? (
                  <p className="mt-4 text-sm text-orange-700">Upgrade to Standard to unlock the verification badge.</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section id="addresses" className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h2 className="text-3xl font-semibold text-[#211f1a]">Saved Addresses</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          Manage your service locations for faster booking. Add details like building access and parking info.
        </p>
        <div className="mt-8">
          <SavedAddressesManager addresses={savedAddresses} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <h3 className="text-2xl font-semibold text-[#211f1a]">Property preferences</h3>
          <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
            Sharing a few details about your home helps professionals prepare with the right supplies.
          </p>
          <dl className="mt-6 space-y-4 text-base">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">Property type</dt>
              <dd className="mt-2 text-[#211f1a]">{formatPropertyType(propertyType)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">City</dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.city ?? "Add your city"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">Country</dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.country ?? "Colombia"}</dd>
            </div>
          </dl>
          <Link href="#" className="mt-6 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]">
            Update preferences →
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <h3 className="text-2xl font-semibold text-[#211f1a]">Need help?</h3>
          <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
            Our support team can help with verification, bookings, or anything else you need.
          </p>
          <ul className="mt-6 space-y-3 text-base text-[#211f1a]">
            <li>
              <span className="font-semibold">Live chat:</span> Weekdays 8:00–20:00 COT
            </li>
            <li>
              <span className="font-semibold">Email:</span> help@maidconnect.com
            </li>
            <li>
              <span className="font-semibold">Emergency line:</span> +57 123 456 7890
            </li>
          </ul>
          <Link href="/support/account-suspended" className="mt-6 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]">
            Browse help center →
          </Link>
        </div>
      </section>

      <section id="bookings" className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h2 className="text-3xl font-semibold text-[#211f1a]">My Bookings</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          View and manage your upcoming and past service appointments.
        </p>
        <div className="mt-8">
          <CustomerBookingList bookings={bookings} />
        </div>
      </section>

      <section id="favorites" className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h2 className="text-3xl font-semibold text-[#211f1a]">My Favorites</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          Quick access to your favorite professionals for easy rebooking.
        </p>
        <div className="mt-8">
          <FavoritesList />
        </div>
      </section>

      <section id="messages" className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h2 className="text-3xl font-semibold text-[#211f1a]">Messages</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          Chat with professionals about your bookings and service details.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/customer/messages"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff5d46] px-6 py-3 text-base font-medium text-white transition hover:bg-[#e54d3c]"
          >
            View all messages
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]"
          >
            <h3 className="text-lg font-semibold text-[#211f1a]">{item.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-[#5d574b]">{item.description}</p>
            <span className="mt-4 inline-flex items-center text-base font-semibold text-[#ff5d46] group-hover:text-[#eb6c65]">
              Go now →
            </span>
          </Link>
        ))}
      </section>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{label}</dt>
      <dd className="mt-2 text-base font-medium text-[#211f1a]">{value}</dd>
    </div>
  );
}
