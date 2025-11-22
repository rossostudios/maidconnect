"use client";

/**
 * Label Component (React Aria)
 *
 * Accessible label component for form inputs.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 3: Component Libraries Consolidation - Task 1
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 * ```
 */

import * as React from "react";
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Label Props
 *
 * Extends React Aria's Label props with our custom styling.
 * React 19: ref is a regular prop.
 */
export interface LabelProps extends AriaLabelProps {
  /**
   * Associates the label with an input element by ID
   */
  htmlFor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the label element
   */
  ref?: React.RefObject<HTMLLabelElement | null>;
}

/**
 * Label Component
 *
 * Provides accessible label for form inputs with consistent styling.
 * Uses React Aria for robust accessibility support.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const Label = ({ className, htmlFor, ref, ...props }: LabelProps) => {
  return (
    <AriaLabel
      className={cn(
        // Base styles matching original Radix implementation
        "font-medium text-sm leading-none",
        // Accessibility styles for disabled inputs
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        // Lia Design System - text color
        "text-neutral-900",
        // Additional classes
        className
      )}
      htmlFor={htmlFor}
      ref={ref}
      {...props}
    />
  );
};
