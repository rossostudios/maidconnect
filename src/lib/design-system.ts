/**
 * Design System Tokens - 8px Grid System
 * Following 2025-2026 best practices for consistent spacing and layout
 *
 * Base unit: 8px (Tailwind spacing-2)
 * All spacing follows 8px increments for visual consistency
 * Rule: Internal spacing ≤ External spacing
 */

export const SPACING = {
  /** 4px - Micro spacing for tight elements */
  xs: "1" as const,
  /** 8px - Base unit, minimum recommended spacing */
  sm: "2" as const,
  /** 16px - Standard spacing between related elements */
  md: "4" as const,
  /** 24px - Medium spacing for grouping */
  lg: "6" as const,
  /** 32px - Large spacing for sections */
  xl: "8" as const,
  /** 40px - Extra large spacing */
  "2xl": "10" as const,
  /** 48px - Major section spacing */
  "3xl": "12" as const,
  /** 56px - Hero spacing */
  "4xl": "14" as const,
  /** 64px - Maximum spacing */
  "5xl": "16" as const,
} as const;

/**
 * Icon Container Design System
 * Consistent icon presentation across all admin cards
 */
export const ICON_CONTAINER = {
  /** Icon size inside container */
  iconSize: "h-5 w-5" as const,
  /** Container size - rounded square */
  containerSize: "h-12 w-12" as const,
  /** Border radius - 8px for consistency with grid */
  borderRadius: "rounded-lg" as const,
  /** Background - lightest slate with subtle opacity */
  background: "bg-slate-50 dark:bg-slate-900/50" as const,
  /** Icon color - medium slate for contrast */
  iconColor: "text-slate-600 dark:text-slate-400" as const,
  /** Padding inside container for visual balance */
  padding: "p-3" as const, // 12px = close to 8px grid
} as const;

/**
 * Card Layout System
 * Consistent card structure with proper spacing
 */
export const CARD_LAYOUT = {
  /** Padding inside cards - 24px (3 × 8px) */
  padding: "p-6" as const,
  /** Spacing between card sections - 16px (2 × 8px) */
  sectionGap: "gap-4" as const,
  /** Spacing between icon and content - 24px (3 × 8px) */
  iconContentGap: "gap-6" as const,
  /** Additional top space for first element - 0px (padding handles it) */
  iconTopMargin: "mt-0" as const,
} as const;

/**
 * Status Color Variants
 * Semantic colors for different statuses
 */
export const STATUS_VARIANTS = {
  pending: {
    container: "bg-amber-50 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    label: "Pending",
  },
  active: {
    container: "bg-emerald-50 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    label: "Active",
  },
  review: {
    container: "bg-blue-50 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    label: "Needs Review",
  },
  approved: {
    container: "bg-green-50 dark:bg-green-950/20",
    icon: "text-green-600 dark:text-green-400",
    label: "Approved",
  },
  warning: {
    container: "bg-orange-50 dark:bg-orange-950/20",
    icon: "text-orange-600 dark:text-orange-400",
    label: "Warning",
  },
  error: {
    container: "bg-red-50 dark:bg-red-950/20",
    icon: "text-red-600 dark:text-red-400",
    label: "Error",
  },
  neutral: {
    container: "bg-slate-50 dark:bg-slate-900/50",
    icon: "text-slate-600 dark:text-slate-400",
    label: "Neutral",
  },
} as const;

export type StatusVariant = keyof typeof STATUS_VARIANTS;
