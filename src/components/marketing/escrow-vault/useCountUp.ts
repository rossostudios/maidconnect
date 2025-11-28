"use client";

import { useEffect, useRef, useState } from "react";

type UseCountUpOptions = {
  /** Target value to count up to */
  target: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before starting the animation in milliseconds */
  delay?: number;
  /** Whether to disable the animation */
  disabled?: boolean;
  /** Easing function */
  easing?: (t: number) => number;
};

/**
 * Hook for animated count-up effect
 * Uses requestAnimationFrame for smooth 60fps animation
 */
export function useCountUp({
  target,
  duration = 2000,
  delay = 0,
  disabled = false,
  easing = easeOutExpo,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(disabled ? target : 0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }

    // Reset on target change
    setValue(0);
    startTimeRef.current = null;

    const startAnimation = () => {
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentValue = Math.round(easedProgress * target);

        setValue(currentValue);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, delay, disabled, easing]);

  return value;
}

/**
 * Easing function: Exponential ease-out
 * Fast start, slow end - feels natural for counting
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

/**
 * Easing function: Cubic ease-out
 * Alternative smoother easing
 */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Easing function: Quartic ease-out
 * Even smoother easing
 */
export function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4;
}
