import Link from "next/link";
import { requireUser } from "@/lib/auth";

const ONBOARDING_STEPS = [
  { id: "application", title: "Submit application" },
  { id: "documents", title: "Upload documents" },
  { id: "profile", title: "Build profile" },
];

function getOnboardingProgress(status: string | null) {
  switch (status) {
    case "application_pending":
      return { completed: 0, activeIndex: 0 };
    case "application_in_review":
      return { completed: 1, activeIndex: 1 };
    case "approved":
      return { completed: 2, activeIndex: 2 };
    case "active":
      return { completed: 3, activeIndex: 2 };
    default:
      return { completed: 0, activeIndex: 0 };
  }
}

export default async function ProfessionalDashboardPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });
  const progress = getOnboardingProgress(user.onboardingStatus);
  const onboardingComplete = progress.completed >= ONBOARDING_STEPS.length;

  return (
    <section className="flex-1 space-y-6">
      <header className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Track onboarding progress, manage bookings, and update your profile.
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="text-sm font-medium text-[#fd857f] transition hover:text-[#eb6c65]"
          >
            Sign out
          </Link>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">Account email</dt>
            <dd className="mt-1 text-sm text-[#211f1a]">{user.email}</dd>
          </div>
          <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">Onboarding status</dt>
            <dd className="mt-1 text-sm text-[#211f1a] capitalize">{user.onboardingStatus.replace(/_/g, " ")}</dd>
          </div>
          <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">Preferred language</dt>
            <dd className="mt-1 text-sm text-[#211f1a]">{user.locale}</dd>
          </div>
        </dl>
      </header>

      {!onboardingComplete ? (
        <section className="rounded-xl border border-[#fd857f33] bg-[#fef1ee] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#402d2d]">Complete your onboarding</h2>
              <p className="text-sm text-[#7a524c]">
                Finish the steps below to publish your profile and start accepting bookings.
              </p>
            </div>
            <Link
              href="/dashboard/pro/onboarding"
              className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
            >
              Continue onboarding
            </Link>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = progress.completed > index;
              const isActive = progress.activeIndex === index && !isCompleted;

              return (
                <li
                  key={step.id}
                  className="rounded-lg border border-[#f0e1dc] bg-white/90 p-4 shadow-sm transition hover:border-[#fd857f40]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#fd857f]">{`Step ${index + 1}`}</span>
                    {isCompleted ? (
                      <span className="rounded-full bg-[#e6f5ea] px-2 py-0.5 text-xs font-semibold text-[#2f7a47]">
                        Done
                      </span>
                    ) : isActive ? (
                      <span className="rounded-full bg-[#fde0dc] px-2 py-0.5 text-xs font-semibold text-[#c4534d]">
                        In progress
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-[#7a6d62]">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#211f1a]">{step.title}</p>
                  <p className="mt-1 text-xs text-[#7a6d62]">Estimated 5 minutes</p>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <div className="rounded-xl border border-dashed border-[#efe7dc] bg-white/90 p-6 text-sm text-[#7a6d62]">
        Booking management, onboarding checklist, and earnings modules will surface here as we build the remaining
        epics.
      </div>
    </section>
  );
}
