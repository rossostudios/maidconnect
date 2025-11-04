/**
 * EmptyState Component
 * Reusable empty state for lists and screens.
 * Standardizes the icon + title + description pattern.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { colors, semanticColors, spacing, typography } from "@/constants/design-tokens";
import { Button, type ButtonProps } from "./button";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps extends ViewProps {
  /**
   * Icon name (Ionicons)
   */
  icon: IconName;

  /**
   * Icon color
   * @default semanticColors.text.tertiary
   */
  iconColor?: string;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Optional action button
   */
  action?: {
    label: string;
    onPress: () => void;
    variant?: ButtonProps["variant"];
    icon?: IconName;
  };

  /**
   * Custom content below description
   */
  children?: ReactNode;

  /**
   * Custom style
   */
  style?: ViewProps["style"];
}

export function EmptyState({
  icon,
  iconColor = semanticColors.text.tertiary,
  title,
  description,
  action,
  children,
  style,
  ...viewProps
}: EmptyStateProps) {
  return (
    <View {...viewProps} style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons color={iconColor} name={icon} size={64} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {action && (
        <View style={styles.actionContainer}>
          <Button icon={action.icon} onPress={action.onPress} variant={action.variant || "primary"}>
            {action.label}
          </Button>
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: semanticColors.text.secondary,
    textAlign: "center",
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});
