import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ApplicationForm } from "./application-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ProfileBuildForm } from "./profile-build-form";

const inputClass =
  "w-full rounded-md border border-[#efe7dc] bg-white/90 px-3 py-2 text-sm shadow-sm transition focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]";

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

export default async function ProfessionalOnboardingPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });
  const stepIndex = currentStepIndex(user.onboardingStatus);
  const onboardingComplete = stepIndex >= STEPS.length;

  return (
    <section className="flex-1 space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#fd857f]">Onboarding</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">Launch your MaidConnect profile</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Complete the steps below to unlock bookings. You can save and return at any time—progress is remembered.
          </p>
        </div>
        <Link
          href="/dashboard/pro"
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-300"
        >
          Back to dashboard
        </Link>
      </header>

      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const isCompleted = stepIndex > index;
          const isActive = stepIndex === index && !onboardingComplete;

          return (
            <li
              key={step.id}
              className={`rounded-lg border p-4 shadow-sm ${
                isCompleted
                  ? "border-[#e3f3e8] bg-[#f4fbf6]"
                  : isActive
                    ? "border-[#fd857f40] bg-[#fef1ee]"
                    : "border-[#efe7dc] bg-white/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{`Step ${index + 1}`}</span>
                {isCompleted ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Done</span>
                ) : isActive ? (
                  <span className="rounded-full bg-[#fde0dc] px-2 py-0.5 text-xs font-semibold text-[#c4534d]">
                    In progress
                  </span>
                ) : (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                    Pending
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-base font-semibold text-neutral-900">{step.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
            </li>
          );
        })}
      </ol>

      {onboardingComplete ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
          Your profile is active. Booking management tools will appear on your main dashboard as they are released.
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
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800">Required</h3>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    <li>• Government-issued ID (Cédula de Ciudadanía or Cédula de Extranjería)</li>
                    <li>• Proof of address (utility bill, lease agreement)</li>
                  </ul>

                  <h3 className="mt-6 text-sm font-semibold text-neutral-800">Optional</h3>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    <li>• Professional certifications</li>
                    <li>• Work permits (if applicable)</li>
                  </ul>

                  <div className="mt-6 rounded-lg border border-[#fd857f33] bg-[#fef1ee] p-4 text-xs text-[#7a524c]">
                    Accepted formats: PDF, JPG, PNG (max 5MB each). Our team reviews uploads within 3-5 business days and keeps you informed throughout the process.
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
              />
            </SectionWrapper>
          ) : null}

          {stepIndex >= 3 ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
              Your onboarding is complete. Return to the dashboard to manage bookings.
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
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
