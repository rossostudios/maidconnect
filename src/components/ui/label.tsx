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

import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Label Props
 *
 * Extends React Aria's Label props with our custom styling.
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
}

/**
 * Label Component
 *
 * Provides accessible label for form inputs with consistent styling.
 * Uses React Aria for robust accessibility support.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => {
    return (
      <AriaLabel
        ref={ref}
        htmlFor={htmlFor}
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
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
