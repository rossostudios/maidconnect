import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/lib/auth";

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center text-[#211f1a]">
      <div className="space-y-4">
        <h1 className="font-semibold text-3xl">Account temporarily suspended</h1>
        <p className="text-[#5d574b] text-sm">
          Your professional account is currently under review. Please contact Casaora support to
          resolve any pending issues or complete outstanding onboarding requirements.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2 font-semibold text-sm text-white shadow-sm transition hover:border-[#8B7355] hover:bg-[#2b2624]"
            href="mailto:support@casaora.com"
          >
            Email support
          </Link>
          <Link
            className="rounded-full border border-[#211f1a] px-5 py-2 font-semibold text-[#211f1a] text-sm transition hover:border-[#8B7355]"
            href={AUTH_ROUTES.signOut}
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
