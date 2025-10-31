import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";

export default async function AdminHomePage() {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 text-[#211f1a]">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-3xl">Admin Control Center</h1>
          <p className="mt-2 text-[#5d574b] text-sm">
            Review onboarding queues, monitor incidents, and support MaidConnect users.
          </p>
        </div>
        <Link
          className="rounded-full border border-[#211f1a] px-4 py-2 font-semibold text-[#211f1a] text-sm transition hover:border-[#ff5d46]"
          href="/auth/sign-out?redirectTo=/"
        >
          Sign out
        </Link>
      </header>

      <div className="space-y-8">
        {/* Admin Info */}
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-4 shadow-sm">
          <dl className="space-y-1">
            <dt className="font-semibold text-[#7a6d62] text-xs uppercase tracking-wide">
              Signed in as
            </dt>
            <dd className="text-[#211f1a] text-sm">{user.email}</dd>
          </dl>
        </div>

        {/* Professional Vetting Queue */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-[#211f1a] text-xl">Professional Vetting Queue</h2>
            <p className="mt-1 text-[#7a6d62] text-sm">
              Review and approve professional applications
            </p>
          </div>
          <ProfessionalVettingDashboard />
        </section>

        {/* Additional Admin Sections */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Changelog Management */}
          <Link
            className="group rounded-2xl border border-[#ebe5d8] bg-white p-6 text-center shadow-sm transition hover:border-[#ff5d46] hover:shadow-md"
            href="/admin/changelog"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 group-hover:bg-purple-100">
              <svg
                aria-label="Changelog icon"
                className="h-6 w-6 text-purple-600"
                fill="none"
                role="img"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-[#211f1a]">Changelog Management</h3>
            <p className="text-[#5d574b] text-xs">Create and manage sprint updates</p>
          </Link>

          {/* Feedback Management */}
          <Link
            className="group rounded-2xl border border-[#ebe5d8] bg-white p-6 text-center shadow-sm transition hover:border-[#ff5d46] hover:shadow-md"
            href="/admin/feedback"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
              <svg
                aria-label="Feedback icon"
                className="h-6 w-6 text-blue-600"
                fill="none"
                role="img"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-[#211f1a]">Feedback Management</h3>
            <p className="text-[#5d574b] text-xs">Review and manage user feedback</p>
          </Link>

          {/* Future sections */}
          <div className="rounded-2xl border border-[#dcd6c7] border-dashed bg-white p-6 text-center text-[#5d574b] text-sm">
            <h3 className="mb-2 font-semibold text-[#211f1a]">User Management</h3>
            <p className="text-xs">Suspend/ban users (coming soon)</p>
          </div>
          <div className="rounded-2xl border border-[#dcd6c7] border-dashed bg-white p-6 text-center text-[#5d574b] text-sm">
            <h3 className="mb-2 font-semibold text-[#211f1a]">Disputes</h3>
            <p className="text-xs">Resolve customer/pro disputes (coming soon)</p>
          </div>
          <div className="rounded-2xl border border-[#dcd6c7] border-dashed bg-white p-6 text-center text-[#5d574b] text-sm">
            <h3 className="mb-2 font-semibold text-[#211f1a]">Audit Logs</h3>
            <p className="text-xs">View admin action history (coming soon)</p>
          </div>
        </section>
      </div>
    </section>
  );
}
