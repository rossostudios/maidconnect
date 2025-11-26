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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 text-center shadow-lg">
          {/* Icon - Precision: Sharp edges, rausch-50 background */}
          <div className="mb-6 flex justify-center">
            <div className="bg-rausch-50 p-6">
              <HugeiconsIcon className="h-12 w-12 text-rausch-500" icon={Alert01Icon} />
            </div>
          </div>

          {/* Title - Precision: Geist Sans, neutral-900, baseline-aligned */}
          <h1 className="mb-3 font-bold text-[32px] text-neutral-900 leading-[48px]">
            Something went wrong
          </h1>

          {/* Description - Precision: Geist Sans, neutral-700, baseline-aligned */}
          <p className="mb-8 text-lg text-neutral-700 leading-[24px]">
            We've encountered an unexpected error. Our team has been notified and is working to fix
            it.
          </p>

          {/* Error Details (only in development) - Precision: Sharp edges, Geist Mono */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 border-2 border-rausch-200 bg-rausch-50 p-4 text-left">
              <p className="mb-2 font-semibold text-rausch-600 text-sm">Error Details:</p>
              <p className="break-all font-[family-name:var(--font-geist-mono)] text-rausch-600 text-xs">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-rausch-600 text-xs">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions - Precision: Sharp edges, rausch-500 primary, neutral outline */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              className="inline-flex items-center justify-center gap-2 bg-rausch-500 px-6 py-3 font-semibold text-base text-white transition-colors hover:bg-rausch-600 active:bg-rausch-700"
              onClick={reset}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={RefreshIcon} />
              Try Again
            </button>
            <Link
              className="inline-flex items-center justify-center gap-2 border-2 border-neutral-200 bg-white px-6 py-3 font-semibold text-base text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
              href="/"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Home01Icon} />
              Go Home
            </Link>
          </div>

          {/* Support Link - Precision: rausch-600 for links */}
          <p className="mt-6 text-neutral-700 text-sm">
            Need help?{" "}
            <Link className="text-rausch-600" href="/contact">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
