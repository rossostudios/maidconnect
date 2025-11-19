"use client";

/**
 * Separator Component (Native HTML)
 *
 * Visual separator line component for dividing content.
 * Migrated from Radix UI to native HTML with proper accessibility.
 *
 * Week 3: Component Libraries Consolidation - Task 2
 *
 * @example
 * ```tsx
 * // Horizontal separator (default)
 * <Separator />
 *
 * // Vertical separator
 * <Separator orientation="vertical" />
 *
 * // Non-decorative separator (semantic)
 * <Separator decorative={false} />
 * ```
 */

import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Separator Props
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the separator
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the separator is purely decorative (no semantic meaning)
   * @default true
   */
  decorative?: boolean;
}

/**
 * Separator Component
 *
 * Provides a visual divider line with proper accessibility.
 * - Decorative separators (default) are hidden from screen readers
 * - Semantic separators use proper ARIA role
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative ? "true" : undefined}
        className={cn(
          // Base styles
          "shrink-0",
          // Lia Design System - border color (replacing bg-border with explicit neutral-200)
          "bg-neutral-200",
          // Size based on orientation
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          // Additional classes
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
