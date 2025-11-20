"use client";

/**
 * Badge Component - Lia Design System
 *
 * Status and label component using Precision neutral + orange palette.
 * Maintains status distinction through neutral shades and orange highlights.
 * Supports icons, dots, and multiple semantic variants.
 *
 * Precision Variants:
 * - default: White background (neutral-900 text)
 * - secondary: Light neutral (neutral-700 text)
 * - primary: Orange highlight (orange-600 text) - use for featured/important
 * - muted: Subtle neutral (neutral-600 text)
 * - pending: Orange accent (indicates action needed)
 * - confirmed/in_progress: Neutral shades
 * - completed: White background (clean completion state)
 * - cancelled: Darker neutral (clear terminated state)
 */

import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Precision palette: Neutral backgrounds with clear hierarchy
        default: "border border-neutral-200 bg-white text-neutral-900",
        secondary: "border border-neutral-200 bg-neutral-100 text-neutral-700",
        primary: "border border-orange-200 bg-orange-50 text-orange-600",
        muted: "border border-neutral-100 bg-neutral-50 text-neutral-700",
        outline: "border border-neutral-300 bg-transparent text-neutral-700",
        // Status variants using Precision neutral + orange palette
        pending: "border border-orange-200 bg-orange-50 text-orange-600",
        confirmed: "border border-neutral-200 bg-neutral-100 text-neutral-700",
        in_progress: "border border-neutral-200 bg-neutral-100 text-neutral-700",
        completed: "border border-neutral-200 bg-white text-neutral-900",
        cancelled: "border border-neutral-300 bg-neutral-200 text-neutral-900",
        // Deprecated semantic colors (kept for backwards compatibility, migrate to neutral/orange)
        success: "border border-neutral-200 bg-white text-neutral-900",
        warning: "border border-orange-200 bg-orange-50 text-orange-600",
        danger: "border border-neutral-300 bg-neutral-200 text-neutral-900",
        info: "border border-neutral-200 bg-neutral-100 text-neutral-700",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon to display */
  icon?: HugeIcon;
  /** Show a dot indicator */
  dot?: boolean;
  /** Dot color override */
  dotColor?: string;
}

function Badge({ className, variant, size, icon, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span aria-hidden="true" className={cn("h-1.5 w-1.5", dotColor || "bg-current")} />}
      {icon && (
        <HugeiconsIcon
          className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )}
          icon={icon}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
