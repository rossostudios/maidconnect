"use client";

import {
  Calendar03Icon,
  CreditCardIcon,
  FavouriteIcon,
  Home09Icon,
  Location01Icon,
  Message01Icon,
  Notification03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

export type EmptyStateVariant =
  | "bookings"
  | "favorites"
  | "messages"
  | "notifications"
  | "reviews"
  | "addresses"
  | "payments"
  | "default";

const variantConfig: Record<
  EmptyStateVariant,
  { icon: HugeIcon; bgColor: string; iconColor: string; borderColor: string }
> = {
  bookings: {
    icon: Calendar03Icon,
    bgColor: "bg-rausch-50",
    iconColor: "text-rausch-500",
    borderColor: "border-rausch-100",
  },
  favorites: {
    icon: FavouriteIcon,
    bgColor: "bg-rose-50",
    iconColor: "text-rose-500",
    borderColor: "border-rose-100",
  },
  messages: {
    icon: Message01Icon,
    bgColor: "bg-babu-50",
    iconColor: "text-babu-500",
    borderColor: "border-babu-100",
  },
  notifications: {
    icon: Notification03Icon,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
  },
  reviews: {
    icon: StarIcon,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-100",
  },
  addresses: {
    icon: Location01Icon,
    bgColor: "bg-green-50",
    iconColor: "text-green-500",
    borderColor: "border-green-100",
  },
  payments: {
    icon: CreditCardIcon,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
    borderColor: "border-purple-100",
  },
  default: {
    icon: Home09Icon,
    bgColor: "bg-neutral-50",
    iconColor: "text-neutral-400",
    borderColor: "border-neutral-200",
  },
};

type Props = {
  /** Title text displayed below the icon */
  title: string;
  /** Description text shown below the title */
  description?: string;
  /** Which visual variant to use (determines icon and colors) */
  variant?: EmptyStateVariant;
  /** Custom icon to override the variant default */
  icon?: HugeIcon;
  /** Optional action button or link */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "default" | "compact";
};

/**
 * Empty State Component
 *
 * A consistent empty state pattern for dashboard sections.
 * Follows Lia Design System with Anthropic rounded corners,
 * warm neutral colors, and orange accent.
 */
export function EmptyState({
  title,
  description,
  variant = "default",
  icon,
  action,
  className,
  size = "default",
}: Props) {
  const config = variantConfig[variant];
  const IconComponent = icon || config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-lg border border-neutral-200 bg-neutral-50/50",
        size === "default" ? "p-12" : "p-8",
        className
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2",
          config.bgColor,
          config.borderColor,
          size === "default" ? "h-16 w-16" : "h-12 w-12"
        )}
      >
        <HugeiconsIcon
          className={cn(config.iconColor, size === "default" ? "h-7 w-7" : "h-5 w-5")}
          icon={IconComponent}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "mt-4 font-semibold text-neutral-900",
          size === "default" ? "text-lg" : "text-base",
          geistSans.className
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "mt-2 max-w-sm text-neutral-600",
            size === "default" ? "text-base" : "text-sm"
          )}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Helper function to create a styled CTA link for empty states
 */
export function EmptyStateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-rausch-500 px-6 py-3",
        "font-semibold text-sm text-white shadow-sm transition",
        "hover:bg-rausch-600 focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2",
        geistSans.className
      )}
      href={href}
    >
      {children}
    </a>
  );
}

/**
 * Inline text with link for empty states
 */
export function EmptyStateInlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      className="font-semibold text-rausch-600 transition hover:text-rausch-700 hover:underline"
      href={href}
    >
      {children}
    </a>
  );
}
