/**
 * Background Check Card Component
 * Displays individual background check information
 * Extracted from background-check-dashboard to reduce complexity
 */

import {
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
  TimeScheduleIcon,
  UserAccountIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCheckTypeLabel,
  getProviderBadge,
  getRecommendationText,
  getStatusBadge,
} from "@/lib/integrations/background-checks/badgeHelpers";

type BackgroundCheckCardProps = {
  check: any; // Use any to avoid type conflicts between Date and string after JSON serialization
  onViewDetails: () => void;
};

export function BackgroundCheckCard({ check, onViewDetails }: BackgroundCheckCardProps) {
  return (
    <Card className="border-stone-200 bg-white transition-shadow hover:shadow-lg dark:border-stone-800 dark:bg-stone-950">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 dark:bg-stone-950">
                  <HugeiconsIcon
                    className="h-6 w-6 text-stone-900 dark:text-stone-100"
                    icon={UserAccountIcon}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
                    {check.professional.full_name || "Unnamed Professional"}
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {check.professional.city && check.professional.country
                      ? `${check.professional.city}, ${check.professional.country}`
                      : check.professional.email || "No contact info"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 font-semibold text-sm ${getStatusBadge(check.status)}`}
                >
                  {check.status}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-semibold text-sm ${getProviderBadge(check.provider)}`}
                >
                  {check.provider}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-4 w-4 text-stone-600 dark:text-stone-400"
                    icon={TimeScheduleIcon}
                  />
                  <span className="font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
                    Waiting Time
                  </span>
                </div>
                <p className="font-bold text-2xl text-stone-900 dark:text-stone-100">
                  {check.daysWaiting}
                  <span className="ml-1 font-normal text-sm text-stone-600 dark:text-stone-400">
                    days
                  </span>
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-4 w-4 text-stone-600 dark:text-stone-400"
                    icon={SecurityCheckIcon}
                  />
                  <span className="font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
                    Checks Performed
                  </span>
                </div>
                <p className="font-bold text-2xl text-stone-900 dark:text-stone-100">
                  {check.checksPerformed?.length || 0}
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-4 w-4 text-stone-600 dark:text-stone-400"
                    icon={CheckmarkCircle02Icon}
                  />
                  <span className="font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
                    Recommendation
                  </span>
                </div>
                <p className="font-bold text-sm text-stone-800 dark:text-stone-300">
                  {getRecommendationText(check.recommendation)}
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-4 w-4 text-stone-600 dark:text-stone-400"
                    icon={TimeScheduleIcon}
                  />
                  <span className="font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
                    Completed
                  </span>
                </div>
                <p className="text-sm text-stone-800 dark:text-stone-300">
                  {check.completedAt ? new Date(check.completedAt).toLocaleDateString() : "Pending"}
                </p>
              </div>
            </div>

            {/* Checks Performed Tags */}
            {check.checksPerformed && check.checksPerformed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {check.checksPerformed.map((checkType: string) => (
                  <span
                    className="rounded-lg bg-white px-3 py-1.5 font-medium text-stone-900 text-xs dark:bg-stone-950 dark:text-stone-100"
                    key={checkType}
                  >
                    {getCheckTypeLabel(checkType)}
                  </span>
                ))}
              </div>
            )}

            {/* Criminal Records Warning */}
            {check.results.criminal && check.results.criminal.records.length > 0 && (
              <div className="mt-6 rounded-lg border border-stone-900 bg-white p-4 dark:border-stone-100/30 dark:bg-stone-950">
                <p className="mb-2 font-semibold text-sm text-stone-800 dark:text-stone-300">
                  ⚠ Criminal Records Found
                </p>
                <p className="text-sm text-stone-800 dark:text-stone-300">
                  {check.results.criminal.records.length} record(s) found. Click "View Details" to
                  review.
                </p>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            className="ml-6 rounded-lg bg-stone-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-stone-900 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
            onClick={onViewDetails}
            type="button"
          >
            <HugeiconsIcon className="mr-2 inline h-4 w-4" icon={ViewIcon} />
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
