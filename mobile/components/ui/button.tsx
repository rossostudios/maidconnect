/**
 * Button Component
 * Reusable button with multiple variants and states.
 * Consolidates 12+ button implementations across the app into one component.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
} from "react-native";
import {
  borderRadius,
  colors,
  opacity,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  /**
   * Button variant
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Button text
   */
  children: string;

  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Optional icon (Ionicons name)
   */
  icon?: IconName;

  /**
   * Icon position
   * @default "left"
   */
  iconPosition?: "left" | "right";

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Custom style (use sparingly, prefer variants)
   */
  style?: PressableProps["style"];
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Variant styles
  const variantStyles = {
    primary: {
      container: {
        backgroundColor: semanticColors.interactive.default,
      },
      containerPressed: {
        backgroundColor: semanticColors.interactive.pressed,
      },
      containerDisabled: {
        backgroundColor: semanticColors.interactive.disabled,
      },
      text: {
        color: semanticColors.text.inverse,
      },
      textDisabled: {
        color: semanticColors.text.inverse,
      },
    },
    secondary: {
      container: {
        backgroundColor: colors.neutral[100],
      },
      containerPressed: {
        backgroundColor: colors.neutral[200],
      },
      containerDisabled: {
        backgroundColor: colors.neutral[100],
      },
      text: {
        color: semanticColors.text.primary,
      },
      textDisabled: {
        color: semanticColors.text.disabled,
      },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: semanticColors.border.default,
      },
      containerPressed: {
        backgroundColor: colors.neutral[50],
        borderColor: semanticColors.border.medium,
      },
      containerDisabled: {
        backgroundColor: "transparent",
        borderColor: semanticColors.border.light,
      },
      text: {
        color: semanticColors.text.primary,
      },
      textDisabled: {
        color: semanticColors.text.disabled,
      },
    },
    ghost: {
      container: {
        backgroundColor: "transparent",
      },
      containerPressed: {
        backgroundColor: colors.neutral[50],
      },
      containerDisabled: {
        backgroundColor: "transparent",
      },
      text: {
        color: semanticColors.interactive.default,
      },
      textDisabled: {
        color: semanticColors.text.disabled,
      },
    },
    danger: {
      container: {
        backgroundColor: semanticColors.status.error,
      },
      containerPressed: {
        backgroundColor: colors.error[700],
      },
      containerDisabled: {
        backgroundColor: semanticColors.interactive.disabled,
      },
      text: {
        color: semanticColors.text.inverse,
      },
      textDisabled: {
        color: semanticColors.text.inverse,
      },
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      container: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      text: {
        fontSize: typography.fontSize.sm,
      },
      icon: 16,
    },
    md: {
      container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      },
      text: {
        fontSize: typography.fontSize.base,
      },
      icon: 20,
    },
    lg: {
      container: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
      },
      text: {
        fontSize: typography.fontSize.lg,
      },
      icon: 24,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      style={(state: PressableStateCallbackType) => {
        const baseStyles = [
          styles.container,
          currentSize.container,
          currentVariant.container,
          state.pressed && !isDisabled && currentVariant.containerPressed,
          isDisabled && currentVariant.containerDisabled,
          fullWidth && styles.fullWidth,
          isDisabled && { opacity: opacity.disabled },
        ];

        if (style) {
          if (typeof style === "function") {
            return [...baseStyles, style(state)];
          }
          return [...baseStyles, style];
        }

        return baseStyles;
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={isDisabled ? currentVariant.textDisabled.color : currentVariant.text.color}
          size={size === "sm" ? "small" : "small"}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              color={isDisabled ? currentVariant.textDisabled.color : currentVariant.text.color}
              name={icon}
              size={currentSize.icon}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              currentSize.text,
              isDisabled ? currentVariant.textDisabled : currentVariant.text,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              color={isDisabled ? currentVariant.textDisabled.color : currentVariant.text.color}
              name={icon}
              size={currentSize.icon}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
