"use client";

import { useState } from "react";
import { BriefConfirmation } from "@/components/brief/brief-confirmation";
import { BriefForm } from "@/components/brief/brief-form";
import { Container } from "@/components/ui/container";

export default function BriefPage() {
  const [submitted, setSubmitted] = useState(false);
  const [briefData, setBriefData] = useState<{ briefId: string; email: string } | null>(null);

  const handleSuccess = (briefId: string) => {
    // Get email from localStorage or form data (saved during form submission)
    const email = localStorage.getItem("briefEmail") || "";
    setBriefData({ briefId, email });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <Container className="max-w-4xl">
        {/* Header */}
        {!submitted && (
          <div className="mb-12 text-center">
            <div className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1 font-medium text-orange-600 text-sm">
              Free Service Matching
            </div>
            <h1 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
              Tell Us What You Need
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Answer a few questions and we'll connect you with 3–5 thoroughly vetted professionals
              who match your needs — usually within 5 business days.
            </p>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-neutral-600 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Background Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Reference Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Bilingual Support</span>
              </div>
            </div>
          </div>
        )}

        {/* Form or Confirmation */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-12">
          {submitted ? (
            briefData ? (
              <BriefConfirmation briefId={briefData.briefId} email={briefData.email} />
            ) : null
          ) : (
            <BriefForm onSuccess={handleSuccess} />
          )}
        </div>

        {/* Security & Privacy */}
        {!submitted && (
          <div className="mt-8 text-center text-neutral-600 text-sm">
            <p>
              🔒 Your information is secure and will only be used to match you with suitable
              professionals. We never share your data with third parties.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
