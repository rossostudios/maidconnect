"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

type BriefConfirmationProps = {
  briefId: string;
  email: string;
};

export function BriefConfirmation({ briefId, email }: BriefConfirmationProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center bg-green-100">
          <HugeiconsIcon className="h-12 w-12 text-green-600" icon={Tick02Icon} size={48} />
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="font-bold text-4xl text-neutral-900">Request Received!</h1>
          <p className="text-lg text-neutral-600">
            Thank you for choosing Casaora. We'll review your requirements and send you 3–5
            carefully matched candidates within 5 business days.
          </p>
        </div>

        {/* Details Card */}
        <div className="border border-neutral-200 bg-white p-6 text-left shadow-sm">
          <h2 className="mb-4 font-semibold text-neutral-900">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">We Review Your Needs</h3>
                <p className="text-neutral-600 text-sm">
                  Our team will carefully review your requirements and preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">We Find the Best Matches</h3>
                <p className="text-neutral-600 text-sm">
                  We'll handpick 3–5 thoroughly vetted professionals who match your specific needs.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">You Receive Profiles</h3>
                <p className="text-neutral-600 text-sm">
                  We'll email detailed profiles to <strong>{email}</strong> with bios, references,
                  and availability.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-orange-100 font-semibold text-orange-600 text-sm">
                4
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">You Interview & Hire</h3>
                <p className="text-neutral-600 text-sm">
                  Schedule video or in-person interviews, then hire your perfect match with our
                  support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Number */}
        <div className="bg-neutral-100 p-4">
          <p className="text-neutral-600 text-sm">
            Reference Number:{" "}
            <span className="font-mono font-semibold text-neutral-900">{briefId}</span>
          </p>
        </div>

        {/* Confirmation Email */}
        <div className="border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-900 text-sm">
            📧 A confirmation email has been sent to <strong>{email}</strong>. Please check your
            spam folder if you don't see it within a few minutes.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link href="/professionals">
            <Button className="w-full sm:w-auto" variant="outline">
              Browse Professionals
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button className="w-full sm:w-auto" variant="ghost">
              Learn How Casaora Works
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <div className="pt-6">
          <p className="text-neutral-700 text-sm">
            Have questions?{" "}
            <Link className="text-orange-600" href="/contact">
              Contact our support team
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
