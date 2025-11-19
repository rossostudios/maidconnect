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
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Checkbox Props
 *
 * Extends React Aria's Checkbox props with our custom styling.
 */
export interface CheckboxProps extends Omit<AriaCheckboxProps, "children"> {
  /**
   * Additional CSS classes for the checkbox container
   */
  className?: string;
  /**
   * Optional label text (rendered as children)
   */
  children?: React.ReactNode;
}

/**
 * Checkbox Component
 *
 * Provides accessible checkbox with Lia Design System styling.
 * Uses React Aria for robust keyboard navigation and screen reader support.
 */
export const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <AriaCheckbox
        ref={ref}
        className={cn(
          // Base layout - inline-flex for label + checkbox
          "group inline-flex items-center gap-2",
          // Additional classes
          className
        )}
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
                "border rounded",
                // Default state - orange border (primary)
                "border-orange-500",
                // Focus state - ring
                "group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-orange-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white",
                // Checked state - filled background
                isSelected && "bg-orange-500 text-white",
                // Disabled state
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Checkmark Icon (only visible when selected) */}
              {isSelected && (
                <HugeiconsIcon
                  className="h-4 w-4 text-current"
                  icon={Tick02Icon}
                  size={16}
                />
              )}
            </div>

            {/* Label Text (if provided) */}
            {children && (
              <span
                className={cn(
                  // Lia Design System - typography
                  "text-sm font-medium text-neutral-900",
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
  }
);

Checkbox.displayName = "Checkbox";
