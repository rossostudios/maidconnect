"use client";

import {
  CheckmarkCircle01Icon,
  Shield01Icon,
  Task01Icon,
  UserIdVerificationIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils/core";
import {
  badgeVariants,
  contentSwapVariants,
  stepConnectorVariants,
  stepDotVariants,
  vettingCardVariants,
} from "../animations";
import type { VettingFlowCardProps, VettingStep } from "../types";
import { useAutoPlay } from "./useAutoPlay";

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
 * Get animation state for a step indicator
 */
function getStepState(index: number, currentStep: number): "active" | "complete" | "inactive" {
  if (index === currentStep) {
    return "active";
  }
  if (index < currentStep) {
    return "complete";
  }
  return "inactive";
}

/**
 * Get aria label suffix for step indicator
 */
function getStepSuffix(index: number, currentStep: number): string {
  if (index < currentStep) {
    return " (completed)";
  }
  if (index === currentStep) {
    return " (current)";
  }
  return "";
}

/**
 * Step indicator component
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
  const stepState = getStepState(index, currentStep);
  const labelSuffix = getStepSuffix(index, currentStep);
  const isLast = index === DEFAULT_STEPS.length - 1;

  return (
    <div className="flex items-center" role="listitem">
      <motion.button
        animate={stepState}
        aria-current={index === currentStep ? "step" : undefined}
        aria-label={`${step.title}${labelSuffix}`}
        className={cn(
          "relative flex h-3 w-3 items-center justify-center rounded-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900",
          "transition-colors"
        )}
        onClick={onSelect}
        type="button"
        variants={shouldAnimate ? stepDotVariants : undefined}
      />
      {!isLast && (
        <div className="relative mx-1.5 h-0.5 w-6 overflow-hidden rounded-full bg-stone-700 dark:bg-rausch-800/60">
          <motion.div
            animate={index < currentStep ? "complete" : "incomplete"}
            className="absolute inset-0 origin-left bg-green-500"
            variants={shouldAnimate ? stepConnectorVariants : undefined}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Vetting Flow Card
 *
 * Animated visualization of the 5-point verification process:
 * 1. ID Verification
 * 2. Background Check
 * 3. Skills Assessment
 * 4. Video Interview
 * 5. Final Approval
 *
 * Features:
 * - Auto-play progression through steps
 * - Step indicator dots with completion states
 * - Badge animations when steps complete
 * - Profile card content that transforms
 */
export function VettingFlowCard({
  autoPlay = true,
  autoPlayInterval = 3000,
  onStepChange,
  disableAnimation = false,
  className,
}: VettingFlowCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  const { currentStep, setStep, pause, resume, isPaused } = useAutoPlay({
    totalSteps: DEFAULT_STEPS.length,
    interval: autoPlayInterval,
    enabled: autoPlay && shouldAnimate,
    onStepChange,
  });

  const currentStepData = DEFAULT_STEPS[currentStep];

  return (
    <motion.div
      animate="visible"
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
      initial={shouldAnimate ? "hidden" : "visible"}
      onBlur={resume}
      onFocus={pause}
      onMouseEnter={pause}
      onMouseLeave={resume}
      role="region"
      variants={vettingCardVariants}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-950/50 px-3 py-1 font-medium text-green-400 text-xs dark:bg-green-900/50 dark:text-green-400">
          <motion.span
            animate={shouldAnimate ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : undefined}
            className="h-1.5 w-1.5 rounded-full bg-green-400"
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
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

      {/* Profile Card */}
      <div className="rounded-xl bg-stone-800/40 p-4 dark:border dark:border-rausch-800/40 dark:bg-rausch-900/40">
        {/* Profile Header with Maria Camila */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
            <Image
              alt="Maria Camila"
              className="object-cover"
              fill
              sizes="48px"
              src="/mariacamila.png"
            />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm text-stone-100 dark:text-rausch-100">
              Maria Camila
            </div>
            <div className="text-stone-400 text-xs dark:text-rausch-300">
              Cleaning Specialist • Bogotá
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            animate="center"
            className="flex items-center gap-3 rounded-lg bg-stone-800/60 p-3 dark:bg-rausch-900/60"
            exit={shouldAnimate ? "exit" : undefined}
            initial={shouldAnimate ? "enter" : undefined}
            key={currentStep}
            variants={shouldAnimate ? contentSwapVariants : undefined}
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

            {/* Check Icon */}
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                currentStepData.color === "rausch" && "bg-rausch-500 text-white",
                currentStepData.color === "babu" && "bg-babu-500 text-white",
                currentStepData.color === "green" && "bg-green-500 text-white"
              )}
              initial={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: shouldAnimate ? 0.3 : 0,
              }}
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
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Earned Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <AnimatePresence>
            {DEFAULT_STEPS.slice(0, currentStep + 1).map((step, index) => (
              <motion.span
                animate="visible"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs",
                  step.color === "rausch" &&
                    "bg-rausch-950/50 text-rausch-400 dark:bg-rausch-800/50 dark:text-rausch-300",
                  step.color === "babu" &&
                    "bg-babu-950/50 text-babu-400 dark:bg-babu-900/50 dark:text-babu-300",
                  step.color === "green" &&
                    "bg-green-950/50 text-green-400 dark:bg-green-900/50 dark:text-green-300"
                )}
                exit={shouldAnimate ? "hidden" : undefined}
                initial={shouldAnimate ? "hidden" : "visible"}
                key={step.id}
                transition={{ delay: shouldAnimate ? index * 0.1 : 0 }}
                variants={shouldAnimate ? badgeVariants : undefined}
              >
                <svg
                  aria-hidden="true"
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M10.28 2.28L4.5 8.06 1.72 5.28a.75.75 0 00-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l6.5-6.5a.75.75 0 00-1.06-1.06h.12z" />
                </svg>
                {step.badge}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <motion.div
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-stone-500 text-xs dark:text-rausch-400"
          initial={{ opacity: 0 }}
        >
          Paused - hover to resume
        </motion.div>
      )}
    </motion.div>
  );
}
