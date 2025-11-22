"use client";

import { Alert01Icon } from "hugeicons-react";
import { useEffect } from "react";

/**
 * Professional Dashboard Error Boundary
 *
 * Catches errors in professional dashboard routes and displays a fallback UI.
 * Prevents professional dashboard errors from crashing the entire app.
 */
export default function ProDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (PostHog, Sentry, etc.)
    console.error("[Pro Dashboard Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        {/* Error card */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <Alert01Icon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-center font-semibold text-2xl text-neutral-900">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-neutral-700">
            An error occurred while loading your professional dashboard. This has been logged and
            our team has been notified.
          </p>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-lg bg-neutral-50 p-4">
              <p className="mb-2 font-mono font-semibold text-neutral-900 text-sm">
                Error Details:
              </p>
              <p className="font-mono text-neutral-700 text-xs">{error.message}</p>
              {error.digest && (
                <p className="mt-2 font-mono text-neutral-500 text-xs">Digest: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
            <a
              className="block w-full rounded-lg border-2 border-neutral-200 px-6 py-3 text-center font-semibold text-neutral-900 transition hover:border-orange-500 hover:text-orange-600"
              href="/en/dashboard/pro"
            >
              Go to Dashboard Home
            </a>
          </div>
        </div>

        {/* Support link */}
        <p className="mt-6 text-center text-neutral-500 text-sm">
          Need help?{" "}
          <a className="font-medium text-orange-600 hover:text-orange-700" href="/en/support">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
