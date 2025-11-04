/**
 * Design Tokens
 * Centralized design system tokens for colors, typography, spacing, and more.
 * Use these tokens instead of hardcoded values for consistency across the app.
 */

/**
 * COLOR TOKENS
 * Semantic color names for consistent usage across the app.
 */
export const colors = {
  // Primary Brand Colors
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#2563EB", // Main primary color
    600: "#1D4ED8",
    700: "#1E40AF",
    800: "#1E3A8A",
    900: "#1E293B",
  },

  // Neutral/Gray Scale
  neutral: {
    0: "#FFFFFF",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },

  // Semantic Colors
  success: {
    50: "#DCFCE7",
    100: "#BBF7D0",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
  },

  error: {
    50: "#FEE2E2",
    100: "#FECACA",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
  },

  warning: {
    50: "#FEF3C7",
    100: "#FDE68A",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
  },

  info: {
    50: "#E0F2FE",
    100: "#BAE6FD",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
  },
} as const;

/**
 * TYPOGRAPHY TOKENS
 * Standardized font sizes and weights
 */
export const typography = {
  // Font Sizes (reduced from 15+ to 6 core sizes)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Font Weights (numeric only for consistency)
  fontWeight: {
    regular: "400" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Line Heights (relative to font size)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * SPACING TOKENS
 * 8px grid system for consistent spacing
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

/**
 * BORDER RADIUS TOKENS
 * Standardized border radius values
 */
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999, // For pills and circular elements
} as const;

/**
 * SHADOW/ELEVATION TOKENS
 * Consistent shadow patterns for depth
 */
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

/**
 * OPACITY TOKENS
 * Standard opacity values for states
 */
export const opacity = {
  disabled: 0.5,
  hover: 0.9,
  pressed: 0.8,
  placeholder: 0.6,
} as const;

/**
 * LAYOUT TOKENS
 * Common layout values
 */
export const layout = {
  containerPadding: spacing.lg,
  contentMaxWidth: 1200,
  headerHeight: 56,
  tabBarHeight: 64,
  modalMaxHeight: "90%",
} as const;

/**
 * ANIMATION TOKENS
 * Standard animation durations and easings
 */
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: "ease-in-out" as const,
    enter: "ease-out" as const,
    exit: "ease-in" as const,
  },
} as const;

/**
 * SEMANTIC COLOR HELPERS
 * Purpose-driven color mappings for common use cases
 */
export const semanticColors = {
  // Text
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    placeholder: colors.neutral[400],
    disabled: colors.neutral[300],
    inverse: colors.neutral[0],
  },

  // Backgrounds
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    elevated: colors.neutral[0],
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Borders
  border: {
    default: colors.neutral[200],
    light: colors.neutral[100],
    medium: colors.neutral[300],
    dark: colors.neutral[400],
  },

  // Interactive States
  interactive: {
    default: colors.primary[500],
    hover: colors.primary[600],
    pressed: colors.primary[700],
    disabled: colors.neutral[300],
  },

  // Status Indicators
  status: {
    success: colors.success[600],
    successLight: colors.success[50],
    error: colors.error[600],
    errorLight: colors.error[50],
    warning: colors.warning[600],
    warningLight: colors.warning[50],
    info: colors.info[600],
    infoLight: colors.info[50],
  },
} as const;

/**
 * DARK MODE TOKENS
 * Color overrides for dark mode (future implementation)
 */
export const darkColors = {
  // Will be implemented when dark mode is added
  // For now, using light mode tokens only
} as const;

/**
 * Type exports for TypeScript support
 */
export type ColorScale = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type SemanticColors = typeof semanticColors;
