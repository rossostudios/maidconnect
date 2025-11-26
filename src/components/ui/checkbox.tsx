"use client";

/**
 * Checkbox Component (React Aria)
 *
 * Accessible checkbox component with custom Lia Design System styling.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 3: Component Libraries Consolidation - Task 3
 *
 * @example
 * ```tsx
 * <Checkbox>
 *   Accept terms and conditions
 * </Checkbox>
 *
 * // Controlled
 * <Checkbox isSelected={checked} onChange={setChecked}>
 *   Newsletter subscription
 * </Checkbox>
 *
 * // Disabled
 * <Checkbox isDisabled>
 *   Unavailable option
 * </Checkbox>
 * ```
 */

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Checkbox Props
 *
 * Extends React Aria's Checkbox props with our custom styling.
 * React 19: ref is a regular prop.
 * Backward compatible with Radix UI props (checked, onCheckedChange).
 */
export interface CheckboxProps
  extends Omit<AriaCheckboxProps, "children" | "isSelected" | "onChange"> {
  /**
   * Additional CSS classes for the checkbox container
   */
  className?: string;
  /**
   * Optional label text (rendered as children)
   */
  children?: React.ReactNode;
  /**
   * Ref to the checkbox element
   */
  ref?: React.RefObject<HTMLLabelElement | null>;
  /**
   * Whether the checkbox is checked (Radix compatibility)
   * @deprecated Use isSelected instead
   */
  checked?: boolean;
  /**
   * Whether the checkbox is selected (React Aria native)
   */
  isSelected?: boolean;
  /**
   * Callback when checked state changes (Radix compatibility)
   * @deprecated Use onChange instead
   */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  /**
   * Callback when selection changes (React Aria native)
   */
  onChange?: (isSelected: boolean) => void;
}

/**
 * Checkbox Component
 *
 * Provides accessible checkbox with Lia Design System styling.
 * Uses React Aria for robust keyboard navigation and screen reader support.
 * React 19: Uses ref as regular prop instead of forwardRef.
 * Supports both Radix UI props (checked, onCheckedChange) and React Aria props (isSelected, onChange).
 */
export const Checkbox = ({
  className,
  children,
  ref,
  checked,
  isSelected,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) => {
  // Backward compatibility: support both Radix and React Aria prop names
  const resolvedIsSelected = isSelected ?? checked;

  const handleChange = (selected: boolean) => {
    onChange?.(selected);
    onCheckedChange?.(selected);
  };

  return (
    <AriaCheckbox
      className={cn(
        // Base layout - inline-flex for label + checkbox
        "group inline-flex items-center gap-2",
        // Additional classes
        className
      )}
      isSelected={resolvedIsSelected}
      onChange={handleChange}
      ref={ref}
      {...props}
    >
      {({ isSelected, isDisabled }) => (
        <>
          {/* Checkbox Box */}
          <div
            className={cn(
              // Base layout
              "grid h-4 w-4 shrink-0 place-content-center",
              // Border and shape (Lia Design System - Anthropic rounded corners)
              "rounded border",
              // Default state - orange border (primary)
              "border-rausch-500",
              // Focus state - ring
              "group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-rausch-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white",
              // Checked state - filled background
              isSelected && "bg-rausch-500 text-white",
              // Disabled state
              isDisabled && "cursor-not-allowed opacity-50"
            )}
          >
            {/* Checkmark Icon (only visible when selected) */}
            {isSelected && (
              <HugeiconsIcon className="h-4 w-4 text-current" icon={Tick02Icon} size={16} />
            )}
          </div>

          {/* Label Text (if provided) */}
          {children && (
            <span
              className={cn(
                // Lia Design System - typography
                "font-medium text-neutral-900 text-sm",
                // Cursor
                "cursor-pointer select-none",
                // Disabled state
                isDisabled && "cursor-not-allowed opacity-70"
              )}
            >
              {children}
            </span>
          )}
        </>
      )}
    </AriaCheckbox>
  );
};
