"use client";

import { AlertCircleIcon, Calendar03Icon, CheckmarkCircle02Icon } from "hugeicons-react";
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
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getHealthBorderColor = (score: number) => {
    if (score >= 80) return "border-green-200";
    if (score >= 50) return "border-yellow-200";
    return "border-red-200";
  };

  return (
    <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Calendar03Icon className="h-6 w-6 text-[var(--red)]" />
        <h3 className="font-semibold text-[var(--foreground)] text-lg">{t("title")}</h3>
      </div>

      {/* Health Score */}
      <div
        className={`mb-6 rounded-2xl border-2 p-6 ${getHealthBgColor(health.healthScore)} ${getHealthBorderColor(health.healthScore)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-[#6b7280] text-sm">{t("overallHealth")}</p>
            <p className={`font-bold text-4xl ${getHealthColor(health.healthScore)}`}>
              {health.healthScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[#6b7280] text-sm">{t("availableDays")}</p>
            <p className="font-bold text-2xl text-[var(--foreground)]">
              {health.availableDaysCount}/7
            </p>
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
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="mb-3 flex items-center gap-2 font-semibold text-blue-900 text-sm">
            <AlertCircleIcon className="h-5 w-5" />
            {t("recommendations")}
          </p>
          <ul className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <li className="flex items-start gap-2 text-blue-800 text-sm" key={index}>
                <span className="mt-1 text-blue-600">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success State */}
      {health.healthScore === 100 && (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-green-900 text-sm">
            <CheckmarkCircle02Icon className="h-5 w-5" />
            {t("perfectHealth")}
          </p>
          <p className="mt-2 text-green-800 text-sm">{t("perfectHealthDescription")}</p>
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
            ? "bg-green-500 text-white"
            : "border-2 border-[#d1d5db] bg-white text-[#6b7280]"
        }`}
      >
        {completed ? (
          <CheckmarkCircle02Icon className="h-5 w-5" />
        ) : (
          <AlertCircleIcon className="h-5 w-5" />
        )}
      </div>
      <span
        className={`text-sm ${completed ? "font-medium text-[var(--foreground)]" : "text-[#6b7280]"}`}
      >
        {label}
      </span>
    </div>
  );
}
