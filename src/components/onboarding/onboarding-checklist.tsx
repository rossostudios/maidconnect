"use client";

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { OnboardingChecklist as OnboardingChecklistType, OnboardingItem } from "@/types";

type OnboardingChecklistProps = {
  checklist: OnboardingChecklistType;
  completionPercentage: number;
  canAcceptBookings: boolean;
  onItemClick?: (itemId: string) => void;
};

/**
 * Onboarding Checklist Component
 *
 * Displays professional onboarding progress with % completion.
 * Blocks booking acceptance until 100% of required items are complete.
 *
 * Based on Tremor Blocks pattern for progress tracking.
 */
export function OnboardingChecklist({
  checklist,
  completionPercentage,
  canAcceptBookings,
  onItemClick,
}: OnboardingChecklistProps) {
  const t = useTranslations("components.onboardingChecklist");
  const [expandedOptional, setExpandedOptional] = useState(false);

  const requiredItems = checklist.items.filter((item) => item.required);
  const optionalItems = checklist.items.filter((item) => !item.required);

  const completedRequired = requiredItems.filter((item) => item.completed).length;
  const totalRequired = requiredItems.length;

  return (
    <div className="border-2 border-[neutral-200] bg-[neutral-50] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
          <span className="font-bold text-2xl text-[neutral-500]">{completionPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 overflow-hidden bg-[neutral-50]">
          <div
            className="h-full bg-gradient-to-r from-[neutral-500] to-[neutral-500] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Status Message */}
        <p className="mt-3 text-[neutral-400] text-sm">
          {canAcceptBookings ? (
            <span className="flex items-center gap-2 font-semibold text-[neutral-500]">
              <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle02Icon} />
              {t("ready")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5" icon={InformationCircleIcon} />
              {t("incomplete", {
                completed: completedRequired,
                total: totalRequired,
              })}
            </span>
          )}
        </p>
      </div>

      {/* Required Items */}
      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-[neutral-900] text-sm uppercase tracking-wide">
          {t("requiredItems")}
        </h4>
        <div className="space-y-2">
          {requiredItems.map((item) => (
            <ChecklistItem item={item} key={item.id} onClick={() => onItemClick?.(item.id)} />
          ))}
        </div>
      </div>

      {/* Optional Items (Collapsible) */}
      {optionalItems.length > 0 && (
        <div>
          <button
            className="mb-3 flex w-full items-center justify-between font-semibold text-[neutral-900] text-sm uppercase tracking-wide transition hover:text-[neutral-500]"
            onClick={() => setExpandedOptional(!expandedOptional)}
            type="button"
          >
            <span>{t("optionalItems")}</span>
            <svg
              className={`h-5 w-5 transition-transform ${expandedOptional ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>

          {expandedOptional && (
            <div className="space-y-2">
              {optionalItems.map((item) => (
                <ChecklistItem item={item} key={item.id} onClick={() => onItemClick?.(item.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!canAcceptBookings && (
        <div className="mt-6 bg-[neutral-50] p-4 text-[neutral-500] text-sm">
          <p className="font-semibold">{t("helpTitle")}</p>
          <p className="mt-1 text-[neutral-500]">{t("helpDescription")}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Checklist Item
 */
function ChecklistItem({ item, onClick }: { item: OnboardingItem; onClick: () => void }) {
  const t = useTranslations("components.onboardingChecklist.items");

  return (
    <button
      className={`flex w-full items-center gap-3 border-2 p-4 text-left transition-all ${
        item.completed
          ? "border-[neutral-500]/40 bg-[neutral-500]/10 hover:bg-[neutral-500]/10"
          : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-500]/50 hover:shadow-sm"
      }`}
      onClick={onClick}
      type="button"
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center ${
          item.completed
            ? "bg-[neutral-500]/100 text-[neutral-50]"
            : "border-2 border-[neutral-200] bg-[neutral-50] text-[neutral-400]"
        }`}
      >
        {item.completed ? (
          <HugeiconsIcon className="h-6 w-6" icon={CheckmarkCircle02Icon} />
        ) : (
          <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
        )}
      </div>

      {/* Label */}
      <div className="flex-1">
        <p
          className={`font-medium text-sm ${item.completed ? "text-[neutral-500]" : "text-[neutral-900]"}`}
        >
          {t(item.id)}
        </p>
        {item.completedAt && (
          <p className="mt-1 text-[neutral-500] text-xs">
            {t("completedOn", {
              date: new Date(item.completedAt).toLocaleDateString(),
            })}
          </p>
        )}
      </div>

      {/* Arrow */}
      {!item.completed && (
        <svg
          className="h-5 w-5 flex-shrink-0 text-[neutral-400]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      )}
    </button>
  );
}
