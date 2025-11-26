"use client";

/**
 * Progress Component (React Aria)
 *
 * Accessible progress bar with Lia Design System styling.
 * Built on React Aria Components.
 *
 * @example
 * ```tsx
 * <Progress value={75} />
 * <Progress value={50} showValue />
 * <Progress value={100} variant="success" />
 * ```
 */

import * as React from "react";
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Progress Component
// ============================================================================

/**
 * Progress Props
 */
export interface ProgressProps extends Omit<AriaProgressBarProps, "children"> {
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Additional CSS classes for the indicator
   */
  indicatorClassName?: string;
  /**
   * Whether to show the percentage value
   */
  showValue?: boolean;
  /**
   * Visual variant
   */
  variant?: "default" | "success" | "warning" | "error";
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Ref to the progress element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Variant styles for the progress indicator
 */
const VARIANT_STYLES = {
  default: "bg-rausch-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
} as const;

/**
 * Size styles for the progress bar
 */
const SIZE_STYLES = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

/**
 * Progress Component
 *
 * Visual indicator of completion or progress.
 * Lia Design System: rounded-full, neutral background, orange fill.
 */
export const Progress = ({
  className,
  indicatorClassName,
  showValue = false,
  variant = "default",
  size = "md",
  value = 0,
  ref,
  ...props
}: ProgressProps) => {
  // Ensure value is within bounds
  const normalizedValue = Math.max(0, Math.min(100, value ?? 0));

  return (
    <AriaProgressBar
      className={cn("w-full", showValue && "flex items-center gap-3", className)}
      ref={ref}
      value={normalizedValue}
      {...props}
    >
      {({ percentage }) => (
        <>
          {/* Track */}
          <div
            className={cn(
              // Layout
              "relative w-full overflow-hidden",
              // Background
              "bg-neutral-200",
              // Shape
              "rounded-full",
              // Size
              SIZE_STYLES[size]
            )}
          >
            {/* Indicator */}
            <div
              className={cn(
                // Layout
                "h-full",
                // Shape
                "rounded-full",
                // Transition
                "transition-all duration-300 ease-in-out",
                // Variant color
                VARIANT_STYLES[variant],
                indicatorClassName
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Value label */}
          {showValue && (
            <span className="min-w-[3ch] text-right font-medium text-neutral-700 text-sm">
              {Math.round(percentage)}%
            </span>
          )}
        </>
      )}
    </AriaProgressBar>
  );
};

Progress.displayName = "Progress";

// ============================================================================
// Progress Circle Component (Circular Progress)
// ============================================================================

/**
 * Progress Circle Props
 */
export type ProgressCircleProps = {
  /**
   * Current value (0-100)
   */
  value: number;
  /**
   * Size of the circle in pixels
   */
  size?: number;
  /**
   * Stroke width of the circle
   */
  strokeWidth?: number;
  /**
   * Visual variant
   */
  variant?: "default" | "success" | "warning" | "error";
  /**
   * Whether to show the percentage value in center
   */
  showValue?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Stroke colors for variants
 */
const STROKE_COLORS = {
  default: "stroke-rausch-500",
  success: "stroke-green-500",
  warning: "stroke-yellow-500",
  error: "stroke-red-500",
} as const;

/**
 * Progress Circle Component
 *
 * Circular progress indicator.
 */
export const ProgressCircle = ({
  value,
  size = 40,
  strokeWidth = 4,
  variant = "default",
  showValue = false,
  className,
}: ProgressCircleProps) => {
  // Calculate circle parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <AriaProgressBar
      aria-label="Progress"
      className={cn("relative inline-flex items-center justify-center", className)}
      value={normalizedValue}
    >
      {({ percentage }) => (
        <>
          <svg className="rotate-[-90deg]" height={size} width={size}>
            {/* Background circle */}
            <circle
              className="stroke-neutral-200"
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              className={cn("transition-all duration-300 ease-in-out", STROKE_COLORS[variant])}
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          </svg>

          {/* Center value */}
          {showValue && (
            <span className="absolute font-semibold text-neutral-900 text-xs">
              {Math.round(percentage)}
            </span>
          )}
        </>
      )}
    </AriaProgressBar>
  );
};

ProgressCircle.displayName = "ProgressCircle";
