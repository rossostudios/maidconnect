"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { matchWizardTracking } from "@/lib/integrations/posthog";
import { HomeDetailsStep } from "./steps/home-details-step";
import { LocationStep } from "./steps/location-step";
import { PreferencesStep } from "./steps/preferences-step";
import { ResultsStep } from "./steps/results-step";
import { ServiceStep } from "./steps/service-step";
import { TimingBudgetStep } from "./steps/timing-budget-step";

export type WizardData = {
  // Location
  country?: string; // ISO 3166-1 alpha-2 country code (CO, PY, UY, AR)
  city?: string;
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
    serviceType: "",
  });

  // Track start time for wizard completion analytics
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedStartRef = useRef<boolean>(false);
  const stepsCompletedRef = useRef<number>(0);
  const stepsSkippedRef = useRef<number>(0);

  // Track wizard start on mount
  useEffect(() => {
    if (!hasTrackedStartRef.current) {
      matchWizardTracking.started({ source: "direct" });
      hasTrackedStartRef.current = true;
    }
  }, []);

  // Track wizard exit on unmount (if not completed)
  useEffect(() => {
    return () => {
      // Only track exit if user didn't complete the wizard
      if (currentStep !== "results") {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const steps: Step[] = [
          "location",
          "service",
          "home-details",
          "timing-budget",
          "preferences",
          "results",
        ];
        const stepNumber = steps.indexOf(currentStep) + 1;
        const progress = (stepNumber / steps.length) * 100;

        matchWizardTracking.exited({
          lastStep: currentStep,
          stepNumber,
          progress,
          timeSpent,
        });
      }
    };
  }, [currentStep]);

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

    // Track step completion
    stepsCompletedRef.current += 1;
    matchWizardTracking.stepCompleted({
      step: currentStep,
      stepNumber: currentIndex + 1,
      data: wizardData,
    });

    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      if (nextStepValue) {
        setCurrentStep(nextStepValue);

        // Track wizard completion when reaching results
        if (nextStepValue === "results") {
          const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
          matchWizardTracking.completed({
            totalStepsCompleted: stepsCompletedRef.current,
            stepsSkipped: stepsSkippedRef.current,
            timeSpent,
            finalData: {
              country: wizardData.country,
              city: wizardData.city,
              serviceType: wizardData.serviceType,
              budgetRange:
                wizardData.budgetMin && wizardData.budgetMax
                  ? `${wizardData.budgetMin}-${wizardData.budgetMax}`
                  : undefined,
              languagePreference: wizardData.languagePreference,
            },
          });
        }
      }
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
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        // Track backward navigation
        matchWizardTracking.stepBack({
          fromStep: currentStep,
          toStep: prevStep,
          currentStepNumber: currentIndex + 1,
        });
        setCurrentStep(prevStep);
      }
    }
  };

  const skipToResults = () => {
    // Track that a step was skipped
    const steps: Step[] = [
      "location",
      "service",
      "home-details",
      "timing-budget",
      "preferences",
      "results",
    ];
    const currentIndex = steps.indexOf(currentStep);

    stepsSkippedRef.current += 1;
    matchWizardTracking.stepSkipped({
      step: currentStep as "home-details" | "timing-budget" | "preferences",
      stepNumber: currentIndex + 1,
    });

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
    <div className="min-h-screen bg-gradient-to-br from-[bg-[neutral-50]] to-[bg-[neutral-50]] py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-semibold text-3xl text-[neutral-900] sm:text-4xl">
            {t("title", { defaultValue: "Find Your Perfect Match" })}
          </h1>
          <p className="mt-2 text-[neutral-400] text-lg">
            {t("subtitle", {
              defaultValue:
                "Answer a few questions and we'll recommend the best professionals for you",
            })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 overflow-hidden rounded-full bg-[neutral-200]">
            <div
              aria-label={t("progressLabel", {
                defaultValue: "Match wizard progress",
                step: currentStepIndex + 1,
                total: steps.length,
              })}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(progress)}
              className="h-full rounded-full bg-[neutral-900] transition-all duration-300"
              role="progressbar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            aria-atomic="true"
            aria-live="polite"
            className="mt-2 flex justify-between text-[neutral-400] text-sm"
          >
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
        <div className="rounded-lg border border-[neutral-200] bg-[neutral-50] p-6 shadow-[0_10px_40px_rgba(22,22,22,0.04)] sm:p-8">
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
            className="text-[neutral-400] text-sm hover:text-[neutral-900]"
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
