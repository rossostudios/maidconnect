/**
 * Badge Component
 *
 * Versatile status and label component with neutral colors
 * Supports icons, dots, and multiple variants
 */

import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-stone-200 bg-white text-stone-900",
        secondary: "border border-stone-200 bg-stone-100 text-stone-700",
        success: "border border-green-200 bg-green-50 text-green-700",
        warning: "border border-yellow-200 bg-yellow-50 text-yellow-700",
        danger: "border border-red-200 bg-red-50 text-red-700",
        info: "border border-blue-200 bg-blue-50 text-blue-700",
        outline: "border border-stone-300 bg-transparent text-stone-700",
        // Status variants with neutral colors
        pending: "border border-yellow-200 bg-yellow-50 text-yellow-700",
        confirmed: "border border-blue-200 bg-blue-50 text-blue-700",
        in_progress: "border border-stone-200 bg-stone-100 text-stone-700",
        completed: "border border-green-200 bg-green-50 text-green-700",
        cancelled: "border border-red-200 bg-red-50 text-red-700",
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
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")}
        />
      )}
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
