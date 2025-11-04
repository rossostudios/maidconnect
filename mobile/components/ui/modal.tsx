/**
 * Modal Component
 * Reusable bottom sheet modal with consistent styling.
 * Standardizes the bottom sheet pattern used across the app.
 */

import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Pressable,
  Modal as RNModal,
  type ModalProps as RNModalProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  borderRadius,
  layout,
  semanticColors,
  spacing,
  typography,
} from "@/constants/design-tokens";

export interface ModalProps extends Omit<RNModalProps, "children"> {
  /**
   * Modal visibility
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Enable scrolling
   * @default true
   */
  scrollable?: boolean;

  /**
   * Custom footer content
   */
  footer?: ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
  footer,
  ...modalProps
}: ModalProps) {
  return (
    <RNModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
      {...modalProps}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.overlayTouchable} />

        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color={semanticColors.text.secondary} name="close" size={24} />
            </Pressable>
          </View>

          {/* Content */}
          {scrollable ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              style={styles.content}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.content}>{children}</View>
          )}

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: semanticColors.background.overlay,
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: semanticColors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: layout.modalMaxHeight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.light,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: semanticColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.xxl,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.light,
  },
});
