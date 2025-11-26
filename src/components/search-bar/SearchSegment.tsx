"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SearchSegmentProps = {
  /** Small label displayed above the value */
  label: string;
  /** Content displayed below the label (input, select, or text) */
  children: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Whether this segment is currently active/focused */
  isActive?: boolean;
  /** Click handler for the segment */
  onClick?: () => void;
  /** Whether to show the right divider */
  showDivider?: boolean;
};

/**
 * A clickable segment within the Airbnb-style search bar.
 * Displays a small label above the main content with hover/active states.
 */
export const SearchSegment = ({
  label,
  children,
  className,
  isActive = false,
  onClick,
  showDivider = true,
  ref,
}: SearchSegmentProps & { ref?: RefObject<HTMLDivElement | null> }) => {
  return (
    <>
      <div
        className={cn(
          "group relative min-w-0 flex-1 cursor-pointer rounded-full px-6 py-3 transition-all duration-200",
          // Hover state - subtle background
          "hover:bg-neutral-100/80 dark:hover:bg-muted/80",
          // Active state - more prominent background
          isActive && "bg-neutral-100 shadow-sm dark:bg-muted dark:shadow-none",
          className
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        ref={ref}
        role="button"
        tabIndex={0}
      >
        {/* Label */}
        <span className="block font-semibold text-neutral-900 text-xs tracking-wide dark:text-neutral-50">
          {label}
        </span>
        {/* Content */}
        <div className="mt-0.5">{children}</div>
      </div>

      {/* Divider */}
      {showDivider && (
        <div
          className={cn(
            "h-8 w-px flex-shrink-0 transition-opacity duration-200",
            isActive ? "bg-transparent" : "bg-neutral-200/60 dark:bg-border/60"
          )}
        />
      )}
    </>
  );
};

SearchSegment.displayName = "SearchSegment";
