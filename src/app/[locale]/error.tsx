"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf9] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-50 p-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-bold text-[#211f1a]">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-[#7d7566]">
            We've encountered an unexpected error. Our team has been notified and
            is working to fix it.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-left">
              <p className="mb-2 text-sm font-semibold text-red-900">
                Error Details:
              </p>
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-red-600">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-white transition hover:bg-[#ff4529]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-sm text-[#7d7566]">
            Need help?{" "}
            <Link href="/contact" className="text-[#ff5d46] hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
