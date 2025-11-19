"use client";

/**
 * Radio Group Component (React Aria)
 *
 * Accessible radio button group with custom Lia Design System styling.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 3: Component Libraries Consolidation - Task 4
 *
 * @example
 * ```tsx
 * <RadioGroup value={selected} onChange={setSelected}>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option1" id="opt1" />
 *     <Label htmlFor="opt1">Option 1</Label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option2" id="opt2" />
 *     <Label htmlFor="opt2">Option 2</Label>
 *   </div>
 * </RadioGroup>
 * ```
 */

import {
  RadioGroup as AriaRadioGroup,
  Radio as AriaRadio,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Radio Group Props
 */
export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "children"> {
  /**
   * Additional CSS classes for the group container
   */
  className?: string;
  /**
   * Radio button items (children)
   */
  children: React.ReactNode;
  /**
   * Legacy Radix UI prop name for onChange
   * Maps to React Aria's onChange
   */
  onValueChange?: (value: string) => void;
}

/**
 * Radio Group Item Props
 */
export interface RadioGroupItemProps extends Omit<AriaRadioProps, "children"> {
  /**
   * Additional CSS classes for the radio button
   */
  className?: string;
  /**
   * HTML id attribute (for label association)
   */
  id?: string;
}

/**
 * Radio Group Component
 *
 * Container for radio buttons with proper accessibility.
 * Uses React Aria for robust keyboard navigation and screen reader support.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, onChange, onValueChange, ...props }, ref) => {
    // Support both React Aria's onChange and Radix UI's onValueChange for backward compatibility
    const handleChange = React.useCallback(
      (value: string) => {
        onChange?.(value);
        onValueChange?.(value);
      },
      [onChange, onValueChange]
    );

    return (
      <AriaRadioGroup
        ref={ref}
        className={cn(
          // Grid layout with spacing (matching original)
          "grid gap-2",
          // Additional classes
          className
        )}
        onChange={handleChange}
        {...props}
      >
        {children}
      </AriaRadioGroup>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

/**
 * Radio Group Item Component
 *
 * Individual radio button with Lia Design System styling.
 * - Square indicator (no rounded corners - Lia Design System)
 * - Orange primary color
 * - Focus ring for accessibility
 */
export const RadioGroupItem = React.forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <AriaRadio
        ref={ref}
        id={id}
        className={cn(
          // Base layout - the radio button circle container
          "group inline-flex items-center",
          // Additional classes
          className
        )}
        {...props}
      >
        {({ isSelected, isDisabled }) => (
          <div
            className={cn(
              // Square shape with border
              "aspect-square h-4 w-4",
              // Border styling (Lia Design System - orange primary)
              "border border-orange-500",
              // Focus ring
              "group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-orange-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white",
              // Disabled state
              isDisabled && "cursor-not-allowed opacity-50",
              // Additional classes
              className
            )}
          >
            {/* Inner indicator (square - Lia Design System: no rounded corners) */}
            {isSelected && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-2.5 w-2.5 bg-orange-500" />
              </div>
            )}
          </div>
        )}
      </AriaRadio>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";
