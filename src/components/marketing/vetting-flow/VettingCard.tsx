"use client";

import {
  CheckmarkCircle01Icon,
  Shield01Icon,
  Task01Icon,
  UserIdVerificationIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/core";
import { useAutoPlayLite } from "../hooks/useAutoPlayLite";
import type { VettingFlowCardProps, VettingStep } from "../types";

/**
 * Default vetting steps with icons and badges
 */
const DEFAULT_STEPS: VettingStep[] = [
  {
    id: "id-verification",
    icon: UserIdVerificationIcon,
    title: "ID Verification",
    badge: "Identity Confirmed",
    color: "rausch",
  },
  {
    id: "background-check",
    icon: Shield01Icon,
    title: "Background Check",
    badge: "Clean Record",
    color: "babu",
  },
  {
    id: "skills-assessment",
    icon: Task01Icon,
    title: "Skills Assessment",
    badge: "Skills Verified",
    color: "rausch",
  },
  {
    id: "video-interview",
    icon: Video01Icon,
    title: "Video Interview",
    badge: "Interview Passed",
    color: "babu",
  },
  {
    id: "final-approval",
    icon: CheckmarkCircle01Icon,
    title: "Final Approval",
    badge: "Fully Vetted",
    color: "green",
  },
];

/**
 * Get data-state attribute for step styling
 */
function getStepState(index: number, currentStep: number): "active" | "complete" | "inactive" {
  if (index === currentStep) return "active";
  if (index < currentStep) return "complete";
  return "inactive";
}

/**
 * Step Indicator - CSS-only animated dot
 */
function StepIndicator({
  step,
  index,
  currentStep,
  shouldAnimate,
  onSelect,
}: {
  step: VettingStep;
  index: number;
  currentStep: number;
  shouldAnimate: boolean;
  onSelect: () => void;
}) {
  const state = getStepState(index, currentStep);
  const isLast = index === DEFAULT_STEPS.length - 1;
  const labelSuffix =
    state === "complete" ? " (completed)" : state === "active" ? " (current)" : "";

  return (
    <div className="flex items-center" role="listitem">
      <button
        aria-current={index === currentStep ? "step" : undefined}
        aria-label={`${step.title}${labelSuffix}`}
        className={cn(
          "relative flex h-3 w-3 items-center justify-center rounded-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900",
          "transition-all duration-300",
          // State-based styling via data attribute
          state === "active" && [
            "scale-110 bg-rausch-500",
            shouldAnimate && "animate-vetting-pulse",
          ],
          state === "complete" && "bg-green-500",
          state === "inactive" && "bg-stone-600 dark:bg-rausch-700"
        )}
        data-state={state}
        onClick={onSelect}
        type="button"
      />
      {/* Connector line */}
      {!isLast && (
        <div className="relative mx-1.5 h-0.5 w-6 overflow-hidden rounded-full bg-stone-700 dark:bg-rausch-800/60">
          <div
            className={cn(
              "absolute inset-0 origin-left bg-green-500 transition-transform duration-300",
              index < currentStep ? "scale-x-100" : "scale-x-0",
              shouldAnimate && index < currentStep && "animate-connector-fill"
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Badge - CSS animated verification badge
 */
function Badge({
  step,
  index,
  shouldAnimate,
}: {
  step: VettingStep;
  index: number;
  shouldAnimate: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs",
        shouldAnimate && "animate-badge-pop-in",
        step.color === "rausch" &&
          "bg-rausch-950/50 text-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-300",
        step.color === "babu" &&
          "bg-babu-950/50 text-babu-400 dark:bg-babu-900/50 dark:text-babu-300",
        step.color === "green" &&
          "bg-green-950/50 text-green-400 dark:bg-green-900/50 dark:text-green-300"
      )}
      style={shouldAnimate ? { animationDelay: `${index * 100}ms` } : undefined}
    >
      <svg aria-hidden="true" className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 12 12">
        <path d="M10.28 2.28L4.5 8.06 1.72 5.28a.75.75 0 00-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l6.5-6.5a.75.75 0 00-1.06-1.06h.12z" />
      </svg>
      {step.badge}
    </span>
  );
}

/**
 * VettingCard - Zero-Bloat Marketing Component
 *
 * CSS-first animated visualization of the 5-point verification process.
 * Replaces Framer Motion with CSS keyframes for ~45KB bundle savings.
 *
 * Features:
 * - Auto-play progression through steps
 * - Step indicator dots with completion states
 * - Badge animations when steps complete
 * - Profile card centered with flexbox
 * - Full keyboard accessibility
 * - prefers-reduced-motion support via CSS media query
 */
export function VettingCard({
  autoPlay = true,
  autoPlayInterval = 3000,
  onStepChange,
  disableAnimation = false,
  className,
}: VettingFlowCardProps) {
  const { currentStep, setStep, pause, resume, isPaused, prefersReducedMotion } = useAutoPlayLite({
    totalSteps: DEFAULT_STEPS.length,
    interval: autoPlayInterval,
    enabled: autoPlay,
    onStepChange,
  });

  const shouldAnimate = !(disableAnimation || prefersReducedMotion);
  const currentStepData = DEFAULT_STEPS[currentStep];

  // Track step changes for animation triggers
  const [animationKey, setAnimationKey] = useState(0);
  useEffect(() => {
    setAnimationKey((k) => k + 1);
  }, [currentStep]);

  return (
    <div
      aria-label="Professional vetting process"
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-2xl p-6",
        // Light mode: dark stone background
        "bg-gradient-to-br from-stone-900 to-stone-950",
        "border border-stone-800/60",
        "shadow-stone-950/60 shadow-xl",
        // Dark mode: brand burgundy gradient
        "dark:from-rausch-950/90 dark:via-rausch-950 dark:to-stone-950",
        "dark:border-rausch-800/40 dark:shadow-rausch-950/40",
        className
      )}
      onBlur={resume}
      onFocus={pause}
      onMouseEnter={pause}
      onMouseLeave={resume}
      role="region"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-950/50 px-3 py-1 font-medium text-green-400 text-xs dark:bg-green-900/50 dark:text-green-400">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-green-400",
              shouldAnimate && "animate-header-dot-pulse"
            )}
          />
          5-Point Verification
        </span>
      </div>

      {/* Step Indicators */}
      <div
        aria-label="Verification steps"
        className="mb-8 flex items-center justify-center gap-2"
        role="list"
      >
        {DEFAULT_STEPS.map((step, index) => (
          <StepIndicator
            currentStep={currentStep}
            index={index}
            key={step.id}
            onSelect={() => setStep(index)}
            shouldAnimate={shouldAnimate}
            step={step}
          />
        ))}
      </div>

      {/* Profile Card - CENTERED */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-xs rounded-xl bg-stone-800/40 p-4 dark:border dark:border-rausch-800/40 dark:bg-rausch-900/40">
          {/* Profile Header with Default Avatar */}
          <div className="mb-4 flex items-center gap-3">
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
            <div className="flex-1">
              <div className="font-medium text-sm text-stone-100 dark:text-rausch-100">
                Applicant Profile
              </div>
              <div className="text-stone-400 text-xs dark:text-rausch-300">
                Cleaning Specialist • Bogotá
              </div>
            </div>
          </div>

          {/* Current Step Content */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg bg-stone-800/60 p-3 dark:bg-rausch-900/60",
              shouldAnimate && "animate-step-enter"
            )}
            key={animationKey}
          >
            {/* Step Icon */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                currentStepData.color === "rausch" && "bg-rausch-500/20 text-rausch-400",
                currentStepData.color === "babu" && "bg-babu-500/20 text-babu-400",
                currentStepData.color === "green" && "bg-green-500/20 text-green-400"
              )}
            >
              <HugeiconsIcon className="h-5 w-5" icon={currentStepData.icon} />
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div className="font-medium text-sm text-stone-100 dark:text-rausch-100">
                {currentStepData.title}
              </div>
              <div className="text-stone-400 text-xs dark:text-rausch-300">
                Step {currentStep + 1} of {DEFAULT_STEPS.length}
              </div>
            </div>

            {/* Checkmark Icon */}
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                shouldAnimate && "animate-check-pop",
                currentStepData.color === "rausch" && "bg-rausch-500 text-white",
                currentStepData.color === "babu" && "bg-babu-500 text-white",
                currentStepData.color === "green" && "bg-green-500 text-white"
              )}
              key={`check-${animationKey}`}
            >
              <svg
                aria-hidden="true"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 12 12"
              >
                <polyline points="2 6 5 9 10 3" />
              </svg>
            </div>
          </div>

          {/* Earned Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {DEFAULT_STEPS.slice(0, currentStep + 1).map((step, index) => (
              <Badge index={index} key={step.id} shouldAnimate={shouldAnimate} step={step} />
            ))}
          </div>
        </div>
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="mt-4 text-center text-stone-500 text-xs dark:text-rausch-400">
          Paused - hover to resume
        </div>
      )}
    </div>
  );
}
