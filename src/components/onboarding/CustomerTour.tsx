"use client";

import { useEffect } from "react";
import type { TourStep } from "@/hooks/useOnboarding";
import { useOnboardingTour } from "@/hooks/useOnboarding";

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
    target: '[data-tour="bookings"]',
    title: "Your Bookings",
    content:
      "View and manage all your service bookings in one place. Track statuses, reschedule appointments, and communicate with professionals.",
    placement: "left",
  },
  {
    target: '[data-tour="favorites"]',
    title: "Your Favorites",
    content:
      "Save your preferred professionals for quick rebooking. Never lose track of the great people who help make your life easier.",
    placement: "left",
  },
];

export function CustomerTour() {
  const { start } = useOnboardingTour({
    tourId: "customer",
    steps,
    onComplete: () => {
      localStorage.setItem("customer-tour-completed", "true");
    },
  });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("customer-tour-completed");
    if (!hasSeenTour) {
      setTimeout(() => start(), 1000);
    }
  }, [start]);

  return null;
}
