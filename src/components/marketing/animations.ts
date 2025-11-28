/**
 * Marketing Components - Shared Framer Motion Variants
 * Consistent animation patterns following Lia Design System
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================================
// Shared Animation Constants
// ============================================================================

/** Primary ease curve for smooth, natural animations */
export const PRIMARY_EASE = [0.22, 1, 0.36, 1] as const;

/** Spring physics for interactive elements */
export const SPRING_CONFIG = {
  stiffness: 500,
  damping: 35,
  mass: 0.8,
} as const;

/** Softer spring for larger elements */
export const SOFT_SPRING_CONFIG = {
  stiffness: 400,
  damping: 25,
  mass: 1,
} as const;

// ============================================================================
// Escrow Vault Card Animations
// ============================================================================

export const escrowCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: PRIMARY_EASE,
      staggerChildren: 0.15,
    },
  },
  hover: {
    y: -4,
    boxShadow: "0 20px 40px -12px rgba(122, 59, 74, 0.25)",
    transition: {
      type: "spring",
      ...SOFT_SPRING_CONFIG,
    },
  },
};

export const escrowElementVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: PRIMARY_EASE,
    },
  },
};

export const shieldPulseVariants: Variants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 3,
      ease: "easeInOut",
    },
  },
};

export const flowLineVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, ease: PRIMARY_EASE },
      opacity: { duration: 0.3 },
    },
  },
  animate: {
    strokeDashoffset: [0, -20],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
};

// ============================================================================
// Interactive Calendar Animations
// ============================================================================

export const calendarVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: PRIMARY_EASE,
      staggerChildren: 0.015,
    },
  },
};

export const calendarDayVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: PRIMARY_EASE,
    },
  },
};

export const daySelectionVariants: Variants = {
  initial: {
    scale: 1,
    backgroundColor: "transparent",
  },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  tap: {
    scale: 0.95,
  },
  selected: {
    scale: 1,
    transition: {
      type: "spring",
      ...SPRING_CONFIG,
    },
  },
};

export const monthTransitionVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: PRIMARY_EASE,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

// ============================================================================
// Vetting Flow Card Animations
// ============================================================================

export const vettingCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: PRIMARY_EASE,
    },
  },
};

export const stepDotVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: "rgb(87, 83, 78)", // stone-600
  },
  active: {
    scale: 1.3,
    backgroundColor: "rgb(122, 59, 74)", // rausch-500
    transition: {
      type: "spring",
      ...SPRING_CONFIG,
    },
  },
  complete: {
    scale: 1,
    backgroundColor: "rgb(120, 140, 93)", // green-500
    transition: {
      type: "spring",
      ...SPRING_CONFIG,
    },
  },
};

export const stepConnectorVariants: Variants = {
  incomplete: {
    scaleX: 0,
    originX: 0,
  },
  complete: {
    scaleX: 1,
    transition: {
      duration: 0.4,
      ease: PRIMARY_EASE,
    },
  },
};

export const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      ...SOFT_SPRING_CONFIG,
    },
  },
};

export const contentSwapVariants: Variants = {
  enter: {
    opacity: 0,
    x: 20,
  },
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: PRIMARY_EASE,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const profileCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: PRIMARY_EASE,
    },
  },
};

// ============================================================================
// Instant Match Card Animations
// ============================================================================

export const instantMatchCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: PRIMARY_EASE,
      staggerChildren: 0.1,
    },
  },
};

export const matchPhaseVariants: Variants = {
  enter: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: PRIMARY_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

export const profilePulseVariants: Variants = {
  pulse: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 0 rgba(122, 59, 74, 0)",
      "0 0 0 8px rgba(122, 59, 74, 0.2)",
      "0 0 0 0 rgba(122, 59, 74, 0)",
    ],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 0.5,
    },
  },
};

export const matchLineVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.6, ease: PRIMARY_EASE },
      opacity: { duration: 0.2 },
    },
  },
};

export const matchSuccessVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get transition with reduced motion support
 */
export function getTransition(transition: Transition): Transition {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return transition;
}
