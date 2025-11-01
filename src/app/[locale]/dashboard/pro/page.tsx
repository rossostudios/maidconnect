import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
} from "@/app/[locale]/dashboard/pro/onboarding/state";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { ProBookingList } from "@/components/bookings/pro-booking-list";
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt";
import { PendingRatingsList } from "@/components/reviews/pending-ratings-list";
import { ServiceAddonsManager } from "@/components/service-addons/service-addons-manager";
import {
  BookingCalendarSkeleton,
  BookingsListSkeleton,
  DocumentsSkeleton,
  PendingRatingsSkeleton,
  ProfileMetricsSkeleton,
  ServiceAddonsSkeleton,
} from "@/components/skeletons/dashboard-skeletons";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const STATUS_ORDER = [
  "application_pending",
  "application_in_review",
  "approved",
  "active",
] as const;

const TASKS = [
  {
    id: "application",
    title: "Application details submitted",
    description: "Tell us who you are, your experience, references, and where you work.",
    targetStatus: "application_in_review",
    cta: {
      href: "/dashboard/pro/onboarding",
      label: "Update application",
    },
  },
  {
    id: "documents",
    title: "Required documents uploaded",
    description: "Upload your government ID and proof of address for verification.",
    targetStatus: "approved",
    cta: {
      href: "/dashboard/pro/onboarding",
      label: "Upload documents",
    },
  },
  {
    id: "profile",
    title: "Public profile ready",
    description: "Complete your bio, services, pricing, and availability to go live.",
    targetStatus: "active",
    cta: {
      href: "/dashboard/pro/onboarding",
      label: "Finish profile",
    },
  },
] as const;

const DOCUMENT_LABELS: Record<string, string> = Object.fromEntries(
  [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((doc) => [doc.key, doc.label])
);

function hasReachedStatus(currentStatus: string | null, targetStatus: string) {
  const currentIndex = STATUS_ORDER.indexOf((currentStatus ?? "") as (typeof STATUS_ORDER)[number]);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus as (typeof STATUS_ORDER)[number]);
  if (targetIndex === -1) {
    return false;
  }
  if (currentIndex === -1) {
    return false;
  }
  return currentIndex >= targetIndex;
}

function formatCurrencyCOP(value?: number | null) {
  if (!value || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "—";
  }
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

type ProfessionalProfile = {
  full_name: string | null;
  status: string | null;
  onboarding_completed_at: string | null;
  primary_services: string[] | null;
  rate_expectations: { hourly_cop?: number } | null;
  references_data: Array<{ name: string | null; contact: string | null }> | null;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarding_status: string | null;
};

type DocumentRow = {
  id: string;
  document_type: string;
  storage_path: string;
  uploaded_at: string;
  metadata: {
    originalName?: string;
    size?: number;
    mimeType?: string;
    note?: string | null;
  } | null;
  signedUrl?: string | null;
};

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

export default async function ProfessionalDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.main" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const [
    { data: profileData, error: profileError },
    { data: documentsData, error: documentsError },
    { data: bookingsData, error: bookingsError },
    { data: customerReviewsData, error: customerReviewsError },
    { data: addonsData, error: addonsError },
  ] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select(
        "full_name, status, onboarding_completed_at, primary_services, rate_expectations, references_data, stripe_connect_account_id, stripe_connect_onboarding_status"
      )
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("professional_documents")
      .select("id, document_type, storage_path, uploaded_at, metadata")
      .eq("profile_id", user.id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("bookings")
      .select(
        `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
        customer:profiles!customer_id(id)`
      )
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("customer_reviews").select("booking_id").eq("professional_id", user.id),
    supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileError) {
    console.error("Error fetching professional profile:", profileError);
  }
  if (documentsError) {
    console.error("Error fetching documents:", documentsError);
  }
  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
  }
  if (customerReviewsError) {
    console.error("Error fetching customer reviews:", customerReviewsError);
  }
  if (addonsError) {
    console.error("Error fetching addons:", addonsError);
  }

  const professionalProfile = (profileData as ProfessionalProfile | null) ?? null;
  let documents = (documentsData as DocumentRow[] | null) ?? [];
  const bookings = (bookingsData as ProfessionalBookingRow[] | null) ?? [];
  const customerReviews = (customerReviewsData as { booking_id: string }[] | null) ?? [];
  const addons = (addonsData as any[] | null) ?? [];

  // Create a Set of booking IDs that have been reviewed
  const reviewedBookingIds = new Set(customerReviews.map((r) => r.booking_id));

  // Filter completed bookings and mark which have reviews
  const completedBookings = bookings
    .filter((b) => b.status === "completed")
    .map((b) => ({
      id: b.id,
      service_name: b.service_name,
      scheduled_start: b.scheduled_start,
      customer: b.customer,
      hasReview: reviewedBookingIds.has(b.id),
    }))
    .slice(0, 5); // Show max 5 recent completed bookings

  if (documents.length > 0) {
    const signedUrlResults = await Promise.all(
      documents.map((doc) =>
        supabase.storage.from("professional-documents").createSignedUrl(doc.storage_path, 120)
      )
    );

    documents = documents.map((doc, index) => {
      const result = signedUrlResults[index];
      if (result?.error) {
        console.error("Error creating signed URL for document:", result.error);
      }
      return {
        ...doc,
        signedUrl: result?.data?.signedUrl ?? null,
      };
    });
  }

  const requiredDocKeys = new Set(REQUIRED_DOCUMENTS.map((doc) => doc.key));
  const uploadedDocMap = new Map<string, DocumentRow>();
  for (const doc of documents) {
    if (!uploadedDocMap.has(doc.document_type)) {
      uploadedDocMap.set(doc.document_type, doc);
    }
  }
  const missingDocuments = [...requiredDocKeys].filter((key) => !uploadedDocMap.has(key));

  const onboardingStatus = user.onboardingStatus;

  // Calculate real-time metrics
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const completedThisWeek = bookings.filter((b) => {
    if (b.status !== "completed" || !b.scheduled_start) {
      return false;
    }
    const bookingDate = new Date(b.scheduled_start);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bookingDate >= weekAgo;
  }).length;
  const weeklyEarnings = bookings
    .filter((b) => {
      if (b.status !== "completed" || !b.scheduled_start || !b.amount_captured) {
        return false;
      }
      const bookingDate = new Date(b.scheduled_start);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    })
    .reduce((sum, b) => sum + (b.amount_captured || 0), 0);

  return (
    <section className="flex-1 space-y-8">
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      <header className="rounded-[32px] bg-white p-10 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div>
          <h1 className="font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
            {t("welcomeBack")}
            {professionalProfile?.full_name ? `, ${professionalProfile.full_name}` : ""}
          </h1>
          <p className="mt-4 max-w-2xl text-[#5d574b] text-lg leading-relaxed">
            {onboardingStatus === "active"
              ? t("dashboardDescription")
              : t("onboardingDescription")}
          </p>
        </div>
        {onboardingStatus === "active" ? (
          <Suspense fallback={<ProfileMetricsSkeleton />}>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label={t("metrics.activeBookings")} value={activeBookings.toString()} />
              <MetricCard label={t("metrics.pendingRequests")} value={pendingBookings.toString()} />
              <MetricCard
                label={t("metrics.completedThisWeek")}
                value={completedThisWeek.toString()}
              />
              <MetricCard
                label={t("metrics.earningsThisWeek")}
                value={formatCurrencyCOP(weeklyEarnings)}
              />
            </dl>
          </Suspense>
        ) : null}
      </header>

      {onboardingStatus === "active" ? null : (
        <section className="rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fff5f2] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-3xl text-[#211f1a]">{t("onboarding.title")}</h2>
              <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                {t("onboarding.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
              href="/dashboard/pro/onboarding"
            >
              {t("onboarding.manageButton")}
            </Link>
          </div>

          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {TASKS.map((task) => {
              const isComplete = hasReachedStatus(onboardingStatus, task.targetStatus);
              return (
                <li
                  className="hover:-translate-y-1 rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]"
                  key={task.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#ff5d46] text-xs uppercase tracking-[0.2em]">
                      {t(`onboarding.tasks.${task.id}.title`)}
                    </span>
                    {isComplete ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700 text-xs">
                        {t("onboarding.status.completed")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 text-xs">
                        {t("onboarding.status.actionNeeded")}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-[#211f1a] text-base leading-relaxed">
                    {t(`onboarding.tasks.${task.id}.description`)}
                  </p>
                  {isComplete ? null : (
                    <Link
                      className="mt-3 inline-flex items-center font-semibold text-[#ff5d46] text-sm hover:text-[#eb6c65]"
                      href={task.cta.href}
                    >
                      {t(`onboarding.tasks.${task.id}.cta`)} →
                    </Link>
                  )}
                  {task.id === "documents" && missingDocuments.length > 0 ? (
                    <p className="mt-3 text-[#c4534d] text-xs">
                      {t("onboarding.warnings.missing")}{" "}
                      {missingDocuments.map((doc) => DOCUMENT_LABELS[doc] ?? doc).join(", ")}
                    </p>
                  ) : null}
                  {task.id === "profile" &&
                  professionalProfile?.primary_services &&
                  professionalProfile.primary_services.length === 0 ? (
                    <p className="mt-3 text-[#c4534d] text-xs">
                      {t("onboarding.warnings.addService")}
                    </p>
                  ) : null}
                  {task.id === "profile" && professionalProfile?.onboarding_completed_at ? (
                    <p className="mt-3 text-[#2f7a47] text-xs">
                      {t("onboarding.warnings.profileActivated")}{" "}
                      {formatDate(professionalProfile.onboarding_completed_at)}.
                    </p>
                  ) : null}
                  {task.id === "application" &&
                  professionalProfile?.references_data &&
                  professionalProfile.references_data.length < 2 ? (
                    <p className="mt-3 text-[#c4534d] text-xs">
                      {t("onboarding.warnings.addReferences")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Pending Customer Ratings */}
      {onboardingStatus === "active" && completedBookings.length > 0 ? (
        <Suspense fallback={<PendingRatingsSkeleton />}>
          <PendingRatingsList completedBookings={completedBookings} />
        </Suspense>
      ) : null}

      {/* Full-Width Booking Calendar & List */}
      {onboardingStatus === "active" ? (
        <section className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-3xl text-[#211f1a]">
                {t("sections.bookingCalendar.title")}
              </h2>
              <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                {t("sections.bookingCalendar.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              href="/dashboard/pro/onboarding"
            >
              {t("sections.bookingCalendar.updateAvailability")}
            </Link>
          </div>
          <div className="mt-8">
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
          <div className="mt-8">
            <h3 className="mb-4 font-semibold text-[#211f1a] text-xl">
              {t("sections.recentBookings")}
            </h3>
            <Suspense fallback={<BookingsListSkeleton />}>
              <ProBookingList bookings={bookings} />
            </Suspense>
          </div>
        </section>
      ) : null}

      {/* Services & Add-ons Combined */}
      {onboardingStatus === "active" ? (
        <section className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-3xl text-[#211f1a]">
                {t("sections.services.title")}
              </h2>
              <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                {t("sections.services.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-5 py-2.5 font-semibold text-sm text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
              href="/dashboard/pro/onboarding"
            >
              {t("sections.services.editButton")}
            </Link>
          </div>

          {/* Current Services */}
          <div className="mt-8">
            <h3 className="font-semibold text-[#211f1a] text-xl">
              {t("sections.services.yourServices")}
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {professionalProfile?.primary_services?.length ? (
                professionalProfile.primary_services.map((service) => (
                  <span
                    className="rounded-full border-2 border-[#ebe5d8] bg-white px-5 py-2.5 font-semibold text-[#211f1a] text-sm"
                    key={service}
                  >
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-[#5d574b] text-base">{t("sections.services.noServices")}</p>
              )}
            </div>
          </div>

          {/* Service Add-ons */}
          <div className="mt-8">
            <h3 className="font-semibold text-[#211f1a] text-xl">
              {t("sections.services.customAddons")}
            </h3>
            <p className="mt-2 text-[#5d574b] text-base">
              {t("sections.services.addonsDescription")}
            </p>
            <div className="mt-4">
              <Suspense fallback={<ServiceAddonsSkeleton />}>
                <ServiceAddonsManager addons={addons} professionalId={user.id} />
              </Suspense>
            </div>
          </div>
        </section>
      ) : null}

      {/* Document center */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h3 className="font-semibold text-2xl text-[#211f1a]">{t("sections.documents.title")}</h3>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
          {t("sections.documents.description")}
        </p>
        {documents.length === 0 ? (
          <p className="mt-4 text-[#c4534d] text-base">{t("sections.documents.noDocuments")}</p>
        ) : (
          <Suspense fallback={<DocumentsSkeleton />}>
            <ul className="mt-6 divide-y divide-[#efe7dc] text-[#211f1a] text-sm">
              {documents.map((doc) => (
                <li className="flex flex-col gap-2 py-4" key={doc.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium">
                        {DOCUMENT_LABELS[doc.document_type] ?? doc.document_type}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[#7a6d62] text-xs">
                        <span>
                          {doc.metadata?.originalName ?? t("sections.documents.unnamedFile")}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(doc.metadata?.size)}</span>
                        {doc.metadata?.note ? (
                          <>
                            <span>•</span>
                            <span>Note: {doc.metadata.note}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[#7a6d62] text-xs uppercase tracking-wide">
                      {t("sections.documents.uploaded")} {formatDate(doc.uploaded_at)}
                    </span>
                  </div>
                  {doc.signedUrl ? (
                    <Link
                      className="inline-flex w-fit items-center gap-1 rounded-md border border-[#efe7dc] px-3 py-1 font-semibold text-[#ff5d46] text-xs transition hover:border-[#ff5d46] hover:text-[#eb6c65]"
                      href={doc.signedUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("sections.documents.download")}
                    </Link>
                  ) : (
                    <p className="text-[#c4534d] text-xs">
                      {t("sections.documents.downloadError")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Suspense>
        )}
        <Link
          className="mt-4 inline-flex items-center font-semibold text-[#ff5d46] text-sm hover:text-[#eb6c65]"
          href="/dashboard/pro/onboarding"
        >
          {t("sections.documents.manageLink")} →
        </Link>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <dt className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">{label}</dt>
      <dd className="mt-3 font-semibold text-3xl text-[#211f1a]">{value}</dd>
    </div>
  );
}
