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
import type { CardSize, DirectoryProfessional } from "../types";

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
  if (!rating) return "New";
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
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
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
                <span className="font-semibold text-lg text-neutral-400">
                  {professional.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Link href={`/professionals/${professional.id}`}>
            <h3 className="truncate font-semibold text-neutral-900 hover:text-orange-600">
              {professional.name}
            </h3>
          </Link>

          {/* Rating + Reviews - Airbnb inline style */}
          <div className="mt-0.5 flex items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-3.5 w-3.5",
                professional.averageRating ? "text-neutral-900" : "text-neutral-300"
              )}
              icon={StarIcon}
            />
            <span className="font-medium text-neutral-900 text-sm">
              {formatRating(professional.averageRating)}
            </span>
            {professional.totalReviews > 0 && (
              <span className="text-neutral-500 text-sm">({professional.totalReviews})</span>
            )}
          </div>

          {/* Service + Location */}
          <div className="mt-1 text-neutral-500 text-xs">
            {professional.primaryService}
            {professional.locationLabel && ` · ${professional.locationLabel}`}
          </div>

          {/* Price */}
          {professional.hourlyRateCents && (
            <p className="mt-1.5 text-neutral-900 text-sm">
              <span className="font-semibold">
                {formatCurrency(professional.hourlyRateCents / 100, {
                  currency: professional.currency,
                  locale: "es-CO",
                })}
              </span>
              <span className="text-neutral-500"> /hr</span>
            </p>
          )}
        </div>
      </article>
    );
  }

  // Default Airbnb-style card
  return (
    <article className={cn("group relative w-full", className)}>
      {/* Image container with aspect ratio */}
      <Link
        className="relative block overflow-hidden rounded-xl"
        href={`/professionals/${professional.id}`}
      >
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          {professional.avatarUrl ? (
            <Image
              alt={professional.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={professional.avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <span className="font-semibold text-5xl text-neutral-400">
                {professional.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Guest Favorite badge - Airbnb style ribbon */}
        {guestFavorite && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-neutral-900 text-xs shadow-md">
              <span>Guest favorite</span>
            </div>
          </div>
        )}

        {/* Available Today badge */}
        {professional.isAvailableToday && !guestFavorite && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs shadow-md">
              <HugeiconsIcon className="h-3.5 w-3.5 text-orange-500" icon={FlashIcon} />
              <span className="font-medium text-neutral-900">Available today</span>
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

      {/* Content below image */}
      <div className="mt-3">
        {/* Row 1: Location + Rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-medium text-neutral-900">
            <Link className="hover:underline" href={`/professionals/${professional.id}`}>
              {professional.name}
            </Link>
          </h3>

          {/* Rating - Airbnb inline style */}
          <div className="flex shrink-0 items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-3.5 w-3.5",
                professional.averageRating ? "text-neutral-900" : "text-neutral-400"
              )}
              icon={StarIcon}
            />
            <span className="text-neutral-900 text-sm">
              {formatRating(professional.averageRating)}
            </span>
            {professional.totalReviews > 0 && (
              <span className="text-neutral-500 text-sm">({professional.totalReviews})</span>
            )}
          </div>
        </div>

        {/* Row 2: Service type */}
        <p className="mt-0.5 text-neutral-500 text-sm">{professional.primaryService}</p>

        {/* Row 3: Location */}
        {professional.locationLabel && (
          <p className="text-neutral-500 text-sm">{professional.locationLabel}</p>
        )}

        {/* Row 4: Verification badges - minimal */}
        {(professional.verificationLevel === "elite" ||
          professional.verificationLevel === "premium" ||
          professional.isBackgroundChecked) && (
          <div className="mt-1 flex items-center gap-1.5 text-neutral-500 text-xs">
            <HugeiconsIcon className="h-3.5 w-3.5" icon={CheckmarkCircle01Icon} />
            <span>
              {professional.verificationLevel === "elite"
                ? "Elite verified"
                : professional.verificationLevel === "premium"
                  ? "Premium verified"
                  : "Background checked"}
            </span>
          </div>
        )}

        {/* Row 5: Price - prominent */}
        {professional.hourlyRateCents && (
          <p className="mt-2 text-neutral-900">
            <span className="font-semibold">
              {formatCurrency(professional.hourlyRateCents / 100, {
                currency: professional.currency,
                locale: "es-CO",
              })}
            </span>
            <span className="text-neutral-500"> /hr</span>
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
    <div className={cn("w-full", className)}>
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-200">
        <div className="-translate-x-full absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Content skeleton */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-12 rounded bg-neutral-200" />
        </div>
        <div className="h-3.5 w-24 rounded bg-neutral-200" />
        <div className="h-3.5 w-20 rounded bg-neutral-200" />
        <div className="h-5 w-16 rounded bg-neutral-200" />
      </div>
    </div>
  );
}
