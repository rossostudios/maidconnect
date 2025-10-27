import Link from "next/link";
import { AUTH_ROUTES } from "@/lib/auth";

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-neutral-900">Account temporarily suspended</h1>
        <p className="text-sm text-neutral-600">
          Your professional account is currently under review. Please contact MaidConnect support to resolve any pending
          issues or complete outstanding onboarding requirements.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:support@maidconnect.com"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Email support
          </Link>
          <Link
            href={AUTH_ROUTES.signOut}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
