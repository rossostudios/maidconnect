/**
 * Badge Component
 * Reusable badge for status indicators, labels, and counts.
 */

import { StyleSheet, Text, View, type ViewProps } from "react-native";
import {
  borderRadius,
  colors,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "primary";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends ViewProps {
  /**
   * Badge variant (determines color)
   * @default "neutral"
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default "md"
   */
  size?: BadgeSize;

  /**
   * Badge text
   */
  children: string;

  /**
   * Custom style
   */
  style?: ViewProps["style"];
}

export function Badge({
  variant = "neutral",
  size = "md",
  children,
  style,
  ...viewProps
}: BadgeProps) {
  // Variant styles
  const variantStyles = {
    success: {
      container: {
        backgroundColor: semanticColors.status.successLight,
      },
      text: {
        color: semanticColors.status.success,
      },
    },
    error: {
      container: {
        backgroundColor: semanticColors.status.errorLight,
      },
      text: {
        color: semanticColors.status.error,
      },
    },
    warning: {
      container: {
        backgroundColor: semanticColors.status.warningLight,
      },
      text: {
        color: semanticColors.status.warning,
      },
    },
    info: {
      container: {
        backgroundColor: semanticColors.status.infoLight,
      },
      text: {
        color: semanticColors.status.info,
      },
    },
    neutral: {
      container: {
        backgroundColor: colors.neutral[100],
      },
      text: {
        color: semanticColors.text.secondary,
      },
    },
    primary: {
      container: {
        backgroundColor: colors.primary[500],
      },
      text: {
        color: semanticColors.text.inverse,
      },
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      container: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      },
      text: {
        fontSize: typography.fontSize.xs,
      },
    },
    md: {
      container: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      },
      text: {
        fontSize: typography.fontSize.sm,
      },
    },
    lg: {
      container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      },
      text: {
        fontSize: typography.fontSize.base,
      },
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      {...viewProps}
      style={[styles.container, currentSize.container, currentVariant.container, style]}
    >
      <Text style={[styles.text, currentSize.text, currentVariant.text]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
});
