/**
 * Chip Component
 * Reusable chip for filters, tags, and selections.
 * Standardizes the filter chip pattern duplicated across screens.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
} from "react-native";
import {
  borderRadius,
  colors,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type ChipVariant = "outlined" | "filled";
export type ChipSize = "sm" | "md";

export interface ChipProps extends Omit<PressableProps, "style"> {
  /**
   * Chip variant
   * @default "outlined"
   */
  variant?: ChipVariant;

  /**
   * Chip size
   * @default "md"
   */
  size?: ChipSize;

  /**
   * Chip text
   */
  children: string;

  /**
   * Selected state (for filter chips)
   */
  selected?: boolean;

  /**
   * Optional icon (Ionicons name)
   */
  icon?: IconName;

  /**
   * Show remove icon (for dismissible chips)
   */
  onRemove?: () => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Custom style
   */
  style?: PressableProps["style"];
}

export function Chip({
  variant = "outlined",
  size = "md",
  children,
  selected = false,
  icon,
  onRemove,
  disabled = false,
  style,
  ...pressableProps
}: ChipProps) {
  // Variant styles
  const variantStyles = {
    outlined: {
      container: {
        backgroundColor: selected ? colors.primary[500] : semanticColors.background.primary,
        borderWidth: 1,
        borderColor: selected ? colors.primary[500] : semanticColors.border.default,
      },
      containerPressed: {
        backgroundColor: selected ? colors.primary[600] : colors.neutral[50],
        borderColor: selected ? colors.primary[600] : semanticColors.border.medium,
      },
      containerDisabled: {
        backgroundColor: semanticColors.background.secondary,
        borderColor: semanticColors.border.light,
      },
      text: {
        color: selected ? semanticColors.text.inverse : semanticColors.text.primary,
      },
      textDisabled: {
        color: semanticColors.text.disabled,
      },
      icon: selected ? semanticColors.text.inverse : semanticColors.text.secondary,
    },
    filled: {
      container: {
        backgroundColor: selected ? colors.primary[500] : colors.neutral[100],
      },
      containerPressed: {
        backgroundColor: selected ? colors.primary[600] : colors.neutral[200],
      },
      containerDisabled: {
        backgroundColor: semanticColors.background.secondary,
      },
      text: {
        color: selected ? semanticColors.text.inverse : semanticColors.text.primary,
      },
      textDisabled: {
        color: semanticColors.text.disabled,
      },
      icon: selected ? semanticColors.text.inverse : semanticColors.text.secondary,
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      container: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      },
      text: {
        fontSize: typography.fontSize.xs,
      },
      icon: 14,
    },
    md: {
      container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      },
      text: {
        fontSize: typography.fontSize.sm,
      },
      icon: 16,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityState={{
        disabled,
        selected,
      }}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => {
        const baseStyles = [
          styles.container,
          currentSize.container,
          currentVariant.container,
          state.pressed && !disabled && currentVariant.containerPressed,
          disabled && currentVariant.containerDisabled,
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
      {icon && (
        <Ionicons
          color={disabled ? currentVariant.textDisabled.color : currentVariant.icon}
          name={icon}
          size={currentSize.icon}
          style={styles.iconLeft}
        />
      )}
      <Text
        style={[
          styles.text,
          currentSize.text,
          disabled ? currentVariant.textDisabled : currentVariant.text,
        ]}
      >
        {children}
      </Text>
      {onRemove && (
        <Pressable disabled={disabled} hitSlop={8} onPress={onRemove} style={styles.removeButton}>
          <Ionicons
            color={disabled ? currentVariant.textDisabled.color : currentVariant.icon}
            name="close-circle"
            size={currentSize.icon}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  removeButton: {
    marginLeft: spacing.xs,
  },
});
