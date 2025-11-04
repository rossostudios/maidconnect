/**
 * Card Component
 * Reusable card container with consistent shadow and padding.
 * Standardizes the 8+ card patterns found across the app.
 */

import type { ReactNode } from "react";
import { Pressable, type PressableProps, StyleSheet, View, type ViewProps } from "react-native";
import { borderRadius, semanticColors, shadows, spacing } from "@/constants/design-tokens";

export type CardVariant = "elevated" | "outlined" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends ViewProps {
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: CardVariant;

  /**
   * Card padding
   * @default "md"
   */
  padding?: CardPadding;

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Optional press handler (makes card pressable)
   */
  onPress?: PressableProps["onPress"];

  /**
   * Custom style
   */
  style?: ViewProps["style"];
}

export function Card({
  variant = "elevated",
  padding = "md",
  children,
  onPress,
  style,
  ...viewProps
}: CardProps) {
  // Variant styles
  const variantStyles = {
    elevated: {
      backgroundColor: semanticColors.background.elevated,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: semanticColors.background.primary,
      borderWidth: 1,
      borderColor: semanticColors.border.default,
    },
    flat: {
      backgroundColor: semanticColors.background.secondary,
    },
  };

  // Padding styles
  const paddingStyles = {
    none: {},
    sm: {
      padding: spacing.md,
    },
    md: {
      padding: spacing.lg,
    },
    lg: {
      padding: spacing.xl,
    },
  };

  const cardStyle = [styles.card, variantStyles[variant], paddingStyles[padding], style];

  // If onPress is provided, use Pressable
  if (onPress) {
    return (
      <Pressable
        {...viewProps}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, use View
  return (
    <View {...viewProps} style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
  },
});
