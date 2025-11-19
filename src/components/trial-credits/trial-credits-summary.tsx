/**
 * Trial Credits Summary Component
 *
 * Displays all trial credits earned by a customer across different professionals.
 * Shows progress bars, credit amounts, and links to use credits for direct hire.
 *
 * Design: Lia Design System compliant
 * - Anthropic rounded-lg cards
 * - 4px grid spacing
 * - Three-accent palette (orange primary, green success)
 * - Warm neutral backgrounds
 *
 * @module components/trial-credits
 */

import { Briefcase01Icon } from "hugeicons-react";
import { Link } from "@/i18n/routing";
import type { CustomerTrialCreditSummary } from "@/lib/services/trial-credits/trialCreditService";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";

export type TrialCreditsSummaryProps = {
  trialCredits: CustomerTrialCreditSummary[];
  locale: string;
};

/**
 * Trial Credits Summary
 *
 * Displays a grid of trial credit cards for each professional the customer has credits with.
 *
 * @example
 * <TrialCreditsSummary
 *   trialCredits={[
 *     {
 *       professionalId: "abc123",
 *       professionalName: "Maria García",
 *       creditAvailableCOP: 200000,
 *       creditAvailableUSD: 50,
 *       bookingsCompleted: 2,
 *       totalBookingsValueCOP: 400000,
 *       percentageEarned: 33,
 *     },
 *   ]}
 *   locale="en"
 * />
 */
export function TrialCreditsSummary({ trialCredits, locale }: TrialCreditsSummaryProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-2">
          <Briefcase01Icon className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl">
            Trial Credits Earned
          </h2>
          <p className="mt-1 text-neutral-700 text-sm leading-relaxed">
            Credits you've earned by booking with professionals. Apply them to reduce direct hire
            fees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {trialCredits.map((credit) => (
          <TrialCreditCard credit={credit} key={credit.professionalId} locale={locale} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Trial Credit Card
 * Shows credit details for a single professional
 */
function TrialCreditCard({
  credit,
  locale,
}: {
  credit: CustomerTrialCreditSummary;
  locale: string;
}) {
  const maxCreditCOP = 598_000; // 50% of $299 = ~$150
  const maxCreditUSD = Math.round(maxCreditCOP / 4000);

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 transition-all hover:border-orange-200 hover:shadow-md">
      {/* Professional Name */}
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-lg text-neutral-900">
          {credit.professionalName}
        </h3>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700 text-sm">
          {credit.bookingsCompleted} booking{credit.bookingsCompleted !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-neutral-700">Credit Earned</span>
          <span className="font-semibold text-neutral-900">
            {formatCurrency(credit.creditAvailableUSD, "USD")} /{" "}
            {formatCurrency(maxCreditUSD, "USD")} max
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            aria-label={`${credit.percentageEarned}% of maximum credit earned`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={credit.percentageEarned}
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
            role="progressbar"
            style={{ width: `${Math.min(credit.percentageEarned, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-neutral-500 text-xs">Total Spent</p>
          <p className="mt-1 font-semibold text-base text-neutral-900">
            {formatCurrency(Math.round(credit.totalBookingsValueCOP / 4000), "USD")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-neutral-500 text-xs">Available Credit</p>
          <p className="mt-1 font-semibold text-base text-green-600">
            {formatCurrency(credit.creditAvailableUSD, "USD")}
          </p>
        </div>
      </div>

      {/* CTA - Use Credit */}
      <Link
        className={cn(
          "w-full rounded-lg px-4 py-2.5 font-[family-name:var(--font-geist-sans)] font-semibold text-sm",
          "bg-orange-500 text-white shadow-sm",
          "hover:bg-orange-600 hover:shadow-md active:bg-orange-700",
          "transition-all duration-200",
          "flex items-center justify-center gap-2"
        )}
        href={`/${locale}/professionals/${credit.professionalId}`}
      >
        Use Credit for Direct Hire
        <Briefcase01Icon className="h-4 w-4" />
      </Link>
    </div>
  );
}
