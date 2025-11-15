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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[neutral-50] px-4">
      <div className="w-full max-w-md rounded-lg border border-[neutral-200] bg-[neutral-50] p-8 shadow-lg">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[neutral-500]/10">
            <svg
              aria-label="Error"
              className="h-8 w-8 text-[neutral-500]"
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
        <h1 className="mb-2 text-center font-semibold text-2xl text-[neutral-900]">
          Something went wrong
        </h1>
        <p className="mb-6 text-center text-[neutral-400] text-sm">
          We've been notified and are working to fix the issue.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded-lg bg-[neutral-500]/10 p-4">
            <summary className="cursor-pointer font-medium text-[neutral-500] text-sm">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-x-auto text-[neutral-500] text-xs">
              {error.name}: {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-[neutral-500] px-4 py-3 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload Page
          </button>
          <button
            className="w-full rounded-lg border border-[neutral-200] bg-[neutral-50] px-4 py-3 font-medium text-[neutral-900] text-sm transition hover:bg-[neutral-50]"
            onClick={() => window.location.assign("/")}
            type="button"
          >
            Go to Homepage
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-center text-[neutral-400] text-xs">
          Need help?{" "}
          <a className="text-[neutral-500] underline hover:text-[neutral-500]" href="/contact">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
