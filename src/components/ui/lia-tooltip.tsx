"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * LiaTooltipContent - Lia Design System (Anthropic-Inspired)
 *
 * Clean, light tooltip with:
 * - Anthropic rounded corners (rounded-lg)
 * - Light background with neutral borders
 * - Geist Sans for clear readability
 * - Refined typography (font-medium, no uppercase)
 * - Subtle slide-in animation
 * - Matches Anthropic design aesthetic
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    className={cn(
      // Base styles
      "z-50 overflow-hidden rounded-lg border border-neutral-200 bg-white px-3 py-1.5 shadow-lg",
      // Typography
      "font-medium text-neutral-900 text-sm",
      geistSans.className,
      // Animations
      "fade-in-0 zoom-in-95 animate-in",
      "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    ref={ref}
    sideOffset={sideOffset}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * LiaTooltip - Simplified API
 *
 * Usage:
 * <LiaTooltip content="Users">
 *   <button>👥</button>
 * </LiaTooltip>
 */
interface LiaTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

function LiaTooltip({ children, content, side = "right", delayDuration = 300 }: LiaTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

export { LiaTooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
