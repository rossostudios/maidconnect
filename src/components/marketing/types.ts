/**
 * Marketing Components - Shared TypeScript Types
 * Interactive visual components for the Casaora homepage
 */

import type { ComponentType } from "react";

// ============================================================================
// Escrow Vault Card Types
// ============================================================================

export type SupportedCurrency = "USD" | "COP" | "PYG" | "UYU" | "ARS";

export type EscrowVaultCardProps = {
  /** Amount to display in the escrow vault */
  amount: number;
  /** Currency for the amount display */
  currency?: SupportedCurrency;
  /** Duration of the count-up animation in milliseconds */
  countUpDuration?: number;
  /** Disable all animations (for reduced motion or testing) */
  disableAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export type EscrowFlowStatus = "idle" | "transferring" | "secured" | "releasing";

// ============================================================================
// Interactive Calendar Types
// ============================================================================

export type InteractiveCalendarProps = {
  /** Currently selected date */
  selectedDate?: Date | null;
  /** Callback when a date is selected */
  onDateSelect?: (date: Date | null) => void;
  /** Locale for day/month names */
  locale?: "en" | "es";
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export type CalendarDayProps = {
  /** The date this cell represents */
  date: Date;
  /** Whether this date is currently selected */
  isSelected: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is in the current month */
  isCurrentMonth: boolean;
  /** Whether this date is disabled/not selectable */
  isDisabled: boolean;
  /** Callback when the day is selected */
  onSelect: () => void;
  /** Disable animations */
  disableAnimation?: boolean;
};

export type CalendarState = {
  /** Currently viewed month/year */
  viewDate: Date;
  /** Currently selected date */
  selectedDate: Date | null;
  /** Navigate to previous month */
  previousMonth: () => void;
  /** Navigate to next month */
  nextMonth: () => void;
  /** Select a date */
  selectDate: (date: Date | null) => void;
  /** Get all days to display in the calendar grid */
  calendarDays: CalendarDay[];
};

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
};

// ============================================================================
// Vetting Flow Card Types
// ============================================================================

export type VettingStep = {
  /** Unique identifier for the step */
  id: string;
  /** Icon component to display */
  icon: ComponentType<{ className?: string }>;
  /** Step title */
  title: string;
  /** Badge text shown when step completes */
  badge: string;
  /** Color variant for the step (rausch, babu, green) */
  color: "rausch" | "babu" | "green";
};

export type VettingFlowCardProps = {
  /** Enable auto-play through steps */
  autoPlay?: boolean;
  /** Interval between steps in milliseconds */
  autoPlayInterval?: number;
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export type UseAutoPlayReturn = {
  /** Current step index */
  currentStep: number;
  /** Set the current step */
  setStep: (step: number) => void;
  /** Pause auto-play */
  pause: () => void;
  /** Resume auto-play */
  resume: () => void;
  /** Whether auto-play is currently paused */
  isPaused: boolean;
};

// ============================================================================
// Instant Match Card Types
// ============================================================================

export type MatchPhase = {
  /** Unique identifier for the phase */
  id: string;
  /** Phase title */
  title: string;
  /** Phase subtitle/description */
  subtitle: string;
  /** Icon to display */
  icon: ComponentType<{ className?: string }>;
};

export type InstantMatchCardProps = {
  /** Enable auto-play through phases */
  autoPlay?: boolean;
  /** Interval between phases in milliseconds */
  autoPlayInterval?: number;
  /** Callback when phase changes */
  onPhaseChange?: (phaseIndex: number) => void;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
};
