"use client";

import { Alert01Icon } from "hugeicons-react";
import { useEffect } from "react";

/**
 * Admin Error Boundary
 *
 * Catches errors in admin routes and displays a fallback UI.
 * Prevents admin errors from crashing the entire app.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (PostHog, Sentry, etc.)
    console.error("[Admin Error]", {
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
          <h1 className="mb-3 text-center text-2xl font-semibold text-neutral-900">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-neutral-700">
            An error occurred while loading the admin dashboard. This has been logged and our team
            has been notified.
          </p>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-lg bg-neutral-50 p-4">
              <p className="mb-2 font-mono text-sm font-semibold text-neutral-900">
                Error Details:
              </p>
              <p className="font-mono text-xs text-neutral-700">{error.message}</p>
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-neutral-500">Digest: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
              type="button"
            >
              Try again
            </button>
            <a
              href="/en/admin"
              className="block w-full rounded-lg border-2 border-neutral-200 px-6 py-3 text-center font-semibold text-neutral-900 transition hover:border-orange-500 hover:text-orange-600"
            >
              Go to Admin Home
            </a>
          </div>
        </div>

        {/* Support link */}
        <p className="mt-6 text-center text-sm text-neutral-500">
          Need help?{" "}
          <a href="/en/support" className="font-medium text-orange-600 hover:text-orange-700">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
