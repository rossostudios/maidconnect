import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import {
  currentStepIndex,
  getStepClassName,
  transformProfileData,
} from "@/lib/onboarding/profile-data-transformer";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ApplicationForm } from "./application-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ProfileBuildForm } from "./profile-build-form";

const inputClass =
  "w-full rounded-xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] px-4 py-4 text-base shadow-sm transition focus:border-[#FF4444A22] focus:outline-none focus:ring-2 focus:ring-[#FF4444A22]/20";

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
  unstable_noStore(); // Opt out of caching for dynamic page

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

  // Transform Supabase data to form initial data using helper
  const professionalProfileRecord =
    (professionalProfileData as SupabaseProfessionalProfile | null) ?? null;
  const profileInitialData = transformProfileData(professionalProfileRecord);

  return (
    <section className="flex-1 space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[#AA88AAAAC] text-xs uppercase tracking-[0.2em]">
            {t(isActive ? "labels.profileSettings" : "labels.onboarding")}
          </p>
          <h1 className="type-serif-lg mt-4 text-[#116611616]">
            {t(isActive ? "headings.editProfile" : "headings.launchProfile")}
          </h1>
          <p className="mt-4 max-w-2xl text-[#AA88AAAAC] text-lg leading-relaxed">
            {t(isActive ? "descriptions.active" : "descriptions.notActive")}
          </p>
        </div>
        <Link
          className="inline-flex items-center rounded-full border-2 border-[#EE44EE2E3] px-5 py-2.5 font-semibold text-[#116611616] text-sm transition hover:border-[#FF4444A22] hover:text-[#FF4444A22]"
          href="/dashboard/pro"
        >
          {t("backToDashboard")}
        </Link>
      </header>

      {isActive ? null : (
        <ol className="grid gap-6 md:grid-cols-3">
          {STEP_IDS.map((stepId, index) => {
            const isCompleted = stepIndex > index;
            const isCurrent = stepIndex === index && !onboardingComplete;
            const stepClassName = getStepClassName(isCompleted, isCurrent);

            return (
              <li
                className={`hover:-translate-y-1 rounded-[28px] border p-8 shadow-sm transition hover:shadow-[0_10px_40px_rgba(22,22,22,0.08)] ${stepClassName}`}
                key={stepId}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4444A22] font-semibold text-[#FFEEFF8E8] text-lg">
                    {index + 1}
                  </div>
                  {(() => {
                    if (isCompleted) {
                      return (
                        <span className="rounded-full bg-[#FF4444A22]/10 px-3 py-1 font-semibold text-[#FF4444A22] text-xs">
                          {t("status.completed")}
                        </span>
                      );
                    }
                    if (isCurrent) {
                      return (
                        <span className="rounded-full bg-[#FF4444A22]/10 px-3 py-1 font-semibold text-[#FF4444A22] text-xs">
                          {t("status.inProgress")}
                        </span>
                      );
                    }
                    return (
                      <span className="rounded-full bg-[#EE44EE2E3]/30 px-3 py-1 font-semibold text-[#AA88AAAAC] text-xs">
                        {t("status.pending")}
                      </span>
                    );
                  })()}
                </div>
                <h2 className="mt-6 font-semibold text-[#116611616] text-xl">
                  {t(`steps.${stepId}.title`)}
                </h2>
                <p className="mt-3 text-[#AA88AAAAC] text-base leading-relaxed">
                  {t(`steps.${stepId}.description`)}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {isActive ? (
        <div className="space-y-8">
          <div className="rounded-[28px] border border-[#FF4444A22]/40 bg-[#FF4444A22]/10 p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4444A22]/10">
                <svg
                  aria-label="Success icon"
                  className="h-6 w-6 text-[#FF4444A22]"
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
                <h2 className="font-semibold text-2xl text-[#FF4444A22]">
                  {t("success.profileLive")}
                </h2>
                <p className="mt-2 text-[#FF4444A22] text-base leading-relaxed">
                  {t("success.updateDescription")}
                </p>
              </div>
            </div>
          </div>

          <SectionWrapper
            subtitle={t("sections.publicProfile.description")}
            title={t("sections.publicProfile.title")}
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
        </div>
      ) : (
        <>
          {stepIndex === 0 ? (
            <SectionWrapper
              subtitle={t("sections.applicationDetails.description")}
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
              subtitle={t("sections.uploadDocuments.description")}
              title={t("sections.uploadDocuments.title")}
            >
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-[#116611616] text-xl">
                    {t("sections.uploadDocuments.required")}
                  </h3>
                  <ul className="mt-4 space-y-3 text-[#AA88AAAAC] text-base">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FF4444A22]" />
                      <span>{t("sections.uploadDocuments.requiredDocs.governmentId")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FF4444A22]" />
                      <span>{t("sections.uploadDocuments.requiredDocs.proofOfAddress")}</span>
                    </li>
                  </ul>

                  <h3 className="mt-8 font-semibold text-[#116611616] text-xl">
                    {t("sections.uploadDocuments.optional")}
                  </h3>
                  <ul className="mt-4 space-y-3 text-[#AA88AAAAC] text-base">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#AA88AAAAC]" />
                      <span>{t("sections.uploadDocuments.optionalDocs.certifications")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#AA88AAAAC]" />
                      <span>{t("sections.uploadDocuments.optionalDocs.workPermits")}</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
                    <p className="text-[#AA88AAAAC] text-sm leading-relaxed">
                      <strong className="text-[#116611616]">
                        {t("sections.uploadDocuments.acceptedFormats")}
                      </strong>{" "}
                      {t("sections.uploadDocuments.formatInfo")}
                    </p>
                  </div>
                </div>
                <DocumentUploadForm inputClass={inputClass} />
              </div>
            </SectionWrapper>
          ) : null}

          {stepIndex === 2 ? (
            <SectionWrapper
              subtitle={t("sections.createProfile.description")}
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
            <div className="rounded-[28px] border border-[#FF4444A22]/40 bg-[#FF4444A22]/10 p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4444A22]/10">
                  <svg
                    aria-label="Success icon"
                    className="h-6 w-6 text-[#FF4444A22]"
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
                  <h2 className="font-semibold text-2xl text-[#FF4444A22]">
                    {t("complete.title")}
                  </h2>
                  <p className="mt-2 text-[#FF4444A22] text-base leading-relaxed">
                    {t("complete.description")}
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
    <section className="rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-10 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
      <header className="mb-8">
        <h2 className="font-semibold text-3xl text-[#116611616]">{title}</h2>
        <p className="mt-3 text-[#AA88AAAAC] text-base leading-relaxed">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
