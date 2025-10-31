"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { HomeDetailsStep } from "./steps/home-details-step";
import { LocationStep } from "./steps/location-step";
import { PreferencesStep } from "./steps/preferences-step";
import { ResultsStep } from "./steps/results-step";
import { ServiceStep } from "./steps/service-step";
import { TimingBudgetStep } from "./steps/timing-budget-step";

export type WizardData = {
  // Location
  city: string;
  neighborhood?: string;

  // Service
  serviceType: string;
  serviceTemplate?: string;

  // Home Details
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  hasPets?: boolean;
  petDetails?: string;
  suppliesNeeded?: boolean;

  // Timing & Budget
  preferredDate?: string;
  preferredTime?: string;
  frequency?: "one-time" | "weekly" | "biweekly" | "monthly";
  budgetMin?: number;
  budgetMax?: number;

  // Preferences
  languagePreference?: "english" | "spanish" | "bilingual";
  verificationRequired?: "basic" | "enhanced" | "background-check";
  experienceYears?: number;
  availability?: "today" | "this-week" | "flexible";
};

type Step = "location" | "service" | "home-details" | "timing-budget" | "preferences" | "results";

export function MatchWizard() {
  const t = useTranslations("matchWizard");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("location");
  const [wizardData, setWizardData] = useState<WizardData>({
    city: "",
    serviceType: "",
  });

  const updateData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const steps: Step[] = [
      "location",
      "service",
      "home-details",
      "timing-budget",
      "preferences",
      "results",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const steps: Step[] = [
      "location",
      "service",
      "home-details",
      "timing-budget",
      "preferences",
      "results",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const skipToResults = () => {
    setCurrentStep("results");
  };

  const exitWizard = () => {
    router.push("/professionals");
  };

  // Progress calculation
  const steps: Step[] = [
    "location",
    "service",
    "home-details",
    "timing-budget",
    "preferences",
    "results",
  ];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbfafa] to-[#f5f0e8] py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-semibold text-3xl text-[#211f1a] sm:text-4xl">
            {t("title", { defaultValue: "Find Your Perfect Match" })}
          </h1>
          <p className="mt-2 text-[#5d574b] text-lg">
            {t("subtitle", {
              defaultValue:
                "Answer a few questions and we'll recommend the best professionals for you",
            })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 overflow-hidden rounded-full bg-[#ebe5d8]">
            <div
              className="h-full rounded-full bg-[#211f1a] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[#7a6d62] text-sm">
            <span>
              {t("step", { defaultValue: "Step" })} {currentStepIndex + 1}{" "}
              {t("of", { defaultValue: "of" })} {steps.length}
            </span>
            <span>
              {Math.round(progress)}% {t("complete", { defaultValue: "complete" })}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-3xl border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)] sm:p-8">
          {currentStep === "location" && (
            <LocationStep
              data={wizardData}
              onBack={exitWizard}
              onNext={nextStep}
              onUpdate={updateData}
            />
          )}

          {currentStep === "service" && (
            <ServiceStep
              data={wizardData}
              onBack={previousStep}
              onNext={nextStep}
              onUpdate={updateData}
            />
          )}

          {currentStep === "home-details" && (
            <HomeDetailsStep
              data={wizardData}
              onBack={previousStep}
              onNext={nextStep}
              onSkip={skipToResults}
              onUpdate={updateData}
            />
          )}

          {currentStep === "timing-budget" && (
            <TimingBudgetStep
              data={wizardData}
              onBack={previousStep}
              onNext={nextStep}
              onSkip={skipToResults}
              onUpdate={updateData}
            />
          )}

          {currentStep === "preferences" && (
            <PreferencesStep
              data={wizardData}
              onBack={previousStep}
              onNext={nextStep}
              onSkip={skipToResults}
              onUpdate={updateData}
            />
          )}

          {currentStep === "results" && (
            <ResultsStep
              data={wizardData}
              onBack={previousStep}
              onRestart={() => setCurrentStep("location")}
            />
          )}
        </div>

        {/* Exit Link */}
        <div className="mt-6 text-center">
          <button
            className="text-[#7a6d62] text-sm hover:text-[#211f1a]"
            onClick={exitWizard}
            type="button"
          >
            {t("exit", { defaultValue: "Exit wizard and browse all professionals" })}
          </button>
        </div>
      </div>
    </div>
  );
}
