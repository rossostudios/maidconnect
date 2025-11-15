"use client";

import { Search, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

type EmptyStateProps = {
  hasFilters?: boolean;
  onClearFilters?: () => void;
};

export function ProfessionalsEmptyState({ hasFilters = false, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    // When filters are applied but no results
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center border-2 border-neutral-300 border-dashed bg-neutral-50 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center bg-neutral-200">
          <Search className="h-8 w-8 text-neutral-400" />
        </div>

        <h3 className="mb-2 font-semibold text-neutral-900 text-xl">
          No professionals match these filters
        </h3>
        <p className="mb-6 max-w-md text-neutral-600">
          Try adjusting your search criteria or clearing some filters to see more results.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Clear All Filters
            </Button>
          )}
          <Link href="/brief">
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Your Brief
            </Button>
          </Link>
        </div>

        <div className="mt-8 border border-orange-200 bg-orange-50 p-4">
          <p className="text-orange-900 text-sm">
            <strong>Can't find what you're looking for?</strong> Our concierge team can handpick the
            perfect match for you.
          </p>
        </div>
      </div>
    );
  }

  // When there are genuinely no professionals in the database yet
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center border-2 border-neutral-300 border-dashed bg-neutral-50 p-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center bg-orange-100">
        <Users className="h-10 w-10 text-orange-600" />
      </div>

      <h3 className="mb-3 font-bold text-2xl text-neutral-900">
        We're building our professional network
      </h3>
      <p className="mb-8 max-w-lg text-lg text-neutral-600">
        We're currently onboarding thoroughly vetted professionals in your area. Let us know what
        you need, and we'll notify you when we have the perfect matches ready.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link className="w-full" href="/brief">
          <Button className="w-full" size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Tell Us Your Needs
          </Button>
        </Link>
        <Link className="w-full" href="/concierge">
          <Button className="w-full" size="lg" variant="outline">
            Request Concierge Service
          </Button>
        </Link>
      </div>

      {/* What happens next */}
      <div className="mx-auto max-w-2xl border border-neutral-200 bg-white p-6 text-left">
        <h4 className="mb-4 font-semibold text-neutral-900">How it works:</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
              1
            </div>
            <p className="text-neutral-700 text-sm">
              Tell us your requirements (service type, location, language, schedule)
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
              2
            </div>
            <p className="text-neutral-700 text-sm">
              We'll vet and match professionals who perfectly fit your needs
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
              3
            </div>
            <p className="text-neutral-700 text-sm">
              You'll receive 3–5 detailed profiles within 5 business days
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
              4
            </div>
            <p className="text-neutral-700 text-sm">
              Interview candidates and hire your perfect match with our support
            </p>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-neutral-600 text-sm">
        <div className="flex items-center gap-2">
          <svg
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
  );
}
