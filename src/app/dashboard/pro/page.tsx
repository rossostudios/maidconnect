import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth";
import { REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS } from "@/app/dashboard/pro/onboarding/actions";

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
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("es-CO", {
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

export default async function ProfessionalDashboardPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const [{ data: profileData, error: profileError }, { data: documentsData, error: documentsError }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("full_name, status, onboarding_completed_at, primary_services, rate_expectations, references_data")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("professional_documents")
      .select("id, document_type, storage_path, uploaded_at, metadata")
      .eq("profile_id", user.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  if (profileError) {
    console.error("Failed to load professional profile", profileError);
  }
  if (documentsError) {
    console.error("Failed to load professional documents", documentsError);
  }

  const professionalProfile = (profileData as ProfessionalProfile | null) ?? null;
  let documents = (documentsData as DocumentRow[] | null) ?? [];

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

  return (
    <section className="flex-1 space-y-6">
      <header className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back{professionalProfile?.full_name ? `, ${professionalProfile.full_name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Review your onboarding progress and take the next steps to start accepting bookings.
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
          <SummaryStat label="Account email" value={user.email ?? "—"} />
          <SummaryStat label="Onboarding status" value={formatStatus(onboardingStatus)} />
          <SummaryStat label="Preferred language" value={user.locale ?? "—"} />
          <SummaryStat
            label="Hourly rate (COP)"
            value={formatCurrencyCOP(professionalProfile?.rate_expectations?.hourly_cop)}
          />
        </dl>
      </header>

      <section className="rounded-xl border border-[#fd857f33] bg-[#fef1ee] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#402d2d]">Onboarding checklist</h2>
            <p className="text-sm text-[#7a524c]">
              Complete each step so customers can discover and book you. Missing items are highlighted below.
            </p>
          </div>
          <Link
            href="/dashboard/pro/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
          >
            Manage onboarding
          </Link>
        </div>

        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {TASKS.map((task) => {
            const isComplete = hasReachedStatus(onboardingStatus, task.targetStatus);
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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#211f1a]">Document center</h3>
          <p className="mt-1 text-sm text-[#7a6d62]">
            Keep your verification paperwork current. Upload new files if your information changes.
          </p>
          {documents.length === 0 ? (
            <p className="mt-4 text-sm text-[#c4534d]">
              We don’t have any documents on file yet. Please upload the required documents.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#efe7dc] text-sm text-[#211f1a]">
              {documents.map((doc) => (
                <li key={doc.id} className="flex flex-col gap-2 py-3">
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
                      className="inline-flex w-fit items-center gap-1 rounded-md border border-[#efe7dc] px-3 py-1 text-xs font-semibold text-[#fd857f] transition hover:border-[#fd857f] hover:text-[#eb6c65]"
                    >
                      Download
                    </Link>
                  ) : (
                    <p className="text-xs text-[#c4534d]">We couldn’t generate a download link. Try reloading.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/pro/onboarding"
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#fd857f] hover:text-[#eb6c65]"
          >
            Manage documents →
          </Link>
        </div>

        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#211f1a]">Profile snapshot</h3>
          <p className="mt-1 text-sm text-[#7a6d62]">
            Keep your services and availability up to date so customers always know what to expect.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">Services</dt>
              <dd className="mt-1 text-[#211f1a]">
                {professionalProfile?.primary_services?.length
                  ? professionalProfile.primary_services.join(", ")
                  : "Add the services you offer"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">References</dt>
              <dd className="mt-1 text-[#211f1a]">
                {professionalProfile?.references_data?.length
                  ? `${professionalProfile.references_data.length} on file`
                  : "Add at least two references"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">Profile status</dt>
              <dd className="mt-1 text-[#211f1a]">
                {professionalProfile?.status ? formatStatus(professionalProfile.status) : "Pending"}
              </dd>
            </div>
          </dl>
          <Link
            href="/dashboard/pro/onboarding"
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#fd857f] hover:text-[#eb6c65]"
          >
            Edit profile →
          </Link>
        </div>
      </section>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">{label}</dt>
      <dd className="mt-1 text-sm text-[#211f1a]">{value}</dd>
    </div>
  );
}
