/**
 * Input Component
 * Reusable text input with consistent styling and states.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import {
  borderRadius,
  colors,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends TextInputProps {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text
   */
  hint?: string;

  /**
   * Input size
   * @default "md"
   */
  size?: InputSize;

  /**
   * Left icon (Ionicons name)
   */
  leftIcon?: IconName;

  /**
   * Right icon (Ionicons name)
   */
  rightIcon?: IconName;

  /**
   * Right icon press handler
   */
  onRightIconPress?: () => void;

  /**
   * Required field indicator
   */
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  size = "md",
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  editable = true,
  style,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
      },
      text: {
        fontSize: typography.fontSize.lg,
      },
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size];
  const hasError = !!error;
  const isDisabled = !editable;

  const getIconColor = () => {
    if (hasError) {
      return semanticColors.status.error;
    }
    if (isDisabled) {
      return semanticColors.text.disabled;
    }
    if (isFocused) {
      return colors.primary[500];
    }
    return semanticColors.text.tertiary;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.container,
          currentSize.container,
          isFocused && styles.containerFocused,
          hasError && styles.containerError,
          isDisabled && styles.containerDisabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            color={getIconColor()}
            name={leftIcon}
            size={currentSize.icon}
            style={styles.iconLeft}
          />
        )}

        <TextInput
          {...textInputProps}
          editable={editable}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          placeholderTextColor={semanticColors.text.placeholder}
          style={[
            styles.input,
            currentSize.text,
            {
              color: isDisabled ? semanticColors.text.disabled : semanticColors.text.primary,
            },
            style,
          ]}
        />

        {rightIcon && (
          <Pressable
            disabled={!onRightIconPress || isDisabled}
            hitSlop={8}
            onPress={onRightIconPress}
          >
            <Ionicons
              color={getIconColor()}
              name={rightIcon}
              size={currentSize.icon}
              style={styles.iconRight}
            />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: semanticColors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: semanticColors.status.error,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.background.secondary,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: borderRadius.md,
  },
  containerFocused: {
    borderColor: colors.primary[500],
    backgroundColor: semanticColors.background.primary,
  },
  containerError: {
    borderColor: semanticColors.status.error,
    backgroundColor: semanticColors.background.primary,
  },
  containerDisabled: {
    backgroundColor: semanticColors.background.tertiary,
    borderColor: semanticColors.border.light,
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: semanticColors.status.error,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: semanticColors.text.tertiary,
    marginTop: spacing.xs,
  },
});
