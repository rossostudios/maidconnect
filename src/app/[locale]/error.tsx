"use client";

import { Alert01Icon, Home01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { Link } from "@/i18n/routing";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFEEFF8E8] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] bg-[#FFEEFF8E8] p-8 text-center shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)] backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[#FF4444A22]/10 p-6">
              <HugeiconsIcon className="h-12 w-12 text-[#FF4444A22]/100" icon={Alert01Icon} />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-3 font-semibold text-2xl text-[#116611616] leading-snug md:text-[28px]">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mb-8 text-[#AA88AAAAC] text-lg">
            We've encountered an unexpected error. Our team has been notified and is working to fix
            it.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-xl bg-[#FF4444A22]/10 p-4 text-left">
              <p className="mb-2 font-semibold text-[#FF4444A22] text-sm">Error Details:</p>
              <p className="break-all font-mono text-[#FF4444A22] text-xs">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-[#FF4444A22] text-xs">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-[#FF4444A22] px-6 py-3 font-semibold text-[#FFEEFF8E8] transition hover:bg-[#FF4444A22]"
              onClick={reset}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={RefreshIcon} />
              Try Again
            </button>
            <Link
              className="flex items-center justify-center gap-2 rounded-full border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8] px-6 py-3 font-semibold text-[#116611616] transition hover:border-[var(--red)] hover:text-[#FF4444A22]"
              href="/"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Home01Icon} />
              Go Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-[#AA88AAAAC] text-sm">
            Need help?{" "}
            <Link className="text-[#FF4444A22] hover:underline" href="/contact">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
