/**
 * MaidConnect Design Tokens
 *
 * Single source of truth for all design values across the platform.
 * All components should reference these tokens instead of hardcoding values.
 *
 * Last Updated: 2025-11-10
 * Reference: docs/02-design/design-system.md
 */

// ============================================================================
// COLOR PALETTE - STONE ONLY (Simplified Design System)
// ============================================================================

export const colors = {
  /** Stone palette - Complete neutral scale for all design needs */
  stone: {
    50: "#FAFAF9", // Lightest - Page backgrounds
    100: "#F5F5F4", // Very light - Card backgrounds
    200: "#E7E5E4", // Light - Borders, dividers
    300: "#D6D3D1", // Medium light - Hover states
    400: "#A8A29E", // Medium - Muted text, icons
    500: "#78716C", // Medium dark - Secondary text
    600: "#57534E", // Dark - Body text
    700: "#44403C", // Darker - Accents, emphasis
    800: "#292524", // Very dark - Headings
    900: "#1C1917", // Darkest - Primary text
    950: "#0C0A09", // Ultra dark - Maximum contrast
  },

  /** Semantic colors mapped to Stone shades */
  success: {
    DEFAULT: "#57534E", // stone-600
    light: "#F5F5F4", // stone-100
  },
  warning: {
    DEFAULT: "#78716C", // stone-500
    light: "#F5F5F4", // stone-100
  },
  danger: {
    DEFAULT: "#44403C", // stone-700
    light: "#E7E5E4", // stone-200
  },
  info: {
    DEFAULT: "#A8A29E", // stone-400
    light: "#F5F5F4", // stone-100
  },

  /** Background colors */
  background: {
    primary: "#FFFFFF", // White (main background)
    secondary: "#FAFAF9", // stone-50 (card backgrounds)
    muted: "#F5F5F4", // stone-100 (muted sections)
  },

  /** Border colors */
  border: {
    DEFAULT: "#E7E5E4", // stone-200 (default border)
    strong: "#D6D3D1", // stone-300 (stronger borders)
    muted: "#F5F5F4", // stone-100 (subtle borders)
  },

  /** Text colors */
  text: {
    primary: "#1C1917", // stone-900 (headings, primary text)
    secondary: "#78716C", // stone-500 (secondary text, labels)
    muted: "#A8A29E", // stone-400 (muted text)
    inverse: "#FFFFFF", // White text on dark backgrounds
  },
} as const;

// ============================================================================
// SPACING SYSTEM (8px base unit)
// ============================================================================

export const spacing = {
  /** Card padding and spacing */
  card: {
    padding: "p-8", // 32px - Standard card padding
    paddingCompact: "p-6", // 24px - Compact card padding
    gap: "gap-6", // 24px - Internal card spacing
  },

  /** Component spacing */
  component: {
    gap: {
      xs: "gap-2", // 8px - Minimal gaps (icon + text)
      sm: "gap-4", // 16px - Default element spacing
      md: "gap-6", // 24px - Card/component internal spacing
      lg: "gap-8", // 32px - Related component groups
      xl: "gap-12", // 48px - Major element separation
      "2xl": "gap-16", // 64px - Component group spacing
    },
  },

  /** Section spacing (responsive) */
  section: {
    sm: "py-16 sm:py-20 lg:py-24", // Standard sections
    md: "py-20 sm:py-24 lg:py-32", // Feature sections
    lg: "py-24 sm:py-32 lg:py-40", // Hero sections
  },

  /** Icon box padding */
  iconBox: {
    DEFAULT: "p-3", // 12px - Standard icon box
    sm: "p-2", // 8px - Small icon box
    lg: "p-4", // 16px - Large icon box
  },
} as const;

// ============================================================================
// SIZING
// ============================================================================

export const sizing = {
  /** Icon sizes */
  icon: {
    xs: "h-4 w-4", // 16px - Small icons
    sm: "h-5 w-5", // 20px - Medium icons
    md: "h-6 w-6", // 24px - Standard metric card icons
    lg: "h-8 w-8", // 32px - Large icons
    xl: "h-12 w-12", // 48px - Extra large icons
  },

  /** Avatar sizes */
  avatar: {
    sm: "h-8 w-8", // 32px
    md: "h-10 w-10", // 40px
    lg: "h-12 w-12", // 48px
    xl: "h-16 w-16", // 64px
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  sm: "rounded-lg", // 8px - Small radius
  md: "rounded-xl", // 12px - Standard radius (cards, buttons)
  lg: "rounded-2xl", // 16px - Large radius
  xl: "rounded-3xl", // 24px - Extra large radius
  full: "rounded-full", // Pills, avatars
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  /** Heading sizes */
  heading: {
    h1: "text-5xl font-bold", // Page titles
    h2: "text-4xl font-bold", // Section titles
    h3: "text-3xl font-bold", // Subsection titles
    h4: "text-2xl font-semibold", // Card titles
    h5: "text-xl font-semibold", // Component titles
    h6: "text-lg font-semibold", // Small titles
  },

  /** Body text */
  body: {
    xl: "text-xl",
    lg: "text-lg",
    base: "text-base",
    sm: "text-sm",
    xs: "text-xs",
  },

  /** Metric values */
  metric: {
    primary: "text-4xl font-bold", // Main metric display
    secondary: "text-3xl font-bold", // Secondary metrics
    small: "text-2xl font-bold", // Compact metrics
  },

  /** Labels and captions */
  label: {
    DEFAULT: "text-xs font-semibold uppercase tracking-wider",
    normal: "text-sm font-medium",
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: "shadow-sm",
  DEFAULT: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  none: "shadow-none",
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  DEFAULT: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  shadow: "transition-shadow duration-200 ease-in-out",
} as const;

// ============================================================================
// METRIC CARD VARIANTS (Stone Palette Only)
// ============================================================================

export const metricCardVariants = {
  default: {
    card: "border-stone-200 bg-stone-50",
    iconBg: "bg-stone-200/30",
    iconColor: "text-stone-400",
  },
  success: {
    card: "border-stone-200 bg-stone-50",
    iconBg: "bg-stone-600/10",
    iconColor: "text-stone-600",
  },
  warning: {
    card: "border-stone-200 bg-stone-50",
    iconBg: "bg-stone-500/10",
    iconColor: "text-stone-500",
  },
  danger: {
    card: "border-stone-200 bg-stone-50",
    iconBg: "bg-stone-700/10",
    iconColor: "text-stone-700",
  },
  info: {
    card: "border-stone-200 bg-stone-50",
    iconBg: "bg-stone-400/10",
    iconColor: "text-stone-400",
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Tailwind class for a specific color
 * @example getColorClass('red', 'bg') => 'bg-orange'
 */
export function getColorClass(
  color: keyof typeof colors,
  type: "bg" | "text" | "border" = "bg",
  shade = 500
): string {
  const colorValue = colors[color];
  if (typeof colorValue === "object" && "DEFAULT" in colorValue) {
    const value = shade === 500 ? colorValue.DEFAULT : (colorValue as any)[shade];
    return `${type}-[${value}]`;
  }
  return "";
}

/**
 * Get metric card variant styles
 * @example getMetricCardStyles('success')
 */
export function getMetricCardStyles(variant: keyof typeof metricCardVariants = "default") {
  return metricCardVariants[variant];
}
