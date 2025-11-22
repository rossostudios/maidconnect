"use client";

import {
  Add01Icon,
  BabyBed01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ChefHatIcon,
  CreditCardIcon,
  FavouriteIcon,
  Home01Icon,
  Message01Icon,
  PackageIcon,
  Shield01Icon,
  StarIcon,
  UserLove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

// ============================================================================
// VISUAL COMPONENTS - Coded illustrations for bento cards
// ============================================================================

function VerifiedProfileVisual({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
}) {
  return (
    <>
      <div className="relative flex items-center justify-center py-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="-top-8 -right-8 absolute h-32 w-32 rounded-full bg-neutral-200/40 blur-2xl" />
          <div className="-bottom-4 -left-4 absolute h-24 w-24 rounded-full bg-neutral-200/30 blur-xl" />
        </div>

        {/* Stacked Cards Container */}
        <div className="relative w-full max-w-[280px] pr-6 pb-6">
          {/* Background Card (offset) */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            className="absolute top-4 right-0 bottom-0 left-4 z-0 overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-50 shadow-lg"
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Cover image */}
            <div className="relative h-14 overflow-hidden">
              <Image alt="Background" className="object-cover opacity-60" fill src="/pricing.png" />
            </div>
            <div className="px-4 pt-10 pb-4">
              <div className="flex items-center gap-2 opacity-50">
                <span className="font-semibold text-neutral-700">Laura Sofia</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs">
                  Pro
                </span>
              </div>
              <p className="mt-0.5 text-neutral-400 text-sm">Childcare • Medellín</p>
            </div>
          </motion.div>

          {/* Main Profile Card - Tilted */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            className="-rotate-2 relative z-10 w-full origin-bottom-left overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-neutral-200/50 shadow-xl"
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Cover image */}
            <div className="relative h-16 overflow-hidden">
              <Image alt="Profile cover" className="object-cover" fill src="/pricing.png" />
            </div>

            {/* Avatar section */}
            <div className="relative px-4 pb-4">
              <div className="-top-8 absolute left-4">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-lg">
                    <Image alt="María Camila" className="object-cover" fill src="/Brooke.png" />
                  </div>
                  {/* Verification badge */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    className="-right-1 -bottom-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-md"
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 text-white"
                      icon={CheckmarkCircle02Icon}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="mt-12 pl-[72px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">María Camila</span>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700 text-xs">
                    Pro
                  </span>
                </div>
                <p className="mt-0.5 text-neutral-500 text-sm">Cleaning Specialist • Bogotá</p>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HugeiconsIcon
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      icon={StarIcon}
                      key={star}
                    />
                  ))}
                  <span className="ml-1 font-medium text-neutral-700 text-sm">4.9</span>
                  <span className="text-neutral-400 text-sm">(127 reviews)</span>
                </div>

                {/* Verification badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-green-700 text-xs">
                    <HugeiconsIcon className="h-3 w-3" icon={Shield01Icon} />
                    ID Verified
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700 text-xs">
                    <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle02Icon} />
                    Background Check
                  </span>
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100/80 backdrop-blur-sm transition-all hover:bg-neutral-200"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-600" icon={Cancel01Icon} />
              </button>

              {/* Large cover image */}
              <div className="relative h-48 w-full">
                <Image
                  alt="Professional profile"
                  className="object-cover"
                  fill
                  src="/pricing.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="-top-12 absolute left-6">
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl">
                      <Image alt="María Camila" className="object-cover" fill src="/Brooke.png" />
                    </div>
                    <div className="-right-1 -bottom-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-md">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                    </div>
                  </div>
                </div>

                <div className="pt-16">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-neutral-900">María Camila</h3>
                    <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700 text-sm">
                      Pro
                    </span>
                  </div>
                  <p className="mt-1 text-lg text-neutral-600">Cleaning Specialist • Bogotá</p>

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
                    <span className="font-semibold text-lg text-neutral-900">4.9</span>
                    <span className="text-neutral-500">(127 reviews)</span>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 text-neutral-700 leading-relaxed">
                    "I've been a professional cleaner for 8 years, specializing in deep cleaning and
                    organizing. I treat every home as if it were my own, with attention to detail
                    and care for your belongings."
                  </p>

                  {/* Verification badges */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 font-medium text-green-700 text-sm">
                      <HugeiconsIcon className="h-4 w-4" icon={Shield01Icon} />
                      ID Verified
                    </span>
                    <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 font-medium text-blue-700 text-sm">
                      <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle02Icon} />
                      Background Check
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

function SecurePaymentVisual() {
  return (
    <div className="relative flex flex-col items-center gap-3 py-2">
      {/* Payment flow animation */}
      <div className="flex w-full items-center justify-center gap-2">
        {/* Customer wallet */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-400 to-orange-600" />
        </motion.div>

        {/* Arrow flow */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              className="h-1.5 w-1.5 rounded-full bg-orange-400"
              key={i}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Casaora escrow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-orange-200 bg-orange-50"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        >
          <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Shield01Icon} />
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
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1.5 }}
        >
          <span className="font-semibold text-green-700 text-sm">$</span>
        </motion.div>
      </div>

      {/* Transaction card */}
      <div className="w-full max-w-[220px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-neutral-100 border-b px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Payment held securely</span>
            <span className="flex items-center gap-1 text-green-600 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Protected
            </span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-900 text-sm">$85,000 COP</span>
            <HugeiconsIcon className="h-4 w-4 text-neutral-400" icon={CreditCardIcon} />
          </div>
          <p className="mt-0.5 text-neutral-400 text-xs">Released when service is complete</p>
        </div>
      </div>
    </div>
  );
}

function ReviewsVisual({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        {/* Stacked Testimonial Cards Container */}
        <div className="relative pr-6 pb-6">
          {/* Background testimonial card (offset) */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            className="absolute top-4 right-0 bottom-0 left-4 z-0 overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-50 shadow-md"
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
              <p className="line-clamp-2 text-neutral-500 text-xs leading-relaxed">
                "The professionals on Casaora are amazing. I've hired three different cleaners and
                each one has been..."
              </p>
            </div>
            <div className="flex items-center gap-2 bg-neutral-100/50 px-4 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-200 to-blue-300" />
              <span className="text-neutral-400 text-xs">Andrea M.</span>
            </div>
          </motion.div>

          {/* Featured testimonial card - Tilted */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            className="relative z-10 origin-bottom-left rotate-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg"
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
              <p className="text-neutral-700 text-sm leading-relaxed">
                "Finding reliable help at home used to be so stressful. Casaora verified
                everything—background checks, interviews, reviews—so I could focus on my family."
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 border-neutral-100 border-t bg-neutral-50/50 px-4 py-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image alt="Brooke" className="object-cover" fill src="/Brooke.png" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Brooke</p>
                <p className="text-neutral-500 text-xs">Verified Customer</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-100"
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <HugeiconsIcon className="h-3 w-3 text-green-600" icon={CheckmarkCircle02Icon} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Review stats - centered */}
        <div className="mx-auto flex w-fit items-center gap-6 rounded-xl border border-neutral-200 bg-white px-6 py-3 shadow-sm">
          <div className="text-center">
            <p className="font-bold text-2xl text-neutral-900">4.9</p>
            <p className="text-neutral-500 text-xs">Avg rating</p>
          </div>
          <div className="h-10 w-px bg-neutral-200" />
          <div className="text-center">
            <p className="font-bold text-2xl text-neutral-900">2.4k</p>
            <p className="text-neutral-500 text-xs">Reviews</p>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && setIsExpanded && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-600" icon={Cancel01Icon} />
              </button>

              {/* Content */}
              <div className="flex gap-6 p-6">
                {/* Avatar */}
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                  <Image alt="Brooke" className="object-cover" fill src="/Brooke.png" />
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
                  <p className="text-lg text-neutral-700 leading-relaxed">
                    "Finding reliable help at home used to be so stressful. Casaora verified
                    everything—background checks, interviews, reviews—so I could focus on my
                    family."
                  </p>

                  {/* Author info */}
                  <div className="mt-6 flex items-center gap-3">
                    <div>
                      <p className="font-bold text-neutral-900 text-xl">Brooke</p>
                      <p className="text-neutral-500">Verified Customer</p>
                    </div>
                    <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <HugeiconsIcon
                        className="h-5 w-5 text-green-600"
                        icon={CheckmarkCircle02Icon}
                      />
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="mt-4 flex gap-4 border-neutral-100 border-t pt-4 text-neutral-500 text-sm">
                    <span>Hired for: Cleaning</span>
                    <span>•</span>
                    <span>Bogotá, Colombia</span>
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

function BackgroundCheckVisual() {
  const checks = [
    { label: "Identity", done: true },
    { label: "Criminal", done: true },
    { label: "References", done: true },
  ];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Shield animation */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        className="relative"
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200 shadow-lg">
          <HugeiconsIcon className="h-10 w-10 text-white" icon={Shield01Icon} />
        </div>
        <motion.div
          animate={{ scale: [0, 1.5, 0], opacity: [0.5, 0, 0.5] }}
          className="absolute inset-0 rounded-2xl border-2 border-green-400"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checks.map((check, i) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            key={check.label}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <HugeiconsIcon className="h-3 w-3 text-green-600" icon={CheckmarkCircle02Icon} />
            </div>
            <span className="text-neutral-700 text-sm">{check.label} verified</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InstantBookingVisual() {
  const times = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Mini calendar */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-neutral-900 text-sm">November 2025</span>
          <HugeiconsIcon className="h-4 w-4 text-neutral-400" icon={Calendar03Icon} />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span className="text-neutral-400" key={`day-${d}-${i}`}>
              {d}
            </span>
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <span className="text-neutral-300" key={`prev-${i}`}>
              {24 + i}
            </span>
          ))}
          {Array.from({ length: 21 }).map((_, i) => (
            <motion.span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg text-sm",
                i + 1 === 21
                  ? "bg-orange-500 font-medium text-white"
                  : i + 1 === 22
                    ? "border border-orange-200 bg-orange-50 text-orange-600"
                    : "text-neutral-700"
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
                ? "border-orange-500 bg-orange-50 font-medium text-orange-600"
                : "border-neutral-200 text-neutral-600 hover:border-orange-200"
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

function SupportChatVisual() {
  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Chat messages */}
      <div className="flex flex-col gap-2">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-3 py-2 text-sm text-white">
            I need help with my booking
          </div>
        </div>

        {/* Support response */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
            <HugeiconsIcon className="h-4 w-4 text-orange-600" icon={Message01Icon} />
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-neutral-100 px-3 py-2 text-neutral-800 text-sm">
            Hi! I'd be happy to help. What seems to be the issue?
          </div>
        </motion.div>

        {/* Typing indicator */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          className="flex gap-2"
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
            <HugeiconsIcon className="h-4 w-4 text-orange-600" icon={Message01Icon} />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                animate={{ y: [0, -3, 0] }}
                className="h-1.5 w-1.5 rounded-full bg-neutral-400"
                key={i}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Response time badge */}
      <div className="mt-1 flex items-center justify-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-neutral-500 text-xs">Avg response: 2 min</span>
      </div>
    </div>
  );
}

function ServicesVisual() {
  const services = [
    { icon: Home01Icon, label: "Cleaning", color: "bg-blue-50 text-blue-600" },
    { icon: BabyBed01Icon, label: "Childcare", color: "bg-pink-50 text-pink-600" },
    { icon: ChefHatIcon, label: "Cooking", color: "bg-amber-50 text-amber-600" },
    { icon: UserLove01Icon, label: "Elder Care", color: "bg-rose-50 text-rose-600" },
    { icon: FavouriteIcon, label: "Pet Care", color: "bg-teal-50 text-teal-600" },
    { icon: PackageIcon, label: "Laundry", color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      {services.map((service, i) => (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl p-2.5",
            service.color.split(" ")[0]
          )}
          key={service.label}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm",
              service.color.split(" ")[1]
            )}
          >
            <HugeiconsIcon className="h-5 w-5" icon={service.icon} />
          </div>
          <span className={cn("font-medium text-[10px]", service.color.split(" ")[1])}>
            {service.label}
          </span>
        </motion.div>
      ))}
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

const bentoCards: BentoCard[] = [
  {
    id: "verified",
    title: "Verified professionals",
    description:
      "Every professional passes ID verification and background checks. See real reviews from families in your area.",
    visual: ({ isExpanded, setIsExpanded }) => (
      <VerifiedProfileVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    ),
    span: "md:col-span-2 md:row-span-2",
    gradient: "from-orange-50/80 via-white to-amber-50/40",
    expandable: true,
  },
  {
    id: "payments",
    title: "Secure payments",
    description: "Payments are held safely until the job is complete. No cash, no hassle.",
    visual: <SecurePaymentVisual />,
    span: "md:col-span-2",
    gradient: "from-sky-50/60 via-white to-slate-50/40",
  },
  {
    id: "reviews",
    title: "Real reviews",
    description: "Read honest feedback from families who've hired the same professionals.",
    visual: ({ isExpanded, setIsExpanded }) => (
      <ReviewsVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    ),
    span: "md:col-span-2 md:row-span-2",
    gradient: "from-amber-50/60 via-white to-orange-50/40",
    expandable: true,
  },
  {
    id: "background",
    title: "Background checks",
    description: "Comprehensive verification including identity, criminal records, and references.",
    visual: <BackgroundCheckVisual />,
    span: "md:col-span-2",
    gradient: "from-emerald-50/60 via-white to-green-50/40",
  },
  {
    id: "booking",
    title: "Instant booking",
    description: "Find available professionals and book in minutes. No back-and-forth needed.",
    visual: <InstantBookingVisual />,
    span: "md:col-span-2",
  },
  {
    id: "support",
    title: "Dedicated support",
    description: "Our team is here to help resolve any issues and keep everyone safe.",
    visual: <SupportChatVisual />,
    span: "md:col-span-2",
  },
  {
    id: "services",
    title: "All your home needs",
    description: "From cleaning to childcare to cooking—find help for every household task.",
    visual: <ServicesVisual />,
    span: "md:col-span-2",
    gradient: "from-violet-50/40 via-white to-pink-50/40",
  },
];

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
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  },
};

export function BenefitsSection() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <section className="bg-neutral-50 py-16 md:py-24" id="benefits">
      <Container className="max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5"
            initial={{ opacity: 0, y: 10 }}
          >
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="font-medium text-orange-700 text-sm">Trust & Safety</span>
          </motion.div>

          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl font-semibold text-3xl text-neutral-900 leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            Why families choose Casaora
          </motion.h2>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-xl text-base text-neutral-600 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            Your home is personal. That's why we built every feature with safety and trust at the
            core.
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
                  "group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg",
                  card.span,
                  card.gradient && `bg-gradient-to-br ${card.gradient}`
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
                    <h3 className="font-semibold text-lg text-neutral-900 md:text-xl">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-neutral-600 text-sm leading-relaxed md:text-base">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Plus button - positioned at right side of container */}
                {card.expandable && (
                  <button
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                    onClick={() => setIsExpanded(true)}
                    type="button"
                  >
                    <HugeiconsIcon className="h-4 w-4 text-neutral-600" icon={Add01Icon} />
                  </button>
                )}

                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/0 via-transparent to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
