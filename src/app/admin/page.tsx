import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function AdminHomePage() {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Admin Control Center</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Review onboarding queues, monitor incidents, and support MaidConnect users.
          </p>
        </div>
        <Link href="/auth/sign-out?redirectTo=/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Sign out
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
          Admin tools will surface here as we implement governance workflows.
        </div>
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
          <dl className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Signed in as</dt>
            <dd className="text-sm text-neutral-900">{user.email}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
