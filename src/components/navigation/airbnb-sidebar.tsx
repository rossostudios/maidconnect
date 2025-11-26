"use client";

/**
 * Airbnb Sidebar Component
 *
 * Clean, text-primary sidebar navigation inspired by Airbnb design.
 * 240px width, logo header, flat navigation list with settings pinned to bottom.
 *
 * Lia Design System: rounded-lg, neutral borders, Geist Sans typography.
 */

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/core";
import { AirbnbSidebarItem, type NavItem } from "./airbnb-sidebar-item";

export type AirbnbSidebarProps = {
  /** Main navigation items (appear at top) */
  items: NavItem[];
  /** Items pinned to bottom (e.g., Settings) */
  bottomItems?: NavItem[];
  /** Logo link destination */
  logoHref?: string;
  /** Additional CSS classes */
  className?: string;
};

export function AirbnbSidebar({
  items,
  bottomItems,
  logoHref = "/",
  className,
}: AirbnbSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen w-60 flex-col border-border border-r bg-background",
        "hidden lg:flex", // Hidden on mobile, visible on desktop
        className
      )}
    >
      {/* Logo Header */}
      <div className="flex h-14 items-center border-border border-b px-4">
        <Link
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
          href={logoHref}
        >
          <Image
            alt="Casaora"
            className="flex-shrink-0"
            height={28}
            src="/isologo.svg"
            width={28}
          />
          <span className="font-semibold text-foreground tracking-tight">CASAORA</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col overflow-y-auto py-3">
        {/* Main Items */}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <AirbnbSidebarItem item={item} />
            </li>
          ))}
        </ul>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Items (Settings, etc.) */}
        {bottomItems && bottomItems.length > 0 && (
          <ul className="mt-3 space-y-1 border-border border-t pt-3 pb-3">
            {bottomItems.map((item) => (
              <li key={item.href}>
                <AirbnbSidebarItem item={item} />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
