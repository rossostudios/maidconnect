"use client";

import { Alert01Icon, Home01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-[family-name:var(--font-geist-sans)]">
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
          <div className="w-full max-w-lg">
            <div className="bg-white p-8 text-center shadow-lg">
              {/* Icon - Precision: Sharp edges, orange-50 background */}
              <div className="mb-6 flex justify-center">
                <div className="bg-orange-50 p-6">
                  <HugeiconsIcon className="h-12 w-12 text-orange-500" icon={Alert01Icon} />
                </div>
              </div>

              {/* Title - Precision: Geist Sans, neutral-900, baseline-aligned */}
              <h1 className="mb-3 font-bold text-[32px] text-neutral-900 leading-[48px]">
                Application Error
              </h1>

              {/* Description - Precision: Geist Sans, neutral-700, baseline-aligned */}
              <p className="mb-8 text-lg text-neutral-700 leading-[24px]">
                A critical error has occurred. Our team has been notified and is working to resolve
                the issue.
              </p>

              {/* Actions - Precision: Sharp edges, orange-500 primary, neutral outline */}
              <div className="flex flex-col gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 px-6 py-3 font-semibold text-base text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
                  onClick={reset}
                  type="button"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={RefreshIcon} />
                  Try Again
                </button>
                <a
                  className="inline-flex items-center justify-center gap-2 border-2 border-neutral-200 bg-white px-6 py-3 font-semibold text-base text-neutral-900 no-underline transition-colors hover:border-neutral-900 hover:bg-neutral-50"
                  href="/"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Home01Icon} />
                  Go to Homepage
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
