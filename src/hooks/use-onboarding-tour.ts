"use client";

import { useCallback, useEffect, useState } from "react";

export type TourStep = {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  action?: "next" | "complete" | "skip";
};

export type TourState = {
  isActive: boolean;
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
};

type UseOnboardingTourProps = {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
};

export function useOnboardingTour({ tourId, steps, onComplete, onSkip }: UseOnboardingTourProps) {
  const storageKey = `tour_${tourId}`;

  // Initialize state from localStorage
  const [state, setState] = useState<TourState>(() => {
    if (typeof window === "undefined") {
      return {
        isActive: false,
        currentStep: 0,
        isCompleted: false,
        isSkipped: false,
      };
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading tour state:", error);
    }

    return {
      isActive: false,
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  // Start tour
  const start = useCallback(() => {
    setState({
      isActive: true,
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
    });
  }, []);

  // Go to next step
  const next = useCallback(() => {
    setState((prev) => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= steps.length) {
        onComplete?.();
        return {
          ...prev,
          isActive: false,
          isCompleted: true,
        };
      }
      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  }, [steps.length, onComplete]);

  // Go to previous step
  const previous = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Skip tour
  const skip = useCallback(() => {
    setState({
      isActive: false,
      currentStep: 0,
      isCompleted: false,
      isSkipped: true,
    });
    onSkip?.();
  }, [onSkip]);

  // Close tour
  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // Reset tour (for testing or replay)
  const reset = useCallback(() => {
    setState({
      isActive: false,
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Check if user should see tour (not completed or skipped)
  const shouldShowTour = !(state.isCompleted || state.isSkipped);

  const currentStepData = steps[state.currentStep];
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  return {
    state,
    currentStep: currentStepData,
    currentStepIndex: state.currentStep,
    totalSteps: steps.length,
    progress,
    shouldShowTour,
    start,
    next,
    previous,
    skip,
    close,
    reset,
  };
}
