import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/lib/auth";

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center text-gray-900">
      <div className="space-y-4">
        <h1 className="font-semibold text-3xl">Account temporarily suspended</h1>
        <p className="text-gray-600 text-sm">
          Your professional account is currently under review. Please contact Casaora support to
          resolve any pending issues or complete outstanding onboarding requirements.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2 font-semibold text-sm text-white shadow-sm transition hover:border-[var(--red)] hover:bg-[#2b2624]"
            href="mailto:support@casaora.com"
          >
            Email support
          </Link>
          <Link
            className="rounded-full border border-[var(--foreground)] px-5 py-2 font-semibold text-gray-900 text-sm transition hover:border-[var(--red)]"
            href={AUTH_ROUTES.signOut}
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
