import type { ReactNode } from "react";
import Link from "next/link";
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

const COUNTRY_OPTIONS = ["Colombia", "United States", "Canada", "United Kingdom", "Mexico", "Other"];

const AVAILABILITY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const LANGUAGE_OPTIONS = ["Español", "English", "Português", "Français"];

const STEPS = [
  {
    id: "application",
    title: "Submit application",
    description: "Tell us about your experience, services, and references.",
    statusKey: "application_pending",
  },
  {
    id: "documents",
    title: "Upload documents",
    description: "Provide required identification and proof of address.",
    statusKey: "application_in_review",
  },
  {
    id: "profile",
    title: "Build your profile",
    description: "Create a compelling bio, select services, and set rates.",
    statusKey: "approved",
  },
];

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

export default async function ProfessionalOnboardingPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });
  const stepIndex = currentStepIndex(user.onboardingStatus);
  const isActive = user.onboardingStatus === "active";
  const onboardingComplete = stepIndex >= STEPS.length;

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
            {isActive ? "PROFILE SETTINGS" : "ONBOARDING"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            {isActive ? "Edit your profile" : "Launch your MaidConnect profile"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
            {isActive
              ? "Update your public information, services, and availability. Changes are reflected instantly on your listing."
              : "Complete the steps below to unlock bookings. You can save and return at any time—progress is remembered."}
          </p>
        </div>
        <Link
          href="/dashboard/pro"
          className="inline-flex items-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          Back to dashboard
        </Link>
      </header>

      {isActive ? null : (
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const isCompleted = stepIndex > index;
            const isCurrent = stepIndex === index && !onboardingComplete;

            return (
              <li
                key={step.id}
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
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Completed</span>
                  ) : isCurrent ? (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      In progress
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      Pending
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-xl font-semibold text-[#211f1a]">{step.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-[#5d574b]">{step.description}</p>
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
                <h2 className="text-2xl font-semibold text-green-900">Your profile is live!</h2>
                <p className="mt-2 text-base leading-relaxed text-green-800">
                  Update your public information below whenever you need to refresh your listing.
                </p>
              </div>
            </div>
          </div>

          <SectionWrapper
            title="Public profile"
            subtitle="Adjust your bio, services, languages, and weekly availability. Changes update your listing instantly."
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
              submitLabel="Save profile"
              footnote="Your changes update instantly on your public listing."
            />
          </SectionWrapper>
        </div>
      ) : (
        <>
          {stepIndex === 0 ? (
            <SectionWrapper
              title="Application Details"
              subtitle="Share your professional background. This information helps us verify your experience and match you with the right clients."
            >
              <ApplicationForm services={APPLICATION_SERVICE_OPTIONS} countries={COUNTRY_OPTIONS} inputClass={inputClass} />
            </SectionWrapper>
          ) : null}

          {stepIndex === 1 ? (
            <SectionWrapper
              title="Upload required documents"
              subtitle="Securely upload scans or photos of your identification. We store everything in encrypted Supabase Storage."
            >
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold text-[#211f1a]">Required</h3>
                  <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]"></span>
                      <span>Government-issued ID (Cédula de Ciudadanía or Cédula de Extranjería)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff5d46]"></span>
                      <span>Proof of address (utility bill, lease agreement)</span>
                    </li>
                  </ul>

                  <h3 className="mt-8 text-xl font-semibold text-[#211f1a]">Optional</h3>
                  <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      <span>Professional certifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      <span>Work permits (if applicable)</span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                    <p className="text-sm leading-relaxed text-[#5d574b]">
                      <strong className="text-[#211f1a]">Accepted formats:</strong> PDF, JPG, PNG (max 5MB each). Our team reviews uploads within 3-5 business days and keeps you informed throughout the process.
                    </p>
                  </div>
                </div>
                <DocumentUploadForm inputClass={inputClass} />
              </div>
            </SectionWrapper>
          ) : null}

          {stepIndex === 2 ? (
            <SectionWrapper
              title="Create your public profile"
              subtitle="Craft a compelling presence that builds trust with new customers. This information appears on your MaidConnect listing."
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
                  <h2 className="text-2xl font-semibold text-green-900">Onboarding complete!</h2>
                  <p className="mt-2 text-base leading-relaxed text-green-800">
                    Return to the dashboard to manage bookings and start connecting with customers.
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
