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
// COLOR PALETTE
// ============================================================================

export const colors = {
  /** Primary brand color (Ember Red) - Used for CTAs, highlights, interactive elements */
  red: {
    DEFAULT: "#F44A22",
    50: "#FEF8E8", // Lightest tint (backgrounds)
    100: "#FFE5DD", // Light tint
    500: "#F44A22", // Base color
    600: "#D63D1C", // Darker shade (hover)
    700: "#B83317", // Darkest shade (active)
  },

  /** Neutral grays - Used for text, borders, backgrounds */
  gray: {
    50: "#FEF8E8", // Silver (light backgrounds)
    100: "#F5F5F5", // Very light gray
    200: "#E4E2E3", // Light gray (borders, dividers)
    300: "#D1D1D1", // Medium light gray
    400: "#A8AAAC", // Stone (secondary text, muted elements)
    500: "#808080", // Medium gray
    600: "#606060", // Dark gray
    900: "#161616", // Midnight (primary text, headings)
  },

  /** Semantic colors */
  success: {
    DEFAULT: "#10B981",
    light: "#D1FAE5",
  },
  warning: {
    DEFAULT: "#F59E0B",
    light: "#FEF3C7",
  },
  danger: {
    DEFAULT: "#EF4444",
    light: "#FEE2E2",
  },
  info: {
    DEFAULT: "#3B82F6",
    light: "#DBEAFE",
  },

  /** Background colors */
  background: {
    primary: "#FFFFFF", // White (main background)
    secondary: "#FEF8E8", // Silver (card backgrounds)
    muted: "#F5F5F5", // Muted sections
  },

  /** Border colors */
  border: {
    DEFAULT: "#E4E2E3", // Default border
    strong: "#D1D1D1", // Stronger borders
    muted: "#F5F5F5", // Subtle borders
  },

  /** Text colors */
  text: {
    primary: "#161616", // Midnight (headings, primary text)
    secondary: "#A8AAAC", // Stone (secondary text, labels)
    muted: "#D1D1D1", // Muted text
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
// METRIC CARD VARIANTS (Standardized)
// ============================================================================

export const metricCardVariants = {
  default: {
    card: "border-[#E4E2E3] bg-[#FEF8E8]",
    iconBg: "bg-[#E4E2E3]/30",
    iconColor: "text-[#A8AAAC]",
  },
  success: {
    card: "border-[#E4E2E3] bg-[#FEF8E8]",
    iconBg: "bg-[#F44A22]/10",
    iconColor: "text-[#F44A22]",
  },
  warning: {
    card: "border-[#E4E2E3] bg-[#FEF8E8]",
    iconBg: "bg-[#F44A22]/10",
    iconColor: "text-[#F44A22]",
  },
  danger: {
    card: "border-[#E4E2E3] bg-[#FEF8E8]",
    iconBg: "bg-[#F44A22]/10",
    iconColor: "text-[#F44A22]",
  },
  info: {
    card: "border-[#E4E2E3] bg-[#FEF8E8]",
    iconBg: "bg-[#FEF8E8]",
    iconColor: "text-[#F44A22]",
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Tailwind class for a specific color
 * @example getColorClass('red', 'bg') => 'bg-[#F44A22]'
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
