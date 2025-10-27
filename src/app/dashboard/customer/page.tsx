import Link from "next/link";
import { requireUser } from "@/lib/auth";

const QUICK_LINKS = [
  {
    title: "Book a professional",
    description: "Browse verified experts by service, language, and availability.",
    href: "/professionals",
  },
  {
    title: "View past visits",
    description: "Download receipts, add tips, or rebook your favorites.",
    href: "#",
  },
  {
    title: "Update payment method",
    description: "Manage cards and local payment options securely.",
    href: "#",
  },
];

export default async function CustomerDashboardPage() {
  const user = await requireUser({ allowedRoles: ["customer"] });

  return (
    <section className="flex-1 space-y-6">
      <header className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#fd857f]">Customer dashboard</span>
            <h1 className="mt-2 text-2xl font-semibold text-[#211f1a]">Your bookings hub</h1>
            <p className="mt-1 text-sm text-[#7a6d62]">
              Explore vetted professionals, review upcoming visits, and manage payments in one place.
            </p>
          </div>
          <Link
            href="/auth/sign-out?redirectTo=/"
            className="text-sm font-medium text-[#fd857f] transition hover:text-[#eb6c65]"
          >
            Sign out
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">Account email</dt>
            <dd className="mt-1 text-sm text-[#211f1a]">{user.email}</dd>
          </div>
          <div className="rounded-lg border border-[#efe7dc] bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">Preferred language</dt>
            <dd className="mt-1 text-sm text-[#211f1a]">{user.locale}</dd>
          </div>
        </dl>
      </header>

      <section className="rounded-xl border border-[#fd857f33] bg-[#fef1ee] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#402d2d]">Plan your next visit</h2>
            <p className="text-sm text-[#7a524c]">
              Rebook professionals you trust or discover new specialists across cleaning, cooking, childcare, and more.
            </p>
          </div>
          <Link
            href="/professionals"
            className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]"
          >
            Browse professionals
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-xl border border-[#efe7dc] bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#fd857f4d]"
          >
            <h3 className="text-sm font-semibold text-[#211f1a]">{item.title}</h3>
            <p className="mt-1 text-sm text-[#7a6d62]">{item.description}</p>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-[#fd857f] group-hover:text-[#eb6c65]">
              Go now →
            </span>
          </Link>
        ))}
      </section>

      <div className="rounded-xl border border-dashed border-[#efe7dc] bg-white/90 p-6 text-sm text-[#7a6d62]">
        Upcoming bookings, payment history, and rating summaries will appear here as customer-focused modules are
        built out.
      </div>
    </section>
  );
}
