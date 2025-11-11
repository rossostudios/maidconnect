"use client";

import {
  Baby01Icon,
  ChefHatIcon,
  FavouriteIcon,
  Home01Icon,
  MagicWand01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../MatchWizard";

type ServiceStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const SERVICES = [
  {
    value: "cleaning",
    label: "House Cleaning",
    icon: MagicWand01Icon,
    templates: [
      { value: "regular", label: "Regular Cleaning" },
      { value: "deep", label: "Deep Clean" },
      { value: "move-out", label: "Move-Out Deep Clean" },
      { value: "post-construction", label: "Post-Construction Cleanup" },
    ],
  },
  {
    value: "housekeeping",
    label: "Housekeeping",
    icon: Home01Icon,
    templates: [
      { value: "daily", label: "Daily Housekeeping" },
      { value: "live-in", label: "Live-in Housekeeper" },
    ],
  },
  {
    value: "laundry",
    label: "Laundry & Ironing",
    icon: PackageIcon,
    templates: [
      { value: "wash-fold", label: "Wash & Fold" },
      { value: "dry-clean", label: "Dry Cleaning Pickup" },
      { value: "ironing", label: "Ironing Only" },
    ],
  },
  {
    value: "cooking",
    label: "Cooking & Meal Prep",
    icon: ChefHatIcon,
    templates: [
      { value: "meal-prep", label: "Weekly Meal Prep" },
      { value: "personal-chef", label: "Personal Chef" },
      { value: "special-occasion", label: "Special Occasion" },
    ],
  },
  {
    value: "childcare",
    label: "Childcare",
    icon: Baby01Icon,
    templates: [
      { value: "nanny", label: "Nanny" },
      { value: "babysitter", label: "Babysitter" },
      { value: "after-school", label: "After-School Care" },
    ],
  },
  {
    value: "eldercare",
    label: "Elder Care",
    icon: FavouriteIcon,
    templates: [
      { value: "companion", label: "Companion Care" },
      { value: "personal-care", label: "Personal Care Assistant" },
      { value: "live-in-care", label: "Live-in Caregiver" },
    ],
  },
];

export function ServiceStep({ data, onUpdate, onNext, onBack }: ServiceStepProps) {
  const t = useTranslations("matchWizard.service");

  const handleNext = () => {
    if (!data.serviceType) {
      return;
    }
    onNext();
  };

  const selectedService = SERVICES.find((s) => s.value === data.serviceType);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-[#0f172a]">
          {t("title", { defaultValue: "What service do you need?" })}
        </h2>
        <p className="mt-2 text-[#94a3b8]">
          {t("description", { defaultValue: "Select the type of help you're looking for" })}
        </p>
      </div>

      {/* Service Selection */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const isSelected = data.serviceType === service.value;

          return (
            <button
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition ${
                isSelected
                  ? "border-[#0f172a] bg-[#0f172a]/5"
                  : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#0f172a]/30"
              }`}
              key={service.value}
              onClick={() => onUpdate({ serviceType: service.value, serviceTemplate: undefined })}
              type="button"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isSelected ? "bg-[#0f172a] text-[#f8fafc]" : "bg-[#f8fafc] text-[#0f172a]"
                }`}
              >
                <HugeiconsIcon className="h-6 w-6" icon={Icon} />
              </div>
              <span
                className={`text-center font-medium text-sm ${
                  isSelected ? "text-[#0f172a]" : "text-[#94a3b8]"
                }`}
              >
                {service.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Service Templates */}
      {selectedService && selectedService.templates.length > 0 && (
        <div className="space-y-3">
          <div className="block font-medium text-[#0f172a] text-sm">
            {t("templateLabel", { defaultValue: "Select a template" })}{" "}
            <span className="font-normal text-[#94a3b8]">
              ({t("optional", { defaultValue: "optional" })})
            </span>
          </div>
          <div className="space-y-2">
            {selectedService.templates.map((template) => {
              const isSelected = data.serviceTemplate === template.value;

              return (
                <button
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#0f172a] bg-[#0f172a]/5 font-semibold text-[#0f172a]"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:border-[#0f172a]/30"
                  }`}
                  key={template.value}
                  onClick={() => onUpdate({ serviceTemplate: template.value })}
                  type="button"
                >
                  {template.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 font-semibold text-[#94a3b8] transition hover:border-[#0f172a] hover:text-[#0f172a]"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-[#0f172a] px-6 py-3 font-semibold text-[#f8fafc] shadow-[0_6px_18px_rgba(22,22,22,0.22)] transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!data.serviceType}
          onClick={handleNext}
          type="button"
        >
          {t("next", { defaultValue: "Next Step" })}
        </button>
      </div>
    </div>
  );
}
