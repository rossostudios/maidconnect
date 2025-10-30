import Link from "next/link";
import { AUTH_ROUTES } from "@/lib/auth";

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center text-[#211f1a]">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Account temporarily suspended</h1>
        <p className="text-sm text-[#5d574b]">
          Your professional account is currently under review. Please contact MaidConnect support to resolve any pending
          issues or complete outstanding onboarding requirements.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:support@maidconnect.com"
            className="rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-[#ff5d46] hover:bg-[#2b2624]"
          >
            Email support
          </Link>
          <Link
            href={AUTH_ROUTES.signOut}
            className="rounded-full border border-[#211f1a] px-5 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46]"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
