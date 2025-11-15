/**
 * Dashboard Design Tokens
 *
 * Centralized design system for admin dashboard (2025 standards)
 * - Compact but spacious layout
 * - Consistent spacing and typography
 * - Single shadow style
 * - 12-column grid alignment
 */

export const DASHBOARD = {
  // ============================================
  // SPACING - Use ONLY these values
  // ============================================
  spacing: {
    // Between major sections
    section: "gap-6", // 24px
    sectionY: "space-y-6", // 24px vertical

    // Between cards in grid
    card: "gap-4", // 16px

    // Inside cards
    cardPadding: "p-5", // 20px all sides
    cardPaddingX: "px-5", // 20px horizontal
    cardPaddingY: "py-5", // 20px vertical

    // Stat cards (more compact)
    statPadding: "p-4", // 16px all sides

    // Tables (dense layout)
    tableCellX: "px-3", // 12px horizontal
    tableCellY: "py-3", // 12px vertical
    tableCell: "px-3 py-3", // 12px all

    // Component internal spacing
    componentGap: "gap-3", // 12px
    tightGap: "gap-1.5", // 6px
  },

  // ============================================
  // TYPOGRAPHY - Use ONLY these values
  // ============================================
  typography: {
    // Page title (main dashboard heading)
    pageTitle: "text-[32px] leading-[48px] font-bold tracking-tight",

    // Section titles (Platform health, Booking pipeline, etc.)
    sectionTitle: "text-xl font-bold tracking-tight",

    // Card titles (inside white cards)
    cardTitle: "text-base font-semibold",

    // Metric numbers (big stats)
    metric: "text-[28px] font-bold leading-none",
    metricLarge: "text-[32px] font-bold leading-none",

    // Body text
    body: "text-sm",
    bodyMedium: "text-sm font-medium",

    // Label text (uppercase badges)
    label: "text-[11px] font-medium uppercase tracking-wide",
    labelTight: "text-[10px] font-medium uppercase tracking-[0.1em]",

    // Helper text
    helper: "text-xs text-neutral-600",
  },

  // ============================================
  // CARDS - Use ONLY these values
  // ============================================
  cards: {
    // Default card (subtle shadow)
    default: "border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",

    // Stat card (no shadow, minimal)
    stat: "border border-neutral-200 bg-white",

    // Interactive card (hover effect)
    interactive:
      "border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",

    // Table container
    table: "border border-neutral-200 bg-white",
  },

  // ============================================
  // COLORS - Consistent palette
  // ============================================
  colors: {
    // Text
    heading: "text-neutral-900",
    body: "text-neutral-600",
    label: "text-neutral-500",
    muted: "text-neutral-400",

    // Backgrounds
    bgWhite: "bg-white",
    bgSubtle: "bg-neutral-50",

    // Borders
    border: "border-neutral-200",

    // Status colors
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
    info: "text-blue-600",
  },

  // ============================================
  // GRID - 12-column layout
  // ============================================
  grid: {
    container: "grid grid-cols-12",

    // Common column spans
    full: "col-span-12",
    half: "col-span-12 lg:col-span-6",
    twoThirds: "col-span-12 lg:col-span-8",
    oneThird: "col-span-12 lg:col-span-4",

    // Stat grid (always 4 columns on desktop)
    statGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get consistent card styles
 */
export function getCardClass(variant: "default" | "stat" | "interactive" | "table" = "default") {
  return DASHBOARD.cards[variant];
}

/**
 * Get consistent spacing class
 */
export function getSpacing(type: keyof typeof DASHBOARD.spacing) {
  return DASHBOARD.spacing[type];
}

/**
 * Get consistent typography class
 */
export function getTypography(type: keyof typeof DASHBOARD.typography) {
  return DASHBOARD.typography[type];
}
