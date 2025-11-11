"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  /**
   * The target number to count to
   */
  target: number;
  /**
   * Duration of animation in milliseconds
   * @default 2000
   */
  duration?: number;
  /**
   * Optional prefix (e.g., "$", "+")
   */
  prefix?: string;
  /**
   * Optional suffix (e.g., "+", "K", "M")
   */
  suffix?: string;
  /**
   * Number of decimal places to show
   * @default 0
   */
  decimals?: number;
  /**
   * Optional className for styling
   */
  className?: string;
};

/**
 * AnimatedCounter component that counts up from 0 to target when in viewport
 * Uses Intersection Observer for performance
 */
export function AnimatedCounter({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const startValue = 0;
          const endValue = target;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - (1 - progress) ** 3;
            const currentCount = startValue + (endValue - startValue) * easeOut;

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  const formattedCount = count.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn("text-slate-900", className)} ref={ref}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}
