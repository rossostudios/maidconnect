"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils/core";
import { calendarVariants, monthTransitionVariants } from "../animations";
import type { InteractiveCalendarProps } from "../types";
import { CalendarDay } from "./CalendarDay";
import { areSameDays, useCalendarState } from "./useCalendarState";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Get locale-specific strings
 */
function getLocaleStrings(locale: "en" | "es") {
  const isSpanish = locale === "es";
  return {
    weekdays: isSpanish ? WEEKDAYS_ES : WEEKDAYS_EN,
    months: isSpanish ? MONTHS_ES : MONTHS_EN,
    calendarLabel: isSpanish ? "Calendario" : "Calendar",
    prevMonthLabel: isSpanish ? "Mes anterior" : "Previous month",
    nextMonthLabel: isSpanish ? "Mes siguiente" : "Next month",
    selectedLabel: isSpanish ? "Seleccionado: " : "Selected: ",
    dateLocale: isSpanish ? "es-ES" : "en-US",
  };
}

/**
 * Interactive Calendar Component
 *
 * A fully functional calendar with:
 * - Tactile scale animations on date selection
 * - Month navigation with slide transitions
 * - Today highlighting
 * - Keyboard navigation support
 * - Dark theme matching Lia Design System
 */
export function InteractiveCalendar({
  selectedDate: controlledSelectedDate,
  onDateSelect,
  locale = "en",
  minDate,
  maxDate,
  disableAnimation = false,
  className,
}: InteractiveCalendarProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);
  const [direction, setDirection] = useState(0);

  const {
    viewDate,
    selectedDate: internalSelectedDate,
    previousMonth,
    nextMonth,
    selectDate,
    calendarDays,
  } = useCalendarState({
    initialDate: controlledSelectedDate,
    minDate,
    maxDate,
    onSelect: onDateSelect,
  });

  const selectedDate = controlledSelectedDate ?? internalSelectedDate;
  const localeStrings = getLocaleStrings(locale);
  const monthYear = `${localeStrings.months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const handlePreviousMonth = () => {
    setDirection(-1);
    previousMonth();
  };

  const handleNextMonth = () => {
    setDirection(1);
    nextMonth();
  };

  return (
    <motion.div
      animate="visible"
      aria-label={localeStrings.calendarLabel}
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-2xl",
        "bg-neutral-900 p-4",
        "border border-neutral-800",
        "shadow-neutral-950/50 shadow-xl",
        className
      )}
      initial={shouldAnimate ? "hidden" : "visible"}
      role="application"
      variants={calendarVariants}
    >
      {/* Header with month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          aria-label={localeStrings.prevMonthLabel}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400",
            "hover:bg-neutral-800 hover:text-neutral-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500",
            "transition-colors"
          )}
          onClick={handlePreviousMonth}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
        </button>

        <AnimatePresence custom={direction} mode="wait">
          <motion.h2
            animate="center"
            className="font-semibold text-neutral-200 text-sm"
            custom={direction}
            exit={shouldAnimate ? "exit" : undefined}
            initial={shouldAnimate ? "enter" : undefined}
            key={monthYear}
            variants={shouldAnimate ? monthTransitionVariants : undefined}
          >
            {monthYear}
          </motion.h2>
        </AnimatePresence>

        <button
          aria-label={localeStrings.nextMonthLabel}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400",
            "hover:bg-neutral-800 hover:text-neutral-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500",
            "transition-colors"
          )}
          onClick={handleNextMonth}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
        </button>
      </div>

      {/* Weekday headers */}
      <div aria-hidden="true" className="mb-2 grid grid-cols-7 gap-1">
        {localeStrings.weekdays.map((day) => (
          <div
            className="flex h-8 items-center justify-center font-medium text-neutral-500 text-xs"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        animate="visible"
        aria-label={monthYear}
        className="grid grid-cols-7 gap-1"
        initial={shouldAnimate ? "hidden" : undefined}
        role="grid"
        variants={shouldAnimate ? calendarVariants : undefined}
      >
        {calendarDays.map((day, index) => (
          <CalendarDay
            date={day.date}
            disableAnimation={!shouldAnimate}
            isCurrentMonth={day.isCurrentMonth}
            isDisabled={day.isDisabled}
            isSelected={areSameDays(selectedDate, day.date)}
            isToday={day.isToday}
            key={`${day.date.toISOString()}-${index}`}
            onSelect={() => selectDate(day.date)}
          />
        ))}
      </motion.div>

      {/* Selected date display */}
      {selectedDate && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-neutral-800/50 px-3 py-2 text-center"
          initial={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-neutral-400 text-xs">{localeStrings.selectedLabel}</span>
          <span className="font-medium text-neutral-200 text-xs">
            {selectedDate.toLocaleDateString(localeStrings.dateLocale, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
