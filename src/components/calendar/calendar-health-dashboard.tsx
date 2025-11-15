"use client";

import { AlertCircleIcon, Calendar03Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { CalendarHealth } from "@/types";

type CalendarHealthDashboardProps = {
  health: CalendarHealth;
};

/**
 * Calendar Health Dashboard Component
 *
 * Displays professional calendar health metrics with actionable recommendations.
 * Shows health score (0-100) and specific areas for improvement.
 */
export function CalendarHealthDashboard({ health }: CalendarHealthDashboardProps) {
  const t = useTranslations("components.calendarHealth");

  const getHealthColor = (score: number) => {
    if (score >= 80) {
      return "text-[neutral-500]";
    }
    if (score >= 50) {
      return "text-[neutral-500]";
    }
    return "text-[neutral-500]";
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) {
      return "bg-[neutral-500]/10";
    }
    if (score >= 50) {
      return "bg-[neutral-500]/5";
    }
    return "bg-[neutral-500]/10";
  };

  const getHealthBorderColor = (score: number) => {
    if (score >= 80) {
      return "border-[neutral-500]/40";
    }
    if (score >= 50) {
      return "border-[neutral-500]/30";
    }
    return "border-[neutral-500]/30";
  };

  return (
    <div className="border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <HugeiconsIcon className="h-6 w-6 text-[neutral-500]" icon={Calendar03Icon} />
        <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
      </div>

      {/* Health Score */}
      <div
        className={`mb-6 border-2 p-6 ${getHealthBgColor(health.healthScore)} ${getHealthBorderColor(health.healthScore)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-[neutral-400] text-sm">{t("overallHealth")}</p>
            <p className={`font-bold text-4xl ${getHealthColor(health.healthScore)}`}>
              {health.healthScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[neutral-400] text-sm">{t("availableDays")}</p>
            <p className="font-bold text-2xl text-[neutral-900]">{health.availableDaysCount}/7</p>
          </div>
        </div>
      </div>

      {/* Health Checklist */}
      <div className="mb-6 space-y-3">
        <HealthItem completed={health.hasWorkingHours} label={t("hasWorkingHours")} />
        <HealthItem completed={health.hasServiceRadius} label={t("hasServiceRadius")} />
        <HealthItem completed={health.hasTravelBuffers} label={t("hasTravelBuffers")} />
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="bg-[neutral-50] p-4">
          <p className="mb-3 flex items-center gap-2 font-semibold text-[neutral-500] text-sm">
            <HugeiconsIcon className="h-5 w-5" icon={AlertCircleIcon} />
            {t("recommendations")}
          </p>
          <ul className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <li className="flex items-start gap-2 text-[neutral-500] text-sm" key={index}>
                <span className="mt-1 text-[neutral-500]">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success State */}
      {health.healthScore === 100 && (
        <div className="bg-[neutral-500]/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-[neutral-500] text-sm">
            <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
            {t("perfectHealth")}
          </p>
          <p className="mt-2 text-[neutral-500] text-sm">{t("perfectHealthDescription")}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Health Item
 */
function HealthItem({ completed, label }: { completed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center ${
          completed
            ? "bg-[neutral-500]/100 text-[neutral-50]"
            : "border-2 border-[neutral-200] bg-[neutral-50] text-[neutral-400]"
        }`}
      >
        {completed ? (
          <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
        ) : (
          <HugeiconsIcon className="h-5 w-5" icon={AlertCircleIcon} />
        )}
      </div>
      <span
        className={`text-sm ${completed ? "font-medium text-[neutral-900]" : "text-[neutral-400]"}`}
      >
        {label}
      </span>
    </div>
  );
}
