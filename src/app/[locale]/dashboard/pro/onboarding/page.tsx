import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ApplicationForm } from "./application-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ProfileBuildForm } from "./profile-build-form";
import { getTranslations } from "next-intl/server";

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

const COUNTRY_OPTIONS = ["Colombia", "United States", "Canada", "United Kingdom", "Mexico", "Other"];

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
  const professionalProfileRecord = (professionalProfileData as SupabaseProfessionalProfile | null) ?? null;
  if (professionalProfileRecord) {
    const availabilitySchedule =
      professionalProfileRecord.availability && typeof professionalProfileRecord.availability === "object"
        ? professionalProfileRecord.availability.schedule ?? []
        : [];
    profileInitialData = {
      bio: professionalProfileRecord.bio ?? "",
      languages: professionalProfileRecord.languages ?? [],
      services: Array.isArray(professionalProfileRecord.services) ? professionalProfileRecord.services : [],
      availability: Array.isArray(availabilitySchedule) ? availabilitySchedule : [],
    };
  }

  return (
    <section className="flex-1 space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">
            {t(isActive ? "header.badgeActive" : "header.badgeOnboarding")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            {t(isActive ? "header.titleActive" : "header.titleOnboarding")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
            {t(isActive ? "header.descriptionActive" : "header.descriptionOnboarding")}
          </p>
        </div>
        <Link
          href="/dashboard/pro"
          className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
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
                key={stepId}
                className={`rounded-[28px] border p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)] ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : isCurrent
                      ? "border-[#ebe5d8] bg-white shadow-[0_10px_40px_rgba(18,17,15,0.04)]"
                      : "border-[#ebe5d8] bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5d46] text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  {isCompleted ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{t("steps.statusCompleted")}</span>
                  ) : isCurrent ? (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {t("steps.statusInProgress")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {t("steps.statusPending")}
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-xl font-semibold text-[#211f1a]">{t(`steps.${stepId}.title`)}</h2>
                <p className="mt-3 text-base leading-relaxed text-[#5d574b]">{t(`steps.${stepId}.description`)}</p>
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
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-green-900">{t("profileLive.title")}</h2>
                <p className="mt-2 text-base leading-relaxed text-green-800">
                  {t("profileLive.description")}
                </p>
              </div>
            </div>
          </div>

          <SectionWrapper
            title={t("sections.publicProfile.title")}
            subtitle={t("sections.publicProfile.subtitle")}
          >
            <ProfileBuildForm
              services={PROFILE_SERVICE_OPTIONS.map((name) => ({ name }))}
              availabilityDays={AVAILABILITY_OPTIONS.map((label) => ({
                label,
                slug: label.toLowerCase().replace(/\s+/g, "_"),
              }))}
              languages={LANGUAGE_OPTIONS}
              inputClass={inputClass}
              initialData={profileInitialData}
              submitLabel={t("sections.publicProfile.submitLabel")}
              footnote={t("sections.publicProfile.footnote")}
            />
          </SectionWrapper>
        </div>
      ) : (
        <>
          {stepIndex === 0 ? (
            <SectionWrapper
              title={t("sections.applicationDetails.title")}
              subtitle={t("sections.applicationDetails.subtitle")}
            >
              <ApplicationForm services={APPLICATION_SERVICE_OPTIONS} countries={COUNTRY_OPTIONS} inputClass={inputClass} />
            </SectionWrapper>
          ) : null}

          {stepIndex === 1 ? (
            <SectionWrapper
              title={t("sections.uploadDocuments.title")}
              subtitle={t("sections.uploadDocuments.subtitle")}
            >
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">{t("sections.uploadDocuments.required.title")}</h3>
                  <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]"></span>
                      <span>{t("sections.uploadDocuments.required.governmentId")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]"></span>
                      <span>{t("sections.uploadDocuments.required.proofOfAddress")}</span>
                    </li>
                  </ul>

                  <h3 className="mt-8 text-xl font-semibold text-[#211f1a]">{t("sections.uploadDocuments.optional.title")}</h3>
                  <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      <span>{t("sections.uploadDocuments.optional.certifications")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      <span>{t("sections.uploadDocuments.optional.workPermits")}</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                    <p className="text-sm leading-relaxed text-[#5d574b]">
                      <strong className="text-[#211f1a]">{t("sections.uploadDocuments.formats.label")}</strong> {t("sections.uploadDocuments.formats.text")}
                    </p>
                  </div>
                </div>
                <DocumentUploadForm inputClass={inputClass} />
              </div>
            </SectionWrapper>
          ) : null}

          {stepIndex === 2 ? (
            <SectionWrapper
              title={t("sections.createProfile.title")}
              subtitle={t("sections.createProfile.subtitle")}
            >
              <ProfileBuildForm
                services={PROFILE_SERVICE_OPTIONS.map((name) => ({ name }))}
                availabilityDays={AVAILABILITY_OPTIONS.map((label) => ({
                  label,
                  slug: label.toLowerCase().replace(/\s+/g, "_"),
                }))}
                languages={LANGUAGE_OPTIONS}
                inputClass={inputClass}
                initialData={profileInitialData}
              />
            </SectionWrapper>
          ) : null}

          {onboardingComplete && !isActive ? (
            <div className="rounded-[28px] border border-green-200 bg-green-50 p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-green-900">{t("onboardingComplete.title")}</h2>
                  <p className="mt-2 text-base leading-relaxed text-green-800">
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
        <h2 className="text-3xl font-semibold text-[#211f1a]">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-[#5d574b]">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
