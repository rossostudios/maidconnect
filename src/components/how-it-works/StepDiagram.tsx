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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[neutral-500] to-[var(--red)] font-bold text-2xl text-[neutral-50] shadow-lg">
        {stepNumber}
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[neutral-50]">
        <HugeiconsIcon className="h-10 w-10 text-[neutral-500]" icon={icon} />
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-[neutral-900] text-lg">{t(titleKey)}</h3>
        <p className="text-[neutral-400] text-sm leading-relaxed">{t(descriptionKey)}</p>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="-right-1/2 absolute top-8 hidden h-0.5 w-full bg-gradient-to-r from-[neutral-500]/50 to-transparent md:block" />
      )}
    </div>
  );
}
