"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/core";
import { calendarDayVariants } from "../animations";
import type { CalendarDayProps } from "../types";

/**
 * Get className for calendar day based on state
 */
function getDayClassName(
  isCurrentMonth: boolean,
  isDisabled: boolean,
  isToday: boolean,
  isSelected: boolean
): string {
  return cn(
    "relative flex h-10 w-10 items-center justify-center rounded-lg font-medium text-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
    isCurrentMonth ? "text-neutral-200" : "text-neutral-600",
    isDisabled && "cursor-not-allowed opacity-40",
    isToday && !isSelected && "ring-1 ring-rausch-500/50",
    isSelected && "bg-rausch-500 text-white",
    !(isSelected || isDisabled) && "hover:bg-neutral-800"
  );
}

/**
 * Individual calendar day cell
 * Features tactile scale animation on selection
 */
export function CalendarDay({
  date,
  isSelected,
  isToday,
  isCurrentMonth,
  isDisabled,
  onSelect,
  disableAnimation = false,
}: CalendarDayProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);
  const dayNumber = date.getDate();
  const canInteract = !isDisabled;
  const showHoverScale = shouldAnimate && canInteract && !isSelected;
  const showTapScale = shouldAnimate && canInteract;

  const ariaLabel = date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const className = getDayClassName(isCurrentMonth, isDisabled, isToday, isSelected);

  return (
    <motion.button
      animate={shouldAnimate ? "visible" : undefined}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      className={className}
      disabled={isDisabled}
      initial={shouldAnimate ? "hidden" : undefined}
      onClick={onSelect}
      role="gridcell"
      tabIndex={canInteract ? 0 : -1}
      type="button"
      variants={shouldAnimate ? calendarDayVariants : undefined}
      whileHover={showHoverScale ? { scale: 1.1 } : undefined}
      whileTap={showTapScale ? { scale: 0.95 } : undefined}
    >
      {/* Selection ring animation */}
      {isSelected && shouldAnimate && (
        <motion.span
          className="absolute inset-0 rounded-lg bg-rausch-500"
          layoutId="calendar-selection"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        />
      )}

      {/* Day number */}
      <span className={cn("relative z-10", isSelected && "text-white")}>{dayNumber}</span>

      {/* Today indicator dot */}
      {isToday && !isSelected && (
        <span className="-translate-x-1/2 absolute bottom-1 left-1/2 h-1 w-1 rounded-full bg-rausch-400" />
      )}
    </motion.button>
  );
}
