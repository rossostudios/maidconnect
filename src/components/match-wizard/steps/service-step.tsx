"use client";

import { Baby, ChefHat, Heart, Home, Package, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../match-wizard";

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
    icon: Sparkles,
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
    icon: Home,
    templates: [
      { value: "daily", label: "Daily Housekeeping" },
      { value: "live-in", label: "Live-in Housekeeper" },
    ],
  },
  {
    value: "laundry",
    label: "Laundry & Ironing",
    icon: Package,
    templates: [
      { value: "wash-fold", label: "Wash & Fold" },
      { value: "dry-clean", label: "Dry Cleaning Pickup" },
      { value: "ironing", label: "Ironing Only" },
    ],
  },
  {
    value: "cooking",
    label: "Cooking & Meal Prep",
    icon: ChefHat,
    templates: [
      { value: "meal-prep", label: "Weekly Meal Prep" },
      { value: "personal-chef", label: "Personal Chef" },
      { value: "special-occasion", label: "Special Occasion" },
    ],
  },
  {
    value: "childcare",
    label: "Childcare",
    icon: Baby,
    templates: [
      { value: "nanny", label: "Nanny" },
      { value: "babysitter", label: "Babysitter" },
      { value: "after-school", label: "After-School Care" },
    ],
  },
  {
    value: "eldercare",
    label: "Elder Care",
    icon: Heart,
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
        <h2 className="font-semibold text-2xl text-[#211f1a]">
          {t("title", { defaultValue: "What service do you need?" })}
        </h2>
        <p className="mt-2 text-[#7a6d62]">
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
                  ? "border-[#211f1a] bg-[#211f1a]/5"
                  : "border-[#ebe5d8] bg-white hover:border-[#211f1a]/30"
              }`}
              key={service.value}
              onClick={() => onUpdate({ serviceType: service.value, serviceTemplate: undefined })}
              type="button"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isSelected ? "bg-[#211f1a] text-white" : "bg-[#fbfafa] text-[#211f1a]"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span
                className={`text-center font-medium text-sm ${
                  isSelected ? "text-[#211f1a]" : "text-[#5d574b]"
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
          <label className="block font-medium text-[#211f1a] text-sm">
            {t("templateLabel", { defaultValue: "Select a template" })}{" "}
            <span className="font-normal text-[#7a6d62]">
              ({t("optional", { defaultValue: "optional" })})
            </span>
          </label>
          <div className="space-y-2">
            {selectedService.templates.map((template) => {
              const isSelected = data.serviceTemplate === template.value;

              return (
                <button
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#211f1a] bg-[#211f1a]/5 font-semibold text-[#211f1a]"
                      : "border-[#ebe5d8] bg-white text-[#5d574b] hover:border-[#211f1a]/30"
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
          className="flex-1 rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-[#211f1a] hover:text-[#211f1a]"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-[#211f1a] px-6 py-3 font-semibold text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] transition hover:bg-[#2d2822] disabled:cursor-not-allowed disabled:opacity-50"
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
