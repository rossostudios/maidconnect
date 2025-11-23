"use client";

/**
 * Social Profile Components - Public Profile & Social Features
 *
 * Airbnb-inspired social profile elements:
 * - Public profile header with sharing
 * - Stats and badges display
 * - Reviews showcase
 * - Activity feed
 * - Share modal
 *
 * Following Lia Design System.
 */

import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  Facebook01Icon,
  Link01Icon,
  Mail01Icon,
  MoreHorizontalIcon,
  Share01Icon,
  StarIcon,
  TwitterIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Types
// ============================================================================

export type SocialProfile = {
  id: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  memberSince: string;
  verified: boolean;
  responseRate?: number;
  responseTime?: string;
  profileUrl: string;
};

export type ProfileStats = {
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  yearsActive: number;
  repeatCustomerRate?: number;
};

export type ProfileBadge = {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: "orange" | "blue" | "green" | "neutral";
};

export type ProfileReview = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date: string;
  serviceType?: string;
};

export type ActivityItem = {
  id: string;
  type: "booking" | "review" | "badge" | "milestone";
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
};

// ============================================================================
// Profile Header
// ============================================================================

type ProfileHeaderProps = {
  profile: SocialProfile;
  stats: ProfileStats;
  badges?: ProfileBadge[];
  isOwn?: boolean;
  onShare?: () => void;
  onEdit?: () => void;
  className?: string;
};

export function ProfileHeader({
  profile,
  stats,
  badges = [],
  isOwn = false,
  onShare,
  onEdit,
  className,
}: ProfileHeaderProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-neutral-200 bg-white", className)}>
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-orange-100 to-orange-50 md:h-48">
        {profile.coverImage && (
          <Image
            alt="Cover"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            src={profile.coverImage}
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 md:px-6 md:pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4 flex items-end justify-between md:-mt-16">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-sm md:h-32 md:w-32">
              {profile.avatar ? (
                <Image
                  alt={profile.name}
                  className="object-cover"
                  fill
                  sizes="128px"
                  src={profile.avatar}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <HugeiconsIcon className="h-12 w-12 text-orange-600" icon={UserIcon} />
                </div>
              )}
            </div>
            {profile.verified && (
              <div className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                <HugeiconsIcon className="h-5 w-5 text-green-500" icon={CheckmarkCircle02Icon} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isOwn ? (
              <Button onClick={onEdit} size="sm" variant="outline">
                Edit Profile
              </Button>
            ) : (
              <Button onClick={onShare} size="sm" variant="outline">
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={Share01Icon} />
                Share
              </Button>
            )}
          </div>
        </div>

        {/* Name & Location */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className={cn("font-bold text-2xl text-neutral-900", geistSans.className)}>
              {profile.name}
            </h1>
            {profile.verified && (
              <Badge className="border-green-200 bg-green-50 text-green-700" size="sm">
                Verified
              </Badge>
            )}
          </div>
          {profile.location && (
            <p className={cn("mt-1 text-neutral-500", geistSans.className)}>{profile.location}</p>
          )}
          {profile.bio && (
            <p className={cn("mt-3 text-neutral-700 line-clamp-3", geistSans.className)}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Reviews" value={stats.totalReviews.toString()} />
          <StatCard
            icon={<HugeiconsIcon className="h-4 w-4 fill-orange-500 text-orange-500" icon={StarIcon} />}
            label="Rating"
            value={stats.averageRating.toFixed(1)}
          />
          <StatCard label="Bookings" value={stats.totalBookings.toString()} />
          <StatCard label="Years Active" value={stats.yearsActive.toString()} />
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <ProfileBadgeChip badge={badge} key={badge.id} />
            ))}
          </div>
        )}

        {/* Response Info */}
        {(profile.responseRate || profile.responseTime) && (
          <div className="mt-4 flex flex-wrap gap-4 border-neutral-100 border-t pt-4 text-sm text-neutral-500">
            {profile.responseRate && (
              <span>
                <strong className="text-neutral-900">{profile.responseRate}%</strong> response rate
              </span>
            )}
            {profile.responseTime && (
              <span>
                Responds in <strong className="text-neutral-900">{profile.responseTime}</strong>
              </span>
            )}
            <span>
              Member since <strong className="text-neutral-900">{profile.memberSince}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card
// ============================================================================

type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3 text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className={cn("font-bold text-neutral-900 text-xl", geistSans.className)}>{value}</span>
      </div>
      <span className={cn("text-neutral-500 text-xs", geistSans.className)}>{label}</span>
    </div>
  );
}

// ============================================================================
// Profile Badge Chip
// ============================================================================

type ProfileBadgeChipProps = {
  badge: ProfileBadge;
};

function ProfileBadgeChip({ badge }: ProfileBadgeChipProps) {
  const colorStyles = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        colorStyles[badge.color || "neutral"],
        geistSans.className
      )}
      title={badge.description}
    >
      {badge.icon}
      <span className="font-medium text-sm">{badge.label}</span>
    </div>
  );
}

// ============================================================================
// Reviews Showcase
// ============================================================================

type ReviewsShowcaseProps = {
  reviews: ProfileReview[];
  totalCount: number;
  averageRating: number;
  onViewAll?: () => void;
  className?: string;
};

export function ReviewsShowcase({
  reviews,
  totalCount,
  averageRating,
  onViewAll,
  className,
}: ReviewsShowcaseProps) {
  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-4 md:p-6", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 fill-orange-500 text-orange-500" icon={StarIcon} />
          <span className={cn("font-bold text-neutral-900 text-xl", geistSans.className)}>
            {averageRating.toFixed(1)}
          </span>
          <span className={cn("text-neutral-500", geistSans.className)}>
            · {totalCount} reviews
          </span>
        </div>
        {totalCount > reviews.length && (
          <Button onClick={onViewAll} size="sm" variant="ghost">
            View all
          </Button>
        )}
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Review Card
// ============================================================================

type ReviewCardProps = {
  review: ProfileReview;
};

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-neutral-100 border-b pb-4 last:border-0 last:pb-0">
      {/* Author */}
      <div className="mb-2 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-100">
          {review.authorAvatar ? (
            <Image
              alt={review.authorName}
              className="object-cover"
              fill
              sizes="40px"
              src={review.authorAvatar}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <span className="font-bold text-neutral-500 text-sm">
                {review.authorName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {review.authorName}
          </p>
          <p className={cn("text-neutral-500 text-xs", geistSans.className)}>{review.date}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <HugeiconsIcon
            className={cn(
              "h-4 w-4",
              i < review.rating ? "fill-orange-500 text-orange-500" : "text-neutral-200"
            )}
            icon={StarIcon}
            key={i}
          />
        ))}
        {review.serviceType && (
          <span className={cn("ml-2 text-neutral-400 text-xs", geistSans.className)}>
            · {review.serviceType}
          </span>
        )}
      </div>

      {/* Text */}
      <p className={cn("text-neutral-700 text-sm line-clamp-3", geistSans.className)}>
        {review.text}
      </p>
    </div>
  );
}

// ============================================================================
// Activity Feed
// ============================================================================

type ActivityFeedProps = {
  activities: ActivityItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
};

export function ActivityFeed({
  activities,
  onLoadMore,
  hasMore = false,
  className,
}: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-600";
      case "review":
        return "bg-orange-100 text-orange-600";
      case "badge":
        return "bg-green-100 text-green-600";
      case "milestone":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-4 md:p-6", className)}>
      <h3 className={cn("mb-4 font-semibold text-neutral-900 text-lg", geistSans.className)}>
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div className="flex gap-3" key={activity.id}>
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  getActivityIcon(activity.type)
                )}
              >
                {activity.icon || <div className="h-2 w-2 rounded-full bg-current" />}
              </div>
              {index < activities.length - 1 && <div className="my-1 h-full w-0.5 bg-neutral-100" />}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pb-4">
              <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                {activity.title}
              </p>
              {activity.description && (
                <p className={cn("mt-0.5 text-neutral-500 text-xs", geistSans.className)}>
                  {activity.description}
                </p>
              )}
              <span className={cn("mt-1 text-neutral-400 text-xs", geistSans.className)}>
                {activity.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button className="mt-4 w-full" onClick={onLoadMore} variant="outline">
          Load More
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Share Profile Modal
// ============================================================================

type ShareProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  profileName: string;
};

export function ShareProfileModal({
  isOpen,
  onClose,
  profileUrl,
  profileName,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profileUrl]);

  const shareOptions = [
    {
      id: "copy",
      label: "Copy Link",
      icon: Copy01Icon,
      onClick: handleCopyLink,
    },
    {
      id: "email",
      label: "Email",
      icon: Mail01Icon,
      href: `mailto:?subject=Check out ${profileName} on Casaora&body=${encodeURIComponent(profileUrl)}`,
    },
    {
      id: "twitter",
      label: "Twitter",
      icon: TwitterIcon,
      href: `https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(profileName)} on Casaora&url=${encodeURIComponent(profileUrl)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook01Icon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className={cn("mb-4 font-semibold text-neutral-900 text-lg", geistSans.className)}>
          Share Profile
        </h3>

        {/* URL Preview */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
          <HugeiconsIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" icon={Link01Icon} />
          <span className={cn("flex-1 truncate text-neutral-700 text-sm", geistSans.className)}>
            {profileUrl}
          </span>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-2">
          {shareOptions.map((option) =>
            option.href ? (
              <a
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-neutral-700 transition-colors hover:border-orange-300 hover:bg-orange-50"
                href={option.href}
                key={option.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <HugeiconsIcon className="h-5 w-5" icon={option.icon} />
                <span className={cn("font-medium text-sm", geistSans.className)}>
                  {option.label}
                </span>
              </a>
            ) : (
              <button
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-neutral-700 transition-colors hover:border-orange-300 hover:bg-orange-50"
                key={option.id}
                onClick={option.onClick}
                type="button"
              >
                <HugeiconsIcon
                  className={cn("h-5 w-5", copied && option.id === "copy" && "text-green-500")}
                  icon={copied && option.id === "copy" ? CheckmarkCircle02Icon : option.icon}
                />
                <span className={cn("font-medium text-sm", geistSans.className)}>
                  {copied && option.id === "copy" ? "Copied!" : option.label}
                </span>
              </button>
            )
          )}
        </div>

        {/* Close button */}
        <Button className="mt-4 w-full" onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Profile Card (Compact for listings)
// ============================================================================

type ProfileCardProps = {
  profile: SocialProfile;
  stats: ProfileStats;
  onViewProfile?: (profileId: string) => void;
  className?: string;
};

export function ProfileCard({ profile, stats, onViewProfile, className }: ProfileCardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-sm",
        className
      )}
    >
      {/* Avatar & Basic Info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
            {profile.avatar ? (
              <Image
                alt={profile.name}
                className="object-cover"
                fill
                sizes="48px"
                src={profile.avatar}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <span className="font-bold text-orange-600 text-lg">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
            {profile.verified && (
              <div className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                <HugeiconsIcon className="h-3 w-3 text-green-500" icon={CheckmarkCircle02Icon} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className={cn("truncate font-semibold text-neutral-900", geistSans.className)}>
              {profile.name}
            </h4>
            {profile.location && (
              <p className={cn("truncate text-neutral-500 text-sm", geistSans.className)}>
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <HugeiconsIcon className="h-4 w-4 fill-orange-500 text-orange-500" icon={StarIcon} />
            <span className={cn("font-medium text-neutral-900", geistSans.className)}>
              {stats.averageRating.toFixed(1)}
            </span>
            <span className={cn("text-neutral-400", geistSans.className)}>
              ({stats.totalReviews})
            </span>
          </div>
          <span className="text-neutral-300">·</span>
          <span className={cn("text-neutral-500", geistSans.className)}>
            {stats.totalBookings} bookings
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="border-neutral-100 border-t px-4 py-3">
        <Button
          className="w-full"
          onClick={() => onViewProfile?.(profile.id)}
          size="sm"
          variant="outline"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}
