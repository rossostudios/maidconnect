/**
 * Motion Provider
 *
 * Wraps the application with Framer Motion's MotionConfig.
 * Automatically respects user's motion preferences and provides
 * consistent animation timing across all components.
 *
 * @see https://motion.dev/docs/react-motion-config
 * @see https://motion.dev/docs/react-accessibility
 */

"use client";

import type { Transition } from "framer-motion";
import { MotionConfig } from "framer-motion";

type MotionProviderProps = {
  children: React.ReactNode;
  /**
   * Override default transition
   * @default { type: "spring", stiffness: 240, damping: 28 }
   */
  transition?: Transition;
};

/**
 * Default transition used across the app
 * Natural spring physics for smooth, responsive animations
 */
const defaultTransition: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 0.8,
};

/**
 * MotionProvider - Global motion configuration
 *
 * Features:
 * - Respects prefers-reduced-motion automatically
 * - Consistent spring transitions
 * - Zero config required in child components
 *
 * @example
 * ```tsx
 * // In root layout
 * <MotionProvider>
 *   <YourApp />
 * </MotionProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Custom transition
 * <MotionProvider transition={{ duration: 0.3 }}>
 *   <YourApp />
 * </MotionProvider>
 * ```
 */
export function MotionProvider({ children, transition = defaultTransition }: MotionProviderProps) {
  return (
    <MotionConfig
      /**
       * "user" = respect system preference
       * "always" = force reduced motion
       * "never" = disable reduced motion
       */
      reducedMotion="user"
      transition={transition}
    >
      {children}
    </MotionConfig>
  );
}
