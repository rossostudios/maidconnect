import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth";

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

  const [{ data: profileData }, { data: customerData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("phone, city, country, full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("verification_tier, property_preferences")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  const profile = (profileData as { phone: string | null; city: string | null; country: string | null; full_name: string | null } | null) ?? null;
  const customerProfile = (customerData as { verification_tier: string | null; property_preferences: Record<string, unknown> | null } | null) ?? null;

  const verificationTier = customerProfile?.verification_tier ?? "basic";
  const propertyType = (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;

  const hasProfileDetails = Boolean(profile?.phone && profile.city);
  const hasPaymentMethod = false; // placeholder until payments integration
  const hasCompletedBooking = false; // placeholder until bookings integration

  const completedTasks = {
    profile: hasProfileDetails,
    verification: isVerificationTierAtLeast(verificationTier, "standard"),
    payment: hasPaymentMethod,
    booking: hasCompletedBooking,
  } as Record<(typeof CUSTOMER_TASKS)[number]["id"], boolean>;

  return (
    <section className="flex-1 space-y-6">
      <header className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#fd857f]">Customer dashboard</span>
            <h1 className="mt-2 text-2xl font-semibold text-[#211f1a]">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-[#7a6d62]">
              Explore vetted professionals, review upcoming visits, and manage payments in one place.
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="text-sm font-medium text-[#fd857f] transition hover:text-[#eb6c65]"
          >
            Sign out
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Account email" value={user.email ?? "—"} />
          <SummaryCard label="Phone" value={profile?.phone ?? "Add your phone"} />
          <SummaryCard label="City" value={profile?.city ?? "Add your city"} />
          <SummaryCard label="Verification tier" value={verificationTier.toUpperCase()} />
        </dl>
      </header>

      <section className="rounded-xl border border-[#fd857f33] bg-[#fef1ee] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#402d2d]">Get ready to book</h2>
            <p className="text-sm text-[#7a524c]">
              Complete these quick steps to unlock instant booking confirmations and top-rated professionals.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
          >
            Update profile
          </Link>
        </div>

        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {CUSTOMER_TASKS.map((task) => {
            const isComplete = completedTasks[task.id];
            return (
              <li
                key={task.id}
                className="rounded-lg border border-[#f0e1dc] bg-white/90 p-4 shadow-sm transition hover:border-[#fd857f40]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#fd857f]">{task.title}</span>
                  {isComplete ? (
                    <span className="rounded-full bg-[#e6f5ea] px-2 py-0.5 text-xs font-semibold text-[#2f7a47]">
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fde0dc] px-2 py-0.5 text-xs font-semibold text-[#c4534d]">
                      Action needed
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#211f1a]">{task.description}</p>
                {!isComplete ? (
                  <Link
                    href={task.cta.href}
                    className="mt-3 inline-flex items-center text-sm font-semibold text-[#fd857f] hover:text-[#eb6c65]"
                  >
                    {task.cta.label} →
                  </Link>
                ) : null}
                {task.id === "verification" && !isComplete ? (
                  <p className="mt-3 text-xs text-[#c4534d]">Upgrade to Standard to unlock the verification badge.</p>
                ) : null}
                {task.id === "payment" ? (
                  <p className="mt-3 text-xs text-[#7a6d62]">Payments integration coming soon.</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#211f1a]">Property preferences</h3>
          <p className="mt-1 text-sm text-[#7a6d62]">
            Sharing a few details about your home helps professionals prepare with the right supplies.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">Property type</dt>
              <dd className="mt-1 text-[#211f1a]">{formatPropertyType(propertyType)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">City</dt>
              <dd className="mt-1 text-[#211f1a]">{profile?.city ?? "Add your city"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">Country</dt>
              <dd className="mt-1 text-[#211f1a]">{profile?.country ?? "Colombia"}</dd>
            </div>
          </dl>
          <Link href="#" className="mt-4 inline-flex items-center text-sm font-semibold text-[#fd857f] hover:text-[#eb6c65]">
            Update preferences →
          </Link>
        </div>

        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#211f1a]">Need help?</h3>
          <p className="mt-1 text-sm text-[#7a6d62]">
            Our support team can help with verification, bookings, or anything else you need.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#211f1a]">
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
          <Link href="/support/account-suspended" className="mt-4 inline-flex items-center text-sm font-semibold text-[#fd857f] hover:text-[#eb6c65]">
            Browse help center →
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-xl border border-[#efe7dc] bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#fd857f4d]"
          >
            <h3 className="text-sm font-semibold text-[#211f1a]">{item.title}</h3>
            <p className="mt-1 text-sm text-[#7a6d62]">{item.description}</p>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-[#fd857f] group-hover:text-[#eb6c65]">
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
    <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">{label}</dt>
      <dd className="mt-1 text-sm text-[#211f1a]">{value}</dd>
    </div>
  );
}
