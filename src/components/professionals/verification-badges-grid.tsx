"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/core";
import { VerificationBadge, type VerificationLevel } from "./verification-badge";

export type VerificationData = {
  level: VerificationLevel;
  backgroundCheckPassed?: boolean;
  documentsVerified?: boolean;
  interviewCompleted?: boolean;
  referencesVerified?: boolean;
};

export type VerificationBadgesGridProps = {
  verification: VerificationData;
  showExplanations?: boolean;
  className?: string;
};

/**
 * Verification Badges Grid Component
 *
 * Displays all verification checks for a professional in a grid layout.
 * Shows specific badges for each verification type with explanations.
 *
 * Follows Lia Design System:
 * - Anthropic rounded corners (rounded-lg)
 * - Color-coded badges (green for background check, blue for docs, orange for interview)
 * - Solid backgrounds with border
 * - 4px grid spacing
 */
export function VerificationBadgesGrid({
  verification,
  showExplanations = false,
  className,
}: VerificationBadgesGridProps) {
  const {
    level,
    backgroundCheckPassed,
    documentsVerified,
    interviewCompleted,
    referencesVerified,
  } = verification;

  // Determine which badges to show
  const badges: { level: VerificationLevel; show: boolean; explanation: string }[] = [
    {
      level: "basic",
      show: level !== "none",
      explanation: "Identity verification completed with government-issued ID",
    },
    {
      level: "background-check",
      show: backgroundCheckPassed === true,
      explanation: "Professional criminal record check passed",
    },
    {
      level: "document-verified",
      show: documentsVerified === true,
      explanation: "Certifications and qualifications verified",
    },
    {
      level: "interview-completed",
      show: interviewCompleted === true,
      explanation: "In-person or video interview conducted by our team",
    },
    {
      level: "reference-checked",
      show: referencesVerified === true,
      explanation: "Professional references contacted and verified",
    },
  ];

  const visibleBadges = badges.filter((b) => b.show);

  if (visibleBadges.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center",
          className
        )}
      >
        <p className="text-neutral-500 text-sm">No verification completed yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Badges Grid */}
      <div className="flex flex-wrap gap-2">
        {visibleBadges.map(({ level: badgeLevel }) => (
          <VerificationBadge key={badgeLevel} level={badgeLevel} size="sm" />
        ))}
      </div>

      {/* Explanations */}
      {showExplanations && (
        <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2 font-medium text-neutral-900 text-sm">
            <InformationCircleIcon className="h-4 w-4 text-neutral-500" />
            What each badge means:
          </div>
          <ul className="space-y-2">
            {visibleBadges.map(({ level: badgeLevel, explanation }) => (
              <li className="flex items-start gap-2 text-neutral-700 text-sm" key={badgeLevel}>
                <span className="mt-0.5 text-neutral-400">•</span>
                <span>
                  <strong className="text-neutral-900">{getBadgeLabel(badgeLevel)}:</strong>{" "}
                  {explanation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Helper to get badge label from level
 */
function getBadgeLabel(level: VerificationLevel): string {
  const labels: Record<VerificationLevel, string> = {
    none: "",
    basic: "ID Verified",
    enhanced: "Enhanced Verified",
    "background-check": "Background Checked",
    "document-verified": "Documents Verified",
    "interview-completed": "Interview Completed",
    "reference-checked": "References Verified",
  };
  return labels[level];
}

/**
 * Compact Verification Summary Badge
 * Shows count of passed verifications in a single badge
 */
export type VerificationSummaryBadgeProps = {
  verification: VerificationData;
  className?: string;
};

function VerificationSummaryBadge({ verification, className }: VerificationSummaryBadgeProps) {
  const {
    level,
    backgroundCheckPassed,
    documentsVerified,
    interviewCompleted,
    referencesVerified,
  } = verification;

  let count = 0;
  if (level !== "none") {
    count++;
  }
  if (backgroundCheckPassed) {
    count++;
  }
  if (documentsVerified) {
    count++;
  }
  if (interviewCompleted) {
    count++;
  }
  if (referencesVerified) {
    count++;
  }

  if (count === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "border border-green-200 bg-green-50 text-green-700",
        "font-medium text-sm",
        className
      )}
    >
      <svg
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          fillRule="evenodd"
        />
      </svg>
      {count} {count === 1 ? "Verification" : "Verifications"}
    </div>
  );
}
