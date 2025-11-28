"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/core";

/**
 * InstantMatchCalendar - Zero-Bloat Marketing Component
 *
 * Static calendar grid for marketing visualization.
 * NO date library - hardcoded data for maximum performance.
 * CSS animations replace Framer Motion (~45KB savings).
 *
 * Features:
 * - 8px grid system alignment (40px cells)
 * - Staggered day pop-in animations
 * - Selection ring pulse animation
 * - Full keyboard navigation (arrow keys + Enter)
 * - prefers-reduced-motion support via CSS media query
 */

// Static weekday headers (Mon-Sun for international format)
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// Hardcoded calendar data - 3 weeks of availability
// No date library needed for marketing visualization
interface CalendarDayData {
  day: number;
  available: boolean;
  slots: number;
}

const CALENDAR_DAYS: CalendarDayData[] = [
  // Week 1
  { day: 1, available: true, slots: 3 },
  { day: 2, available: true, slots: 2 },
  { day: 3, available: false, slots: 0 },
  { day: 4, available: true, slots: 4 },
  { day: 5, available: true, slots: 1 },
  { day: 6, available: true, slots: 5 },
  { day: 7, available: true, slots: 2 },
  // Week 2
  { day: 8, available: true, slots: 3 },
  { day: 9, available: true, slots: 4 },
  { day: 10, available: true, slots: 2 },
  { day: 11, available: false, slots: 0 },
  { day: 12, available: true, slots: 3 },
  { day: 13, available: true, slots: 5 },
  { day: 14, available: true, slots: 1 },
  // Week 3
  { day: 15, available: true, slots: 4 },
  { day: 16, available: true, slots: 2 },
  { day: 17, available: true, slots: 3 },
  { day: 18, available: true, slots: 5 },
  { day: 19, available: false, slots: 0 },
  { day: 20, available: true, slots: 2 },
  { day: 21, available: true, slots: 4 },
];

export interface InstantMatchCalendarProps {
  /** Currently selected day index (0-based) */
  selectedIndex?: number;
  /** Callback when a day is selected */
  onSelect?: (index: number) => void;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the slot indicator color based on availability
 */
function getSlotColor(slots: number): string {
  if (slots === 0) return "bg-stone-600";
  if (slots <= 2) return "bg-amber-500";
  return "bg-green-500";
}

/**
 * Calendar Day Cell - CSS animated
 */
function DayCell({
  data,
  index,
  isSelected,
  shouldAnimate,
  onSelect,
  onKeyDown,
  isFocused,
}: {
  data: CalendarDayData;
  index: number;
  isSelected: boolean;
  shouldAnimate: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isFocused: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus the button when isFocused changes
  useEffect(() => {
    if (isFocused && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isFocused]);

  return (
    <button
      aria-disabled={!data.available}
      aria-label={`Day ${data.day}${data.available ? `, ${data.slots} slots available` : ", unavailable"}`}
      aria-selected={isSelected}
      className={cn(
        // Base styles - 8px grid (40px = 5 × 8px)
        "relative flex h-10 w-full flex-col items-center justify-center rounded-lg",
        "font-medium text-sm transition-all duration-200",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900",
        // Animation
        shouldAnimate && "animate-day-pop",
        // State-based styling
        data.available
          ? "cursor-pointer text-stone-100 hover:bg-stone-700/60"
          : "cursor-not-allowed text-stone-500",
        isSelected && [
          "bg-rausch-500 text-white hover:bg-rausch-500",
          shouldAnimate && "animate-selection-ring",
        ]
      )}
      disabled={!data.available}
      onClick={data.available ? onSelect : undefined}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      role="gridcell"
      style={shouldAnimate ? ({ "--day-index": index } as React.CSSProperties) : undefined}
      tabIndex={data.available ? 0 : -1}
      type="button"
    >
      {/* Day number */}
      <span className="relative z-10">{data.day}</span>

      {/* Slot indicator dot */}
      {data.available && (
        <span
          className={cn(
            "absolute bottom-1.5 h-1 w-1 rounded-full",
            isSelected ? "bg-white/80" : getSlotColor(data.slots)
          )}
        />
      )}
    </button>
  );
}

/**
 * InstantMatchCalendar Component
 */
export function InstantMatchCalendar({
  selectedIndex: controlledIndex,
  onSelect,
  disableAnimation = false,
  className,
}: InstantMatchCalendarProps) {
  // Internal state for uncontrolled mode
  const [internalIndex, setInternalIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Support both controlled and uncontrolled modes
  const selectedIndex = controlledIndex ?? internalIndex;

  // Check for reduced motion preference via CSS
  // (CSS handles animation disable, but we track for conditional classes)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  const handleSelect = useCallback(
    (index: number) => {
      setInternalIndex(index);
      onSelect?.(index);
    },
    [onSelect]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextIndex = currentIndex + 1;
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = currentIndex - 1;
          break;
        case "ArrowDown":
          e.preventDefault();
          nextIndex = currentIndex + 7; // Next row
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = currentIndex - 7; // Previous row
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (CALENDAR_DAYS[currentIndex]?.available) {
            handleSelect(currentIndex);
          }
          return;
        default:
          return;
      }

      // Bounds check and find next available day
      if (nextIndex !== null && nextIndex >= 0 && nextIndex < CALENDAR_DAYS.length) {
        // Skip to next available day if current target is unavailable
        while (
          nextIndex >= 0 &&
          nextIndex < CALENDAR_DAYS.length &&
          !CALENDAR_DAYS[nextIndex].available
        ) {
          nextIndex += e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        }
        if (
          nextIndex >= 0 &&
          nextIndex < CALENDAR_DAYS.length &&
          CALENDAR_DAYS[nextIndex].available
        ) {
          setFocusedIndex(nextIndex);
        }
      }
    },
    [handleSelect]
  );

  return (
    <div
      aria-label="Available dates calendar"
      className={cn(
        // Container - 8px padding (16px = 2 × 8px)
        "w-full max-w-sm overflow-hidden rounded-2xl p-4",
        "bg-gradient-to-br from-stone-900 to-stone-950",
        "border border-stone-800/60",
        "shadow-stone-950/60 shadow-xl",
        // Dark mode variants
        "dark:from-rausch-950/90 dark:via-rausch-950 dark:to-stone-950",
        "dark:border-rausch-800/40 dark:shadow-rausch-950/40",
        className
      )}
      role="application"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-stone-100 dark:text-rausch-100">November 2024</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-950/50 px-2.5 py-1 text-green-400 text-xs dark:bg-green-900/50">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-green-400",
              shouldAnimate && "animate-header-dot-pulse"
            )}
          />
          21 days available
        </span>
      </div>

      {/* Weekday headers - 8px vertical padding */}
      <div aria-hidden="true" className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            className="flex h-8 items-center justify-center font-medium text-stone-500 text-xs dark:text-rausch-400"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - 7 columns, 1px gap */}
      <div aria-label="November 2024" className="grid grid-cols-7 gap-1" role="grid">
        {CALENDAR_DAYS.map((day, index) => (
          <DayCell
            data={day}
            index={index}
            isFocused={focusedIndex === index}
            isSelected={selectedIndex === index}
            key={day.day}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onSelect={() => handleSelect(index)}
            shouldAnimate={shouldAnimate}
          />
        ))}
      </div>

      {/* Instant Match Popup - Shows when a date is selected */}
      {selectedIndex !== null && CALENDAR_DAYS[selectedIndex] && (
        <div
          className={cn(
            "mt-4 rounded-xl bg-stone-800/60 p-3 dark:bg-rausch-900/50",
            shouldAnimate && "animate-step-enter"
          )}
        >
          {/* Match Header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-950/50 px-2 py-0.5 text-green-400 text-xs dark:bg-green-900/50">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-green-400",
                  shouldAnimate && "animate-header-dot-pulse"
                )}
              />
              Instant Match
            </span>
            <span className="text-stone-500 text-xs dark:text-rausch-400">
              Nov {CALENDAR_DAYS[selectedIndex].day}
            </span>
          </div>

          {/* Professional Match Card */}
          <div className="flex items-center gap-3">
            {/* Default Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-rausch-400 to-rausch-600">
              <svg
                aria-hidden="true"
                className="h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* Professional Info */}
            <div className="flex-1">
              <div className="font-medium text-sm text-stone-100 dark:text-rausch-100">
                Available Pro
              </div>
              <div className="text-stone-400 text-xs dark:text-rausch-300">
                Cleaning Specialist • $35/hr
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <svg aria-hidden="true" className="h-3 w-3 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-stone-300 text-xs dark:text-rausch-200">
                    4.9
                  </span>
                </div>
                <span className="text-stone-500 text-xs dark:text-rausch-400">127 bookings</span>
              </div>
            </div>

            {/* Book Button */}
            <button
              className={cn(
                "rounded-lg bg-rausch-500 px-3 py-1.5 font-medium text-white text-xs",
                "transition-colors hover:bg-rausch-600",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
              )}
              type="button"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-stone-400 dark:text-rausch-300">3+ slots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-stone-400 dark:text-rausch-300">1-2 slots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-stone-600" />
          <span className="text-stone-400 dark:text-rausch-300">Full</span>
        </div>
      </div>
    </div>
  );
}
