"use client";

import { useEffect } from "react";
import { TourStep, useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { TourTooltip } from "./tour-tooltip";

const steps: TourStep[] = [
  {
    target: '[data-tour="customer-dashboard"]',
    title: "Your Dashboard",
    content:
      "This is your command center. View upcoming bookings, track service history, and manage your household needs all in one place.",
    placement: "right",
  },
  {
    target: '[data-tour="find-professional"]',
    title: "Find a Professional",
    content:
      "Browse verified professionals or use our AI Match Wizard to find the perfect fit based on your specific needs, schedule, and preferences.",
    placement: "bottom",
  },
  {
    target: '[data-tour="book-service"]',
    title: "Book with Confidence",
    content:
      "Select available times, choose between instant booking or request approval, and secure payment through our escrow system for your protection.",
    placement: "left",
  },
  {
    target: '[data-tour="track-booking"]',
    title: "Track Your Bookings",
    content:
      "Get real-time updates on booking status, receive check-in/check-out notifications, and communicate securely with your professional.",
    placement: "top",
  },
  {
    target: '[data-tour="messages"]',
    title: "Stay Connected",
    content:
      "Send and receive messages, share photos, coordinate schedules, and provide feedback—all through our secure messaging system.",
    placement: "bottom",
  },
];

type CustomerTourProps = {
  autoStart?: boolean;
  onComplete?: () => void;
};

export function CustomerTour({ autoStart = false, onComplete }: CustomerTourProps) {
  const tour = useOnboardingTour({
    tourId: "customer",
    steps,
    onComplete: () => {
      onComplete?.();
    },
  });

  // Auto-start tour on first visit to dashboard
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
