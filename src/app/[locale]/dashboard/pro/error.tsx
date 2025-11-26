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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Error card */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rausch-50 dark:bg-rausch-900/20">
              <Alert01Icon className="h-8 w-8 text-rausch-500 dark:text-rausch-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-center font-semibold text-2xl text-foreground">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-muted-foreground">
            An error occurred while loading your professional dashboard. This has been logged and
            our team has been notified.
          </p>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-lg bg-muted p-4">
              <p className="mb-2 font-mono font-semibold text-foreground text-sm">Error Details:</p>
              <p className="font-mono text-muted-foreground text-xs">{error.message}</p>
              {error.digest && (
                <p className="mt-2 font-mono text-muted-foreground text-xs">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              className="w-full rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-white transition hover:bg-rausch-600"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
            <a
              className="block w-full rounded-lg border-2 border-border px-6 py-3 text-center font-semibold text-foreground transition hover:border-rausch-500 hover:text-rausch-600"
              href="/en/dashboard/pro"
            >
              Go to Dashboard Home
            </a>
          </div>
        </div>

        {/* Support link */}
        <p className="mt-6 text-center text-muted-foreground text-sm">
          Need help?{" "}
          <a
            className="font-medium text-rausch-600 hover:text-rausch-700 dark:text-rausch-400 dark:hover:text-rausch-300"
            href="/en/support"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
