"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { HugeIcon } from "@/types/icons";

type StepDiagramProps = {
  stepNumber: number;
  icon: HugeIcon;
  titleKey: string;
  descriptionKey: string;
  isLast?: boolean;
};

export function StepDiagram({
  stepNumber,
  icon,
  titleKey,
  descriptionKey,
  isLast = false,
}: StepDiagramProps) {
  const t = useTranslations();

  return (
    <div className="relative flex flex-col items-center">
      {/* Step number badge */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#64748b] to-[var(--red)] font-bold text-2xl text-[#f8fafc] shadow-lg">
        {stepNumber}
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8fafc]">
        <HugeiconsIcon className="h-10 w-10 text-[#64748b]" icon={icon} />
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-[#0f172a] text-lg">{t(titleKey)}</h3>
        <p className="text-[#94a3b8] text-sm leading-relaxed">{t(descriptionKey)}</p>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="-right-1/2 absolute top-8 hidden h-0.5 w-full bg-gradient-to-r from-[#64748b]/50 to-transparent md:block" />
      )}
    </div>
  );
}
