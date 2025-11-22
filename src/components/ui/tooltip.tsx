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

import * as React from "react";
import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  OverlayArrow,
} from "react-aria-components";
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
 * React 19: ref is a regular prop.
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
  /**
   * Ref to the tooltip container element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Tooltip Component
 *
 * Container for tooltip trigger and content.
 * Manages tooltip visibility and positioning.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const Tooltip = ({ children, delay: delayOverride, ref, ...props }: TooltipProps) => {
  const { delay: contextDelay } = React.useContext(TooltipContext);
  const delay = delayOverride ?? contextDelay;

  return (
    <AriaTooltipTrigger delay={delay} {...props}>
      {children}
    </AriaTooltipTrigger>
  );
};

/**
 * Tooltip Trigger Props
 * React 19: ref is a regular prop.
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
  /**
   * Ref to the trigger element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Tooltip Trigger Component
 *
 * Wraps the element that triggers the tooltip on hover/focus.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const TooltipTrigger = ({ children, className, ref }: TooltipTriggerProps) => (
  <div className={className} ref={ref}>
    {children}
  </div>
);

/**
 * Tooltip Content Props
 * React 19: ref is a regular prop.
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
  /**
   * Ref to the tooltip content element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Tooltip Content Component
 *
 * The actual tooltip popup with content.
 * Lia Design System: Uses rounded-lg, neutral colors, shadow.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const TooltipContent = ({
  children,
  className,
  showArrow = true,
  ref,
  ...props
}: TooltipContentProps) => {
  return (
    <AriaTooltip
      className={cn(
        // Base styling
        "z-50",
        // Positioning
        "will-change-transform",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
        // Additional classes
        className
      )}
      offset={8}
      ref={ref}
      {...props}
    >
      {/* Arrow */}
      {showArrow && (
        <OverlayArrow>
          <svg className="block fill-neutral-900" height={12} viewBox="0 0 12 12" width={12}>
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
};
