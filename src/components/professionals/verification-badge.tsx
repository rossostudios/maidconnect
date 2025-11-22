import {
  CheckmarkCircle01Icon,
  DocumentValidationIcon,
  SecurityCheckIcon,
  Tick02Icon,
  UserAccountIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VerificationLevel =
  | "none"
  | "basic"
  | "enhanced"
  | "background-check"
  | "document-verified"
  | "interview-completed"
  | "reference-checked";

const verificationBadgeVariants = cva("inline-flex items-center gap-1.5 font-semibold", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

type VerificationBadgeProps = VariantProps<typeof verificationBadgeVariants> & {
  level: VerificationLevel;
  className?: string;
};

/**
 * Verification Badge Component
 * Displays professional verification level with icon and label
 * Part of Week 3-4 enhanced trust badges feature
 */
export function VerificationBadge({ level, size = "sm", className }: VerificationBadgeProps) {
  if (level === "none") {
    return null;
  }

  const config = {
    basic: {
      icon: Tick02Icon,
      label: "ID Verified",
      bgColor: "bg-neutral-100",
      textColor: "text-neutral-700",
      hoverColor: "hover:bg-neutral-200",
    },
    enhanced: {
      icon: CheckmarkCircle01Icon,
      label: "Enhanced Verified",
      bgColor: "bg-neutral-100",
      textColor: "text-neutral-700",
      hoverColor: "hover:bg-neutral-200",
    },
    "background-check": {
      icon: SecurityCheckIcon,
      label: "Background Checked",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      hoverColor: "hover:bg-green-100",
    },
    "document-verified": {
      icon: DocumentValidationIcon,
      label: "Documents Verified",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      hoverColor: "hover:bg-blue-100",
    },
    "interview-completed": {
      icon: UserAccountIcon,
      label: "Interview Completed",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      hoverColor: "hover:bg-orange-100",
    },
    "reference-checked": {
      icon: UserMultiple02Icon,
      label: "References Verified",
      bgColor: "bg-neutral-100",
      textColor: "text-neutral-700",
      hoverColor: "hover:bg-neutral-200",
    },
  };

  const { icon, label, bgColor, textColor, hoverColor } = config[level];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const iconSize = iconSizes[size || "sm"];

  return (
    <Badge
      className={cn(verificationBadgeVariants({ size }), bgColor, textColor, hoverColor, className)}
      variant="secondary"
    >
      <HugeiconsIcon className={cn(iconSize)} icon={icon} />
      {label}
    </Badge>
  );
}

/**
 * On-Time Rate Badge
 * Shows professional's punctuality metric
 */
type OnTimeRateBadgeProps = VariantProps<typeof verificationBadgeVariants> & {
  rate: number; // 0-100
  className?: string;
};

export function OnTimeRateBadge({ rate, size = "sm", className }: OnTimeRateBadgeProps) {
  // Only show if rate is high enough to be a trust signal
  if (rate < 75) {
    return null;
  }

  const badgeClass =
    rate >= 90 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-50 text-neutral-600";

  return (
    <Badge
      className={cn(
        verificationBadgeVariants({ size }),
        badgeClass,
        "hover:bg-neutral-200",
        className
      )}
      variant="secondary"
    >
      ⏱️ {rate}% On-Time
    </Badge>
  );
}

/**
 * Rating Badge
 * Shows average rating with star and review count
 */
type RatingBadgeProps = VariantProps<typeof verificationBadgeVariants> & {
  rating: number; // 0-5
  reviewCount: number;
  className?: string;
};

export function RatingBadge({ rating, reviewCount, size = "sm", className }: RatingBadgeProps) {
  // Only show if there are reviews
  if (reviewCount === 0 || rating === 0) {
    return (
      <Badge
        className={cn(
          verificationBadgeVariants({ size }),
          "bg-neutral-100 text-neutral-700",
          className
        )}
        variant="secondary"
      >
        ⭐ New Professional
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        verificationBadgeVariants({ size }),
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        className
      )}
      variant="secondary"
    >
      ⭐ {rating.toFixed(1)} ({reviewCount})
    </Badge>
  );
}
