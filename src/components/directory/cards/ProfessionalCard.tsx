"use client";

/**
 * ProfessionalCard - Lia Design System
 *
 * Card component for displaying professional profiles in the directory.
 * Uses Anthropic rounded corners, orange accents, and neutral backgrounds.
 */

import {
  CheckmarkCircle01Icon,
  FlashIcon,
  Location01Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import type { CardSize, DirectoryProfessional, VerificationLevel } from "../types";

type ProfessionalCardProps = {
  professional: DirectoryProfessional;
  size?: CardSize;
  variant?: "default" | "compact";
  className?: string;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
};

/**
 * Get verification badge variant based on level
 */
function getVerificationBadge(level: VerificationLevel): {
  label: string;
  variant: "primary" | "secondary" | "default";
} | null {
  switch (level) {
    case "elite":
      return { label: "Elite Verified", variant: "primary" };
    case "premium":
      return { label: "Premium", variant: "primary" };
    case "standard":
      return { label: "Verified", variant: "secondary" };
    case "basic":
      return { label: "Basic", variant: "default" };
    default:
      return null;
  }
}

/**
 * Format rating display
 */
function formatRating(rating: number | null): string {
  if (!rating) {
    return "New";
  }
  return rating.toFixed(1);
}

export function ProfessionalCard({
  professional,
  size = "md",
  variant = "default",
  className,
  onFavorite,
  isFavorite = false,
}: ProfessionalCardProps) {
  const verificationBadge = getVerificationBadge(professional.verificationLevel);

  const cardSizes = {
    sm: "max-w-[240px]",
    md: "max-w-[300px]",
    lg: "max-w-[360px]",
  };

  const imageSizes = {
    sm: "h-32",
    md: "h-40",
    lg: "h-48",
  };

  // Compact variant for map popups
  if (variant === "compact") {
    return (
      <article className={cn("flex gap-3 p-3", className)}>
        {/* Avatar */}
        <Link className="shrink-0" href={`/professionals/${professional.id}`}>
          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-neutral-100">
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

          {/* Rating + Reviews */}
          <div className="mt-0.5 flex items-center gap-1.5">
            <HugeiconsIcon
              className={cn(
                "h-3.5 w-3.5",
                professional.averageRating ? "text-orange-500" : "text-neutral-300"
              )}
              icon={StarIcon}
            />
            <span className="font-medium text-neutral-900 text-sm">
              {formatRating(professional.averageRating)}
            </span>
            {professional.totalReviews > 0 && (
              <span className="text-neutral-500 text-xs">({professional.totalReviews})</span>
            )}
          </div>

          {/* Service + Location */}
          <div className="mt-1 flex items-center gap-2 text-neutral-600 text-xs">
            {professional.primaryService && (
              <span className="truncate">{professional.primaryService}</span>
            )}
            {professional.primaryService && professional.locationLabel && <span>•</span>}
            {professional.locationLabel && (
              <span className="truncate">{professional.locationLabel}</span>
            )}
          </div>

          {/* Price */}
          {professional.hourlyRateCents && (
            <p className="mt-1 font-semibold text-neutral-900 text-sm">
              {formatCurrency(professional.hourlyRateCents / 100, {
                currency: professional.currency,
                locale: "es-CO",
              })}
              <span className="font-normal text-neutral-500">/hr</span>
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:border-orange-200 hover:shadow-md",
        cardSizes[size],
        className
      )}
    >
      {/* Image section */}
      <Link className="relative block overflow-hidden" href={`/professionals/${professional.id}`}>
        <div className={cn("relative w-full bg-neutral-100", imageSizes[size])}>
          {professional.avatarUrl ? (
            <Image
              alt={professional.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              src={professional.avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <span className="font-semibold text-4xl text-neutral-400">
                {professional.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Availability badge */}
        {professional.isAvailableToday && (
          <div className="absolute top-2 left-2">
            <Badge icon={FlashIcon} size="sm" variant="primary">
              Available Today
            </Badge>
          </div>
        )}

        {/* Video intro indicator */}
        {professional.introVideoStatus === "approved" && (
          <div className="absolute bottom-2 left-2">
            <Badge size="sm" variant="secondary">
              Video Intro
            </Badge>
          </div>
        )}
      </Link>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Header row: Name + Rating */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link className="group/name flex-1" href={`/professionals/${professional.id}`}>
            <h3 className="line-clamp-1 font-semibold text-neutral-900 transition-colors group-hover/name:text-orange-600">
              {professional.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex shrink-0 items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-4 w-4",
                professional.averageRating ? "text-orange-500" : "text-neutral-300"
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
        </div>

        {/* Service & verification badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {professional.primaryService && (
            <Badge size="sm" variant="default">
              {professional.primaryService}
            </Badge>
          )}
          {verificationBadge && (
            <Badge icon={Shield01Icon} size="sm" variant={verificationBadge.variant}>
              {verificationBadge.label}
            </Badge>
          )}
          {professional.isBackgroundChecked && (
            <Badge icon={CheckmarkCircle01Icon} size="sm" variant="secondary">
              Background Checked
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-neutral-600 text-sm">
          <HugeiconsIcon className="h-4 w-4 shrink-0" icon={Location01Icon} />
          <span className="line-clamp-1">{professional.locationLabel}</span>
        </div>

        {/* Bio preview */}
        {professional.bio && (
          <p className="mb-3 line-clamp-2 text-neutral-600 text-sm">{professional.bio}</p>
        )}

        {/* Footer: Price + Experience */}
        <div className="mt-auto flex items-center justify-between border-neutral-100 border-t pt-3">
          <div>
            {professional.hourlyRateCents && (
              <p className="font-semibold text-neutral-900">
                {formatCurrency(professional.hourlyRateCents / 100, {
                  currency: professional.currency,
                  locale: "es-CO",
                })}
                <span className="font-normal text-neutral-500 text-sm">/hr</span>
              </p>
            )}
          </div>

          {professional.experienceYears && professional.experienceYears > 0 && (
            <p className="text-neutral-600 text-sm">{professional.experienceYears}+ years exp.</p>
          )}
        </div>

        {/* Languages */}
        {professional.languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {professional.languages.slice(0, 3).map((lang) => (
              <span
                className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600 text-xs"
                key={lang}
              >
                {lang}
              </span>
            ))}
            {professional.languages.length > 3 && (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600 text-xs">
                +{professional.languages.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Skeleton loader for ProfessionalCard
 */
export function ProfessionalCardSkeleton({
  size = "md",
  className,
}: {
  size?: CardSize;
  className?: string;
}) {
  const cardSizes = {
    sm: "max-w-[240px]",
    md: "max-w-[300px]",
    lg: "max-w-[360px]",
  };

  const imageSizes = {
    sm: "h-32",
    md: "h-40",
    lg: "h-48",
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white",
        cardSizes[size],
        className
      )}
    >
      <div className={cn("w-full animate-pulse bg-neutral-200", imageSizes[size])} />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="mb-3 flex gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
        </div>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-neutral-200" />
        <div className="mb-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="flex items-center justify-between border-neutral-100 border-t pt-3">
          <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
