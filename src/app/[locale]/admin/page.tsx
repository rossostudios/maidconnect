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

        {/* Future sections */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
