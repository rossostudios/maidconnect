"use client";

/**
 * TrustProfileSection - Professional Trust & Verification Display
 *
 * Airbnb host dashboard-style trust profile showing verification status,
 * background check results, reviews summary, and trust badges.
 *
 * Features:
 * - Background check status
 * - Identity verification
 * - Review summary with rating
 * - Trust badges and achievements
 * - Verification timeline
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  InformationCircleIcon,
  SecurityCheckIcon,
  ShieldUserIcon,
  StarIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type BackgroundCheckStatus = "not_started" | "pending" | "in_progress" | "passed" | "failed";

export type VerificationItem = {
  id: string;
  type: "identity" | "phone" | "email" | "address" | "social";
  label: string;
  verified: boolean;
  verifiedAt?: string;
};

export type TrustBadge = {
  id: string;
  name: string;
  description: string;
  icon: "star" | "shield" | "verified" | "user";
  earnedAt: string;
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
};

export type TrustProfileData = {
  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  backgroundCheckProvider?: string;
  verifications: VerificationItem[];
  trustBadges: TrustBadge[];
  reviewSummary?: ReviewSummary;
  trustScore?: number;
  profileCompleteness: number;
  memberSince: string;
};

export type TrustProfileSectionProps = {
  trustProfile?: TrustProfileData;
  professionalId: string;
  onStartBackgroundCheck?: () => void;
  className?: string;
};

// ============================================================================
// Status Configuration
// ============================================================================

const BACKGROUND_CHECK_STATUS: Record<
  BackgroundCheckStatus,
  {
    label: string;
    color: string;
    darkColor: string;
    bgColor: string;
    darkBgColor: string;
    icon: HugeIcon;
  }
> = {
  not_started: {
    label: "Not Started",
    color: "text-neutral-500",
    darkColor: "dark:text-neutral-400",
    bgColor: "bg-neutral-50",
    darkBgColor: "dark:bg-neutral-800",
    icon: ShieldUserIcon,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    darkColor: "dark:text-yellow-400",
    bgColor: "bg-yellow-50",
    darkBgColor: "dark:bg-yellow-500/10",
    icon: Clock01Icon,
  },
  in_progress: {
    label: "In Progress",
    color: "text-babu-700",
    darkColor: "dark:text-babu-400",
    bgColor: "bg-babu-50",
    darkBgColor: "dark:bg-babu-500/10",
    icon: Clock01Icon,
  },
  passed: {
    label: "Passed",
    color: "text-green-700",
    darkColor: "dark:text-green-400",
    bgColor: "bg-green-50",
    darkBgColor: "dark:bg-green-500/10",
    icon: CheckmarkCircle02Icon,
  },
  failed: {
    label: "Review Required",
    color: "text-red-700",
    darkColor: "dark:text-red-400",
    bgColor: "bg-red-50",
    darkBgColor: "dark:bg-red-500/10",
    icon: InformationCircleIcon,
  },
};

const BADGE_ICONS: Record<TrustBadge["icon"], HugeIcon> = {
  star: StarIcon,
  shield: SecurityCheckIcon,
  verified: CheckmarkCircle02Icon,
  user: UserCheck01Icon,
};

// ============================================================================
// Main Component
// ============================================================================

export function TrustProfileSection({
  trustProfile,
  professionalId,
  onStartBackgroundCheck,
  className,
}: TrustProfileSectionProps) {
  const _t = useTranslations("dashboard.pro.portfolio.trustProfile");

  // Default trust profile if none provided
  const profile: TrustProfileData = trustProfile || {
    backgroundCheckStatus: "not_started",
    verifications: [],
    trustBadges: [],
    profileCompleteness: 0,
    memberSince: new Date().toISOString(),
  };

  const verifiedCount = profile.verifications.filter((v) => v.verified).length;
  const totalVerifications = profile.verifications.length || 1;
  const verificationProgress = Math.round((verifiedCount / totalVerifications) * 100);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trust Score Overview */}
      <TrustScoreCard
        memberSince={profile.memberSince}
        profileCompleteness={profile.profileCompleteness}
        trustScore={profile.trustScore}
      />

      {/* Background Check */}
      <BackgroundCheckCard
        onStart={onStartBackgroundCheck}
        provider={profile.backgroundCheckProvider}
        status={profile.backgroundCheckStatus}
        verifiedAt={profile.backgroundCheckDate}
      />

      {/* Verifications */}
      <VerificationsCard progress={verificationProgress} verifications={profile.verifications} />

      {/* Review Summary */}
      {profile.reviewSummary && <ReviewSummaryCard summary={profile.reviewSummary} />}

      {/* Trust Badges */}
      {profile.trustBadges.length > 0 && <TrustBadgesCard badges={profile.trustBadges} />}
    </div>
  );
}

// ============================================================================
// Trust Score Card
// ============================================================================

type TrustScoreCardProps = {
  trustScore?: number;
  profileCompleteness: number;
  memberSince: string;
};

function TrustScoreCard({ trustScore, profileCompleteness, memberSince }: TrustScoreCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
            Trust Profile
          </h3>
          <p className="text-muted-foreground text-sm">
            Member since {format(parseISO(memberSince), "MMMM yyyy")}
          </p>
        </div>
        {trustScore !== undefined && (
          <div className="text-right">
            <div
              className={cn(
                "font-bold text-3xl",
                trustScore >= 80
                  ? "text-green-600"
                  : trustScore >= 50
                    ? "text-yellow-600"
                    : "text-red-600",
                geistSans.className
              )}
            >
              {trustScore}%
            </div>
            <p className="text-muted-foreground text-xs">Trust Score</p>
          </div>
        )}
      </div>

      {/* Profile Completeness */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Profile Completeness</span>
          <span className={cn("font-medium text-foreground text-sm", geistSans.className)}>
            {profileCompleteness}%
          </span>
        </div>
        <Progress className="h-2" value={profileCompleteness} />
        {profileCompleteness < 100 && (
          <p className="mt-2 text-muted-foreground text-xs">
            Complete your profile to increase visibility and build trust with clients.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Background Check Card
// ============================================================================

type BackgroundCheckCardProps = {
  status: BackgroundCheckStatus;
  verifiedAt?: string;
  provider?: string;
  onStart?: () => void;
};

function BackgroundCheckCard({ status, verifiedAt, provider, onStart }: BackgroundCheckCardProps) {
  const config = BACKGROUND_CHECK_STATUS[status];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              config.bgColor,
              config.darkBgColor
            )}
          >
            <HugeiconsIcon
              className={cn("h-5 w-5", config.color, config.darkColor)}
              icon={config.icon}
            />
          </div>
          <div>
            <h4 className={cn("font-semibold text-foreground", geistSans.className)}>
              Background Check
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                className={cn(
                  "border",
                  config.bgColor,
                  config.darkBgColor,
                  config.color,
                  config.darkColor
                )}
                variant="secondary"
              >
                {config.label}
              </Badge>
              {provider && <span className="text-muted-foreground text-xs">via {provider}</span>}
            </div>
            {verifiedAt && status === "passed" && (
              <p className="mt-1 text-muted-foreground text-xs">
                Verified on {format(parseISO(verifiedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>

        {status === "not_started" && onStart && (
          <Button onPress={onStart} size="sm">
            Start Check
          </Button>
        )}
      </div>

      {status === "passed" && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-500/10">
          <p className="text-green-700 text-sm dark:text-green-400">
            ✓ Your background check is complete. This badge is visible on your public profile.
          </p>
        </div>
      )}

      {status === "not_started" && (
        <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
          <p className="text-muted-foreground text-sm">
            A background check helps build trust with clients and can increase your bookings by up
            to 30%.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Verifications Card
// ============================================================================

type VerificationsCardProps = {
  verifications: VerificationItem[];
  progress: number;
};

function VerificationsCard({ verifications, progress }: VerificationsCardProps) {
  const defaultVerifications: VerificationItem[] = [
    { id: "email", type: "email", label: "Email Address", verified: false },
    { id: "phone", type: "phone", label: "Phone Number", verified: false },
    { id: "identity", type: "identity", label: "Government ID", verified: false },
    { id: "address", type: "address", label: "Address", verified: false },
  ];

  const items = verifications.length > 0 ? verifications : defaultVerifications;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <h4 className={cn("font-semibold text-foreground", geistSans.className)}>Verifications</h4>
        <span className="text-muted-foreground text-sm">{progress}% complete</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div className="flex items-center justify-between" key={item.id}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  item.verified
                    ? "bg-green-50 dark:bg-green-500/10"
                    : "bg-neutral-100 dark:bg-neutral-800"
                )}
              >
                <HugeiconsIcon
                  className={cn(
                    "h-4 w-4",
                    item.verified ? "text-green-500" : "text-neutral-400 dark:text-neutral-500"
                  )}
                  icon={item.verified ? CheckmarkCircle02Icon : Clock01Icon}
                />
              </div>
              <span
                className={cn(
                  "text-sm",
                  item.verified ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
            {item.verified ? (
              <Badge
                className="border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
                variant="secondary"
              >
                Verified
              </Badge>
            ) : (
              <Button size="sm" variant="outline">
                Verify
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Review Summary Card
// ============================================================================

type ReviewSummaryCardProps = {
  summary: ReviewSummary;
};

function ReviewSummaryCard({ summary }: ReviewSummaryCardProps) {
  const ratingDistribution = [
    { stars: 5, count: summary.fiveStarCount },
    { stars: 4, count: summary.fourStarCount },
    { stars: 3, count: summary.threeStarCount },
    { stars: 2, count: summary.twoStarCount },
    { stars: 1, count: summary.oneStarCount },
  ];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <h4 className={cn("mb-4 font-semibold text-foreground", geistSans.className)}>Reviews</h4>

      <div className="flex items-start gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className={cn("font-bold text-4xl text-foreground", geistSans.className)}>
            {summary.averageRating.toFixed(1)}
          </div>
          <div className="mt-1 flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <HugeiconsIcon
                className={cn(
                  "h-4 w-4",
                  star <= Math.round(summary.averageRating)
                    ? "text-yellow-400"
                    : "text-neutral-200 dark:text-neutral-700"
                )}
                icon={StarIcon}
                key={star}
              />
            ))}
          </div>
          <p className="mt-1 text-muted-foreground text-xs">{summary.totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ stars, count }) => (
            <div className="flex items-center gap-2" key={stars}>
              <span className="w-6 text-muted-foreground text-xs">{stars}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: `${summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Trust Badges Card
// ============================================================================

type TrustBadgesCardProps = {
  badges: TrustBadge[];
};

function TrustBadgesCard({ badges }: TrustBadgesCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <h4 className={cn("mb-4 font-semibold text-foreground", geistSans.className)}>
        Trust Badges
      </h4>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => {
          const IconComponent = BADGE_ICONS[badge.icon];
          return (
            <div
              className="flex flex-col items-center rounded-lg border border-rausch-200 bg-rausch-50 p-4 text-center dark:border-rausch-500/30 dark:bg-rausch-500/10"
              key={badge.id}
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rausch-100 dark:bg-rausch-500/20">
                <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={IconComponent} />
              </div>
              <h5 className={cn("font-semibold text-foreground text-sm", geistSans.className)}>
                {badge.name}
              </h5>
              <p className="mt-0.5 text-muted-foreground text-xs">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Trust Badge (for inline display)
// ============================================================================

export type TrustBadgeCompactProps = {
  type: "background_check" | "verified" | "top_rated";
  className?: string;
};

export function TrustBadgeCompact({ type, className }: TrustBadgeCompactProps) {
  const config = {
    background_check: {
      label: "Background Checked",
      icon: SecurityCheckIcon,
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30",
    },
    verified: {
      label: "ID Verified",
      icon: UserCheck01Icon,
      color: "text-babu-700 dark:text-babu-400",
      bgColor: "bg-babu-50 border-babu-200 dark:bg-babu-500/10 dark:border-babu-500/30",
    },
    top_rated: {
      label: "Top Rated",
      icon: StarIcon,
      color: "text-yellow-700 dark:text-yellow-400",
      bgColor: "bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30",
    },
  };

  const { label, icon, color, bgColor } = config[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-xs",
        bgColor,
        color,
        className
      )}
    >
      <HugeiconsIcon className="h-3.5 w-3.5" icon={icon} />
      {label}
    </span>
  );
}
