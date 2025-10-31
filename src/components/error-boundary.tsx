"use client";

/**
 * Global Error Boundary
 *
 * Catches React errors and displays a fallback UI.
 * Logs errors to Better Stack for monitoring.
 */

import { useLogger } from "@logtail/next";
import type { ErrorInfo, ReactNode } from "react";
import { Component, useEffect } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Error Boundary Component
 * Wraps the application to catch and handle React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Error will be logged to Better Stack via the ErrorDisplay component
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Error Display Component
 * Logs error to Better Stack and shows user-friendly message
 */
function ErrorDisplay({ error }: { error: Error }) {
  const logger = useLogger();

  // Log error to Better Stack on mount
  useEffect(() => {
    logger?.error("React Error Boundary triggered", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      location: window.location.href,
      userAgent: navigator.userAgent,
    });
  }, [error, logger]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf9] px-4">
      <div className="w-full max-w-md rounded-lg border border-[#dcd6c7] bg-white p-8 shadow-lg">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              aria-label="Error"
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Error Icon</title>
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-center font-semibold text-2xl text-[#2e2419]">
          Something went wrong
        </h1>
        <p className="mb-6 text-center text-[#7a6d62] text-sm">
          We've been notified and are working to fix the issue.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded-lg bg-red-50 p-4">
            <summary className="cursor-pointer font-medium text-red-900 text-sm">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-x-auto text-red-800 text-xs">
              {error.name}: {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-[#ff5d46] px-4 py-3 font-medium text-sm text-white transition hover:bg-[#ff4d36]"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload Page
          </button>
          <button
            className="w-full rounded-lg border border-[#dcd6c7] bg-white px-4 py-3 font-medium text-[#2e2419] text-sm transition hover:bg-[#f5f0e8]"
            onClick={() => (window.location.href = "/")}
            type="button"
          >
            Go to Homepage
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-center text-[#7a6d62] text-xs">
          Need help?{" "}
          <a className="text-[#ff5d46] underline hover:text-[#ff4d36]" href="/contact">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
