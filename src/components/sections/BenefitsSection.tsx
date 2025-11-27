"use client";

import {
  Add01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

// ============================================================================
// VISUAL COMPONENTS - Coded illustrations for bento cards
// ============================================================================

function VerifiedProfileVisual({
  isExpanded,
  setIsExpanded,
  t,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <div className="relative flex items-center justify-center py-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="-top-8 -right-8 absolute h-32 w-32 rounded-full bg-muted/60 blur-2xl" />
          <div className="-bottom-4 -left-4 absolute h-24 w-24 rounded-full bg-muted/50 blur-xl" />
        </div>

        {/* Stacked Cards Container */}
        <div className="relative w-full max-w-[260px] pr-5 pb-5">
          {/* Background Card (offset) */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            className="absolute top-3 right-0 bottom-0 left-3 z-0 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-lg"
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Cover image */}
            <div className="relative h-20 overflow-hidden">
              <Image alt="Background" className="object-cover opacity-50" fill src="/guatape.png" />
            </div>
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50" />
              </div>
              <div className="opacity-60">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-muted-foreground text-sm">
                    {t("visuals.profileCard.backgroundName")}
                  </span>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-medium text-[10px] text-amber-700">
                    {t("visuals.profileCard.proBadge")}
                  </span>
                </div>
                <p className="text-muted-foreground/70 text-xs">
                  {t("visuals.profileCard.backgroundSpecialty")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Profile Card - Tilted */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            className="group -rotate-2 relative z-10 w-full origin-bottom-left overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Cover image */}
            <div className="relative h-24 overflow-hidden">
              <Image alt="Profile cover" className="object-cover" fill src="/guatape.png" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Profile content */}
            <div className="relative px-4 pt-3 pb-4">
              {/* Avatar - positioned to overlap cover */}
              <div className="-top-10 absolute left-4">
                <div className="relative">
                  <div className="aspect-square h-16 w-16 overflow-hidden rounded-full border-[3px] border-card bg-muted shadow-lg">
                    <Image
                      alt="María Camila"
                      className="h-full w-full object-cover"
                      fill
                      src="/mariacamila.png"
                    />
                  </div>
                  {/* Verification badge */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    className="-right-0.5 -bottom-0.5 absolute flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white group-hover:animate-badge-glow"
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <HugeiconsIcon className="h-3 w-3 text-white" icon={CheckmarkCircle02Icon} />
                  </motion.div>
                </div>
              </div>

              {/* Name and details - positioned next to avatar */}
              <div className="ml-[76px] min-h-[40px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground text-sm">
                    {t("visuals.profileCard.mainName")}
                  </span>
                  <span className="rounded-full bg-rausch-100 px-1.5 py-0.5 font-medium text-[10px] text-rausch-700 dark:bg-rausch-500/20 dark:text-rausch-400">
                    {t("visuals.profileCard.proBadge")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("visuals.profileCard.mainSpecialty")}
                </p>
              </div>

              {/* Rating row - clean single line */}
              <div className="mt-3 flex items-center gap-1.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      icon={StarIcon}
                      key={star}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground text-sm">4.9</span>
                <span className="text-muted-foreground/70 text-xs">
                  {t("visuals.profileCard.reviewCount")}
                </span>
              </div>

              {/* Verification badges - horizontal pills */}
              <div className="mt-3 flex gap-2">
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                  <HugeiconsIcon className="h-3 w-3" icon={Shield01Icon} />
                  {t("visuals.profileCard.idVerified")}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-babu-200 bg-babu-50 px-2 py-1 text-[10px] text-babu-700 dark:border-babu-500/30 dark:bg-babu-500/10 dark:text-babu-400">
                  <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle02Icon} />
                  {t("visuals.profileCard.backgroundCheck")}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && setIsExpanded && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-all hover:bg-muted/80"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Cancel01Icon} />
              </button>

              {/* Large cover image */}
              <div className="relative h-48 w-full">
                <Image
                  alt="Professional profile"
                  className="object-cover"
                  fill
                  src="/guatape.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="-top-12 absolute left-6">
                  <div className="relative">
                    <div className="aspect-square h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-xl">
                      <Image
                        alt="María Camila"
                        className="h-full w-full object-cover"
                        fill
                        src="/mariacamila.png"
                      />
                    </div>
                    <div className="-right-1 -bottom-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                    </div>
                  </div>
                </div>

                <div className="pt-16">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-foreground">
                      {t("visuals.profileCard.mainName")}
                    </h3>
                    <span className="rounded-full bg-rausch-100 px-3 py-1 font-semibold text-rausch-700 text-sm dark:bg-rausch-500/20 dark:text-rausch-400">
                      {t("visuals.profileCard.proBadge")}
                    </span>
                  </div>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {t("visuals.profileCard.mainSpecialty")}
                  </p>

                  {/* Rating */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HugeiconsIcon
                          className="h-5 w-5 fill-amber-400 text-amber-400"
                          icon={StarIcon}
                          key={star}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground text-lg">4.9</span>
                    <span className="text-muted-foreground">
                      {t("visuals.profileCard.reviewCount")}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {t("visuals.profileCard.bio")}
                  </p>

                  {/* Verification badges */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 font-medium text-green-700 text-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                      <HugeiconsIcon className="h-4 w-4" icon={Shield01Icon} />
                      {t("visuals.profileCard.idVerified")}
                    </span>
                    <span className="flex items-center gap-2 rounded-full border border-babu-200 bg-babu-50 px-4 py-2 font-medium text-babu-700 text-sm dark:border-babu-500/30 dark:bg-babu-500/10 dark:text-babu-400">
                      <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle02Icon} />
                      {t("visuals.profileCard.backgroundCheck")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SecurePaymentVisual({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="relative flex flex-col items-center gap-3 py-2">
      {/* Payment flow animation */}
      <div className="flex w-full items-center justify-center gap-2">
        {/* Customer wallet */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-rausch-400 to-rausch-600" />
        </motion.div>

        {/* Arrow flow */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              className="h-1.5 w-1.5 rounded-full bg-rausch-400"
              key={i}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Casaora escrow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-rausch-200 bg-rausch-50 dark:border-rausch-500/50 dark:bg-rausch-500/20"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        >
          <HugeiconsIcon className="h-6 w-6 text-rausch-600" icon={Shield01Icon} />
        </motion.div>

        {/* Arrow flow */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              className="h-1.5 w-1.5 rounded-full bg-green-400"
              key={i}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 1 + i * 0.2 }}
            />
          ))}
        </div>

        {/* Professional */}
        <motion.div
          animate={{ x: [0, -4, 0] }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1.5 }}
        >
          <span className="font-semibold text-green-700 text-sm dark:text-green-400">$</span>
        </motion.div>
      </div>

      {/* Transaction card */}
      <div className="w-full max-w-[220px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-border border-b px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {t("visuals.securePayment.paymentHeld")}
            </span>
            <span className="flex items-center gap-1 text-green-600 text-xs dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {t("visuals.securePayment.protected")}
            </span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground text-sm">
              {t("visuals.securePayment.amount")}
            </span>
            <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={CreditCardIcon} />
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {t("visuals.securePayment.releasedWhen")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewsVisual({
  isExpanded,
  setIsExpanded,
  t,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        {/* Stacked Testimonial Cards Container */}
        <div className="relative pr-6 pb-6">
          {/* Background testimonial card (offset) */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            className="absolute top-4 right-0 bottom-0 left-4 z-0 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md"
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="p-4 opacity-50">
              <div className="mb-2 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HugeiconsIcon
                    className="h-3.5 w-3.5 fill-amber-300 text-amber-300"
                    icon={StarIcon}
                    key={star}
                  />
                ))}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                {t("visuals.reviews.backgroundReview")}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-babu-200 to-babu-300 dark:from-babu-400 dark:to-babu-500" />
              <span className="text-muted-foreground text-xs">
                {t("visuals.reviews.backgroundName")}
              </span>
            </div>
          </motion.div>

          {/* Featured testimonial card - Tilted */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            className="relative z-10 origin-bottom-left rotate-1 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Quote */}
            <div className="p-4">
              <div className="mb-3 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HugeiconsIcon
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    icon={StarIcon}
                    key={star}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("visuals.reviews.featuredReview")}
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 border-border border-t bg-muted/50 px-4 py-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  alt={t("visuals.reviews.featuredName")}
                  className="object-cover"
                  fill
                  src="/review-brooke.png"
                />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {t("visuals.reviews.featuredName")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("visuals.reviews.verifiedCustomer")}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20"
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <HugeiconsIcon
                  className="h-3 w-3 text-green-600 dark:text-green-400"
                  icon={CheckmarkCircle02Icon}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && setIsExpanded && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-all hover:bg-muted/80"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Cancel01Icon} />
              </button>

              {/* Content */}
              <div className="flex gap-6 p-6">
                {/* Avatar */}
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    alt={t("visuals.reviews.featuredName")}
                    className="object-cover"
                    fill
                    src="/review-brooke.png"
                  />
                </div>

                <div className="flex-1">
                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HugeiconsIcon
                        className="h-6 w-6 fill-amber-400 text-amber-400"
                        icon={StarIcon}
                        key={star}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t("visuals.reviews.featuredReview")}
                  </p>

                  {/* Author info */}
                  <div className="mt-6 flex items-center gap-3">
                    <div>
                      <p className="font-bold text-foreground text-xl">
                        {t("visuals.reviews.featuredName")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("visuals.reviews.verifiedCustomer")}
                      </p>
                    </div>
                    <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                      <HugeiconsIcon
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        icon={CheckmarkCircle02Icon}
                      />
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="mt-4 flex gap-4 border-border border-t pt-4 text-muted-foreground text-sm">
                    <span>{t("visuals.reviews.hiredFor")}</span>
                    <span>•</span>
                    <span>{t("visuals.reviews.location")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function InstantBookingVisual({ t }: { t: ReturnType<typeof useTranslations> }) {
  const times = t.raw("visuals.calendar.times") as string[];

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Mini calendar */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-foreground text-sm">{t("visuals.calendar.month")}</span>
          <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Calendar03Icon} />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {(t.raw("visuals.calendar.days") as string[]).map((d, i) => (
            <span className="text-muted-foreground" key={`day-${d}-${i}`}>
              {d}
            </span>
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <span className="text-muted-foreground/50" key={`prev-${i}`}>
              {24 + i}
            </span>
          ))}
          {Array.from({ length: 21 }).map((_, i) => (
            <motion.span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg text-sm",
                i + 1 === 21
                  ? "bg-rausch-500 font-medium text-white"
                  : i + 1 === 22
                    ? "border border-rausch-200 bg-rausch-50 text-rausch-600 dark:border-rausch-500/50 dark:bg-rausch-500/20 dark:text-rausch-400"
                    : "text-muted-foreground"
              )}
              key={`curr-${i}`}
              whileHover={{ scale: i + 1 !== 21 ? 1.1 : 1 }}
            >
              {i + 1}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-2 gap-2">
        {times.map((time, i) => (
          <motion.button
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              i === 1
                ? "border-rausch-500 bg-rausch-50 font-medium text-rausch-600 dark:border-rausch-500/50 dark:bg-rausch-500/20 dark:text-rausch-400"
                : "border-border text-muted-foreground hover:border-rausch-200 dark:hover:border-rausch-500/50"
            )}
            key={time}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {time}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BENTO CARD DATA
// ============================================================================

type BentoCard = {
  id: string;
  title: string;
  description: string;
  visual:
    | React.ReactNode
    | ((props: { isExpanded: boolean; setIsExpanded: (v: boolean) => void }) => React.ReactNode);
  span: string;
  gradient?: string;
  expandable?: boolean;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function BenefitsSection() {
  const t = useTranslations("features");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const bentoCards: BentoCard[] = [
    {
      id: "verified",
      title: t("verifiedProfessionals.title"),
      description: t("verifiedProfessionals.description"),
      visual: ({ isExpanded, setIsExpanded }) => (
        <VerifiedProfileVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} t={t} />
      ),
      span: "md:col-span-2 md:row-span-2 lg:col-span-3",
      gradient: "from-rausch-50/80 via-white to-amber-50/40",
      expandable: true,
    },
    {
      id: "payments",
      title: t("securePayments.title"),
      description: t("securePayments.description"),
      visual: <SecurePaymentVisual t={t} />,
      span: "md:col-span-2 lg:col-span-3",
      gradient: "from-rausch-50/60 via-white to-amber-50/40",
    },
    {
      id: "reviews",
      title: t("reviewSystem.title"),
      description: t("reviewSystem.description"),
      visual: ({ isExpanded, setIsExpanded }) => (
        <ReviewsVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} t={t} />
      ),
      span: "md:col-span-2 md:row-span-2 lg:col-span-3",
      gradient: "from-amber-50/60 via-white to-rausch-50/40",
      expandable: true,
    },
    {
      id: "booking",
      title: t("realTimeBooking.title"),
      description: t("realTimeBooking.description"),
      visual: <InstantBookingVisual t={t} />,
      span: "md:col-span-2 lg:col-span-3",
      gradient: "from-amber-50/60 via-white to-rausch-50/40",
    },
  ];

  return (
    <section className="bg-muted py-16 md:py-24" id="benefits">
      <Container className="max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-rausch-100 px-4 py-1.5 dark:bg-rausch-500/20"
            initial={{ opacity: 0, y: 10 }}
          >
            <span className="h-2 w-2 rounded-full bg-rausch-500" />
            <span className="font-medium text-rausch-700 text-sm dark:text-rausch-400">
              {t("tag")}
            </span>
          </motion.div>

          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl font-semibold text-3xl text-foreground leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            {t("title")}
          </motion.h2>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Bento grid */}
        <motion.div
          animate="visible"
          className="grid gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-6"
          initial="hidden"
          variants={containerVariants}
        >
          {bentoCards.map((card) => {
            const isExpanded = expandedCard === card.id;
            const setIsExpanded = (value: boolean) => setExpandedCard(value ? card.id : null);

            return (
              <motion.div
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg",
                  card.span,
                  card.gradient &&
                    `bg-gradient-to-br ${card.gradient} dark:from-card dark:via-card dark:to-card`
                )}
                key={card.id}
                variants={cardVariants}
              >
                <div className="flex h-full flex-col p-5 md:p-6">
                  {/* Visual component */}
                  <div className="mb-4 flex-1">
                    {typeof card.visual === "function"
                      ? card.visual({ isExpanded, setIsExpanded })
                      : card.visual}
                  </div>

                  {/* Text content */}
                  <div>
                    <h3 className="font-semibold text-foreground text-lg md:text-xl">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed md:text-base">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Plus button - positioned at right side of container */}
                {card.expandable && (
                  <button
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md transition-all hover:scale-110 hover:bg-muted"
                    onClick={() => setIsExpanded(true)}
                    type="button"
                  >
                    <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Add01Icon} />
                  </button>
                )}

                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/0 via-transparent to-card/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
