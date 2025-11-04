/**
 * Theme Configuration
 * Integrates with design-tokens.ts for a comprehensive design system.
 * Use the design tokens directly for new components, or use this theme for legacy compatibility.
 */

import { Platform } from "react-native";
import {
  animation,
  borderRadius,
  colors,
  layout,
  opacity,
  semanticColors,
  shadows,
  spacing,
  typography,
} from "./design-tokens";

// Updated to use the primary brand color from design tokens
const tintColorLight = colors.primary[500]; // #2563EB
const tintColorDark = colors.neutral[0]; // #FFFFFF

/**
 * Legacy Colors export (maintained for backward compatibility)
 * @deprecated Use semanticColors from design-tokens.ts for new code
 */
export const Colors = {
  light: {
    text: semanticColors.text.primary,
    background: semanticColors.background.primary,
    tint: tintColorLight,
    icon: semanticColors.text.secondary,
    tabIconDefault: semanticColors.text.tertiary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

/**
 * Font families by platform
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Comprehensive Theme Export
 * Re-exports all design tokens for centralized access
 */
export const theme = {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  opacity,
  layout,
  animation,
  fonts: Fonts,
} as const;

/**
 * Type export for TypeScript support
 */
export type Theme = typeof theme;
