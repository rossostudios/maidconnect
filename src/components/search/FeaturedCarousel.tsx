/**
 * FeaturedCarousel - Airbnb-Inspired Featured Professionals
 *
 * Horizontal scrollable carousel for featured content:
 * - Professional cards with ratings
 * - Service highlight cards
 * - Premium badge indicators
 *
 * Inspired by Airbnb's 2025 featured listings carousel.
 *
 * Following Lia Design System.
 */

"use client";

import { ArrowRight01Icon, CheckmarkCircle02Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { formatCurrency, type Currency } from "@/lib/utils/format";
import { CarouselItem, FlexibleCarousel } from "./FlexibleCarousel";

export type FeaturedProfessional = {
  id: string;
  name: string;
  avatar?: string;
  service: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency: Currency;
  verified?: boolean;
  featured?: boolean;
  badge?: string;
  location?: string;
};

type FeaturedCarouselProps = {
  title?: string;
  subtitle?: string;
  professionals: FeaturedProfessional[];
  className?: string;
  cardVariant?: "default" | "compact" | "expanded";
};

export function FeaturedCarousel({
  title = "Featured Professionals",
  subtitle,
  professionals,
  className,
  cardVariant = "default",
}: FeaturedCarouselProps) {
  if (professionals.length === 0) return null;

  return (
    <FlexibleCarousel
      className={className}
      showViewAll
      subtitle={subtitle}
      title={title}
      viewAllHref="/professionals"
      viewAllLabel="See all"
    >
      {professionals.map((pro, index) => (
        <CarouselItem
          key={pro.id}
          minWidth={cardVariant === "compact" ? "200px" : cardVariant === "expanded" ? "320px" : "280px"}
        >
          <FeaturedProfessionalCard index={index} professional={pro} variant={cardVariant} />
        </CarouselItem>
      ))}
    </FlexibleCarousel>
  );
}

type FeaturedProfessionalCardProps = {
  professional: FeaturedProfessional;
  variant?: "default" | "compact" | "expanded";
  index?: number;
};

function FeaturedProfessionalCard({
  professional,
  variant = "default",
  index = 0,
}: FeaturedProfessionalCardProps) {
  const isCompact = variant === "compact";
  const isExpanded = variant === "expanded";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        className="group block rounded-lg border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md"
        href={`/professionals/${professional.id}`}
      >
        {/* Image Section */}
        <div className={cn("relative overflow-hidden rounded-t-lg", isCompact ? "h-32" : "h-40")}>
          {professional.avatar ? (
            <Image
              alt={professional.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              src={professional.avatar}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <span className={cn("font-bold text-orange-600", isCompact ? "text-3xl" : "text-4xl")}>
                {professional.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {professional.featured && (
            <Badge
              className="absolute top-3 left-3 border-orange-200 bg-orange-50 text-orange-600"
              size="sm"
            >
              Featured
            </Badge>
          )}

          {/* Custom Badge */}
          {professional.badge && !professional.featured && (
            <Badge
              className="absolute top-3 left-3 border-blue-200 bg-blue-50 text-blue-600"
              size="sm"
            >
              {professional.badge}
            </Badge>
          )}

          {/* Verified Icon */}
          {professional.verified && (
            <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
              <HugeiconsIcon className="h-4 w-4 text-green-500" icon={CheckmarkCircle02Icon} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={cn("space-y-2", isCompact ? "p-3" : "p-4")}>
          {/* Name & Verification */}
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "truncate font-semibold text-neutral-900 group-hover:text-orange-600",
                isCompact ? "text-sm" : "text-base",
                geistSans.className
              )}
            >
              {professional.name}
            </h3>
            {/* Rating */}
            <div className="flex items-center gap-1">
              <HugeiconsIcon className="h-4 w-4 fill-orange-500 text-orange-500" icon={StarIcon} />
              <span className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
                {professional.rating.toFixed(1)}
              </span>
              <span className={cn("text-neutral-400 text-xs", geistSans.className)}>
                ({professional.reviewCount})
              </span>
            </div>
          </div>

          {/* Service */}
          <p
            className={cn(
              "truncate text-neutral-500",
              isCompact ? "text-xs" : "text-sm",
              geistSans.className
            )}
          >
            {professional.service}
          </p>

          {/* Location - Only in expanded */}
          {isExpanded && professional.location && (
            <p className={cn("truncate text-neutral-400 text-xs", geistSans.className)}>
              {professional.location}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-1">
            <p className={cn("font-semibold text-neutral-900", isCompact ? "text-sm" : "text-base")}>
              {formatCurrency(professional.hourlyRate, professional.currency)}
              <span className="font-normal text-neutral-400 text-sm">/hr</span>
            </p>
            {isExpanded && (
              <Button className="h-8 gap-1 text-xs" size="sm" variant="ghost">
                View Profile
                <HugeiconsIcon className="h-3.5 w-3.5" icon={ArrowRight01Icon} />
              </Button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
