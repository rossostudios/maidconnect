"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface StepDiagramProps {
  stepNumber: number;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  isLast?: boolean;
}

export function StepDiagram({
  stepNumber,
  icon: Icon,
  titleKey,
  descriptionKey,
  isLast = false,
}: StepDiagramProps) {
  const t = useTranslations();

  return (
    <div className="relative flex flex-col items-center">
      {/* Step number badge */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5d46] to-[#e54d36] font-bold text-2xl text-white shadow-lg">
        {stepNumber}
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <Icon className="h-10 w-10 text-[#ff5d46]" />
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">{t(titleKey)}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{t(descriptionKey)}</p>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="-right-1/2 absolute top-8 hidden h-0.5 w-full bg-gradient-to-r from-[#ff5d46]/50 to-transparent md:block" />
      )}
    </div>
  );
}
