import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  submitApplication,
  submitDocuments,
  submitProfile,
  REQUIRED_DOCUMENTS,
  OPTIONAL_DOCUMENTS,
} from "./actions";

const inputClass =
  "w-full rounded-md border border-[#efe7dc] bg-white/90 px-3 py-2 text-sm shadow-sm transition focus:border-[#fd857f] focus:outline-none focus:ring-2 focus:ring-[#fd857f33]";

const PRIMARY_SERVICE_OPTIONS = ["House cleaning", "Laundry", "Cooking"];
const AVAILABILITY_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const COUNTRY_OPTIONS = ["Colombia", "United States", "Canada", "United Kingdom", "Mexico", "Other"];

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
          {stepIndex === 0 ? <ApplicationForm /> : null}
          {stepIndex === 1 ? <DocumentUpload /> : null}
          {stepIndex === 2 ? <ProfileBuild /> : null}
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
  children: React.ReactNode;
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

function ApplicationForm() {
  return (
    <SectionWrapper
      title="Application Details"
      subtitle="Share your professional background. This information helps us verify your experience and match you with the right clients."
    >
      <form className="space-y-6" action={submitApplication}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="fullName">
            <input id="fullName" name="fullName" type="text" className={inputClass} placeholder="María Rodríguez" />
          </Field>
          <Field label="ID number" id="idNumber">
            <input id="idNumber" name="idNumber" type="text" className={inputClass} placeholder="CC 1234567890" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number" id="phone">
            <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+57 300 123 4567" />
          </Field>
          <Field label="Country" id="country">
            <select id="country" name="country" className={inputClass} defaultValue="Colombia">
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="City" id="city">
          <input id="city" name="city" type="text" className={inputClass} placeholder="Medellín" />
        </Field>

        <Field label="Services offered" id="services">
          <div className="grid gap-2 sm:grid-cols-2">
            {["House cleaning", "Laundry", "Cooking", "Organization", "Childcare", "Pet care"].map((service) => (
              <label key={service} className="flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm">
                <input type="checkbox" name="services" value={service} className="h-4 w-4" />
                {service}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Years of experience" id="experienceYears">
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min={0}
              className={inputClass}
              placeholder="5"
            />
          </Field>
          <Field label="Rate expectations (per hour)" id="rate">
            <input id="rate" name="rate" type="number" min={0} className={inputClass} placeholder="40000" />
          </Field>
        </div>

        <Field label="Availability" id="availability">
          <textarea
            id="availability"
            name="availability"
            rows={3}
            className={`${inputClass} min-h-[100px]`}
            placeholder="Example: Monday to Friday 8am - 4pm"
          />
        </Field>

        <Field label="Professional references" id="references" helper="Provide at least two references we can contact.">
          <div className="space-y-3">
            {[1, 2].map((index) => (
              <div key={index} className="rounded-lg border border-neutral-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{`Reference ${index}`}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    name={`reference_name_${index}`}
                    className={inputClass}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    name={`reference_relationship_${index}`}
                    className={inputClass}
                    placeholder="Relationship"
                  />
                  <input
                    type="text"
                    name={`reference_contact_${index}`}
                    className={inputClass}
                    placeholder="Phone or email"
                  />
                </div>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Background check consent" id="consent">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="consent" className="h-4 w-4" /> I authorize MaidConnect to conduct identity and
            background verifications for onboarding.
          </label>
        </Field>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Submitting this application triggers our review team to start verification. You can still edit details later.
          </p>
          <button
            type="submit"
            className="rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
          >
            Submit application
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
}

function DocumentUpload() {
  return (
    <SectionWrapper
      title="Upload required documents"
      subtitle="Provide secure links or file references for each document. You can upload to cloud storage (Drive, Dropbox, iCloud) and paste the shared link here."
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
            Files are reviewed within 3-5 business days. You will receive email updates at every stage.
          </div>
        </div>

        <form className="space-y-6" action={submitDocuments}>
          <div className="space-y-4">
            {REQUIRED_DOCUMENTS.map((doc) => (
              <div key={doc.key} className="rounded-lg border border-neutral-200 bg-white/90 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-800">{doc.label}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#c4534d]">Required</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Paste a secure link to your file or describe how we can access it.
                </p>
                <input
                  type="text"
                  name={`document_${doc.key}`}
                  className={inputClass}
                  placeholder="https://drive.google.com/..."
                />
                <textarea
                  name={`document_${doc.key}_note`}
                  rows={2}
                  className={`${inputClass} mt-3`}
                  placeholder="Optional notes (passwords, expiry dates, document number)"
                />
              </div>
            ))}

            {OPTIONAL_DOCUMENTS.map((doc) => (
              <div key={doc.key} className="rounded-lg border border-dashed border-neutral-200 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-800">{doc.label}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Optional</span>
                </div>
                <input
                  type="text"
                  name={`document_${doc.key}`}
                  className={inputClass}
                  placeholder="Link or reference (optional)"
                />
                <textarea
                  name={`document_${doc.key}_note`}
                  rows={2}
                  className={`${inputClass} mt-3`}
                  placeholder="Notes (e.g., certification type, issuing organization)"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button className="rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]">
              Submit documents
            </button>
          </div>
        </form>
      </div>
    </SectionWrapper>
  );
}

function ProfileBuild() {
  return (
    <SectionWrapper
      title="Create your public profile"
      subtitle="Craft a compelling presence that builds trust with new customers. This information appears on your MaidConnect listing."
    >
      <form className="space-y-6" action={submitProfile}>
        <Field label="Professional bio" id="bio" helper="150-300 words works best.">
          <textarea
            id="bio"
            name="bio"
            rows={5}
            className={`${inputClass} min-h-[140px]`}
            placeholder="Share your background, specialties, and why customers love working with you."
          />
        </Field>

        <Field label="Languages" id="languages">
          <div className="grid gap-2 sm:grid-cols-3">
            {["Español", "English", "Português", "Français"].map((language) => (
              <label key={language} className="flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm">
                <input type="checkbox" name="languages" value={language} className="h-4 w-4" />
                {language}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Services & rates" id="servicesRates">
          <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
            {PRIMARY_SERVICE_OPTIONS.map((service) => (
              <div key={service}>
                <input type="hidden" name="service_name" value={service} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center text-sm font-medium text-neutral-800">{service}</div>
                  <input
                    type="number"
                    name="service_rate"
                    className={inputClass}
                    placeholder="COP/hour"
                    min={0}
                  />
                  <input
                    type="text"
                    name="service_description"
                    className={inputClass}
                    placeholder="Short description of service"
                  />
                </div>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Weekly availability" id="weeklyAvailability">
          <table className="w-full text-left text-sm text-neutral-700">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-2 font-semibold">Day</th>
                <th className="py-2 font-semibold">Start</th>
                <th className="py-2 font-semibold">End</th>
                <th className="py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABILITY_DAYS.map((day) => {
                const slug = day.toLowerCase().replace(/\s+/g, "_");
                return (
                  <tr key={day} className="border-b border-neutral-100">
                    <td className="py-2">{day}</td>
                    <td className="py-2">
                      <input
                        type="time"
                        name={`availability_${slug}_start`}
                        className={inputClass}
                        defaultValue="08:00"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="time"
                        name={`availability_${slug}_end`}
                        className={inputClass}
                        defaultValue="16:00"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        name={`availability_${slug}_notes`}
                        className={inputClass}
                        placeholder="Optional notes"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Field>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Once approved, your profile goes live within 24 hours. You can continue refining details anytime.
          </p>
          <button
            type="submit"
            className="rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
          >
            Submit profile for review
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
}

function Field({
  label,
  helper,
  id,
  children,
}: {
  label: string;
  helper?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      {helper ? <p className="text-xs text-neutral-500">{helper}</p> : null}
      {children}
    </div>
  );
}
