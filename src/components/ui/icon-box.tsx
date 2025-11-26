import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type IconBoxSize = "sm" | "md" | "lg";
type IconBoxVariant = "neutral" | "primary" | "success" | "warning" | "info";

type IconBoxProps = {
  icon: HugeIcon;
  size?: IconBoxSize;
  variant?: IconBoxVariant;
  className?: string;
};

const sizeClasses: Record<IconBoxSize, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-9 w-9", icon: "h-4 w-4" },
  lg: { box: "h-10 w-10", icon: "h-5 w-5" },
};

const variantClasses: Record<IconBoxVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  primary: "bg-rausch-50 text-rausch-600 border border-rausch-200",
  success: "bg-green-50 text-green-600 border border-green-200",
  warning: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  info: "bg-babu-50 text-babu-600 border border-babu-200",
};

/**
 * IconBox - Lia Design System
 *
 * Standardized icon container with consistent sizing and variants:
 * - sm: 32x32px (h-8) - Sidebar nav items, compact lists
 * - md: 36x36px (h-9) - Quick action cards, standard lists
 * - lg: 40x40px (h-10) - Metric cards, featured items
 *
 * Usage:
 * <IconBox icon={Calendar03Icon} size="md" variant="neutral" />
 */
export function IconBox({ icon, size = "md", variant = "neutral", className }: IconBoxProps) {
  const { box, icon: iconSize } = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-lg",
        box,
        variantClasses[variant],
        className
      )}
    >
      <HugeiconsIcon className={iconSize} icon={icon} />
    </div>
  );
}
