"use client";

import {
  Award01Icon,
  Clock01Icon,
  SecurityCheckIcon,
  TranslateIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../match-wizard";

type PreferencesStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

const LANGUAGES = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "bilingual", label: "Bilingual (Preferred)", flag: "🌐" },
];

const VERIFICATION_LEVELS = [
  {
    value: "basic",
    label: "Basic Verification",
    description: "ID verified, active on platform",
    icon: "✓",
  },
  {
    value: "enhanced",
    label: "Enhanced Verification",
    description: "ID + references + background check consent",
    icon: "✓✓",
  },
  {
    value: "background-check",
    label: "Background Check",
    description: "Full background check completed",
    icon: "✓✓✓",
    recommended: true,
  },
];

const AVAILABILITY_OPTIONS = [
  { value: "today", label: "Available Today", icon: "⚡" },
  { value: "this-week", label: "Available This Week", icon: "📅" },
  { value: "flexible", label: "Flexible", icon: "🕐" },
];

export function PreferencesStep({ data, onUpdate, onNext, onBack, onSkip }: PreferencesStepProps) {
  const t = useTranslations("matchWizard.preferences");

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[neutral-900]/5">
          <HugeiconsIcon className="h-8 w-8 text-[neutral-900]" icon={SecurityCheckIcon} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-[neutral-900]">
          {t("title", { defaultValue: "Your must-haves" })}
        </h2>
        <p className="mt-2 text-[neutral-400]">
          {t("description", { defaultValue: "Help us narrow down the perfect match" })}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Language Preference */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-medium text-[neutral-900] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={TranslateIcon} />
            {t("languageLabel", { defaultValue: "Language preference" })}
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => {
              const isSelected = data.languagePreference === lang.value;

              return (
                <button
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                    isSelected
                      ? "border-[neutral-900] bg-[neutral-900]/5"
                      : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-900]/30"
                  }`}
                  key={lang.value}
                  onClick={() =>
                    onUpdate({
                      languagePreference: lang.value as WizardData["languagePreference"],
                    })
                  }
                  type="button"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span
                    className={`flex-1 text-left font-medium ${
                      isSelected ? "text-[neutral-900]" : "text-[neutral-400]"
                    }`}
                  >
                    {lang.label}
                  </span>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[neutral-900] text-[neutral-50]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verification Level */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-medium text-[neutral-900] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={SecurityCheckIcon} />
            {t("verificationLabel", { defaultValue: "Required verification level" })}
          </div>
          <div className="space-y-2">
            {VERIFICATION_LEVELS.map((level) => {
              const isSelected = data.verificationRequired === level.value;

              return (
                <button
                  className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[neutral-900] bg-[neutral-900]/5"
                      : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-900]/30"
                  } ${level.recommended ? "ring-2 ring-[neutral-500]/20" : ""}`}
                  key={level.value}
                  onClick={() =>
                    onUpdate({
                      verificationRequired: level.value as WizardData["verificationRequired"],
                    })
                  }
                  type="button"
                >
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[neutral-900]/10 font-semibold text-[neutral-900] text-xs">
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${isSelected ? "text-[neutral-900]" : "text-[neutral-400]"}`}
                      >
                        {level.label}
                      </span>
                      {level.recommended && (
                        <span className="rounded-full bg-[neutral-500] px-2 py-1 font-semibold text-[neutral-50] text-xs">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[neutral-400] text-xs">{level.description}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[neutral-900] text-[neutral-50]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Years */}
        <div>
          <label
            className="mb-2 flex items-center gap-2 font-medium text-[neutral-900] text-sm"
            htmlFor="experience-years"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Award01Icon} />
            {t("experienceLabel", { defaultValue: "Minimum years of experience" })}
          </label>
          <select
            className="w-full rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] transition focus:border-[neutral-900] focus:outline-none focus:ring-2 focus:ring-[neutral-900]/20"
            id="experience-years"
            onChange={(e) => onUpdate({ experienceYears: Number(e.target.value) })}
            value={data.experienceYears || ""}
          >
            <option value="">{t("anyExperience", { defaultValue: "Any experience level" })}</option>
            <option value="1">1+ year</option>
            <option value="2">2+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-medium text-[neutral-900] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            {t("availabilityLabel", { defaultValue: "Availability needed" })}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {AVAILABILITY_OPTIONS.map((option) => {
              const isSelected = data.availability === option.value;

              return (
                <button
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
                    isSelected
                      ? "border-[neutral-900] bg-[neutral-900]/5"
                      : "border-[neutral-200] bg-[neutral-50] hover:border-[neutral-900]/30"
                  }`}
                  key={option.value}
                  onClick={() =>
                    onUpdate({
                      availability: option.value as WizardData["availability"],
                    })
                  }
                  type="button"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span
                    className={`text-center font-medium text-xs ${
                      isSelected ? "text-[neutral-900]" : "text-[neutral-400]"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 rounded-xl border border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-400] transition hover:border-[neutral-900] hover:text-[neutral-900]"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="rounded-xl border border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-400] transition hover:border-[neutral-900] hover:text-[neutral-900]"
          onClick={onSkip}
          type="button"
        >
          {t("skip", { defaultValue: "Skip" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-[neutral-900] px-6 py-3 font-semibold text-[neutral-50] shadow-[0_6px_18px_rgba(22,22,22,0.22)] transition hover:bg-[neutral-900]"
          onClick={onNext}
          type="button"
        >
          {t("findMatches", { defaultValue: "Find My Matches" })}
        </button>
      </div>
    </div>
  );
}
