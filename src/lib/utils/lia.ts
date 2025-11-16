/**
 * Lia Design System Utilities
 *
 * Consolidated utilities for Casaora's Lia design system.
 * Exports spacing, typography, and grid helpers for consistent implementation.
 *
 * Usage:
 * ```tsx
 * import { spacing, baseline, typography, cn } from '@/lib/utils/precision';
 *
 * // Use spacing constants
 * <div style={{ marginBottom: spacing.baseline(2) }}>
 *
 * // Use typography helpers
 * const headingStyle = typography.heading('h1');
 * <h1 className={cn(headingStyle.className)}>
 *
 * // Use baseline utilities
 * <div className="mb-baseline-2 py-baseline-1">
 * ```
 */

import {
  BASELINE_SPACING,
  MODULE_HEIGHTS,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/shared/config/design-system";
import {
  BASELINE,
  formatTypographyClass,
  getBaselineTypography,
  getModuleHeight,
  isBaselineAligned,
  isModuleAligned,
  MODULE,
  TYPOGRAPHY_SCALE,
} from "@/lib/utils/typography";

/**
 * Spacing Utilities
 *
 * Helpers for consistent 8px grid-based spacing.
 */
export const spacing = {
  /** Get spacing value from grid scale (e.g., spacing.grid(4) = 16px) */
  grid: (multiplier: keyof typeof SPACING): number => SPACING[multiplier],

  /** Get baseline spacing (multiples of 24px) */
  baseline: (multiplier: keyof typeof BASELINE_SPACING): number => BASELINE_SPACING[multiplier],

  /** Get module height (multiples of 64px) */
  module: (multiplier: keyof typeof MODULE_HEIGHTS): number => MODULE_HEIGHTS[multiplier],

  /** Base unit: 8px */
  base: 8,

  /** Baseline: 24px */
  baselineUnit: BASELINE,

  /** Module: 64px */
  moduleUnit: MODULE,
} as const;

/**
 * Baseline Utilities
 *
 * Tailwind class names for baseline-aligned spacing.
 * All values are multiples of 24px for vertical rhythm.
 */
export const baseline = {
  /** Margin bottom utilities */
  mb: {
    1: "mb-baseline-1", // 24px
    2: "mb-baseline-2", // 48px
    3: "mb-baseline-3", // 72px
    4: "mb-baseline-4", // 96px
  },

  /** Margin top utilities */
  mt: {
    1: "mt-baseline-1",
    2: "mt-baseline-2",
    3: "mt-baseline-3",
    4: "mt-baseline-4",
  },

  /** Vertical padding utilities */
  py: {
    1: "py-baseline-1",
    2: "py-baseline-2",
    3: "py-baseline-3",
    4: "py-baseline-4",
  },
} as const;

/**
 * Module Utilities
 *
 * Tailwind class names for module-based heights.
 * All values are multiples of 64px for modular design.
 */
export const module = {
  /** Height utilities */
  h: {
    1: "h-module-1", // 64px
    2: "h-module-2", // 128px
    3: "h-module-3", // 192px
    4: "h-module-4", // 256px
    5: "h-module-5", // 320px
    6: "h-module-6", // 384px
  },

  /** Minimum height utilities */
  minH: {
    1: "min-h-module-1",
    2: "min-h-module-2",
    3: "min-h-module-3",
    4: "min-h-module-4",
  },
} as const;

/**
 * Typography Utilities
 *
 * Helpers for baseline-aligned typography with proper font sizes and line heights.
 */
export const typography = {
  /**
   * Get display typography styles
   * @param size - Display size (xl, lg, md, sm)
   * @returns Typography object with fontSize, lineHeight, and className
   */
  display: (size: keyof typeof TYPOGRAPHY.display) => {
    const typo = TYPOGRAPHY_SCALE.display[size];
    return {
      ...typo,
      className: formatTypographyClass(typo),
    };
  },

  /**
   * Get heading typography styles
   * @param size - Heading size (h1, h2, h3, h4, h5, h6)
   * @returns Typography object with fontSize, lineHeight, and className
   */
  heading: (size: keyof typeof TYPOGRAPHY.heading) => {
    const typo = TYPOGRAPHY_SCALE.heading[size];
    return {
      ...typo,
      className: formatTypographyClass(typo),
    };
  },

  /**
   * Get body typography styles
   * @param size - Body size (xl, lg, base, sm, xs)
   * @returns Typography object with fontSize, lineHeight, and className
   */
  body: (size: keyof typeof TYPOGRAPHY.body) => {
    const typo = TYPOGRAPHY_SCALE.body[size];
    return {
      ...typo,
      className: formatTypographyClass(typo),
    };
  },

  /**
   * Generate custom baseline-aligned typography
   * @param fontSize - Font size in pixels
   * @returns Typography object with fontSize, lineHeight, and className
   */
  custom: (fontSize: number) => {
    const typo = getBaselineTypography(fontSize);
    return {
      ...typo,
      className: formatTypographyClass(typo),
    };
  },
} as const;

/**
 * Grid Utilities
 *
 * Lia Grid System column configurations.
 */
export const grid = {
  /** 10-column grid (asymmetric balance) */
  cols10: "grid-cols-10",

  /** 13-column grid (dynamic tension) */
  cols13: "grid-cols-13",
} as const;

/**
 * Validation Utilities
 *
 * Check if values align to baseline/module grids.
 */
export const validate = {
  /** Check if height aligns to 24px baseline */
  isBaseline: (heightPx: number) => isBaselineAligned(heightPx),

  /** Check if height aligns to 64px module */
  isModule: (heightPx: number) => isModuleAligned(heightPx),

  /** Get module count for a height */
  getModules: (heightPx: number) => Math.ceil(heightPx / MODULE),

  /** Get module height in pixels */
  getModuleHeight: (modules: number) => getModuleHeight(modules),
} as const;

/**
 * Color Utilities
 *
 * Lia palette color classes.
 */
export const colors = {
  /** Background colors */
  bg: {
    default: "bg-neutral-50", // Main page background
    card: "bg-white", // Card surfaces
    muted: "bg-neutral-100", // Muted backgrounds
  },

  /** Text colors */
  text: {
    default: "text-neutral-900", // Headings
    body: "text-neutral-700", // Body text
    muted: "text-neutral-600", // Secondary text
  },

  /** Border colors */
  border: {
    default: "border-neutral-200", // Standard borders
    muted: "border-neutral-100", // Subtle dividers
  },

  /** Interactive colors */
  interactive: {
    primary: "bg-orange-500 text-white", // Primary CTA
    primaryHover: "hover:bg-orange-600", // Primary hover
    link: "text-orange-600 hover:text-orange-700", // Links
  },
} as const;

/**
 * Re-export design system constants
 */
export {
  BASELINE_SPACING,
  COLORS,
  CONTAINER,
  GRID_COLUMNS,
  getGridConfig,
  getTypographyStyles,
  LIA_GRID,
  MODULE_HEIGHTS,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/shared/config/design-system";
/**
 * Re-export core utilities
 */
export { cn } from "@/lib/utils/core";
/**
 * Re-export typography helpers
 */
export {
  formatTypographyClass,
  getBaselineTypography,
  getModuleHeight,
  isBaselineAligned,
  isModuleAligned,
} from "@/lib/utils/typography";
