"use client";

import {
  Calendar,
  DollarSign,
  FileText,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface TimelineStep {
  iconName: string;
  titleKey: string;
  descriptionKey: string;
}

interface ProcessTimelineProps {
  steps: TimelineStep[];
  translationNamespace: string;
}

const iconMap = {
  Search,
  Calendar,
  UserCheck,
  Star,
  FileText,
  ShieldCheck,
  Users,
  DollarSign,
};

export function ProcessTimeline({ steps, translationNamespace }: ProcessTimelineProps) {
  const t = useTranslations(translationNamespace);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-[#ff5d46] via-[#ff5d46]/50 to-transparent md:left-8" />

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = iconMap[step.iconName as keyof typeof iconMap];

          return (
            <div className="relative flex gap-6 md:gap-8" key={index}>
              {/* Step indicator */}
              <div className="relative z-10 flex flex-shrink-0 flex-col items-center">
                {/* Number badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5d46] to-[#e54d36] font-bold text-white shadow-lg md:h-16 md:w-16 md:text-lg">
                  {index + 1}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 pb-8">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <Icon className="h-7 w-7 text-[#ff5d46]" />
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
