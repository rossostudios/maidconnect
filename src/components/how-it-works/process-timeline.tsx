"use client";

import {
  Calendar01Icon,
  DollarCircleIcon,
  File01Icon,
  Search01Icon,
  SecurityCheckIcon,
  StarIcon,
  UserCheck01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";

type TimelineStep = {
  iconName: string;
  titleKey: string;
  descriptionKey: string;
};

type ProcessTimelineProps = {
  steps: TimelineStep[];
  translationNamespace: string;
};

const iconMap = {
  Search: Search01Icon,
  Calendar: Calendar01Icon,
  UserCheck: UserCheck01Icon,
  Star: StarIcon,
  FileText: File01Icon,
  ShieldCheck: SecurityCheckIcon,
  Users: UserGroupIcon,
  DollarSign: DollarCircleIcon,
};

export function ProcessTimeline({ steps, translationNamespace }: ProcessTimelineProps) {
  const t = useTranslations(translationNamespace);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-red-600 via-red-600/50 to-transparent md:left-8" />

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const icon = iconMap[step.iconName as keyof typeof iconMap];

          return (
            <div className="relative flex gap-6 md:gap-8" key={index}>
              {/* Step indicator */}
              <div className="relative z-10 flex flex-shrink-0 flex-col items-center">
                {/* Number badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E85D48] font-bold text-white shadow-sm md:h-16 md:w-16 md:text-lg">
                  {index + 1}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 pb-8">
                <div className="rounded-xl border border-[#ebe5d8] bg-white p-6 shadow-xs transition hover:shadow-sm">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E85D48]/10">
                    <HugeiconsIcon className="h-7 w-7 text-[#E85D48]" icon={icon} />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 text-xl">{t(step.titleKey)}</h3>
                  <p className="text-gray-600 leading-relaxed">{t(step.descriptionKey)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
