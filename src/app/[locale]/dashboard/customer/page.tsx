import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PaymentAuthorizationCard } from "@/components/payments/payment-authorization-card";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { SavedAddressesManager } from "@/components/addresses/saved-addresses-manager";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";

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
  const currentIndex = VERIFICATION_ORDER.indexOf((current ?? "") as (typeof VERIFICATION_ORDER)[number]);
  const targetIndex = VERIFICATION_ORDER.indexOf(target as (typeof VERIFICATION_ORDER)[number]);
  if (targetIndex === -1) return false;
  if (currentIndex === -1) return false;
  return currentIndex >= targetIndex;
}

function formatPropertyType(propertyType: string | null | undefined, propertyTypeMap: Record<string, string>, notSet: string): string {
  if (!propertyType) return notSet;
  return propertyTypeMap[propertyType] ?? propertyType;
}

export default async function CustomerDashboardPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "dashboard.customer.main" });

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
  } as Record<(typeof CUSTOMER_TASK_IDS)[number], boolean>;

  return (
    <section className="flex-1 space-y-8">
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      <header className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{t("header.dashboardLabel")}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              {profile?.full_name
                ? t("header.welcomeBackWithName", { name: profile.full_name })
                : t("header.welcomeBack")}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#5d574b]">
              {t("header.description")}
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          >
            {t("header.signOut")}
          </Link>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label={t("summary.accountEmail")} value={user.email ?? "—"} />
          <SummaryCard label={t("summary.phone")} value={profile?.phone ?? t("summary.addYourPhone")} />
          <SummaryCard label={t("summary.city")} value={profile?.city ?? t("summary.addYourCity")} />
          <SummaryCard label={t("summary.verificationTier")} value={verificationTier.toUpperCase()} />
        </dl>
      </header>

      <section className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[#211f1a]">{t("tasks.title")}</h2>
            <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
              {t("tasks.description")}
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
          >
            {t("tasks.updateProfile")}
          </Link>
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {CUSTOMER_TASK_IDS.map((taskId, index) => {
            const isComplete = completedTasks[taskId];
            return (
              <li
                key={taskId}
                className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5d46] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <span className="text-base font-semibold text-[#211f1a]">{t(`tasks.${taskId}.title`)}</span>
                  </div>
                  {isComplete ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {t("tasks.status.completed")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {t("tasks.status.actionNeeded")}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-base leading-relaxed text-[#5d574b]">{t(`tasks.${taskId}.description`)}</p>
                {taskId === "payment" ? (
                  <PaymentAuthorizationCard hasPaymentMethod={hasPaymentMethod} />
                ) : !isComplete ? (
                  <Link
                    href={CUSTOMER_TASK_HREFS[taskId]}
                    className="mt-4 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
                  >
                    {t(`tasks.${taskId}.cta`)} →
                  </Link>
                ) : null}
                {taskId === "verification" && !isComplete ? (
                  <p className="mt-4 text-sm text-orange-700">{t("tasks.verification.upgradeNote")}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section id="addresses" className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="text-3xl font-semibold text-[#211f1a]">{t("sections.addresses.title")}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          {t("sections.addresses.description")}
        </p>
        <div className="mt-8">
          <SavedAddressesManager addresses={savedAddresses} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h3 className="text-2xl font-semibold text-[#211f1a]">{t("sections.propertyPreferences.title")}</h3>
          <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
            {t("sections.propertyPreferences.description")}
          </p>
          <dl className="mt-6 space-y-4 text-base">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{t("summary.propertyType")}</dt>
              <dd className="mt-2 text-[#211f1a]">
                {formatPropertyType(propertyType, {
                  apartment: t("summary.propertyTypes.apartment"),
                  house: t("summary.propertyTypes.house"),
                  office: t("summary.propertyTypes.office"),
                  other: t("summary.propertyTypes.other"),
                }, t("summary.notSet"))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{t("summary.city")}</dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.city ?? t("summary.addYourCity")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{t("summary.country")}</dt>
              <dd className="mt-2 text-[#211f1a]">{profile?.country ?? "Colombia"}</dd>
            </div>
          </dl>
          <Link href="#" className="mt-6 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]">
            {t("sections.propertyPreferences.updatePreferences")}
          </Link>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h3 className="text-2xl font-semibold text-[#211f1a]">{t("sections.needHelp.title")}</h3>
          <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
            {t("sections.needHelp.description")}
          </p>
          <ul className="mt-6 space-y-3 text-base text-[#211f1a]">
            <li>
              <span className="font-semibold">{t("sections.needHelp.liveChat")}</span> {t("sections.needHelp.liveChatHours")}
            </li>
            <li>
              <span className="font-semibold">{t("sections.needHelp.email")}</span> {t("sections.needHelp.emailAddress")}
            </li>
            <li>
              <span className="font-semibold">{t("sections.needHelp.emergencyLine")}</span> {t("sections.needHelp.emergencyPhone")}
            </li>
          </ul>
          <Link href="/support/account-suspended" className="mt-6 inline-flex items-center text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]">
            {t("sections.needHelp.browseHelpCenter")}
          </Link>
        </div>
      </section>

      <section id="bookings" className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="text-3xl font-semibold text-[#211f1a]">{t("sections.bookings.title")}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          {t("sections.bookings.description")}
        </p>
        <div className="mt-8">
          <CustomerBookingList bookings={bookings} />
        </div>
      </section>

      <section id="favorites" className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="text-3xl font-semibold text-[#211f1a]">{t("sections.favorites.title")}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          {t("sections.favorites.description")}
        </p>
        <div className="mt-8">
          <FavoritesList />
        </div>
      </section>

      <section id="messages" className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="text-3xl font-semibold text-[#211f1a]">{t("sections.messages.title")}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          {t("sections.messages.description")}
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/customer/messages"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff5d46] px-6 py-3 text-base font-medium text-white transition hover:bg-[#e54d3c]"
          >
            {t("sections.messages.viewAllMessages")}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {QUICK_LINK_IDS.map((linkId) => (
          <Link
            key={linkId}
            href={QUICK_LINKS_HREFS[linkId]}
            className="group rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]"
          >
            <h3 className="text-lg font-semibold text-[#211f1a]">{t(`quickLinks.${linkId}.title`)}</h3>
            <p className="mt-3 text-base leading-relaxed text-[#5d574b]">{t(`quickLinks.${linkId}.description`)}</p>
            <span className="mt-4 inline-flex items-center text-base font-semibold text-[#ff5d46] group-hover:text-[#eb6c65]">
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
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{label}</dt>
      <dd className="mt-2 text-base font-medium text-[#211f1a]">{value}</dd>
    </div>
  );
}
