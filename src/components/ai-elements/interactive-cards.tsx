"use client";

/**
 * Interactive Cards - AI Assistant Embedded Content
 *
 * Rich cards displayed inline within AI responses:
 * - Professional recommendation cards
 * - Booking suggestion cards
 * - Service action cards
 * - Quick action buttons
 *
 * Inspired by Airbnb's 2025 AI concierge patterns.
 *
 * Following Lia Design System.
 */

import { Calendar03Icon, CheckmarkCircle02Icon, Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { formatCurrency, type Currency } from "@/lib/utils/format";

// ============================================================================
// Card Container
// ============================================================================

type CardContainerProps = {
  children: ReactNode;
  className?: string;
};

export function CardContainer({ children, className }: CardContainerProps) {
  return (
    <div className={cn("mt-3 space-y-3", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Professional Recommendation Card
// ============================================================================

export type ProfessionalRecommendation = {
  id: string;
  name: string;
  avatar?: string;
  service: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency: Currency;
  verified?: boolean;
  matchScore?: number;
  availability?: string;
  distance?: string;
};

type ProfessionalCardProps = {
  professional: ProfessionalRecommendation;
  onBook?: (professionalId: string) => void;
  onViewProfile?: (professionalId: string) => void;
  variant?: "compact" | "default";
};

export function ProfessionalCard({
  professional,
  onBook,
  onViewProfile,
  variant = "default",
}: ProfessionalCardProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-sm",
        isCompact ? "flex items-center gap-3 p-3" : "p-4"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "relative flex-shrink-0 overflow-hidden rounded-lg",
          isCompact ? "h-12 w-12" : "mb-3 h-20 w-20"
        )}
      >
        {professional.avatar ? (
          <Image
            alt={professional.name}
            className="object-cover"
            fill
            sizes="80px"
            src={professional.avatar}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <span className="font-bold text-orange-600 text-xl">
              {professional.name.charAt(0)}
            </span>
          </div>
        )}
        {professional.verified && (
          <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
            <HugeiconsIcon className="h-3 w-3 text-green-500" icon={CheckmarkCircle02Icon} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1", isCompact ? "min-w-0" : "")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className={cn("truncate font-semibold text-neutral-900", geistSans.className)}>
              {professional.name}
            </h4>
            <p className={cn("truncate text-neutral-500 text-sm", geistSans.className)}>
              {professional.service}
            </p>
          </div>

          {/* Match Score */}
          {professional.matchScore !== undefined && (
            <Badge className="flex-shrink-0 border-green-200 bg-green-50 text-green-700" size="sm">
              {professional.matchScore}% match
            </Badge>
          )}
        </div>

        {/* Rating & Price */}
        <div className={cn("flex items-center gap-3", isCompact ? "mt-1" : "mt-2")}>
          <div className="flex items-center gap-1">
            <HugeiconsIcon className="h-4 w-4 fill-orange-500 text-orange-500" icon={StarIcon} />
            <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
              {professional.rating.toFixed(1)}
            </span>
            <span className={cn("text-neutral-400 text-xs", geistSans.className)}>
              ({professional.reviewCount})
            </span>
          </div>
          <span className="text-neutral-300">·</span>
          <span className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {formatCurrency(professional.hourlyRate, professional.currency)}/hr
          </span>
        </div>

        {/* Availability & Distance */}
        {!isCompact && (professional.availability || professional.distance) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {professional.availability && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon className="h-3 w-3" icon={Clock01Icon} />
                {professional.availability}
              </span>
            )}
            {professional.distance && (
              <span>· {professional.distance} away</span>
            )}
          </div>
        )}

        {/* Actions */}
        {!isCompact && (
          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => onBook?.(professional.id)}
              size="sm"
            >
              Book Now
            </Button>
            <Button
              onClick={() => onViewProfile?.(professional.id)}
              size="sm"
              variant="outline"
            >
              View Profile
            </Button>
          </div>
        )}
      </div>

      {/* Compact Actions */}
      {isCompact && (
        <Button
          className="flex-shrink-0"
          onClick={() => onBook?.(professional.id)}
          size="sm"
        >
          Book
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Booking Suggestion Card
// ============================================================================

export type BookingSuggestion = {
  id: string;
  professionalName: string;
  professionalAvatar?: string;
  service: string;
  suggestedDate: string;
  suggestedTime: string;
  duration: string;
  estimatedPrice: number;
  currency: Currency;
  reason?: string;
};

type BookingSuggestionCardProps = {
  booking: BookingSuggestion;
  onConfirm?: (bookingId: string) => void;
  onModify?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
};

export function BookingSuggestionCard({
  booking,
  onConfirm,
  onModify,
  onDecline,
}: BookingSuggestionCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-blue-200 bg-blue-50/50">
      {/* Header */}
      <div className="border-blue-100 border-b bg-blue-50 px-4 py-2">
        <p className={cn("font-medium text-blue-700 text-sm", geistSans.className)}>
          Suggested Booking
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
            {booking.professionalAvatar ? (
              <Image
                alt={booking.professionalName}
                className="object-cover"
                fill
                sizes="40px"
                src={booking.professionalAvatar}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="font-bold text-blue-600">
                  {booking.professionalName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h4 className={cn("font-semibold text-neutral-900", geistSans.className)}>
              {booking.service}
            </h4>
            <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
              with {booking.professionalName}
            </p>
          </div>
        </div>

        {/* Date/Time */}
        <div className="mt-3 flex items-center gap-4 rounded-lg bg-white px-3 py-2">
          <div className="flex items-center gap-2 text-neutral-600">
            <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
            <span className={cn("text-sm", geistSans.className)}>{booking.suggestedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span className={cn("text-sm", geistSans.className)}>
              {booking.suggestedTime} ({booking.duration})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className={cn("text-neutral-600 text-sm", geistSans.className)}>
            Estimated total
          </span>
          <span className={cn("font-semibold text-neutral-900", geistSans.className)}>
            {formatCurrency(booking.estimatedPrice, booking.currency)}
          </span>
        </div>

        {/* Reason */}
        {booking.reason && (
          <p className={cn("mt-2 text-neutral-500 text-xs", geistSans.className)}>
            {booking.reason}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => onConfirm?.(booking.id)} size="sm">
            Confirm Booking
          </Button>
          <Button onClick={() => onModify?.(booking.id)} size="sm" variant="outline">
            Modify
          </Button>
          <Button
            className="text-neutral-500 hover:text-neutral-700"
            onClick={() => onDecline?.(booking.id)}
            size="sm"
            variant="ghost"
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Service Action Card
// ============================================================================

export type ServiceAction = {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel: string;
  href?: string;
};

type ServiceActionCardProps = {
  action: ServiceAction;
  onAction?: (actionId: string) => void;
};

export function ServiceActionCard({ action, onAction }: ServiceActionCardProps) {
  const content = (
    <div className="group flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-sm">
      {/* Icon */}
      {action.icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
          {action.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-neutral-900", geistSans.className)}>
          {action.title}
        </h4>
        <p className={cn("text-neutral-500 text-sm", geistSans.className)}>
          {action.description}
        </p>
      </div>

      {/* Action Button */}
      <Button
        className="flex-shrink-0"
        onClick={(e) => {
          if (!action.href) {
            e.preventDefault();
            onAction?.(action.id);
          }
        }}
        size="sm"
        variant="outline"
      >
        {action.actionLabel}
      </Button>
    </div>
  );

  if (action.href) {
    return <Link href={action.href}>{content}</Link>;
  }

  return content;
}

// ============================================================================
// Quick Actions
// ============================================================================

type QuickActionsProps = {
  children: ReactNode;
  className?: string;
};

export function QuickActions({ children, className }: QuickActionsProps) {
  return (
    <div className={cn("mt-3 flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}

type QuickActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export function QuickAction({ icon, children, className, ...props }: QuickActionProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 text-sm transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 active:scale-95",
        geistSans.className,
        className
      )}
      type="button"
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================================
// Carousel for Multiple Cards
// ============================================================================

type CardCarouselProps = {
  children: ReactNode;
  className?: string;
};

export function CardCarousel({ children, className }: CardCarouselProps) {
  return (
    <div className={cn("mt-3 -mx-4 px-4", className)}>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {children}
      </div>
    </div>
  );
}

type CardCarouselItemProps = {
  children: ReactNode;
  className?: string;
  width?: string;
};

export function CardCarouselItem({ children, className, width = "280px" }: CardCarouselItemProps) {
  return (
    <div
      className={cn("flex-shrink-0 snap-start", className)}
      style={{ width }}
    >
      {children}
    </div>
  );
}
