"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseAutoPlayReturn } from "../types";

type UseAutoPlayOptions = {
  /** Total number of steps to cycle through */
  totalSteps: number;
  /** Interval between steps in milliseconds */
  interval?: number;
  /** Whether auto-play is enabled */
  enabled?: boolean;
  /** Start from this step */
  initialStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
};

/**
 * Hook for auto-advancing through steps
 * Provides pause/resume controls and manual step selection
 */
export function useAutoPlay({
  totalSteps,
  interval = 3000,
  enabled = true,
  initialStep = 0,
  onStepChange,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    []
  );

  // Setup auto-advance
  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % totalSteps;
        onStepChange?.(nextStep);
        return nextStep;
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [totalSteps, interval, enabled, isPaused, onStepChange]);

  const setStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  return {
    currentStep,
    setStep,
    pause,
    resume,
    isPaused,
  };
}
