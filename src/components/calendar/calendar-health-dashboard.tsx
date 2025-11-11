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
      return "text-[#64748b]";
    }
    if (score >= 50) {
      return "text-[#64748b]";
    }
    return "text-[#64748b]";
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) {
      return "bg-[#64748b]/10";
    }
    if (score >= 50) {
      return "bg-[#64748b]/5";
    }
    return "bg-[#64748b]/10";
  };

  const getHealthBorderColor = (score: number) => {
    if (score >= 80) {
      return "border-[#64748b]/40";
    }
    if (score >= 50) {
      return "border-[#64748b]/30";
    }
    return "border-[#64748b]/30";
  };

  return (
    <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={Calendar03Icon} />
        <h3 className="font-semibold text-[#0f172a] text-lg">{t("title")}</h3>
      </div>

      {/* Health Score */}
      <div
        className={`mb-6 rounded-2xl border-2 p-6 ${getHealthBgColor(health.healthScore)} ${getHealthBorderColor(health.healthScore)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-[#94a3b8] text-sm">{t("overallHealth")}</p>
            <p className={`font-bold text-4xl ${getHealthColor(health.healthScore)}`}>
              {health.healthScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[#94a3b8] text-sm">{t("availableDays")}</p>
            <p className="font-bold text-2xl text-[#0f172a]">{health.availableDaysCount}/7</p>
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
        <div className="rounded-xl bg-[#f8fafc] p-4">
          <p className="mb-3 flex items-center gap-2 font-semibold text-[#64748b] text-sm">
            <HugeiconsIcon className="h-5 w-5" icon={AlertCircleIcon} />
            {t("recommendations")}
          </p>
          <ul className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <li className="flex items-start gap-2 text-[#64748b] text-sm" key={index}>
                <span className="mt-1 text-[#64748b]">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success State */}
      {health.healthScore === 100 && (
        <div className="rounded-xl bg-[#64748b]/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-[#64748b] text-sm">
            <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
            {t("perfectHealth")}
          </p>
          <p className="mt-2 text-[#64748b] text-sm">{t("perfectHealthDescription")}</p>
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
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          completed
            ? "bg-[#64748b]/100 text-[#f8fafc]"
            : "border-2 border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8]"
        }`}
      >
        {completed ? (
          <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
        ) : (
          <HugeiconsIcon className="h-5 w-5" icon={AlertCircleIcon} />
        )}
      </div>
      <span className={`text-sm ${completed ? "font-medium text-[#0f172a]" : "text-[#94a3b8]"}`}>
        {label}
      </span>
    </div>
  );
}
