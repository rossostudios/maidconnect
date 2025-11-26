"use client";

import { MagicWand01Icon, Search01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-neutral-300 border-dashed bg-neutral-50 p-12 text-center dark:border-border dark:bg-card">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800">
          <HugeiconsIcon
            className="h-8 w-8 text-neutral-600 dark:text-neutral-400"
            icon={Search01Icon}
            size={32}
          />
        </div>

        <h3 className="mb-2 font-semibold text-neutral-900 text-xl dark:text-neutral-50">
          No professionals match these filters
        </h3>
        <p className="mb-6 max-w-md text-neutral-600 dark:text-neutral-400">
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
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={MagicWand01Icon} size={16} />
              Start Your Brief
            </Button>
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-rausch-200 bg-rausch-50 p-4 dark:border-rausch-800 dark:bg-rausch-900/30">
          <p className="text-rausch-900 text-sm dark:text-rausch-200">
            <strong>Can't find what you're looking for?</strong> Tell us your requirements and we'll
            help match you with the perfect professional.
          </p>
        </div>
      </div>
    );
  }

  // When there are genuinely no professionals in the database yet
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-neutral-300 border-dashed bg-neutral-50 p-12 text-center dark:border-border dark:bg-card">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-rausch-100 dark:bg-rausch-900/30">
        <HugeiconsIcon
          className="h-10 w-10 text-rausch-600 dark:text-rausch-400"
          icon={UserMultiple02Icon}
          size={40}
        />
      </div>

      <h3 className="mb-3 font-bold text-2xl text-neutral-900 dark:text-neutral-50">
        We're building our professional network
      </h3>
      <p className="mb-8 max-w-lg text-lg text-neutral-600 dark:text-neutral-400">
        We're currently onboarding thoroughly vetted professionals in your area. Let us know what
        you need, and we'll notify you when we have the perfect matches ready.
      </p>

      <div className="mb-8">
        <Link className="w-full" href="/brief">
          <Button className="w-full" size="lg">
            <HugeiconsIcon className="mr-2 h-5 w-5" icon={MagicWand01Icon} size={20} />
            Tell Us Your Needs
          </Button>
        </Link>
      </div>

      {/* What happens next */}
      <div className="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-white p-6 text-left dark:border-border dark:bg-card">
        <h4 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-50">How it works:</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-rausch-100 font-semibold text-rausch-600 text-sm dark:bg-rausch-900/30 dark:text-rausch-400">
              1
            </div>
            <p className="text-neutral-700 text-sm dark:text-neutral-300">
              Tell us your requirements (service type, location, language, schedule)
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-rausch-100 font-semibold text-rausch-600 text-sm dark:bg-rausch-900/30 dark:text-rausch-400">
              2
            </div>
            <p className="text-neutral-700 text-sm dark:text-neutral-300">
              We'll vet and match professionals who perfectly fit your needs
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-rausch-100 font-semibold text-rausch-600 text-sm dark:bg-rausch-900/30 dark:text-rausch-400">
              3
            </div>
            <p className="text-neutral-700 text-sm dark:text-neutral-300">
              You'll receive 3–5 detailed profiles within 5 business days
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-rausch-100 font-semibold text-rausch-600 text-sm dark:bg-rausch-900/30 dark:text-rausch-400">
              4
            </div>
            <p className="text-neutral-700 text-sm dark:text-neutral-300">
              Interview candidates and hire your perfect match with our support
            </p>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-neutral-600 text-sm dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400"
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
            className="h-5 w-5 text-green-600 dark:text-green-400"
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
            className="h-5 w-5 text-green-600 dark:text-green-400"
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
