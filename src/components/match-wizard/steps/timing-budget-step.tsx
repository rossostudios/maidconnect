"use client";

import {
  Calendar01Icon,
  Clock01Icon,
  DollarCircleIcon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../match-wizard";

type TimingBudgetStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

const FREQUENCIES = [
  { value: "one-time", label: "One-time", icon: "🎯" },
  { value: "weekly", label: "Weekly", icon: "📅" },
  { value: "biweekly", label: "Bi-weekly", icon: "🗓️" },
  { value: "monthly", label: "Monthly", icon: "📆" },
];

const BUDGET_RANGES = [
  { min: 0, max: 50_000, label: "Under $50,000 COP" },
  { min: 50_000, max: 100_000, label: "$50,000 - $100,000 COP" },
  { min: 100_000, max: 150_000, label: "$100,000 - $150,000 COP" },
  { min: 150_000, max: 200_000, label: "$150,000 - $200,000 COP" },
  { min: 200_000, max: 999_999, label: "Over $200,000 COP" },
];

export function TimingBudgetStep({
  data,
  onUpdate,
  onNext,
  onBack,
  onSkip,
}: TimingBudgetStepProps) {
  const t = useTranslations("matchWizard.timingBudget");

  const handleBudgetChange = (min: number, max: number) => {
    onUpdate({ budgetMin: min, budgetMax: max });
  };

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900/5">
          <HugeiconsIcon className="h-8 w-8 text-gray-900" icon={Calendar01Icon} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-gray-900">
          {t("title", { defaultValue: "When do you need this service?" })}
        </h2>
        <p className="mt-2 text-[#7a6d62]">
          {t("description", { defaultValue: "Help us find available professionals" })}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Frequency */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-medium text-gray-900 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={RepeatIcon} />
            {t("frequencyLabel", { defaultValue: "How often do you need this service?" })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FREQUENCIES.map((freq) => {
              const isSelected = data.frequency === freq.value;

              return (
                <button
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    isSelected
                      ? "border-gray-900 bg-gray-900/5"
                      : "border-[#ebe5d8] bg-white hover:border-gray-900/30"
                  }`}
                  key={freq.value}
                  onClick={() => onUpdate({ frequency: freq.value as WizardData["frequency"] })}
                  type="button"
                >
                  <span className="text-2xl">{freq.icon}</span>
                  <span
                    className={`font-medium text-sm ${
                      isSelected ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {freq.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label
            className="mb-2 flex items-center gap-2 font-medium text-gray-900 text-sm"
            htmlFor="preferred-date"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
            {t("dateLabel", { defaultValue: "Preferred date" })}
          </label>
          <input
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-gray-900 transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            id="preferred-date"
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onUpdate({ preferredDate: e.target.value })}
            type="date"
            value={data.preferredDate || ""}
          />
        </div>

        {/* Time */}
        <div>
          <label
            className="mb-2 flex items-center gap-2 font-medium text-gray-900 text-sm"
            htmlFor="preferred-time"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            {t("timeLabel", { defaultValue: "Preferred time" })}
          </label>
          <select
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-gray-900 transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            id="preferred-time"
            onChange={(e) => onUpdate({ preferredTime: e.target.value })}
            value={data.preferredTime || ""}
          >
            <option value="">{t("selectTime", { defaultValue: "Select preferred time" })}</option>
            <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
            <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
            <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-medium text-gray-900 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={DollarCircleIcon} />
            {t("budgetLabel", { defaultValue: "Budget range" })}
          </div>
          <div className="space-y-2">
            {BUDGET_RANGES.map((range) => {
              const isSelected = data.budgetMin === range.min && data.budgetMax === range.max;

              return (
                <button
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-gray-900 bg-gray-900/5 font-semibold text-gray-900"
                      : "border-[#ebe5d8] bg-white text-gray-600 hover:border-gray-900/30"
                  }`}
                  key={`${range.min}-${range.max}`}
                  onClick={() => handleBudgetChange(range.min, range.max)}
                  type="button"
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-gray-900 hover:text-gray-900"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-gray-900 hover:text-gray-900"
          onClick={onSkip}
          type="button"
        >
          {t("skip", { defaultValue: "Skip" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] transition hover:bg-[#2d2822]"
          onClick={onNext}
          type="button"
        >
          {t("next", { defaultValue: "Next Step" })}
        </button>
      </div>
    </div>
  );
}
