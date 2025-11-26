"use client";

/**
 * Airbnb Bottom Navigation Component
 *
 * Fixed mobile bottom navigation bar (5 icons) for dashboard navigation.
 * Visible only on mobile, hidden on desktop where sidebar is visible.
 *
 * Lia Design System: h-16, rausch-500 active state, iOS safe area support.
 */

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/core";
import type { NavItem } from "./airbnb-sidebar-item";

export type AirbnbBottomNavProps = {
  /** Navigation items (max 5 recommended) */
  items: NavItem[];
  /** Additional CSS classes */
  className?: string;
};

export function AirbnbBottomNav({ items, className }: AirbnbBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50",
        "flex h-16 items-stretch",
        "border-border border-t bg-background",
        "lg:hidden", // Hidden on desktop
        "pb-safe", // iOS safe area inset
        className
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={item.badge ? `${item.label}, ${item.badge} unread` : item.label}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1",
              "transition-colors duration-150",
              "focus-visible:bg-muted focus-visible:outline-none",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            <div className="relative">
              <HugeiconsIcon
                className={cn("h-6 w-6", isActive && "text-primary")}
                icon={item.icon}
              />
              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="-top-1 -right-2 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-rausch-500 px-1 font-semibold text-[10px] text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "font-medium text-[10px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
