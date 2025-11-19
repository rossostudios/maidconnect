"use client";

/**
 * Tooltip Component (React Aria)
 *
 * Accessible tooltip with positioning and delay support.
 * Uses React Aria for proper ARIA attributes and keyboard interaction.
 *
 * Week 4: Component Libraries Consolidation - Task 2
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>
 *       <Button>Hover me</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       This is helpful information
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 *
 * // With custom delay
 * <TooltipProvider delay={300}>
 *   <Tooltip>
 *     <TooltipTrigger>
 *       <Button>Quick tooltip</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       Shows faster
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */

import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  OverlayArrow,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Tooltip Context for delay configuration
 */
type TooltipContextValue = {
  delay: number;
};

const TooltipContext = React.createContext<TooltipContextValue>({
  delay: 700,
});

/**
 * Tooltip Provider Props
 */
export interface TooltipProviderProps {
  /**
   * Children elements
   */
  children: React.ReactNode;
  /**
   * Delay in milliseconds before showing tooltip (default: 700ms)
   */
  delay?: number;
}

/**
 * Tooltip Provider Component
 *
 * Wraps your app or section to configure tooltip behavior.
 * Provides shared delay configuration for all tooltips.
 */
export function TooltipProvider({ children, delay = 700 }: TooltipProviderProps) {
  return <TooltipContext.Provider value={{ delay }}>{children}</TooltipContext.Provider>;
}

/**
 * Tooltip Props
 */
export interface TooltipProps extends Omit<AriaTooltipProps, "delay"> {
  /**
   * Children elements (TooltipTrigger and TooltipContent)
   */
  children: React.ReactNode;
  /**
   * Optional delay override (milliseconds)
   */
  delay?: number;
}

/**
 * Tooltip Component
 *
 * Container for tooltip trigger and content.
 * Manages tooltip visibility and positioning.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, delay: delayOverride, ...props }, ref) => {
    const { delay: contextDelay } = React.useContext(TooltipContext);
    const delay = delayOverride ?? contextDelay;

    return (
      <AriaTooltipTrigger delay={delay} {...props}>
        {children}
      </AriaTooltipTrigger>
    );
  }
);

Tooltip.displayName = "Tooltip";

/**
 * Tooltip Trigger Props
 */
export interface TooltipTriggerProps {
  /**
   * Children elements (typically a Button or interactive element)
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Tooltip Trigger Component
 *
 * Wraps the element that triggers the tooltip on hover/focus.
 */
export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

TooltipTrigger.displayName = "TooltipTrigger";

/**
 * Tooltip Content Props
 */
export interface TooltipContentProps {
  /**
   * Tooltip content
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show arrow pointer (default: true)
   */
  showArrow?: boolean;
}

/**
 * Tooltip Content Component
 *
 * The actual tooltip popup with content.
 * Lia Design System: Uses rounded-lg, neutral colors, shadow.
 */
export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, showArrow = true, ...props }, ref) => {
    return (
      <AriaTooltip
        ref={ref}
        offset={8}
        className={cn(
          // Base styling
          "z-50",
          // Positioning
          "will-change-transform",
          // Animation
          "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
          // Additional classes
          className
        )}
        {...props}
      >
        {/* Arrow */}
        {showArrow && (
          <OverlayArrow>
            <svg
              width={12}
              height={12}
              viewBox="0 0 12 12"
              className="block fill-neutral-900"
            >
              <path d="M0 0 L6 6 L12 0" />
            </svg>
          </OverlayArrow>
        )}

        {/* Content */}
        <div
          className={cn(
            // Background and border (Lia Design System)
            "bg-neutral-900",
            "border border-neutral-700",
            // Shape - Lia Design System: rounded-lg
            "rounded-lg",
            // Padding
            "px-3 py-2",
            // Shadow
            "shadow-lg",
            // Text styling (Lia Design System)
            "text-sm text-white",
            // Max width
            "max-w-xs"
          )}
        >
          {children}
        </div>
      </AriaTooltip>
    );
  }
);

TooltipContent.displayName = "TooltipContent";
