"use client";

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
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F5F0E8",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "32rem",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "28px",
                padding: "2rem",
                textAlign: "center",
                boxShadow: "0 20px 60px -15px rgba(18,17,15,0.15)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    borderRadius: "9999px",
                    padding: "1.5rem",
                  }}
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    style={{ width: "3rem", height: "3rem", color: "#ef4444" }}
                    viewBox="0 0 24 24"
                  >
                    <title>Error Alert</title>
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "#1A1614",
                  marginBottom: "0.75rem",
                }}
              >
                Application Error
              </h1>

              {/* Description */}
              <p
                style={{
                  fontSize: "1.125rem",
                  color: "#7d7566",
                  marginBottom: "2rem",
                }}
              >
                A critical error has occurred. Our team has been notified and is working to resolve
                the issue.
              </p>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <button
                  onClick={reset}
                  style={{
                    backgroundColor: "#E85D48",
                    color: "white",
                    fontWeight: "600",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  style={{
                    backgroundColor: "white",
                    color: "#1A1614",
                    fontWeight: "600",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "9999px",
                    border: "2px solid #ebe5d8",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
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
