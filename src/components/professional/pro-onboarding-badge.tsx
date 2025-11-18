"use client";

import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

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
    showBadge: boolean;
  }
> = {
  application_pending: {
    label: "Complete Application",
    description: "Finish your application to get reviewed",
    showBadge: true,
  },
  application_in_review: {
    label: "In Review",
    description: "Your application is being reviewed",
    showBadge: true,
  },
  approved: {
    label: "Complete Profile",
    description: "Build your profile to go live",
    showBadge: true,
  },
  active: {
    label: "Active",
    description: "Your profile is live",
    showBadge: false,
  },
  suspended: {
    label: "Account Suspended",
    description: "Contact support for help",
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
      className="group mx-4 mt-4 mb-4 block border border-[#FF5200] bg-orange-50 p-3 transition-all hover:shadow-sm"
      href="/dashboard/pro/onboarding"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#FF5200] bg-[#FF5200]">
          <HugeiconsIcon className="h-4 w-4 text-white" icon={Alert01Icon} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {config.label}
          </p>
          <p
            className={cn(
              "mt-1 font-normal text-neutral-700 text-xs tracking-tighter",
              geistSans.className
            )}
          >
            {config.description}
          </p>

          {completionPercentage > 0 && completionPercentage < 100 && (
            <div className="mt-2">
              <div className="h-1 w-full overflow-hidden border border-neutral-200 bg-white">
                <div
                  className="h-full bg-[#FF5200] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p
                className={cn(
                  "mt-1 text-right font-semibold text-neutral-700 text-xs tracking-tighter",
                  geistSans.className
                )}
              >
                {completionPercentage}%
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
