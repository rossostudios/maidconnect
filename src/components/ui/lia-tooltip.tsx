"use client";

/**
 * LiaTooltip - Lia Design System Tooltip (React Aria)
 *
 * Clean, light tooltip with Anthropic-inspired design:
 * - Rounded corners (rounded-lg)
 * - Light background with neutral borders
 * - Geist Sans for clear readability
 * - Refined typography
 * - Subtle animations
 *
 * Uses React Aria Tooltip component under the hood.
 */

import * as React from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * LiaTooltip Props
 */
interface LiaTooltipProps {
  /**
   * Trigger element
   */
  children: React.ReactNode;
  /**
   * Tooltip content text
   */
  content: string;
  /**
   * Placement side (default: right)
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Delay before showing tooltip in milliseconds (default: 300)
   */
  delayDuration?: number;
}

/**
 * LiaTooltip Component
 *
 * Simplified API for tooltips with Lia Design System styling.
 *
 * @example
 * ```tsx
 * <LiaTooltip content="Users">
 *   <button>👥</button>
 * </LiaTooltip>
 * ```
 */
function LiaTooltip({
  children,
  content,
  side = "right",
  delayDuration = 300,
}: LiaTooltipProps) {
  return (
    <TooltipProvider delay={delayDuration}>
      <Tooltip delay={delayDuration}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          className={cn(
            // Override default dark styling with light Lia styling
            "bg-white text-neutral-900 border border-neutral-200",
            // Typography - Geist Sans
            "font-medium text-sm",
            geistSans.className,
            // Shape - Lia Design System
            "rounded-lg",
            // Shadow
            "shadow-lg"
          )}
          showArrow={false}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export for backward compatibility
export {
  LiaTooltip,
  TooltipProvider,
  Tooltip as TooltipRoot,
  TooltipTrigger,
  TooltipContent,
};
