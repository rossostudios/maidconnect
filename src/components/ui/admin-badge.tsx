import { cn } from "@/lib/utils/core";

type AdminBadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";
type AdminBadgeSize = "sm" | "md" | "lg";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  size?: AdminBadgeSize;
  className?: string;
}

/**
 * AdminBadge - Lia Design System Compliant Badge Component
 *
 * Features:
 * - Zero rounded corners (Lia Design System strict enforcement)
 * - Consistent color palette (neutral + orange)
 * - Multiple variants for different use cases
 * - Accessible with proper contrast ratios (WCAG AA)
 */
export function AdminBadge({
  children,
  variant = "default",
  size = "md",
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        // Base styles - Lia Design System: NO ROUNDED CORNERS
        "inline-flex items-center justify-center border font-medium",

        // Size variants
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",

        // Color variants - Neutral + Orange palette
        variant === "default" && "border-orange-200 bg-orange-50 text-orange-600",
        variant === "success" && "border-neutral-300 bg-neutral-100 text-neutral-900",
        variant === "warning" && "border-orange-300 bg-orange-100 text-orange-700",
        variant === "danger" && "border-red-200 bg-red-50 text-red-600",
        variant === "info" && "border-neutral-200 bg-white text-neutral-700",
        variant === "neutral" && "border-neutral-200 bg-neutral-50 text-neutral-600",

        className
      )}
    >
      {children}
    </span>
  );
}
