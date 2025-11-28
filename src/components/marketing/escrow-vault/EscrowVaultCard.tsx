"use client";

import { Shield01Icon, UserIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";
import {
  escrowCardVariants,
  escrowElementVariants,
  flowLineVariants,
  shieldPulseVariants,
} from "../animations";
import type { EscrowVaultCardProps } from "../types";
import { useCountUp } from "./useCountUp";

/**
 * Escrow Vault Card
 *
 * Interactive visualization of the payment protection flow:
 * Client → Escrow Shield → Professional
 *
 * Features:
 * - Animated count-up for the protected amount
 * - Pulsing shield icon representing secure escrow
 * - Animated SVG flow lines showing money movement
 * - Dark theme with rausch accent highlights
 */
export function EscrowVaultCard({
  amount = 35,
  currency = "USD",
  countUpDuration = 2000,
  disableAnimation = false,
  className,
}: EscrowVaultCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(disableAnimation || prefersReducedMotion);

  const displayValue = useCountUp({
    target: amount,
    duration: countUpDuration,
    delay: 600, // Start after card entrance
    disabled: !shouldAnimate,
  });

  const formattedAmount = formatCurrency(displayValue, currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <motion.div
      animate="visible"
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-2xl",
        // Light mode: dark stone background
        "bg-gradient-to-br from-stone-900 to-stone-950 p-6",
        "border border-stone-800/60",
        "shadow-stone-950/60 shadow-xl",
        // Dark mode: brand burgundy gradient
        "dark:from-rausch-950/90 dark:via-rausch-950 dark:to-stone-950",
        "dark:border-rausch-800/40 dark:shadow-rausch-950/40",
        className
      )}
      initial={shouldAnimate ? "hidden" : "visible"}
      variants={escrowCardVariants}
      whileHover={shouldAnimate ? "hover" : undefined}
    >
      {/* Header */}
      <motion.div className="mb-6 text-center" variants={escrowElementVariants}>
        <span className="inline-flex items-center gap-2 rounded-full bg-rausch-950/50 px-3 py-1 font-medium text-rausch-400 text-xs dark:bg-rausch-800/50 dark:text-rausch-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rausch-400" />
          Payment Protected
        </span>
      </motion.div>

      {/* Flow Diagram */}
      <div className="relative flex items-center justify-between px-2">
        {/* Client Icon */}
        <motion.div className="flex flex-col items-center gap-2" variants={escrowElementVariants}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-800 text-stone-400 dark:bg-rausch-900/60 dark:text-rausch-300">
            <HugeiconsIcon className="h-7 w-7" icon={UserIcon} />
          </div>
          <span className="font-medium text-stone-500 text-xs dark:text-rausch-400">Client</span>
        </motion.div>

        {/* Flow Line Left */}
        <svg
          aria-hidden="true"
          className="-translate-y-1/2 absolute top-1/2 left-[72px] h-6 w-[calc(50%-56px)]"
          preserveAspectRatio="none"
          viewBox="0 0 100 24"
        >
          <motion.path
            animate={shouldAnimate ? ["visible", "animate"] : "visible"}
            d="M 0 12 L 100 12"
            fill="none"
            initial="hidden"
            stroke="rgb(122, 59, 74)"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeWidth="2"
            variants={flowLineVariants}
          />
        </svg>

        {/* Central Shield */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-2"
          variants={escrowElementVariants}
        >
          <motion.div
            animate={shouldAnimate ? "pulse" : undefined}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rausch-500 to-rausch-700 text-white shadow-lg shadow-rausch-500/30"
            variants={shouldAnimate ? shieldPulseVariants : undefined}
          >
            <HugeiconsIcon className="h-10 w-10" icon={Shield01Icon} />
          </motion.div>
          <span className="font-medium text-stone-400 text-xs dark:text-rausch-300">Escrow</span>
        </motion.div>

        {/* Flow Line Right */}
        <svg
          aria-hidden="true"
          className="-translate-y-1/2 absolute top-1/2 right-[72px] h-6 w-[calc(50%-56px)]"
          preserveAspectRatio="none"
          viewBox="0 0 100 24"
        >
          <motion.path
            animate={shouldAnimate ? ["visible", "animate"] : "visible"}
            d="M 0 12 L 100 12"
            fill="none"
            initial="hidden"
            stroke="rgb(122, 59, 74)"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeWidth="2"
            transition={{ delay: 0.2 }}
            variants={flowLineVariants}
          />
        </svg>

        {/* Professional Icon */}
        <motion.div className="flex flex-col items-center gap-2" variants={escrowElementVariants}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-800 text-stone-400 dark:bg-rausch-100 dark:text-rausch-600">
            <HugeiconsIcon className="h-7 w-7" icon={UserMultiple02Icon} />
          </div>
          <span className="font-medium text-stone-500 text-xs dark:text-neutral-600">Pro</span>
        </motion.div>
      </div>

      {/* Amount Display */}
      <motion.div className="mt-8 text-center" variants={escrowElementVariants}>
        <div className="mb-1 font-medium text-stone-500 text-xs uppercase tracking-wider dark:text-neutral-500">
          Protected Amount
        </div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="font-bold font-mono text-4xl text-stone-100 dark:text-rausch-100"
          initial={{ opacity: 0, y: 10 }}
          transition={{
            delay: shouldAnimate ? 0.4 : 0,
            duration: 0.4,
          }}
        >
          {formattedAmount}
        </motion.div>
        <div className="mt-2 text-stone-500 text-xs dark:text-neutral-500">
          Funds held securely until service completion
        </div>
      </motion.div>

      {/* Bottom Status Bar */}
      <motion.div
        className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-green-950/30 px-4 py-2 dark:bg-green-100"
        variants={escrowElementVariants}
      >
        <motion.span
          animate={
            shouldAnimate
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }
              : undefined
          }
          className="h-2 w-2 rounded-full bg-green-500"
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <span className="font-medium text-green-400 text-xs dark:text-green-700">
          Secure &amp; Protected
        </span>
      </motion.div>
    </motion.div>
  );
}
