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

function OnboardingTaskItem({
  task,
  isComplete,
  missingDocuments,
  professionalProfile,
  t,
}: {
  task: (typeof TASKS)[number];
  isComplete: boolean;
  missingDocuments: string[];
  professionalProfile: ProfessionalProfile | null;
  t: (key: string, values?: any) => string;
}) {
  return (
    <li className="hover:-translate-y-1 rounded-[28px] border border-[var(--border-light)] bg-white p-6 shadow-sm transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[var(--red)] text-xs uppercase tracking-[0.2em]">
          {t(`onboarding.tasks.${task.id}.title`)}
        </span>
        {isComplete ? (
          <span className="rounded-full bg-[var(--status-success-bg)] px-3 py-1 font-semibold text-[var(--status-success-text)] text-xs">
            {t("onboarding.status.completed")}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--status-warning-bg)] px-3 py-1 font-semibold text-[var(--status-warning-text)] text-xs">
            {t("onboarding.status.actionNeeded")}
          </span>
        )}
      </div>
      <p className="mt-4 text-[var(--foreground)] text-base leading-relaxed">
        {t(`onboarding.tasks.${task.id}.description`)}
      </p>
      {isComplete ? null : (
        <Link
          className="mt-3 inline-flex items-center font-semibold text-[var(--red)] text-sm hover:text-[var(--red-hover)]"
          href={task.cta.href}
        >
          {t(`onboarding.tasks.${task.id}.cta`)} →
        </Link>
      )}
      {task.id === "documents" && missingDocuments.length > 0 ? (
        <p className="mt-3 text-[var(--status-error-text)] text-xs">
          {t("onboarding.warnings.missing")}{" "}
          {missingDocuments.map((doc) => DOCUMENT_LABELS[doc] ?? doc).join(", ")}
        </p>
      ) : null}
      {task.id === "profile" &&
      professionalProfile?.primary_services &&
      professionalProfile.primary_services.length === 0 ? (
        <p className="mt-3 text-[var(--status-error-text)] text-xs">
          {t("onboarding.warnings.addService")}
        </p>
      ) : null}
      {task.id === "profile" && professionalProfile?.onboarding_completed_at ? (
        <p className="mt-3 text-[var(--status-success-text)] text-xs">
          {t("onboarding.warnings.profileActivated")}{" "}
          {formatDate(professionalProfile.onboarding_completed_at)}.
        </p>
      ) : null}
      {task.id === "application" &&
      professionalProfile?.references_data &&
      professionalProfile.references_data.length < 2 ? (
        <p className="mt-3 text-[var(--status-error-text)] text-xs">
          {t("onboarding.warnings.addReferences")}
        </p>
      ) : null}
    </li>
  );
}

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

function formatCOPWithFallback(value?: number | null) {
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

type CompletedBooking = {
  id: string;
  service_name: string | null;
  scheduled_start: string | null;
  customer: { id: string } | null;
  hasReview: boolean;
};

type DataErrors = {
  profileError?: any;
  documentsError?: any;
  bookingsError?: any;
  customerReviewsError?: any;
  addonsError?: any;
};

function logDataErrors(errors: DataErrors): void {
  if (errors.profileError) {
    console.error("Error fetching professional profile:", errors.profileError);
  }
  if (errors.documentsError) {
    console.error("Error fetching documents:", errors.documentsError);
  }
  if (errors.bookingsError) {
    console.error("Error fetching bookings:", errors.bookingsError);
  }
  if (errors.customerReviewsError) {
    console.error("Error fetching customer reviews:", errors.customerReviewsError);
  }
  if (errors.addonsError) {
    console.error("Error fetching addons:", errors.addonsError);
  }
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

async function addSignedUrlsToDocuments(
  documents: DocumentRow[],
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<DocumentRow[]> {
  if (documents.length === 0) {
    return documents;
  }

  const signedUrlResults = await Promise.all(
    documents.map((doc) =>
      supabase.storage.from("professional-documents").createSignedUrl(doc.storage_path, 120)
    )
  );

  return documents.map((doc, index) => {
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

function findMissingDocuments(documents: DocumentRow[]): string[] {
  const requiredDocKeys = new Set(REQUIRED_DOCUMENTS.map((doc) => doc.key));
  const uploadedDocMap = new Map<string, DocumentRow>();
  for (const doc of documents) {
    if (!uploadedDocMap.has(doc.document_type)) {
      uploadedDocMap.set(doc.document_type, doc);
    }
  }
  return [...requiredDocKeys].filter((key) => !uploadedDocMap.has(key));
}

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

async function fetchProfessionalData(
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
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
      .eq("profile_id", userId)
      .maybeSingle(),
    supabase
      .from("professional_documents")
      .select("id, document_type, storage_path, uploaded_at, metadata")
      .eq("profile_id", userId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("bookings")
      .select(
        `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
        customer:profiles!customer_id(id)`
      )
      .eq("professional_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("customer_reviews").select("booking_id").eq("professional_id", userId),
    supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  logDataErrors({
    profileError,
    documentsError,
    bookingsError,
    customerReviewsError,
    addonsError,
  });

  return {
    profileData,
    documentsData,
    bookingsData,
    customerReviewsData,
    addonsData,
  };
}

async function processProfessionalData(options: {
  profileData: any;
  documentsData: any;
  bookingsData: any;
  customerReviewsData: any;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}) {
  const professionalProfile = (options.profileData as ProfessionalProfile | null) ?? null;
  const bookings = (options.bookingsData as ProfessionalBookingRow[] | null) ?? [];
  const customerReviews = (options.customerReviewsData as { booking_id: string }[] | null) ?? [];

  const reviewedBookingIds = new Set(customerReviews.map((r) => r.booking_id));
  const completedBookings = prepareCompletedBookings(bookings, reviewedBookingIds);

  const documentsWithUrls = await addSignedUrlsToDocuments(
    (options.documentsData as DocumentRow[] | null) ?? [],
    options.supabase
  );

  const missingDocuments = findMissingDocuments(documentsWithUrls);
  const metrics = calculateMetrics(bookings);

  return {
    professionalProfile,
    bookings,
    completedBookings,
    documents: documentsWithUrls,
    missingDocuments,
    metrics,
  };
}

export default async function ProfessionalDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.main" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { profileData, documentsData, bookingsData, customerReviewsData, addonsData } =
    await fetchProfessionalData(user.id, supabase);

  const { professionalProfile, bookings, completedBookings, documents, missingDocuments, metrics } =
    await processProfessionalData({
      profileData,
      documentsData,
      bookingsData,
      customerReviewsData,
      supabase,
    });

  const addons = (addonsData as any[] | null) ?? [];
  const onboardingStatus = user.onboardingStatus;
  const { activeBookings, pendingBookings, completedThisWeek, weeklyEarnings } = metrics;

  return (
    <section className="flex-1 space-y-8">
      {/* Push Notification Permission Prompt */}
      <NotificationPermissionPrompt variant="banner" />

      <header className="rounded-[32px] bg-white p-10 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <div>
          <h1 className="type-serif-lg text-[var(--foreground)]">
            {t("welcomeBack")}
            {professionalProfile?.full_name ? `, ${professionalProfile.full_name}` : ""}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--muted-foreground)] text-lg leading-relaxed">
            {onboardingStatus === "active" ? t("dashboardDescription") : t("onboardingDescription")}
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
                value={formatCOPWithFallback(weeklyEarnings)}
              />
            </dl>
          </Suspense>
        ) : null}
      </header>

      {onboardingStatus === "active" ? null : (
        <section className="rounded-[32px] border border-[var(--border-light)] bg-gradient-to-br from-[var(--red-light)] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-3xl text-[var(--foreground)]">
                {t("onboarding.title")}
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("onboarding.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--red)] px-6 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[var(--red-hover)]"
              href="/dashboard/pro/onboarding"
            >
              {t("onboarding.manageButton")}
            </Link>
          </div>

          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {TASKS.map((task) => (
              <OnboardingTaskItem
                isComplete={hasReachedStatus(onboardingStatus, task.targetStatus)}
                key={task.id}
                missingDocuments={missingDocuments}
                professionalProfile={professionalProfile}
                t={t}
                task={task}
              />
            ))}
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
              <h2 className="font-semibold text-3xl text-[var(--foreground)]">
                {t("sections.bookingCalendar.title")}
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("sections.bookingCalendar.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--border-light)] px-5 py-2.5 font-semibold text-[var(--foreground)] text-sm transition hover:border-[var(--red)] hover:text-[var(--red)]"
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
            <h3 className="mb-4 font-semibold text-[var(--foreground)] text-xl">
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
              <h2 className="font-semibold text-3xl text-[var(--foreground)]">
                {t("sections.services.title")}
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
                {t("sections.services.description")}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--red)] px-5 py-2.5 font-semibold text-sm text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[var(--red-hover)]"
              href="/dashboard/pro/onboarding"
            >
              {t("sections.services.editButton")}
            </Link>
          </div>

          {/* Current Services */}
          <div className="mt-8">
            <h3 className="font-semibold text-[var(--foreground)] text-xl">
              {t("sections.services.yourServices")}
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {professionalProfile?.primary_services?.length ? (
                professionalProfile.primary_services.map((service) => (
                  <span
                    className="rounded-full border-2 border-[var(--border-light)] bg-white px-5 py-2.5 font-semibold text-[var(--foreground)] text-sm"
                    key={service}
                  >
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-[var(--muted-foreground)] text-base">
                  {t("sections.services.noServices")}
                </p>
              )}
            </div>
          </div>

          {/* Service Add-ons */}
          <div className="mt-8">
            <h3 className="font-semibold text-[var(--foreground)] text-xl">
              {t("sections.services.customAddons")}
            </h3>
            <p className="mt-2 text-[var(--muted-foreground)] text-base">
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
        <h3 className="font-semibold text-2xl text-[var(--foreground)]">
          {t("sections.documents.title")}
        </h3>
        <p className="mt-3 text-[var(--muted-foreground)] text-base leading-relaxed">
          {t("sections.documents.description")}
        </p>
        {documents.length === 0 ? (
          <p className="mt-4 text-[var(--status-error-text)] text-base">
            {t("sections.documents.noDocuments")}
          </p>
        ) : (
          <Suspense fallback={<DocumentsSkeleton />}>
            <ul className="mt-6 divide-y divide-[var(--border-lighter)] text-[var(--foreground)] text-sm">
              {documents.map((doc) => (
                <li className="flex flex-col gap-2 py-4" key={doc.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium">
                        {DOCUMENT_LABELS[doc.document_type] ?? doc.document_type}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[var(--label-muted)] text-xs">
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
                    <span className="text-[var(--label-muted)] text-xs uppercase tracking-wide">
                      {t("sections.documents.uploaded")} {formatDate(doc.uploaded_at)}
                    </span>
                  </div>
                  {doc.signedUrl ? (
                    <Link
                      className="inline-flex w-fit items-center gap-1 rounded-md border border-[var(--border-lighter)] px-3 py-1 font-semibold text-[var(--red)] text-xs transition hover:border-[var(--red)] hover:text-[var(--red-hover)]"
                      href={doc.signedUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("sections.documents.download")}
                    </Link>
                  ) : (
                    <p className="text-[var(--status-error-text)] text-xs">
                      {t("sections.documents.downloadError")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Suspense>
        )}
        <Link
          className="mt-4 inline-flex items-center font-semibold text-[var(--red)] text-sm hover:text-[var(--red-hover)]"
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
    <div className="rounded-2xl border border-[var(--border-light)] bg-white p-6 shadow-sm transition hover:shadow-md">
      <dt className="font-semibold text-[var(--label-muted)] text-xs uppercase tracking-[0.2em]">
        {label}
      </dt>
      <dd className="mt-3 font-semibold text-3xl text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
