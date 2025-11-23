import { Link01Icon, MagicWand01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Professional Profiles | Casaora",
  description:
    "Find verified home service professionals on Casaora. Browse our directory or use a professional's personal profile link.",
};

/**
 * Landing page for /pro route (without a slug)
 *
 * This page helps users who land on /pro without a specific professional's
 * vanity URL. It explains what /pro/[name] URLs are for and provides
 * clear next steps.
 */
export default function ProLandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={Link01Icon} size={40} />
          </div>

          {/* Heading */}
          <h1 className="mb-4 font-bold text-3xl text-neutral-900 sm:text-4xl">
            Looking for a professional?
          </h1>

          {/* Explanation */}
          <p className="mb-8 text-lg text-neutral-600">
            Our{" "}
            <code className="rounded bg-neutral-200 px-2 py-1 font-mono text-sm">/pro/name</code>{" "}
            URLs are personalized profile links for verified professionals. If someone shared a link
            with you, make sure it includes their profile name.
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/professionals">
              <Button className="w-full sm:w-auto" size="lg">
                <HugeiconsIcon className="mr-2 h-5 w-5" icon={UserMultiple02Icon} size={20} />
                Browse All Professionals
              </Button>
            </Link>
            <Link href="/brief">
              <Button className="w-full sm:w-auto" size="lg" variant="outline">
                <HugeiconsIcon className="mr-2 h-5 w-5" icon={MagicWand01Icon} size={20} />
                Tell Us Your Needs
              </Button>
            </Link>
          </div>

          {/* Info card */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6 text-left shadow-sm">
            <h2 className="mb-4 font-semibold text-neutral-900">How profile links work</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 text-xs">
                  1
                </div>
                <p>
                  Each verified professional on Casaora can create a personalized profile URL like{" "}
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
                    casaora.com/pro/maria-garcia
                  </code>
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 text-xs">
                  2
                </div>
                <p>
                  They can share this link on business cards, social media, or with clients for easy
                  access to their profile
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 text-xs">
                  3
                </div>
                <p>
                  If you don't have a specific link, browse our{" "}
                  <Link
                    className="font-medium text-orange-600 hover:underline"
                    href="/professionals"
                  >
                    professionals directory
                  </Link>{" "}
                  to find the perfect match
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
              <span>ID Verified</span>
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
              <span>Vetted & Reviewed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
