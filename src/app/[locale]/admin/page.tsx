import {
  Alert01Icon,
  ClipboardIcon,
  MapsLocation01Icon,
  Message01Icon,
  StarIcon,
  UserGroupIcon,
} from "hugeicons-react";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";

export default async function AdminHomePage() {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <>
      <header className="mb-10">
        <h1 className="type-ui-lg text-[var(--foreground)]">Admin Control Center</h1>
        <p className="mt-3 text-[var(--muted-foreground)] text-base leading-relaxed">
          Review onboarding queues, monitor incidents, and support Casaora users.
        </p>
      </header>

      {/* Admin Info */}
      <div className="mb-10 rounded-[28px] border border-[var(--border-light)] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <dl className="space-y-2">
          <dt className="font-semibold text-[var(--label-muted)] text-xs uppercase tracking-[0.12em]">
            Signed in as
          </dt>
          <dd className="font-medium text-[var(--foreground)] text-base">{user.email}</dd>
        </dl>
      </div>

      {/* Professional Vetting Queue */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="type-ui-md text-[var(--foreground)]">Professional Vetting Queue</h2>
          <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
            Review and approve professional applications
          </p>
        </div>
        <ProfessionalVettingDashboard />
      </section>

      {/* Additional Admin Sections */}
      <section>
        <div className="mb-6">
          <h2 className="type-ui-md text-[var(--foreground)]">Management Tools</h2>
          <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
            Quick access to platform management features
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Changelog Management */}
          <Link
            className="group hover:-translate-y-1 rounded-[28px] border border-[var(--border-light)] bg-white p-8 text-center shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
            href="/admin/changelog"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--red)]/10 group-hover:bg-[var(--red)]/20">
              <StarIcon className="h-8 w-8 text-[var(--red)]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">Changelog Management</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Create and manage sprint updates
            </p>
          </Link>

          {/* Feedback Management */}
          <Link
            className="group hover:-translate-y-1 rounded-[28px] border border-[var(--border-light)] bg-white p-8 text-center shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
            href="/admin/feedback"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--charcoal)]/10 group-hover:bg-[var(--charcoal)]/20">
              <Message01Icon className="h-8 w-8 text-[var(--charcoal)]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">Feedback Management</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Review and manage user feedback
            </p>
          </Link>

          {/* Roadmap Management */}
          <Link
            className="group hover:-translate-y-1 rounded-[28px] border border-[var(--border-light)] bg-white p-8 text-center shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
            href="/admin/roadmap"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6B7F5C]/10 group-hover:bg-[#6B7F5C]/20">
              <MapsLocation01Icon className="h-8 w-8 text-[#6B7F5C]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">Roadmap Management</h3>
            <p className="text-[var(--muted-foreground)] text-sm">Manage public roadmap items</p>
          </Link>

          {/* Future sections */}
          <div className="rounded-[28px] border border-[var(--border-lighter)] border-dashed bg-[var(--cream)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <UserGroupIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">User Management</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Suspend/ban users (coming soon)
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--border-lighter)] border-dashed bg-[var(--cream)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <Alert01Icon className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">Disputes</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Resolve customer/pro disputes (coming soon)
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--border-lighter)] border-dashed bg-[var(--cream)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <ClipboardIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">Audit Logs</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              View admin action history (coming soon)
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
