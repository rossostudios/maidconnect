/**
 * Casaora Design System - Lia
 *
 * Modular grid system configuration with structured layout principles.
 * Built on an 8px base unit with 24px baseline grid for typography.
 *
 * Core Principles:
 * - Mathematical precision (all values are multiples of 8px)
 * - Baseline grid alignment (24px vertical rhythm)
 * - Modular structure (64px modules for layout)
 * - Asymmetric balance within rigid grid
 * - Warm neutral palette with vibrant orange accents
 */

/**
 * Color Palette
 *
 * Casaora uses a warm neutral palette inspired by premium hospitality brands,
 * combined with vibrant orange accents for CTAs and interactive elements.
 *
 * All colors follow the 50-950 scale for consistency with Tailwind CSS.
 */
export const COLORS = {
  /** Neutral Palette - Warm Cream/Beige tones */
  neutral: {
    50: "rgb(255 253 252)", // Off-white cream background
    100: "rgb(250 248 246)", // Lightest cream
    200: "rgb(235 234 233)", // Borders, subtle dividers
    300: "rgb(220 218 215)", // Light gray-cream
    400: "rgb(190 187 183)", // Medium-light
    500: "rgb(184 182 179)", // Mid-tone
    600: "rgb(140 137 133)", // Secondary text
    700: "rgb(100 97 93)", // Body text
    800: "rgb(60 57 53)", // Darker text
    900: "rgb(24 24 24)", // Headings, primary text
    950: "rgb(12 10 9)", // Deepest black
  },

  /** Orange Palette - Energy & Action */
  orange: {
    50: "rgb(255 247 240)", // Lightest orange tint
    100: "rgb(255 235 220)", // Very light orange
    200: "rgb(255 215 185)", // Light orange
    300: "rgb(255 185 140)", // Medium-light orange
    400: "rgb(255 135 70)", // Medium orange, highlights
    500: "rgb(255 82 0)", // #FF5200 - Primary CTA
    600: "rgb(230 74 0)", // #E64A00 - Hover, links (WCAG AA)
    700: "rgb(200 64 0)", // Active state, dark accents
    800: "rgb(170 54 0)", // Pressed state
    900: "rgb(140 44 0)", // Darkest orange
  },
} as const;

/**
 * Semantic Color Mapping
 *
 * Use these semantic names in components for consistency and easier theming.
 * These map directly to shadcn UI variables defined in globals.css.
 */
export const SEMANTIC_COLORS = {
  // Backgrounds
  background: COLORS.neutral[50], // Main page background
  card: "rgb(255 255 255)", // Card surfaces
  muted: COLORS.neutral[100], // Muted backgrounds

  // Text
  foreground: COLORS.neutral[900], // Primary text (headings)
  secondaryText: COLORS.neutral[700], // Body text
  mutedText: COLORS.neutral[600], // Secondary/muted text

  // Interactive
  primary: COLORS.orange[500], // Primary CTA buttons
  primaryHover: COLORS.orange[600], // Primary button hover
  primaryActive: COLORS.orange[700], // Primary button active
  link: COLORS.orange[600], // Links (WCAG AA)
  linkHover: COLORS.orange[700], // Link hover

  // UI Elements
  border: COLORS.neutral[200], // Borders, dividers
  input: COLORS.neutral[200], // Input borders
  ring: COLORS.orange[500], // Focus rings

  // Feedback
  destructive: COLORS.orange[700], // Destructive actions
  accent: COLORS.orange[500], // Accent highlights
} as const;

/**
 * Lia Grid System Constants
 */
export const LIA_GRID = {
  /** Base unit: 8px - Foundation of entire system */
  baseUnit: 8,

  /** Baseline: 24px (3 × 8px) - Typography vertical rhythm */
  baseline: 24,

  /** Module: 64px (8 × 8px) - Layout vertical rhythm unit */
  module: 64,

  /** Gutter: 24px (3 × 8px) - Standard grid gap */
  gutter: 24,
} as const;

/**
 * Grid Column Configurations
 *
 * Lia Grid supports multiple column layouts for different use cases:
 * 1. 12-column: Versatile, standard grid
 * 2. 10-column: Asymmetric balance, unique layouts
 * 3. 13-column: Dynamic tension, experimental
 */
export const GRID_COLUMNS = {
  /** 6-column: Mobile-first, simple layouts */
  6: {
    columns: 6,
    gap: 16,
    margin: 24,
    description: "Mobile-first grid with tight spacing",
  },

  /** 10-column: Asymmetric balance */
  10: {
    columns: 10,
    gap: 24,
    margin: 42,
    description: "Asymmetric grid with wider margins for unique layouts",
  },

  /** 12-column: Standard, versatile */
  12: {
    columns: 12,
    gap: 24,
    margin: 24,
    description: "Standard 12-column grid, most versatile",
  },

  /** 13-column: Dynamic tension */
  13: {
    columns: 13,
    gap: 16,
    margin: 32,
    description: "Experimental grid with dynamic, imbalanced feel",
  },
} as const;

/**
 * Spacing Scale (8px Grid System)
 *
 * All spacing follows 8px increments for visual harmony.
 * Use these constants instead of arbitrary pixel values.
 */
export const SPACING = {
  /** 0px - No spacing */
  0: 0,
  /** 4px (0.5 × 8px) - Micro adjustments */
  1: 4,
  /** 8px (1 × 8px) - Base unit */
  2: 8,
  /** 12px (1.5 × 8px) - Tight spacing */
  3: 12,
  /** 16px (2 × 8px) - Standard spacing */
  4: 16,
  /** 20px (2.5 × 8px) - Medium-tight */
  5: 20,
  /** 24px (3 × 8px) - Medium spacing, baseline */
  6: 24,
  /** 32px (4 × 8px) - Large spacing */
  8: 32,
  /** 40px (5 × 8px) - Extra large */
  10: 40,
  /** 48px (6 × 8px) - Section spacing */
  12: 48,
  /** 56px (7 × 8px) - Major sections */
  14: 56,
  /** 64px (8 × 8px) - Module height, hero spacing */
  16: 64,
  /** 80px (10 × 8px) - Maximum spacing */
  20: 80,
  /** 96px (12 × 8px) - Ultra spacing */
  24: 96,
} as const;

/**
 * Module Heights
 *
 * Pre-calculated module multiples for component heights.
 * Ensures components fit perfectly in the modular grid.
 */
export const MODULE_HEIGHTS = {
  /** 1 module = 64px */
  1: 64,
  /** 2 modules = 128px */
  2: 128,
  /** 3 modules = 192px */
  3: 192,
  /** 4 modules = 256px */
  4: 256,
  /** 5 modules = 320px */
  5: 320,
  /** 6 modules = 384px */
  6: 384,
  /** 8 modules = 512px */
  8: 512,
  /** 10 modules = 640px */
  10: 640,
} as const;

/**
 * Baseline Spacing
 *
 * Vertical spacing multiples of the 24px baseline.
 * Use for margins and padding to maintain vertical rhythm.
 */
export const BASELINE_SPACING = {
  /** 1 × baseline = 24px */
  1: 24,
  /** 2 × baseline = 48px */
  2: 48,
  /** 3 × baseline = 72px */
  3: 72,
  /** 4 × baseline = 96px */
  4: 96,
  /** 6 × baseline = 144px */
  6: 144,
  /** 8 × baseline = 192px */
  8: 192,
} as const;

/**
 * Typography Scale (Baseline-Aligned)
 *
 * All font sizes with their corresponding baseline-aligned line heights.
 * Line heights are always multiples of 24px for perfect vertical rhythm.
 */
export const TYPOGRAPHY = {
  display: {
    xl: { fontSize: 72, lineHeight: 72 }, // 3 × baseline
    lg: { fontSize: 60, lineHeight: 72 }, // 3 × baseline
    md: { fontSize: 48, lineHeight: 48 }, // 2 × baseline
    sm: { fontSize: 40, lineHeight: 48 }, // 2 × baseline
  },
  heading: {
    h1: { fontSize: 48, lineHeight: 48 }, // 2 × baseline
    h2: { fontSize: 36, lineHeight: 48 }, // 2 × baseline
    h3: { fontSize: 28, lineHeight: 48 }, // 2 × baseline
    h4: { fontSize: 24, lineHeight: 24 }, // 1 × baseline
    h5: { fontSize: 20, lineHeight: 24 }, // 1 × baseline
    h6: { fontSize: 18, lineHeight: 24 }, // 1 × baseline
  },
  body: {
    xl: { fontSize: 20, lineHeight: 24 }, // 1 × baseline
    lg: { fontSize: 18, lineHeight: 24 }, // 1 × baseline
    base: { fontSize: 16, lineHeight: 24 }, // 1 × baseline
    sm: { fontSize: 14, lineHeight: 24 }, // 1 × baseline
    xs: { fontSize: 12, lineHeight: 24 }, // 1 × baseline
  },
} as const;

/**
 * Container Sizes
 *
 * Max-width values for centered containers.
 * All values follow 8px grid system.
 */
export const CONTAINER = {
  /** Small container: 640px */
  sm: 640,
  /** Medium container: 768px */
  md: 768,
  /** Large container: 1024px */
  lg: 1024,
  /** Extra large container: 1280px */
  xl: 1280,
  /** Max container: 1320px (current Casaora standard) */
  max: 1320,
} as const;

/**
 * Breakpoints (Responsive Design)
 *
 * Mobile-first breakpoints for responsive layouts.
 * Aligned with Tailwind CSS defaults.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Helper: Get grid configuration as CSS Grid template
 *
 * @param columns - Number of columns (6, 10, 12, or 13)
 * @returns CSS Grid configuration object
 */
export function getGridConfig(columns: 6 | 10 | 12 | 13) {
  const config = GRID_COLUMNS[columns];
  return {
    gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
    gap: `${config.gap}px`,
    paddingLeft: `${config.margin}px`,
    paddingRight: `${config.margin}px`,
  };
}

/**
 * Helper: Format typography as CSS properties
 *
 * @param scale - Typography scale key (e.g., 'heading.h1', 'body.base')
 * @returns CSS properties object
 */
export function getTypographyStyles<
  C extends keyof typeof TYPOGRAPHY,
  S extends keyof (typeof TYPOGRAPHY)[C],
>(category: C, size: S): { fontSize: string; lineHeight: string } {
  const typo = TYPOGRAPHY[category][size] as { fontSize: number; lineHeight: number };
  return {
    fontSize: `${typo.fontSize}px`,
    lineHeight: `${typo.lineHeight}px`,
  };
}
