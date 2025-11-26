"use client";

/**
 * DirectorySplitView - Lia Design System
 *
 * Airbnb-style split-view layout for professionals directory.
 * Desktop: 60% cards panel / 40% map panel
 * Mobile: Full-width cards only (no map)
 *
 * Breakpoint: lg (1024px)
 */

import { cn } from "@/lib/utils";

export type DirectorySplitViewProps = {
  /** Left panel content (cards) */
  cardsPanel: React.ReactNode;
  /** Right panel content (map) - hidden on mobile */
  mapPanel: React.ReactNode;
  className?: string;
};

export function DirectorySplitView({ cardsPanel, mapPanel, className }: DirectorySplitViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row",
        "min-h-[calc(100vh-64px)]", // Account for header height
        className
      )}
    >
      {/* Cards Panel - Full width on mobile, 60% on desktop */}
      <div className="w-full overflow-y-auto lg:w-3/5">{cardsPanel}</div>

      {/* Map Panel - Hidden on mobile, 40% sticky on desktop */}
      <div className="sticky top-0 hidden h-screen lg:block lg:w-2/5">{mapPanel}</div>
    </div>
  );
}
