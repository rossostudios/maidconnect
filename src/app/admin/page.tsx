import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";

export default async function AdminHomePage() {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 text-[#211f1a]">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin Control Center</h1>
          <p className="mt-2 text-sm text-[#5d574b]">
            Review onboarding queues, monitor incidents, and support MaidConnect users.
          </p>
        </div>
        <Link
          href="/auth/sign-out?redirectTo=/"
          className="rounded-full border border-[#211f1a] px-4 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#fd857f]"
        >
          Sign out
        </Link>
      </header>

      <div className="space-y-8">
        {/* Admin Info */}
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-4 shadow-sm">
          <dl className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">
              Signed in as
            </dt>
            <dd className="text-sm text-[#211f1a]">{user.email}</dd>
          </dl>
        </div>

        {/* Professional Vetting Queue */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#211f1a]">
              Professional Vetting Queue
            </h2>
            <p className="mt-1 text-sm text-[#7a6d62]">
              Review and approve professional applications
            </p>
          </div>
          <ProfessionalVettingDashboard />
        </section>

        {/* Future sections */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-[#dcd6c7] bg-white p-6 text-center text-sm text-[#5d574b]">
            <h3 className="mb-2 font-semibold text-[#211f1a]">User Management</h3>
            <p className="text-xs">Suspend/ban users (coming soon)</p>
          </div>
          <div className="rounded-2xl border border-dashed border-[#dcd6c7] bg-white p-6 text-center text-sm text-[#5d574b]">
            <h3 className="mb-2 font-semibold text-[#211f1a]">Disputes</h3>
            <p className="text-xs">Resolve customer/pro disputes (coming soon)</p>
          </div>
          <div className="rounded-2xl border border-dashed border-[#dcd6c7] bg-white p-6 text-center text-sm text-[#5d574b]">
            <h3 className="mb-2 font-semibold text-[#211f1a]">Audit Logs</h3>
            <p className="text-xs">View admin action history (coming soon)</p>
          </div>
        </section>
      </div>
    </section>
  );
}
