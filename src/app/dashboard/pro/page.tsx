import Link from "next/link";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { PendingRatingsList } from "@/components/reviews/pending-ratings-list";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth";
import { REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS } from "@/app/dashboard/pro/onboarding/state";
import { ServiceAddonsManager } from "@/components/service-addons/service-addons-manager";
import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { ProBookingList } from "@/components/bookings/pro-booking-list";

const STATUS_ORDER = ["application_pending", "application_in_review", "approved", "active"] as const;

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
  [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((doc) => [doc.key, doc.label]),
);

function formatStatus(status: string | null) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ");
}

function hasReachedStatus(currentStatus: string | null, targetStatus: string) {
  const currentIndex = STATUS_ORDER.indexOf((currentStatus ?? "") as (typeof STATUS_ORDER)[number]);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus as (typeof STATUS_ORDER)[number]);
  if (targetIndex === -1) return false;
  if (currentIndex === -1) return false;
  return currentIndex >= targetIndex;
}

function formatCurrencyCOP(value?: number | null) {
  if (!value || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "—";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
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

export default async function ProfessionalDashboardPage() {
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
        "full_name, status, onboarding_completed_at, primary_services, rate_expectations, references_data, stripe_connect_account_id, stripe_connect_onboarding_status",
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
        customer:profiles!customer_id(id)`,
      )
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("customer_reviews")
      .select("booking_id")
      .eq("professional_id", user.id),
    supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileError) {
    console.error("Failed to load professional profile", profileError);
  }
  if (documentsError) {
    console.error("Failed to load professional documents", documentsError);
  }
  if (bookingsError) {
    console.error("Failed to load professional bookings", bookingsError);
  }
  if (customerReviewsError) {
    console.error("Failed to load customer reviews", customerReviewsError);
  }
  if (addonsError) {
    console.error("Failed to load service add-ons", addonsError);
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
      documents.map((doc) => supabase.storage.from("professional-documents").createSignedUrl(doc.storage_path, 120)),
    );

    documents = documents.map((doc, index) => {
      const result = signedUrlResults[index];
      if (result.error) {
        console.error("Failed to generate signed URL", result.error);
      }
      return {
        ...doc,
        signedUrl: result.data?.signedUrl ?? null,
      };
    });
  }

  const requiredDocKeys = new Set(REQUIRED_DOCUMENTS.map((doc) => doc.key));
  const uploadedDocMap = new Map<string, DocumentRow>();
  documents.forEach((doc) => {
    if (!uploadedDocMap.has(doc.document_type)) {
      uploadedDocMap.set(doc.document_type, doc);
    }
  });
  const missingDocuments = [...requiredDocKeys].filter((key) => !uploadedDocMap.has(key));

  const onboardingStatus = user.onboardingStatus;

  // Calculate real-time metrics
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedThisWeek = bookings.filter(b => {
    if (b.status !== 'completed' || !b.scheduled_start) return false;
    const bookingDate = new Date(b.scheduled_start);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bookingDate >= weekAgo;
  }).length;
  const weeklyEarnings = bookings
    .filter(b => {
      if (b.status !== 'completed' || !b.scheduled_start || !b.amount_captured) return false;
      const bookingDate = new Date(b.scheduled_start);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    })
    .reduce((sum, b) => sum + (b.amount_captured || 0), 0);

  return (
    <section className="flex-1 space-y-8">
      <header className="rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fbfafa] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
              Welcome back{professionalProfile?.full_name ? `, ${professionalProfile.full_name}` : ""}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
              {onboardingStatus === "active"
                ? "Your dashboard overview for managing bookings, services, and customer communications."
                : "Review your onboarding progress and take the next steps to start accepting bookings."}
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="text-base font-semibold text-[#ff5d46] transition hover:text-[#eb6c65]"
          >
            Sign out
          </Link>
        </div>
        {onboardingStatus === "active" ? (
          <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active bookings" value={activeBookings.toString()} />
            <MetricCard label="Pending requests" value={pendingBookings.toString()} />
            <MetricCard label="Completed this week" value={completedThisWeek.toString()} />
            <MetricCard label="Earnings this week" value={formatCurrencyCOP(weeklyEarnings)} />
          </dl>
        ) : null}
      </header>

      {onboardingStatus === "active" ? null : (
        <section className="rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fff5f2] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[#211f1a]">Onboarding checklist</h2>
              <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                Complete each step so customers can discover and book you. Missing items are highlighted below.
              </p>
            </div>
            <Link
              href="/dashboard/pro/onboarding"
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
            >
              Manage onboarding
            </Link>
          </div>

          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {TASKS.map((task) => {
              const isComplete = hasReachedStatus(onboardingStatus, task.targetStatus);
              return (
                <li
                  key={task.id}
                  className="rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)] hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5d46]">{task.title}</span>
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
                  <p className="mt-4 text-base leading-relaxed text-[#211f1a]">{task.description}</p>
                  {!isComplete ? (
                    <Link
                      href={task.cta.href}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
                    >
                      {task.cta.label} →
                    </Link>
                  ) : null}
                  {task.id === "documents" && missingDocuments.length > 0 ? (
                    <p className="mt-3 text-xs text-[#c4534d]">
                      Missing: {missingDocuments.map((doc) => DOCUMENT_LABELS[doc] ?? doc).join(", ")}
                    </p>
                  ) : null}
                  {task.id === "profile" && professionalProfile?.primary_services && professionalProfile.primary_services.length === 0 ? (
                    <p className="mt-3 text-xs text-[#c4534d]">
                      Add at least one service to show customers what you offer.
                    </p>
                  ) : null}
                  {task.id === "profile" && professionalProfile?.onboarding_completed_at ? (
                    <p className="mt-3 text-xs text-[#2f7a47]">
                      Profile activated on {formatDate(professionalProfile.onboarding_completed_at)}.
                    </p>
                  ) : null}
                  {task.id === "application" && professionalProfile?.references_data && professionalProfile.references_data.length < 2 ? (
                    <p className="mt-3 text-xs text-[#c4534d]">
                      Add two professional references so we can complete your background check.
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
        <PendingRatingsList completedBookings={completedBookings} />
      ) : null}

      {/* Full-Width Booking Calendar & List */}
      {onboardingStatus === "active" ? (
        <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[#211f1a]">Booking calendar</h2>
              <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                View your upcoming bookings, manage requests, and track completed visits.
              </p>
            </div>
            <Link
              href="/dashboard/pro/onboarding"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            >
              Update availability
            </Link>
          </div>
          <div className="mt-8">
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
          </div>
          <div className="mt-8">
            <h3 className="mb-4 text-xl font-semibold text-[#211f1a]">Recent bookings</h3>
            <ProBookingList bookings={bookings} />
          </div>
        </section>
      ) : null}

      {/* Services & Add-ons Combined */}
      {onboardingStatus === "active" ? (
        <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[#211f1a]">Services & add-ons</h2>
              <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
                Manage your core services and create custom add-ons to increase booking value.
              </p>
            </div>
            <Link
              href="/dashboard/pro/onboarding"
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
            >
              Edit services
            </Link>
          </div>

          {/* Current Services */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-[#211f1a]">Your services</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {professionalProfile?.primary_services?.length ? (
                professionalProfile.primary_services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border-2 border-[#ebe5d8] bg-white px-5 py-2.5 text-sm font-semibold text-[#211f1a]"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-base text-[#5d574b]">No services added yet. Add services in your profile.</p>
              )}
            </div>
          </div>

          {/* Service Add-ons */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-[#211f1a]">Custom add-ons</h3>
            <p className="mt-2 text-base text-[#5d574b]">Offer extras like deep cleaning, laundry, or pet care.</p>
            <div className="mt-4">
              <ServiceAddonsManager addons={addons} professionalId={user.id} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Messages Section - Modernized */}
      {onboardingStatus === "active" ? (
        <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div>
            <h2 className="text-3xl font-semibold text-[#211f1a]">Messages</h2>
            <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
              Chat with customers about bookings, special requests, and service details.
            </p>
          </div>
          <div className="mt-6">
            <MessagingInterface userId={user.id} userRole="professional" />
          </div>
        </section>
      ) : null}

      {/* Document center */}
      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h3 className="text-2xl font-semibold text-[#211f1a]">Document center</h3>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">
          Keep your verification paperwork current. Upload new files if your information changes.
        </p>
        {documents.length === 0 ? (
          <p className="mt-4 text-base text-[#c4534d]">
            We don't have any documents on file yet. Please upload the required documents.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[#efe7dc] text-sm text-[#211f1a]">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-col gap-2 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium">{DOCUMENT_LABELS[doc.document_type] ?? doc.document_type}</span>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#7a6d62]">
                      <span>{doc.metadata?.originalName ?? "Unnamed file"}</span>
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
                  <span className="text-xs uppercase tracking-wide text-[#7a6d62]">
                    Uploaded {formatDate(doc.uploaded_at)}
                  </span>
                </div>
                {doc.signedUrl ? (
                  <Link
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1 rounded-md border border-[#efe7dc] px-3 py-1 text-xs font-semibold text-[#ff5d46] transition hover:border-[#ff5d46] hover:text-[#eb6c65]"
                  >
                    Download
                  </Link>
                ) : (
                  <p className="text-xs text-[#c4534d]">We couldn't generate a download link. Try reloading.</p>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/pro/onboarding"
          className="mt-4 inline-flex items-center text-sm font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
        >
          Manage documents →
        </Link>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{label}</dt>
      <dd className="mt-3 text-3xl font-semibold text-[#211f1a]">{value}</dd>
    </div>
  );
}
