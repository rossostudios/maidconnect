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
 * - Deep burgundy wine palette with Rausch burgundy and Babu teal accents
 */

/**
 * Color Palette
 *
 * Casaora uses a sophisticated palette with cool neutrals,
 * deep Burgundy wine for primary CTAs, and Babu teal for secondary accents.
 *
 * All colors follow the 50-950 scale for consistency with Tailwind CSS.
 */
export const COLORS = {
  /** Neutral Palette - Airbnb Cool Grays */
  neutral: {
    50: "rgb(247 247 247)", // #F7F7F7 - Page background (Airbnb)
    100: "rgb(235 235 235)", // #EBEBEB - Lightest gray
    200: "rgb(221 221 221)", // #DDDDDD - Borders, dividers (Airbnb)
    300: "rgb(194 194 194)", // #C2C2C2 - Light gray
    400: "rgb(168 168 168)", // #A8A8A8 - Medium-light
    500: "rgb(118 118 118)", // #767676 - Foggy mid-gray (Airbnb)
    600: "rgb(94 94 94)", // #5E5E5E - Secondary text
    700: "rgb(72 72 72)", // #484848 - Hof body text (Airbnb)
    800: "rgb(51 51 51)", // #333333 - Darker text
    900: "rgb(34 34 34)", // #222222 - Headings (Airbnb)
    950: "rgb(17 17 17)", // #111111 - Deepest black
  },

  /** Rausch Palette - Deep Burgundy Wine (Primary) */
  rausch: {
    50: "rgb(246 237 238)", // #F6EDEE - Lightest burgundy tint
    100: "rgb(228 202 208)", // #E4CAD0 - Very light burgundy
    200: "rgb(199 155 166)", // #C79BA6 - Light burgundy
    300: "rgb(168 115 131)", // #A87383 - Medium-light burgundy
    400: "rgb(143 82 97)", // #8F5261 - Medium burgundy, highlights
    500: "rgb(122 59 74)", // #7A3B4A - Primary CTA (Burgundy)
    600: "rgb(107 51 64)", // #6B3340 - Hover state, links
    700: "rgb(93 43 53)", // #5D2B35 - Active state
    800: "rgb(79 36 44)", // #4F242C - Pressed state
    900: "rgb(66 29 36)", // #421D24 - Darkest burgundy
  },

  /** Babu Palette - Airbnb Teal (Secondary) */
  babu: {
    50: "rgb(230 247 246)", // #E6F7F6 - Lightest teal tint
    100: "rgb(204 240 238)", // #CCF0EE - Very light teal
    200: "rgb(153 225 221)", // #99E1DD - Light teal
    300: "rgb(102 210 204)", // #66D2CC - Medium-light teal
    400: "rgb(51 195 187)", // #33C3BB - Medium teal, highlights
    500: "rgb(0 166 153)", // #00A699 - Info/Secondary (Airbnb teal)
    600: "rgb(0 143 132)", // #008F84 - Hover state
    700: "rgb(0 120 112)", // #007870 - Active state
    800: "rgb(0 97 91)", // #00615B - Pressed state
    900: "rgb(0 74 71)", // #004A47 - Darkest teal
  },

  /** Green Palette - Success (unchanged) */
  green: {
    500: "rgb(120 140 93)", // #788C5D - Success (Anthropic green)
    600: "rgb(104 124 77)", // #687C4D - Success hover
  },

  /** Legacy aliases (for migration compatibility) */
  orange: {
    50: "rgb(246 237 238)", // Maps to rausch-50
    100: "rgb(228 202 208)", // Maps to rausch-100
    200: "rgb(199 155 166)", // Maps to rausch-200
    300: "rgb(168 115 131)", // Maps to rausch-300
    400: "rgb(143 82 97)", // Maps to rausch-400
    500: "rgb(122 59 74)", // Maps to rausch-500
    600: "rgb(107 51 64)", // Maps to rausch-600
    700: "rgb(93 43 53)", // Maps to rausch-700
    800: "rgb(79 36 44)", // Maps to rausch-800
    900: "rgb(66 29 36)", // Maps to rausch-900
  },
} as const;

/**
 * Semantic Color Mapping
 *
 * Use these semantic names in components for consistency and easier theming.
 * These map directly to shadcn UI variables defined in globals.css.
 *
 * Burgundy palette: Rausch deep wine for primary, Babu teal for secondary.
 */
export const SEMANTIC_COLORS = {
  // Backgrounds
  background: COLORS.neutral[50], // Main page background (#F7F7F7)
  card: "rgb(255 255 255)", // Card surfaces
  muted: COLORS.neutral[100], // Muted backgrounds

  // Text
  foreground: COLORS.neutral[900], // Primary text/headings (#222222)
  secondaryText: COLORS.neutral[700], // Body text (#484848 Hof)
  mutedText: COLORS.neutral[500], // Secondary/muted text (#767676 Foggy)

  // Interactive - Rausch burgundy wine (Primary)
  primary: COLORS.rausch[500], // Primary CTA buttons (#7A3B4A)
  primaryHover: COLORS.rausch[600], // Primary button hover (#6B3340)
  primaryActive: COLORS.rausch[700], // Primary button active (#5D2B35)
  link: COLORS.rausch[600], // Links (WCAG AA) (#6B3340)
  linkHover: COLORS.rausch[700], // Link hover (#5D2B35)

  // Secondary - Babu teal (Airbnb secondary)
  secondary: COLORS.babu[500], // Info/secondary actions (#00A699)
  secondaryHover: COLORS.babu[600], // Secondary hover (#008F84)

  // UI Elements
  border: COLORS.neutral[200], // Borders, dividers (#DDDDDD)
  input: COLORS.neutral[200], // Input borders (#DDDDDD)
  ring: COLORS.rausch[500], // Focus rings (#7A3B4A)

  // Feedback
  destructive: COLORS.rausch[700], // Destructive actions (#5D2B35)
  accent: COLORS.rausch[500], // Accent highlights (#7A3B4A)
  info: COLORS.babu[500], // Info states (#00A699)
  success: COLORS.green[500], // Success states (#788C5D)
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
