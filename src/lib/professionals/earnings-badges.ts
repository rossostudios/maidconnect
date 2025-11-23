/**
 * Earnings Badge System
 *
 * Badge tiers based on total bookings completed:
 * - Bronze: 1-10 bookings
 * - Silver: 11-50 bookings
 * - Gold: 51-100 bookings
 * - Platinum: 100+ bookings
 */

// ========================================
// Types
// ========================================

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "none";

export type EarningsBadge = {
  tier: BadgeTier;
  displayName: string;
  minBookings: number;
  maxBookings: number | null;
  color: string; // Tailwind color class
  icon: string; // Emoji or icon
  description: string;
};

// ========================================
// Badge Configuration
// ========================================

export const BADGE_TIERS: Record<BadgeTier, EarningsBadge> = {
  none: {
    tier: "none",
    displayName: "No Badge",
    minBookings: 0,
    maxBookings: 0,
    color: "neutral",
    icon: "",
    description: "Complete your first booking to earn a badge",
  },
  bronze: {
    tier: "bronze",
    displayName: "Bronze Professional",
    minBookings: 1,
    maxBookings: 10,
    color: "orange",
    icon: "🥉",
    description: "Completed 1-10 bookings",
  },
  silver: {
    tier: "silver",
    displayName: "Silver Professional",
    minBookings: 11,
    maxBookings: 50,
    color: "neutral",
    icon: "🥈",
    description: "Completed 11-50 bookings",
  },
  gold: {
    tier: "gold",
    displayName: "Gold Professional",
    minBookings: 51,
    maxBookings: 100,
    color: "orange",
    icon: "🥇",
    description: "Completed 51-100 bookings",
  },
  platinum: {
    tier: "platinum",
    displayName: "Platinum Professional",
    minBookings: 101,
    maxBookings: null,
    color: "blue",
    icon: "💎",
    description: "Completed 100+ bookings",
  },
};

// ========================================
// Badge Calculation
// ========================================

/**
 * Calculate badge tier based on total bookings completed
 */
export function calculateBadgeTier(totalBookings: number): BadgeTier {
  if (totalBookings === 0) {
    return "none";
  }
  if (totalBookings >= 101) {
    return "platinum";
  }
  if (totalBookings >= 51) {
    return "gold";
  }
  if (totalBookings >= 11) {
    return "silver";
  }
  if (totalBookings >= 1) {
    return "bronze";
  }
  return "none";
}

/**
 * Get badge information for a specific tier
 */
export function getBadgeInfo(tier: BadgeTier): EarningsBadge {
  return BADGE_TIERS[tier];
}

/**
 * Get badge information based on total bookings
 */
export function getBadgeFromBookings(totalBookings: number): EarningsBadge {
  const tier = calculateBadgeTier(totalBookings);
  return getBadgeInfo(tier);
}

/**
 * Calculate progress to next tier (0-100%)
 */
export function calculateTierProgress(totalBookings: number): {
  currentTier: BadgeTier;
  nextTier: BadgeTier | null;
  progress: number; // 0-100
  bookingsUntilNext: number;
} {
  const currentTier = calculateBadgeTier(totalBookings);
  const currentBadge = BADGE_TIERS[currentTier];

  // Find next tier
  const tiers: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  if (!nextTier) {
    // Already at highest tier
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      bookingsUntilNext: 0,
    };
  }

  const nextBadge = BADGE_TIERS[nextTier];
  const bookingsUntilNext = nextBadge.minBookings - totalBookings;
  const rangeSize = nextBadge.minBookings - currentBadge.minBookings;
  const rangeProgress = totalBookings - currentBadge.minBookings;
  const progress = Math.min(100, Math.max(0, (rangeProgress / rangeSize) * 100));

  return {
    currentTier,
    nextTier,
    progress,
    bookingsUntilNext: Math.max(0, bookingsUntilNext),
  };
}

// ========================================
// Earnings Formatting
// ========================================

/**
 * Format earnings for badge display
 * Converts COP to thousands (e.g., 1,500,000 COP -> $1.5K)
 */
export function formatEarningsForBadge(earningsCOP: number): string {
  const thousands = earningsCOP / 1000;

  if (thousands >= 1000) {
    const millions = thousands / 1000;
    return `$${millions.toFixed(1)}M`;
  }

  return `$${thousands.toFixed(0)}K`;
}

/**
 * Get color classes for badge tier (Lia Design System colors)
 */
export function getBadgeColorClasses(tier: BadgeTier): {
  bg: string;
  border: string;
  text: string;
} {
  switch (tier) {
    case "platinum":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
      };
    case "gold":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
      };
    case "silver":
      return {
        bg: "bg-neutral-100",
        border: "border-neutral-300",
        text: "text-neutral-700",
      };
    case "bronze":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
      };
    default:
      return {
        bg: "bg-neutral-50",
        border: "border-neutral-200",
        text: "text-neutral-600",
      };
  }
}
