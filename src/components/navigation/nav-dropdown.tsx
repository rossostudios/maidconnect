"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

export type NavDropdownItem = {
  name: string;
  href: string;
  description: string;
  icon?: HugeIcon;
};

type NavDropdownProps = {
  label: string;
  items: NavDropdownItem[];
  /** Featured item shown in the right panel */
  featured?: {
    icon: HugeIcon;
    title: string;
    description: string;
  };
  /** @deprecated No longer used - glass pill is always visible */
  overlay?: boolean;
};

/**
 * NavDropdown - Dunas-inspired dropdown menu
 *
 * Features:
 * - Dark burgundy-tinted background (uses semantic tokens)
 * - Two-column layout: menu items left, preview card right
 * - Pill-shaped active state on trigger
 * - Smooth hover transitions
 * - Title + description format for menu items
 */
export function NavDropdown({ label, items, featured }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeItem, setActiveItem] = useState<NavDropdownItem | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveItem(null);
    }, 150);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  // Set first item as active by default when dropdown opens
  useEffect(() => {
    if (isOpen && items.length > 0 && !activeItem) {
      setActiveItem(items[0] ?? null);
    }
  }, [isOpen, items, activeItem]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2 font-medium text-sm",
          // Spring-like transition for premium feel
          "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          // Consistent styling (glass pill always visible)
          isOpen
            ? "bg-rausch-700 text-white shadow-lg shadow-rausch-700/20"
            : "text-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        type="button"
      >
        {label}
        <HugeiconsIcon
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen && "rotate-180"
          )}
          icon={ArrowDown01Icon}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="-translate-x-1/2 absolute top-full left-1/2 z-[100] pt-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              "overflow-hidden rounded-[20px] border border-border bg-card",
              // Layered shadow for depth and elegance
              "shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2),0_12px_40px_-8px_rgba(0,0,0,0.3)]",
              // Entry animation
              "fade-in-0 slide-in-from-top-2 animate-in duration-200",
              // Responsive max-width to prevent overflow
              "max-w-[calc(100vw-2rem)]"
            )}
          >
            <div className="flex min-w-[420px] lg:min-w-[520px]">
              {/* Left: Menu Items */}
              <div className="flex-1 p-4">
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      className={cn(
                        "group/item relative block rounded-xl p-3",
                        "transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                        activeItem?.href === item.href ? "bg-muted" : "hover:bg-muted/60"
                      )}
                      href={item.href}
                      key={item.href}
                      onMouseEnter={() => setActiveItem(item)}
                    >
                      <span className="block font-semibold text-card-foreground text-sm tracking-tight">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-muted-foreground text-xs leading-relaxed">
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: Preview Card */}
              {featured && (
                <div className="hidden w-48 items-center justify-center border-border border-l bg-muted/50 p-4 lg:flex lg:w-64 lg:p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div
                      className={cn(
                        "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl",
                        "bg-gradient-to-br from-rausch-50 to-rausch-100 dark:from-rausch-900/50 dark:to-rausch-800/50",
                        "shadow-black/10 shadow-lg",
                        "transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                        "group-hover/item:scale-105"
                      )}
                    >
                      <HugeiconsIcon
                        className="h-10 w-10 text-rausch-600 dark:text-rausch-300"
                        icon={featured.icon}
                      />
                    </div>
                    {/* Title & Description */}
                    <h4 className="font-semibold text-card-foreground tracking-tight">
                      {activeItem?.name || featured.title}
                    </h4>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {activeItem?.description || featured.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
