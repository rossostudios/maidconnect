"use client";

import {
  CheckmarkCircle01Icon,
  Location01Icon,
  Search01Icon,
  SparklesIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils/core";
import { PRIMARY_EASE } from "../animations";
import type { InstantMatchCardProps, MatchPhase } from "../types";
import { useAutoPlay } from "../vetting-flow/useAutoPlay";

/**
 * Match phases for the instant matching animation
 */
const MATCH_PHASES: MatchPhase[] = [
  {
    id: "search",
    title: "Searching",
    subtitle: "Finding pros in your area...",
    icon: Search01Icon,
  },
  {
    id: "location",
    title: "Matching",
    subtitle: "5 pros available nearby",
    icon: Location01Icon,
  },
  {
    id: "verify",
    title: "Verifying",
    subtitle: "Checking availability...",
    icon: UserCheck01Icon,
  },
  {
    id: "matched",
    title: "Perfect Match!",
    subtitle: "Maria Camila is available now",
    icon: SparklesIcon,
  },
];

/**
 * Instant Match Card
 *
 * Animated visualization of the instant matching process with warm colors.
 * Profile is only revealed on the final "matched" phase.
 *
 * Features:
 * - Auto-play progression through phases
 * - Abstract searching animation during search phases
 * - Profile reveal animation on match
 * - Phase indicator dots
 * - Warm rausch/amber color scheme
 */
export function InstantMatchCard({
  autoPlay = true,
  autoPlayInterval = 2500,
  onPhaseChange,
  disableAnimation = false,
  className,
}: InstantMatchCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  const { currentStep, setStep, pause, resume, isPaused } = useAutoPlay({
    totalSteps: MATCH_PHASES.length,
    interval: autoPlayInterval,
    enabled: autoPlay && shouldAnimate,
    onStepChange: onPhaseChange,
  });

  const currentPhase = MATCH_PHASES[currentStep];
  const isMatched = currentStep === MATCH_PHASES.length - 1;

  return (
    <motion.div
      animate="visible"
      aria-label="Instant matching process"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-rausch-50 via-white to-amber-50/60",
        "border border-rausch-200/60",
        "p-6 shadow-lg shadow-rausch-200/30",
        "dark:from-rausch-950/40 dark:via-stone-900 dark:to-amber-950/30",
        "dark:border-rausch-800/40 dark:shadow-rausch-950/40",
        className
      )}
      initial={shouldAnimate ? "hidden" : "visible"}
      onBlur={resume}
      onFocus={pause}
      onMouseEnter={pause}
      onMouseLeave={resume}
      role="region"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: PRIMARY_EASE },
        },
      }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-rausch-100 px-3 py-1.5 font-medium text-rausch-700 text-xs dark:bg-rausch-900/50 dark:text-rausch-300">
          <motion.span
            animate={shouldAnimate ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : undefined}
            className="h-2 w-2 rounded-full bg-rausch-500"
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
          Instant Matches
        </span>
      </div>

      {/* Phase Indicators */}
      <div className="mb-6 flex items-center justify-center gap-2" role="list">
        {MATCH_PHASES.map((phase, index) => (
          <button
            aria-current={index === currentStep ? "step" : undefined}
            aria-label={`${phase.title}${index < currentStep ? " (completed)" : index === currentStep ? " (current)" : ""}`}
            className={cn(
              "relative h-2.5 w-2.5 rounded-full transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
              index === currentStep && "h-3 w-3 bg-rausch-500",
              index < currentStep && "bg-green-500",
              index > currentStep && "bg-rausch-200 dark:bg-rausch-700"
            )}
            key={phase.id}
            onClick={() => setStep(index)}
            type="button"
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-rausch-100 bg-white/80 p-5 dark:border-rausch-800/40 dark:bg-stone-800/40">
        <AnimatePresence mode="wait">
          {isMatched ? (
            /* Matched State - Profile Revealed */
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
              key="matched"
              transition={{ duration: 0.4, ease: PRIMARY_EASE }}
            >
              {/* Success Header */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                  <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle01Icon} />
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {currentPhase.title}
                </span>
              </motion.div>

              {/* Profile Card */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={shouldAnimate ? { scale: [1, 1.03, 1] } : undefined}
                  className="relative"
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-green-400 shadow-md">
                    <Image
                      alt="Maria Camila"
                      className="object-cover"
                      fill
                      sizes="64px"
                      src="/mariacamila.png"
                    />
                  </div>
                  {/* Online indicator */}
                  <motion.div
                    animate={shouldAnimate ? { scale: [1, 1.2, 1] } : undefined}
                    className="-right-1 -bottom-1 absolute h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-stone-800"
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>

                <div className="flex-1">
                  <div className="font-semibold text-foreground">Maria Camila</div>
                  <div className="text-muted-foreground text-sm">Cleaning Specialist</div>
                  <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
                    <HugeiconsIcon className="h-3 w-3" icon={Location01Icon} />
                    <span>2.3 km away • Bogotá</span>
                  </div>
                </div>
              </motion.div>

              {/* Match Stats */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-3 gap-2"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <div className="rounded-lg bg-rausch-50 p-2 text-center dark:bg-rausch-900/30">
                  <div className="font-semibold text-foreground text-sm">4.9</div>
                  <div className="text-muted-foreground text-xs">Rating</div>
                </div>
                <div className="rounded-lg bg-rausch-50 p-2 text-center dark:bg-rausch-900/30">
                  <div className="font-semibold text-foreground text-sm">127</div>
                  <div className="text-muted-foreground text-xs">Jobs</div>
                </div>
                <div className="rounded-lg bg-rausch-50 p-2 text-center dark:bg-rausch-900/30">
                  <div className="font-semibold text-foreground text-sm">98%</div>
                  <div className="text-muted-foreground text-xs">On-time</div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Searching State - Abstract Animation */
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
              key="searching"
              transition={{ duration: 0.3 }}
            >
              {/* Pulsing Search Animation */}
              <div className="relative mb-5">
                {/* Outer pulse rings */}
                {shouldAnimate && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                      className="absolute inset-0 rounded-full bg-rausch-400"
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                      className="absolute inset-0 rounded-full bg-rausch-300"
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                    />
                  </>
                )}
                {/* Icon container */}
                <div
                  className={cn(
                    "relative flex h-16 w-16 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-rausch-500 to-rausch-600 text-white",
                    "shadow-lg shadow-rausch-300/50 dark:shadow-rausch-900/50"
                  )}
                >
                  <HugeiconsIcon className="h-7 w-7" icon={currentPhase.icon} />
                </div>
              </div>

              {/* Phase Info */}
              <h3 className="mb-1 font-semibold text-foreground text-lg">{currentPhase.title}</h3>
              <p className="text-muted-foreground text-sm">{currentPhase.subtitle}</p>

              {/* Loading dots */}
              <div className="mt-4 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    animate={shouldAnimate ? { y: [0, -6, 0] } : undefined}
                    className="h-2 w-2 rounded-full bg-rausch-400"
                    key={i}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Match Animation Overlay */}
      <AnimatePresence>
        {isMatched && shouldAnimate && (
          <motion.div
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-green-400/40 ring-inset"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Pause Indicator */}
      {isPaused && (
        <motion.div
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-muted-foreground text-xs"
          initial={{ opacity: 0 }}
        >
          Paused - hover to resume
        </motion.div>
      )}
    </motion.div>
  );
}
