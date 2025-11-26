"use client";

/**
 * ProfessionalCard - Airbnb-Style Design
 *
 * Image-first card with hover elevation, heart icon overlay,
 * and clean typography. Follows Airbnb's listing card patterns.
 */

import { CheckmarkCircle01Icon, FlashIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import type { CardSize, DirectoryProfessional, VerificationLevel } from "../types";

// Lookup object for verification badge labels (Biome noNestedTernary fix)
const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  elite: "Elite verified",
  premium: "Premium verified",
  standard: "Background checked",
  basic: "Background checked",
  unverified: "Background checked",
};

type ProfessionalCardProps = {
  professional: DirectoryProfessional;
  size?: CardSize;
  variant?: "default" | "compact";
  className?: string;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
};

/**
 * Format rating display - Airbnb style
 */
function formatRating(rating: number | null): string {
  if (!rating) {
    return "New";
  }
  return rating.toFixed(1);
}

/**
 * Check if professional is a "Guest Favorite" (high rating + reviews)
 */
function isGuestFavorite(rating: number | null, reviews: number): boolean {
  return rating !== null && rating >= 4.8 && reviews >= 10;
}

export function ProfessionalCard({
  professional,
  size = "md",
  variant = "default",
  className,
  onFavorite,
  isFavorite = false,
}: ProfessionalCardProps) {
  const guestFavorite = isGuestFavorite(professional.averageRating, professional.totalReviews);

  // Compact variant for map popups
  if (variant === "compact") {
    return (
      <article className={cn("flex gap-3 p-3", className)}>
        {/* Avatar */}
        <Link className="shrink-0" href={`/professionals/${professional.id}`}>
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {professional.avatarUrl ? (
              <Image
                alt={professional.name}
                className="object-cover"
                fill
                sizes="56px"
                src={professional.avatarUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-semibold text-lg text-neutral-400 dark:text-neutral-500">
                  {professional.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Link href={`/professionals/${professional.id}`}>
            <h3 className="truncate font-semibold text-neutral-900 text-sm hover:text-rausch-600 dark:text-neutral-50 dark:hover:text-rausch-400">
              {professional.name}
            </h3>
          </Link>

          {/* Rating + Reviews - Airbnb inline style */}
          <div className="mt-0.5 flex items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-3.5 w-3.5",
                professional.averageRating
                  ? "text-neutral-900 dark:text-neutral-50"
                  : "text-neutral-300 dark:text-neutral-600"
              )}
              icon={StarIcon}
            />
            <span className="font-medium text-neutral-900 text-sm dark:text-neutral-50">
              {formatRating(professional.averageRating)}
            </span>
            {professional.totalReviews > 0 && (
              <span className="text-neutral-500 text-sm dark:text-neutral-400">
                ({professional.totalReviews})
              </span>
            )}
          </div>

          {/* Service + Location */}
          <div className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
            {professional.primaryService}
            {professional.locationLabel && ` · ${professional.locationLabel}`}
          </div>

          {/* Price */}
          {professional.hourlyRateCents && (
            <p className="mt-1.5 text-neutral-900 text-sm dark:text-neutral-50">
              <span className="font-semibold">
                {formatCurrency(professional.hourlyRateCents / 100, {
                  currency: professional.currency,
                  locale: "es-CO",
                })}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400"> /hr</span>
            </p>
          )}
        </div>
      </article>
    );
  }

  // Default Airbnb-style card
  return (
    <article
      className={cn(
        "group relative w-full overflow-hidden rounded-xl",
        // Card container styling - soft border + shadow
        "border border-neutral-200 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]",
        // Hover effects
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        "hover:shadow-[0_6px_16px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]",
        "hover:border-neutral-300",
        // Dark mode
        "dark:border-border dark:bg-card",
        "dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        "dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        "dark:hover:border-neutral-600",
        className
      )}
    >
      {/* Image container - rounded top only since card has border */}
      <Link className="relative block overflow-hidden" href={`/professionals/${professional.id}`}>
        <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800">
          {professional.avatarUrl ? (
            <Image
              alt={professional.name}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={professional.avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
              <span className="font-semibold text-5xl text-neutral-400 dark:text-neutral-500">
                {professional.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Guest Favorite badge - Premium treatment */}
        {guestFavorite && (
          <div className="absolute top-3 left-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5",
                "bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03]",
                "dark:bg-neutral-900/95 dark:ring-white/[0.05]"
              )}
            >
              <HugeiconsIcon className="h-3.5 w-3.5 text-rausch-500" icon={StarIcon} />
              <span className="font-semibold text-neutral-900 text-xs dark:text-neutral-50">
                Guest favorite
              </span>
            </div>
          </div>
        )}

        {/* Available Today badge - Static clean design */}
        {professional.isAvailableToday && !guestFavorite && (
          <div className="absolute top-3 left-3">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5",
                "bg-white/95 shadow-[0_2px_6px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.03]",
                "dark:bg-neutral-900/95 dark:ring-white/[0.05]"
              )}
            >
              <HugeiconsIcon className="h-3.5 w-3.5 text-rausch-500" icon={FlashIcon} />
              <span className="font-medium text-neutral-900 text-xs dark:text-neutral-50">
                Available today
              </span>
            </div>
          </div>
        )}
      </Link>

      {/* Favorite button - top right over image */}
      {onFavorite && (
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={() => onFavorite(professional.id)}
            size="md"
          />
        </div>
      )}

      {/* Content inside card with padding */}
      <div className="p-3">
        {/* Row 1: Location + Rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-medium text-neutral-900 text-sm dark:text-neutral-50">
            <Link className="hover:underline" href={`/professionals/${professional.id}`}>
              {professional.name}
            </Link>
          </h3>

          {/* Rating - Airbnb inline style */}
          <div className="flex shrink-0 items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-3.5 w-3.5",
                professional.averageRating
                  ? "text-neutral-900 dark:text-neutral-50"
                  : "text-neutral-400 dark:text-neutral-500"
              )}
              icon={StarIcon}
            />
            <span className="text-neutral-900 text-sm dark:text-neutral-50">
              {formatRating(professional.averageRating)}
            </span>
            {professional.totalReviews > 0 && (
              <span className="text-neutral-500 text-sm dark:text-neutral-400">
                ({professional.totalReviews})
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Service type */}
        <p className="mt-0.5 text-neutral-500 text-sm dark:text-neutral-400">
          {professional.primaryService}
        </p>

        {/* Row 3: Location */}
        {professional.locationLabel && (
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            {professional.locationLabel}
          </p>
        )}

        {/* Row 4: Verification badges - minimal */}
        {(professional.verificationLevel === "elite" ||
          professional.verificationLevel === "premium" ||
          professional.isBackgroundChecked) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <HugeiconsIcon className="h-3.5 w-3.5 text-babu-500" icon={CheckmarkCircle01Icon} />
            <span className="text-neutral-500 dark:text-neutral-400">
              {VERIFICATION_LABELS[professional.verificationLevel]}
            </span>
          </div>
        )}

        {/* Row 5: Price - prominent */}
        {professional.hourlyRateCents && (
          <p className="mt-2 text-neutral-900 dark:text-neutral-50">
            <span className="font-semibold">
              {formatCurrency(professional.hourlyRateCents / 100, {
                currency: professional.currency,
                locale: "es-CO",
              })}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400"> /hr</span>
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Skeleton loader for ProfessionalCard - Airbnb style with shimmer
 */
export function ProfessionalCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl",
        "border border-neutral-200 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]",
        "dark:border-border dark:bg-card",
        "dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <div className="-translate-x-full absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
