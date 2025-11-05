import { CheckmarkCircle01Icon, SecurityCheckIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type VerificationLevel = "none" | "basic" | "enhanced" | "background-check";

type VerificationBadgeProps = {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
};

/**
 * Verification Badge Component
 * Displays professional verification level with icon and label
 * Part of Week 3-4 enhanced trust badges feature
 */
export function VerificationBadge({ level, size = "sm" }: VerificationBadgeProps) {
  if (level === "none") {
    return null;
  }

  const config = {
    basic: {
      icon: Tick02Icon,
      label: "ID Verified",
      bgColor: "bg-[#e8f5e9]",
      textColor: "text-[#2e7d32]",
      iconColor: "text-[#2e7d32]",
    },
    enhanced: {
      icon: CheckmarkCircle01Icon,
      label: "Enhanced Verified",
      bgColor: "bg-[#e3f2fd]",
      textColor: "text-[#1565c0]",
      iconColor: "text-[#1565c0]",
    },
    "background-check": {
      icon: SecurityCheckIcon,
      label: "Background Checked",
      bgColor: "bg-[#f3e5f5]",
      textColor: "text-[#6a1b9a]",
      iconColor: "text-[#6a1b9a]",
    },
  };

  const { icon, label, bgColor, textColor, iconColor } = config[level];

  const sizeConfig = {
    sm: {
      padding: "px-2.5 py-1",
      text: "text-xs",
      icon: "h-3.5 w-3.5",
    },
    md: {
      padding: "px-3 py-1.5",
      text: "text-sm",
      icon: "h-4 w-4",
    },
    lg: {
      padding: "px-4 py-2",
      text: "text-base",
      icon: "h-5 w-5",
    },
  };

  const { padding, text, icon: iconSize } = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${bgColor} ${textColor} ${padding} ${text}`}
    >
      <HugeiconsIcon className={`${iconSize} ${iconColor}`} icon={icon} />
      {label}
    </span>
  );
}

/**
 * On-Time Rate Badge
 * Shows professional's punctuality metric
 */
type OnTimeRateBadgeProps = {
  rate: number; // 0-100
  size?: "sm" | "md" | "lg";
};

export function OnTimeRateBadge({ rate, size = "sm" }: OnTimeRateBadgeProps) {
  // Only show if rate is high enough to be a trust signal
  if (rate < 75) {
    return null;
  }

  const getColor = (rateValue: number) => {
    if (rateValue >= 95) {
      return {
        bgColor: "bg-[#f1f8e9]",
        textColor: "text-[#558b2f]",
      };
    }
    if (rateValue >= 85) {
      return {
        bgColor: "bg-[#fff3e0]",
        textColor: "text-[#e65100]",
      };
    }
    return {
      bgColor: "bg-[#fce4ec]",
      textColor: "text-[#c2185b]",
    };
  };

  const { bgColor, textColor } = getColor(rate);

  const sizeConfig = {
    sm: {
      padding: "px-2.5 py-1",
      text: "text-xs",
    },
    md: {
      padding: "px-3 py-1.5",
      text: "text-sm",
    },
    lg: {
      padding: "px-4 py-2",
      text: "text-base",
    },
  };

  const { padding, text } = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${bgColor} ${textColor} ${padding} ${text}`}
    >
      ⏱️ {rate}% On-Time
    </span>
  );
}

/**
 * Rating Badge
 * Shows average rating with star and review count
 */
type RatingBadgeProps = {
  rating: number; // 0-5
  reviewCount: number;
  size?: "sm" | "md" | "lg";
};

export function RatingBadge({ rating, reviewCount, size = "sm" }: RatingBadgeProps) {
  // Only show if there are reviews
  if (reviewCount === 0 || rating === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbfafa] px-2.5 py-1 font-semibold text-[#5a5549] text-xs">
        ⭐ New Professional
      </span>
    );
  }

  const sizeConfig = {
    sm: {
      padding: "px-2.5 py-1",
      text: "text-xs",
    },
    md: {
      padding: "px-3 py-1.5",
      text: "text-sm",
    },
    lg: {
      padding: "px-4 py-2",
      text: "text-base",
    },
  };

  const { padding, text } = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#fff8e1] font-semibold text-[#f57c00] ${padding} ${text}`}
    >
      ⭐ {rating.toFixed(1)} ({reviewCount})
    </span>
  );
}
