import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function AdminHomePage() {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 text-[#211f1a]">
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-[#dcd6c7] bg-white p-6 text-sm text-[#5d574b]">
          Admin tools will surface here as we implement governance workflows.
        </div>
        <div className="rounded-2xl border border-dashed border-[#dcd6c7] bg-white p-6 text-sm text-[#5d574b]">
          <dl className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">Signed in as</dt>
            <dd className="text-sm text-[#211f1a]">{user.email}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
