"use client";

import { Component, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors to Sentry, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm max-w-md">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-50 p-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#211f1a]">
              Something went wrong
            </h2>
            <p className="mb-6 text-[#7d7566]">
              We've been notified of this issue and are working to fix it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-white transition hover:bg-[#ff4529]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
