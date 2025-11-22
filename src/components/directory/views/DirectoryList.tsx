"use client";

/**
 * DirectoryList - Lia Design System
 *
 * List layout for displaying professional cards (horizontal layout).
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
import type { DirectoryProfessional, VerificationLevel } from "../types";

interface DirectoryListProps {
  professionals: DirectoryProfessional[];
  isLoading?: boolean;
  className?: string;
}

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

function ProfessionalListItem({ professional }: { professional: DirectoryProfessional }) {
  const verificationBadge = getVerificationBadge(professional.verificationLevel);

  return (
    <article className="group flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-md sm:gap-6">
      {/* Image */}
      <Link
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32"
        href={`/professionals/${professional.id}`}
      >
        {professional.avatarUrl ? (
          <Image
            alt={professional.name}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="128px"
            src={professional.avatarUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-semibold text-3xl text-neutral-400">
              {professional.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Availability badge */}
        {professional.isAvailableToday && (
          <div className="absolute top-1 left-1">
            <Badge icon={FlashIcon} size="sm" variant="primary">
              Today
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        {/* Header row */}
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link className="group/name" href={`/professionals/${professional.id}`}>
              <h3 className="font-semibold text-neutral-900 transition-colors group-hover/name:text-orange-600">
                {professional.name}
              </h3>
            </Link>

            {/* Location */}
            <div className="mt-1 flex items-center gap-1.5 text-neutral-600 text-sm">
              <HugeiconsIcon className="h-4 w-4 shrink-0" icon={Location01Icon} />
              <span>{professional.locationLabel}</span>
            </div>
          </div>

          {/* Rating + Price (desktop) */}
          <div className="hidden flex-col items-end gap-1 sm:flex">
            <div className="flex items-center gap-1">
              <HugeiconsIcon
                className={cn(
                  "h-4 w-4",
                  professional.averageRating ? "text-orange-500" : "text-neutral-300"
                )}
                icon={StarIcon}
              />
              <span className="font-medium text-neutral-900">
                {professional.averageRating ? professional.averageRating.toFixed(1) : "New"}
              </span>
              {professional.totalReviews > 0 && (
                <span className="text-neutral-500 text-sm">({professional.totalReviews})</span>
              )}
            </div>

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
        </div>

        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-1.5">
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
          {professional.introVideoStatus === "approved" && (
            <Badge size="sm" variant="secondary">
              Video Intro
            </Badge>
          )}
        </div>

        {/* Bio preview */}
        {professional.bio && (
          <p className="mb-2 line-clamp-2 text-neutral-600 text-sm">{professional.bio}</p>
        )}

        {/* Footer - mobile price/rating */}
        <div className="mt-auto flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-1">
            <HugeiconsIcon
              className={cn(
                "h-4 w-4",
                professional.averageRating ? "text-orange-500" : "text-neutral-300"
              )}
              icon={StarIcon}
            />
            <span className="font-medium text-neutral-900 text-sm">
              {professional.averageRating ? professional.averageRating.toFixed(1) : "New"}
            </span>
          </div>

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

        {/* Experience & Languages - desktop only */}
        <div className="mt-auto hidden items-center gap-4 border-neutral-100 border-t pt-2 sm:flex">
          {professional.experienceYears && professional.experienceYears > 0 && (
            <span className="text-neutral-600 text-sm">
              {professional.experienceYears}+ years experience
            </span>
          )}
          {professional.languages.length > 0 && (
            <div className="flex items-center gap-1">
              {professional.languages.slice(0, 3).map((lang) => (
                <span
                  className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600 text-xs"
                  key={lang}
                >
                  {lang}
                </span>
              ))}
              {professional.languages.length > 3 && (
                <span className="text-neutral-500 text-xs">
                  +{professional.languages.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ProfessionalListSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:gap-6">
      <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-neutral-200 sm:h-32 sm:w-32" />
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="hidden sm:block">
            <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
            <div className="mt-1 h-5 w-20 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
        <div className="mb-2 flex gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export function DirectoryList({ professionals, isLoading = false, className }: DirectoryListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ProfessionalListSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {professionals.map((professional) => (
        <ProfessionalListItem key={professional.id} professional={professional} />
      ))}
    </div>
  );
}
