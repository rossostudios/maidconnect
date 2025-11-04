"use client";

import { useEffect } from "react";
import { TourStep, useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { TourTooltip } from "./tour-tooltip";

const steps: TourStep[] = [
  {
    target: '[data-tour="professional-dashboard"]',
    title: "Welcome to Your Professional Dashboard!",
    content:
      "Manage your profile, bookings, earnings, and schedule all from one powerful dashboard. Let's show you around.",
    placement: "right",
  },
  {
    target: '[data-tour="profile"]',
    title: "Build Your Profile",
    content:
      "Complete your profile with photos, services offered, rates, and certifications. A strong profile attracts more clients!",
    placement: "bottom",
  },
  {
    target: '[data-tour="availability"]',
    title: "Set Your Availability",
    content:
      "Define your working hours, block off personal time, and set recurring schedules. Clients can only book when you're available.",
    placement: "left",
  },
  {
    target: '[data-tour="bookings"]',
    title: "Manage Bookings",
    content:
      "Accept or decline booking requests, view upcoming appointments, and track your service history. Stay organized effortlessly.",
    placement: "top",
  },
  {
    target: '[data-tour="check-in-out"]',
    title: "Check-In & Check-Out",
    content:
      "Use the check-in feature when you arrive and check-out when you complete the job. This triggers payment release and builds trust.",
    placement: "bottom",
  },
  {
    target: '[data-tour="earnings"]',
    title: "Track Your Earnings",
    content:
      "Monitor your income, view payout history, and manage payment methods. Get paid securely through our platform.",
    placement: "left",
  },
];

type ProfessionalTourProps = {
  autoStart?: boolean;
  onComplete?: () => void;
};

export function ProfessionalTour({ autoStart = false, onComplete }: ProfessionalTourProps) {
  const tour = useOnboardingTour({
    tourId: "professional",
    steps,
    onComplete: () => {
      onComplete?.();
    },
  });

  // Auto-start tour on first visit to professional dashboard
  useEffect(() => {
    if (autoStart && tour.shouldShowTour) {
      setTimeout(() => {
        tour.start();
      }, 1000);
    }
  }, [autoStart, tour.shouldShowTour, tour.start]);

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
