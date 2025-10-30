import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SavedAddressesManager } from "@/components/addresses/saved-addresses-manager";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { PaymentAuthorizationCard } from "@/components/payments/payment-authorization-card";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const QUICK_LINK_IDS = ["bookProfessional", "viewPastVisits", "updatePayment"] as const;

const QUICK_LINKS_HREFS: Record<string, string> = {
  bookProfessional: "/professionals",
  viewPastVisits: "#",
  updatePayment: "#",
};

const VERIFICATION_ORDER = ["basic", "standard", "enhanced"] as const;

const CUSTOMER_TASK_IDS = ["profile", "verification", "payment", "booking"] as const;

const CUSTOMER_TASK_HREFS: Record<string, string> = {
  profile: "/dashboard/customer",
  verification: "#",
  payment: "#",
  booking: "/professionals",
};

function isVerificationTierAtLeast(current: string | null, target: string) {
  const currentIndex = VERIFICATION_ORDER.indexOf(
    (current ?? "") as (typeof VERIFICATION_ORDER)[number]
  );
  const targetIndex = VERIFICATION_ORDER.indexOf(target as (typeof VERIFICATION_ORDER)[number]);
  if (targetIndex === -1) return false;
  if (currentIndex === -1) return false;
  return currentIndex >= targetIndex;
}

function formatPropertyType(
  propertyType: string | null | undefined,
  propertyTypeMap: Record<string, string>,
  notSet: string
): string {
  if (!propertyType) return notSet;
  return propertyTypeMap[propertyType] ?? propertyType;
}

export default async function CustomerDashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "dashboard.customer.main" });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  const [{ data: profileData }, { data: customerData }, { data: bookingsData }] = await Promise.all(
    [
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
    ]
  );

  const profile =
    (profileData as {
      phone: string | null;
      city: string | null;
      country: string | null;
      full_name: string | null;
      stripe_customer_id: string | null;
    } | null) ?? null;
  const customerProfile =
    (customerData as {
      verification_tier: string | null;
      property_preferences: Record<string, unknown> | null;
      saved_addresses: unknown;
    } | null) ?? null;

  const verificationTier = customerProfile?.verification_tier ?? "basic";
  const propertyType =
    (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;
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
  const bookings =
    (bookingsData as Array<{
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

  const hasCompletedBooking = bookings.some((b) => b.status === "completed");

  const completedTasks = {
    profile: hasProfileDetails,
    verification: isVerificationTierAtLeast(verificationTier, "standard"),
    payment: hasPaymentMethod,
    booking: hasCompletedBooking,
  } as Record<(typeof CUSTOMER_TASK_IDS)[number], boolean>;

  return (
    <section className="flex-1 space-y-8">
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      <header className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
              {t("header.dashboardLabel")}
            </p>
            <h1 className="mt-4 font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {profile?.full_name
                ? t("header.welcomeBackWithName", { name: profile.full_name })
                : t("header.welcomeBack")}
            </h1>
            <p className="mt-4 text-[#5d574b] text-lg leading-relaxed">{t("header.description")}</p>
          </div>
          <Link
            className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            href="/auth/sign-out?redirectTo=/"
          >
            {t("header.signOut")}
          </Link>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label={t("summary.accountEmail")} value={user.email ?? "—"} />
          <SummaryCard
            label={t("summary.phone")}
            value={profile?.phone ?? t("summary.addYourPhone")}
          />
          <SummaryCard
            label={t("summary.city")}
            value={profile?.city ?? t("summary.addYourCity")}
          />
          <SummaryCard
            label={t("summary.verificationTier")}
            value={verificationTier.toUpperCase()}
          />
        </dl>
      </header>

      <section className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-3xl text-[#211f1a]">{t("tasks.title")}</h2>
            <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
              {t("tasks.description")}
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
            href="#"
          >
            {t("tasks.updateProfile")}
          </Link>
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {CUSTOMER_TASK_IDS.map((taskId, index) => {
            const isComplete = completedTasks[taskId];
            return (
              <li
                className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
                key={taskId}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5d46] font-semibold text-sm text-white">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-[#211f1a] text-base">
                      {t(`tasks.${taskId}.title`)}
                    </span>
                  </div>
                  {isComplete ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700 text-xs">
                      {t("tasks.status.completed")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 text-xs">
                      {t("tasks.status.actionNeeded")}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-[#5d574b] text-base leading-relaxed">
                  {t(`tasks.${taskId}.description`)}
                </p>
                {taskId === "payment" ? (
                  <PaymentAuthorizationCard hasPaymentMethod={hasPaymentMethod} />
                ) : isComplete ? null : (
                  <Link
                    className="mt-4 inline-flex items-center font-semibold text-[#ff5d46] text-base hover:text-[#eb6c65]"
                    href={CUSTOMER_TASK_HREFS[taskId]}
                  >
                    {t(`tasks.${taskId}.cta`)} →
                  </Link>
                )}
                {taskId === "verification" && !isComplete ? (
                  <p className="mt-4 text-orange-700 text-sm">
                    {t("tasks.verification.upgradeNote")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section
        className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm"
        id="addresses"
      >
        <h2 className="font-semibold text-3xl text-[#211f1a]">{t("sections.addresses.title")}</h2>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
          {t("sections.addresses.description")}
        </p>
        <div className="mt-8">
          <SavedAddressesManager addresses={savedAddresses} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h3 className="font-semibold text-2xl text-[#211f1a]">
            {t("sections.propertyPreferences.title")}
          </h3>
          <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
            {t("sections.propertyPreferences.description")}
          </p>
          <dl className="mt-6 space-y-4 text-base">
            <div>
              <dt className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("summary.propertyType")}
              </dt>
              <dd className="mt-2 text-[#211f1a]">
                {formatPropertyType(
                  propertyType,
                  {
                    apartment: t("summary.propertyTypes.apartment"),
                    house: t("summary.propertyTypes.house"),
                    office: t("summary.propertyTypes.office"),
                    other: t("summary.propertyTypes.other"),
                  },
                  t("summary.notSet")
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("summary.city")}
              </dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.city ?? t("summary.addYourCity")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("summary.country")}
              </dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.country ?? "Colombia"}</dd>
            </div>
          </dl>
          <Link
            className="mt-6 inline-flex items-center font-semibold text-[#ff5d46] text-base hover:text-[#eb6c65]"
            href="#"
          >
            {t("sections.propertyPreferences.updatePreferences")}
          </Link>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h3 className="font-semibold text-2xl text-[#211f1a]">{t("sections.needHelp.title")}</h3>
          <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
            {t("sections.needHelp.description")}
          </p>
          <ul className="mt-6 space-y-3 text-[#211f1a] text-base">
            <li>
              <span className="font-semibold">{t("sections.needHelp.liveChat")}</span>{" "}
              {t("sections.needHelp.liveChatHours")}
            </li>
            <li>
              <span className="font-semibold">{t("sections.needHelp.email")}</span>{" "}
              {t("sections.needHelp.emailAddress")}
            </li>
            <li>
              <span className="font-semibold">{t("sections.needHelp.emergencyLine")}</span>{" "}
              {t("sections.needHelp.emergencyPhone")}
            </li>
          </ul>
          <Link
            className="mt-6 inline-flex items-center font-semibold text-[#ff5d46] text-base hover:text-[#eb6c65]"
            href="/support/account-suspended"
          >
            {t("sections.needHelp.browseHelpCenter")}
          </Link>
        </div>
      </section>

      <section
        className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm"
        id="bookings"
      >
        <h2 className="font-semibold text-3xl text-[#211f1a]">{t("sections.bookings.title")}</h2>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
          {t("sections.bookings.description")}
        </p>
        <div className="mt-8">
          <CustomerBookingList bookings={bookings} />
        </div>
      </section>

      <section
        className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm"
        id="favorites"
      >
        <h2 className="font-semibold text-3xl text-[#211f1a]">{t("sections.favorites.title")}</h2>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
          {t("sections.favorites.description")}
        </p>
        <div className="mt-8">
          <FavoritesList />
        </div>
      </section>

      <section
        className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm"
        id="messages"
      >
        <h2 className="font-semibold text-3xl text-[#211f1a]">{t("sections.messages.title")}</h2>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
          {t("sections.messages.description")}
        </p>
        <div className="mt-8">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-[#ff5d46] px-6 py-3 font-medium text-base text-white transition hover:bg-[#e54d3c]"
            href="/dashboard/customer/messages"
          >
            {t("sections.messages.viewAllMessages")}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {QUICK_LINK_IDS.map((linkId) => (
          <Link
            className="group hover:-translate-y-1 rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-sm transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]"
            href={QUICK_LINKS_HREFS[linkId]}
            key={linkId}
          >
            <h3 className="font-semibold text-[#211f1a] text-lg">
              {t(`quickLinks.${linkId}.title`)}
            </h3>
            <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
              {t(`quickLinks.${linkId}.description`)}
            </p>
            <span className="mt-4 inline-flex items-center font-semibold text-[#ff5d46] text-base group-hover:text-[#eb6c65]">
              {t("quickLinks.goNow")}
            </span>
          </Link>
        ))}
      </section>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
      <dt className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">{label}</dt>
      <dd className="mt-2 font-medium text-[#211f1a] text-base">{value}</dd>
    </div>
  );
}
