import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ApplicationForm } from "./application-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ProfileBuildForm } from "./profile-build-form";

const inputClass =
  "w-full rounded-xl border border-[#ebe5d8] bg-white px-4 py-4 text-base shadow-sm transition focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]";

const APPLICATION_SERVICE_OPTIONS = [
  "House cleaning",
  "Laundry",
  "Cooking",
  "Organization",
  "Childcare",
  "Pet care",
  "Errand running",
];

const PROFILE_SERVICE_OPTIONS = ["House cleaning", "Laundry", "Cooking"];

const COUNTRY_OPTIONS = [
  "Colombia",
  "United States",
  "Canada",
  "United Kingdom",
  "Mexico",
  "Other",
];

const AVAILABILITY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const LANGUAGE_OPTIONS = ["Español", "English", "Português", "Français"];

const STEP_IDS = ["application", "documents", "profile"] as const;

function currentStepIndex(status: string | null) {
  switch (status) {
    case "application_pending":
      return 0;
    case "application_in_review":
      return 1;
    case "approved":
      return 2;
    case "active":
      return 3;
    default:
      return 0;
  }
}

type ProfileInitialData = {
  bio?: string | null;
  languages?: string[] | null;
  services?: Array<{
    name?: string | null;
    hourly_rate_cop?: number | null;
    description?: string | null;
  }> | null;
  availability?: Array<{
    day?: string | null;
    start?: string | null;
    end?: string | null;
    notes?: string | null;
  }> | null;
};

type SupabaseProfessionalProfile = {
  bio: string | null;
  languages: string[] | null;
  services: Array<{
    name?: string | null;
    hourly_rate_cop?: number | null;
    description?: string | null;
  }> | null;
  availability: { schedule?: ProfileInitialData["availability"] } | null;
};

export default async function ProfessionalOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.onboarding" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const stepIndex = currentStepIndex(user.onboardingStatus);
  const isActive = user.onboardingStatus === "active";
  const onboardingComplete = stepIndex >= STEP_IDS.length;

  const supabase = await createSupabaseServerClient();
  const { data: professionalProfileData } = await supabase
    .from("professional_profiles")
    .select("bio, languages, services, availability")
    .eq("profile_id", user.id)
    .maybeSingle();

  let profileInitialData: ProfileInitialData | undefined;
  const professionalProfileRecord =
    (professionalProfileData as SupabaseProfessionalProfile | null) ?? null;
  if (professionalProfileRecord) {
    const availabilitySchedule =
      professionalProfileRecord.availability &&
      typeof professionalProfileRecord.availability === "object"
        ? (professionalProfileRecord.availability.schedule ?? [])
        : [];
    profileInitialData = {
      bio: professionalProfileRecord.bio ?? "",
      languages: professionalProfileRecord.languages ?? [],
      services: Array.isArray(professionalProfileRecord.services)
        ? professionalProfileRecord.services
        : [],
      availability: Array.isArray(availabilitySchedule) ? availabilitySchedule : [],
    };
  }

  return (
    <section className="flex-1 space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
            {t(isActive ? "header.badgeActive" : "header.badgeOnboarding")}
          </p>
          <h1 className="mt-4 font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
            {t(isActive ? "header.titleActive" : "header.titleOnboarding")}
          </h1>
          <p className="mt-4 max-w-2xl text-[#5d574b] text-lg leading-relaxed">
            {t(isActive ? "header.descriptionActive" : "header.descriptionOnboarding")}
          </p>
        </div>
        <Link
          className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
          href="/dashboard/pro"
        >
          {t("header.backButton")}
        </Link>
      </header>

      {isActive ? null : (
        <ol className="grid gap-6 md:grid-cols-3">
          {STEP_IDS.map((stepId, index) => {
            const isCompleted = stepIndex > index;
            const isCurrent = stepIndex === index && !onboardingComplete;

            return (
              <li
                className={`hover:-translate-y-1 rounded-[28px] border p-8 shadow-sm transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)] ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : isCurrent
                      ? "border-[#ebe5d8] bg-white shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
                      : "border-[#ebe5d8] bg-white"
                }`}
                key={stepId}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5d46] font-semibold text-lg text-white">
                    {index + 1}
                  </div>
                  {isCompleted ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs">
                      {t("steps.statusCompleted")}
                    </span>
                  ) : isCurrent ? (
                    <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 text-xs">
                      {t("steps.statusInProgress")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 text-xs">
                      {t("steps.statusPending")}
                    </span>
                  )}
                </div>
                <h2 className="mt-6 font-semibold text-[#211f1a] text-xl">
                  {t(`steps.${stepId}.title`)}
                </h2>
                <p className="mt-3 text-[#5d574b] text-base leading-relaxed">
                  {t(`steps.${stepId}.description`)}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {isActive ? (
        <div className="space-y-8">
          <div className="rounded-[28px] border border-green-200 bg-green-50 p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  aria-label="Success icon"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  role="img"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-2xl text-green-900">{t("profileLive.title")}</h2>
                <p className="mt-2 text-base text-green-800 leading-relaxed">
                  {t("profileLive.description")}
                </p>
              </div>
            </div>
          </div>

          <SectionWrapper
            subtitle={t("sections.publicProfile.subtitle")}
            title={t("sections.publicProfile.title")}
          >
            <ProfileBuildForm
              availabilityDays={AVAILABILITY_OPTIONS.map((label) => ({
                label,
                slug: label.toLowerCase().replace(/\s+/g, "_"),
              }))}
              footnote={t("sections.publicProfile.footnote")}
              initialData={profileInitialData}
              inputClass={inputClass}
              languages={LANGUAGE_OPTIONS}
              services={PROFILE_SERVICE_OPTIONS.map((name) => ({ name }))}
              submitLabel={t("sections.publicProfile.submitLabel")}
            />
          </SectionWrapper>
        </div>
      ) : (
        <>
          {stepIndex === 0 ? (
            <SectionWrapper
              subtitle={t("sections.applicationDetails.subtitle")}
              title={t("sections.applicationDetails.title")}
            >
              <ApplicationForm
                countries={COUNTRY_OPTIONS}
                inputClass={inputClass}
                services={APPLICATION_SERVICE_OPTIONS}
              />
            </SectionWrapper>
          ) : null}

          {stepIndex === 1 ? (
            <SectionWrapper
              subtitle={t("sections.uploadDocuments.subtitle")}
              title={t("sections.uploadDocuments.title")}
            >
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("sections.uploadDocuments.required.title")}
                  </h3>
                  <ul className="mt-4 space-y-3 text-[#5d574b] text-base">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]" />
                      <span>{t("sections.uploadDocuments.required.governmentId")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]" />
                      <span>{t("sections.uploadDocuments.required.proofOfAddress")}</span>
                    </li>
                  </ul>

                  <h3 className="mt-8 font-semibold text-[#211f1a] text-xl">
                    {t("sections.uploadDocuments.optional.title")}
                  </h3>
                  <ul className="mt-4 space-y-3 text-[#5d574b] text-base">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
                      <span>{t("sections.uploadDocuments.optional.certifications")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
                      <span>{t("sections.uploadDocuments.optional.workPermits")}</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                    <p className="text-[#5d574b] text-sm leading-relaxed">
                      <strong className="text-[#211f1a]">
                        {t("sections.uploadDocuments.formats.label")}
                      </strong>{" "}
                      {t("sections.uploadDocuments.formats.text")}
                    </p>
                  </div>
                </div>
                <DocumentUploadForm inputClass={inputClass} />
              </div>
            </SectionWrapper>
          ) : null}

          {stepIndex === 2 ? (
            <SectionWrapper
              subtitle={t("sections.createProfile.subtitle")}
              title={t("sections.createProfile.title")}
            >
              <ProfileBuildForm
                availabilityDays={AVAILABILITY_OPTIONS.map((label) => ({
                  label,
                  slug: label.toLowerCase().replace(/\s+/g, "_"),
                }))}
                initialData={profileInitialData}
                inputClass={inputClass}
                languages={LANGUAGE_OPTIONS}
                services={PROFILE_SERVICE_OPTIONS.map((name) => ({ name }))}
              />
            </SectionWrapper>
          ) : null}

          {onboardingComplete && !isActive ? (
            <div className="rounded-[28px] border border-green-200 bg-green-50 p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    aria-label="Success icon"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    role="img"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-2xl text-green-900">
                    {t("onboardingComplete.title")}
                  </h2>
                  <p className="mt-2 text-base text-green-800 leading-relaxed">
                    {t("onboardingComplete.description")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function SectionWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#ebe5d8] bg-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
      <header className="mb-8">
        <h2 className="font-semibold text-3xl text-[#211f1a]">{title}</h2>
        <p className="mt-3 text-[#5d574b] text-base leading-relaxed">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
