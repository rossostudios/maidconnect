"use client";

import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/i18n/routing";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

type Props = {
  status: OnboardingStatus;
  completionPercentage?: number;
};

const STATUS_CONFIG: Record<
  OnboardingStatus,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    showBadge: boolean;
  }
> = {
  application_pending: {
    label: "Complete Application",
    description: "Finish your application to get reviewed",
    color: "#E63946",
    bgColor: "#FEF2F2",
    showBadge: true,
  },
  application_in_review: {
    label: "In Review",
    description: "Your application is being reviewed",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    showBadge: true,
  },
  approved: {
    label: "Complete Profile",
    description: "Build your profile to go live",
    color: "#10B981",
    bgColor: "#D1FAE5",
    showBadge: true,
  },
  active: {
    label: "Active",
    description: "Your profile is live",
    color: "#10B981",
    bgColor: "#D1FAE5",
    showBadge: false,
  },
  suspended: {
    label: "Account Suspended",
    description: "Contact support for help",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    showBadge: true,
  },
};

export function ProOnboardingBadge({ status, completionPercentage = 0 }: Props) {
  const config = STATUS_CONFIG[status];

  if (!config.showBadge) {
    return null;
  }

  return (
    <Link
      className="group mx-3 mb-4 mt-4 block rounded-xl border border-[#E5E5E5] p-3 transition-all hover:shadow-md"
      href="/dashboard/pro/onboarding"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <HugeiconsIcon className="h-4 w-4" icon={Alert01Icon} style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: config.color }}>
            {config.label}
          </p>
          <p className="mt-0.5 text-[#525252] text-xs leading-tight">{config.description}</p>

          {completionPercentage > 0 && completionPercentage < 100 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${completionPercentage}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
              <p className="mt-1 text-right text-[#737373] text-xs">{completionPercentage}%</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
