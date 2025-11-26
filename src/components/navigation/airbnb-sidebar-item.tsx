"use client";

/**
 * Airbnb Sidebar Item Component
 *
 * Individual navigation item for the Airbnb-style sidebar.
 * Features text-primary design with icon secondary, optional badge support.
 *
 * Lia Design System:
 * - rounded-lg on all states (12px border radius)
 * - h-12 (48px = 2× baseline grid)
 * - Pseudo-element left border indicator (no layout shift)
 * - rausch-50 active background, rausch-600 text
 * - Smooth 200ms transitions
 */

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: HugeIcon;
  badge?: number;
  pinToBottom?: boolean;
};

export type AirbnbSidebarItemProps = {
  item: NavItem;
  className?: string;
};

export function AirbnbSidebarItem({ item, className }: AirbnbSidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={item.badge ? `${item.label}, ${item.badge} unread` : item.label}
      className={cn(
        // Base layout - consistent for both active and inactive states
        "relative mx-2 flex h-12 items-center gap-3 rounded-lg px-4",
        "font-medium text-sm leading-6",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        // Active state: background + pseudo-element border indicator
        isActive && "bg-rausch-50 text-rausch-600 dark:bg-rausch-900/20 dark:text-rausch-400",
        isActive && "before:absolute before:top-2 before:bottom-2 before:left-0",
        isActive && "before:w-0.5 before:rounded-full before:bg-rausch-500",
        // Inactive state: hover behavior
        !isActive && "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      href={item.href}
    >
      <HugeiconsIcon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors duration-200",
          isActive ? "text-rausch-600 dark:text-rausch-400" : "text-muted-foreground"
        )}
        icon={item.icon}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rausch-500 px-1.5 font-semibold text-white text-xs tabular-nums">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}
