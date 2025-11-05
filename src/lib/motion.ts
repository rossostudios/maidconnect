/**
 * Framer Motion Animation Utilities
 *
 * Consistent, accessible animation patterns for Casaora/MaidConnect.
 * All animations respect user's motion preferences via MotionConfig.
 *
 * @see https://motion.dev/docs/react-accessibility
 */

import type { Transition, Variants } from "framer-motion";

/* ============================================
   ANIMATION TIMING
   ============================================ */

/**
 * Spring transition - natural, physics-based motion
 * Use for interactive elements (buttons, cards, modals)
 */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 0.8,
};

/**
 * Smooth transition - controlled easing
 * Use for page transitions and subtle effects
 */
export const smoothTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // cubic-bezier
};

/**
 * Fast transition - quick feedback
 * Use for micro-interactions (hover, focus states)
 */
export const fastTransition: Transition = {
  type: "tween",
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

/* ============================================
   FADE ANIMATIONS
   ============================================ */

/**
 * Fade in with slight upward movement
 * Perfect for revealing content sections
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(2px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

/**
 * Fade in with slight downward movement
 * Good for dropdown menus, notifications
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
    filter: "blur(2px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

/**
 * Simple fade in (no movement)
 * Use for overlays, modals, tooltips
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: smoothTransition,
  },
};

/* ============================================
   SCALE ANIMATIONS
   ============================================ */

/**
 * Scale in with fade
 * Great for cards, images, featured content
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

/**
 * Bounce in effect
 * Use sparingly for special emphasis
 */
export const bounceIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

/* ============================================
   STAGGER ANIMATIONS
   ============================================ */

/**
 * Container for staggered children
 * Use on parent <ul>, <div>, etc.
 *
 * @example
 * <motion.ul variants={stagger}>
 *   <motion.li variants={fadeInUp}>Item 1</motion.li>
 *   <motion.li variants={fadeInUp}>Item 2</motion.li>
 * </motion.ul>
 */
export const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/**
 * Fast stagger for tight lists
 */
export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

/**
 * Slow stagger for hero sections
 */
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* ============================================
   LIST ANIMATIONS
   ============================================ */

/**
 * List container animation
 * Use with listItem for smooth list reveals
 */
export const listAnimation: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/**
 * List item animation
 * Pairs with listAnimation
 */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

/* ============================================
   SLIDE ANIMATIONS
   ============================================ */

/**
 * Slide in from right (for panels, sidebars)
 */
export const slideInRight: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  show: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: smoothTransition,
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  show: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: smoothTransition,
  },
};

/* ============================================
   VIEWPORT REVEAL
   ============================================ */

/**
 * Standard viewport configuration
 * Reveals element when 25% visible, only once
 */
export const viewportOnce = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -50px 0px",
} as const;

/**
 * Eager viewport reveal (triggers earlier)
 */
export const viewportEager = {
  once: true,
  amount: 0.1,
  margin: "0px 0px -100px 0px",
} as const;

/**
 * Lazy viewport reveal (triggers later)
 */
export const viewportLazy = {
  once: true,
  amount: 0.5,
  margin: "0px",
} as const;

/* ============================================
   INTERACTION ANIMATIONS
   ============================================ */

/**
 * Hover lift effect
 * For cards, buttons, interactive elements
 */
export const hoverLift = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: fastTransition,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * Button press effect
 */
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: fastTransition,
};

/**
 * Card hover effect
 */
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    transition: fastTransition,
  },
};

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Create a custom stagger configuration
 *
 * @param delayBetweenChildren - Delay between each child (seconds)
 * @param initialDelay - Initial delay before first child (seconds)
 */
export function createStagger(delayBetweenChildren = 0.06, initialDelay = 0.05): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delayBetweenChildren,
        delayChildren: initialDelay,
      },
    },
  };
}

/**
 * Create a custom fade-in variant
 *
 * @param direction - Direction of movement ("up" | "down" | "left" | "right" | null)
 * @param distance - Distance to move (pixels)
 */
export function createFadeIn(
  direction: "up" | "down" | "left" | "right" | null = null,
  distance = 12
): Variants {
  const getOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return {};
    }
  };

  return {
    hidden: {
      opacity: 0,
      filter: "blur(2px)",
      ...getOffset(),
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
      transition: springTransition,
    },
  };
}
