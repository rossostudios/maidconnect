"use client";

import { useEffect } from "react";
import { TourStep, useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { TourTooltip } from "./tour-tooltip";

const steps: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: "Welcome to Casaora! 👋",
    content:
      "We're excited to have you here. Let's take a quick tour to help you get started with finding trusted household professionals.",
    placement: "bottom",
  },
  {
    target: '[data-tour="navigation"]',
    title: "Easy Navigation",
    content:
      "Use the main navigation to explore different sections. Find professionals, learn how it works, check pricing, and access your account.",
    placement: "bottom",
  },
  {
    target: '[data-tour="search"]',
    title: "Find the Perfect Match",
    content:
      "Start by browsing professionals or use our AI-powered matching to find the best fit for your household needs.",
    placement: "right",
  },
  {
    target: '[data-tour="help"]',
    title: "Need Help?",
    content:
      "Access our Help Center anytime for guides, FAQs, and support. We're here to make your experience seamless.",
    placement: "left",
  },
];

interface WelcomeTourProps {
  autoStart?: boolean;
  onComplete?: () => void;
}

export function WelcomeTour({ autoStart = false, onComplete }: WelcomeTourProps) {
  const tour = useOnboardingTour({
    tourId: "welcome",
    steps,
    onComplete: () => {
      onComplete?.();
    },
  });

  // Auto-start tour on first visit
  useEffect(() => {
    if (autoStart && tour.shouldShowTour) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        tour.start();
      }, 1000);
    }
  }, [autoStart]);

  if (!(tour.state.isActive && tour.currentStep)) {
    return null;
  }

  return (
    <TourTooltip
      currentStepIndex={tour.currentStepIndex}
      onClose={tour.close}
      onNext={tour.next}
      onPrevious={tour.previous}
      onSkip={tour.skip}
      progress={tour.progress}
      step={tour.currentStep}
      totalSteps={tour.totalSteps}
    />
  );
}
