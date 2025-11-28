"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight auto-play hook for carousel/stepper components
 * Replaces Framer Motion's animation-coupled auto-play pattern
 *
 * Key features:
 * - Built-in prefers-reduced-motion detection via matchMedia
 * - Uses setInterval (not RAF) for predictable timing
 * - Pause/resume on hover/focus
 * - Zero external dependencies
 *
 * Bundle savings: ~45KB (no Framer Motion core)
 */

interface UseAutoPlayLiteOptions {
  /** Total number of steps/slides */
  totalSteps: number;
  /** Interval between steps in ms (default: 3000) */
  interval?: number;
  /** Enable auto-play (default: true) */
  enabled?: boolean;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
}

interface UseAutoPlayLiteReturn {
  /** Current step index (0-based) */
  currentStep: number;
  /** Manually set the current step */
  setStep: (step: number) => void;
  /** Pause auto-play */
  pause: () => void;
  /** Resume auto-play */
  resume: () => void;
  /** Whether auto-play is currently paused */
  isPaused: boolean;
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
}

/**
 * Detects user's reduced motion preference
 * Returns true if user prefers reduced motion
 */
function useReducedMotionDetection(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener for modern browsers
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export function useAutoPlayLite({
  totalSteps,
  interval = 3000,
  enabled = true,
  onStepChange,
}: UseAutoPlayLiteOptions): UseAutoPlayLiteReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotionDetection();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear interval helper
  const clearAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start interval helper
  const startAutoPlay = useCallback(() => {
    clearAutoPlay();

    // Don't auto-play if disabled, paused, or user prefers reduced motion
    if (!enabled || isPaused || prefersReducedMotion) return;

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % totalSteps;
        onStepChange?.(nextStep);
        return nextStep;
      });
    }, interval);
  }, [enabled, isPaused, prefersReducedMotion, interval, totalSteps, onStepChange, clearAutoPlay]);

  // Manual step setter
  const setStep = useCallback(
    (step: number) => {
      const validStep = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(validStep);
      onStepChange?.(validStep);

      // Reset interval when manually setting step
      if (enabled && !isPaused && !prefersReducedMotion) {
        startAutoPlay();
      }
    },
    [totalSteps, enabled, isPaused, prefersReducedMotion, onStepChange, startAutoPlay]
  );

  // Pause handler
  const pause = useCallback(() => {
    setIsPaused(true);
    clearAutoPlay();
  }, [clearAutoPlay]);

  // Resume handler
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Effect to manage auto-play lifecycle
  useEffect(() => {
    if (!isPaused && enabled && !prefersReducedMotion) {
      startAutoPlay();
    }
    return clearAutoPlay;
  }, [isPaused, enabled, prefersReducedMotion, startAutoPlay, clearAutoPlay]);

  return {
    currentStep,
    setStep,
    pause,
    resume,
    isPaused,
    prefersReducedMotion,
  };
}
