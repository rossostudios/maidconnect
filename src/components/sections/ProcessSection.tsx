"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

/**
 * ProcessSection - Hub-and-Spoke Design
 *
 * Inspired by Duna.com's visual architecture:
 * - Central hub with image background and pill shape
 * - Surrounding pill-shaped nodes for each process step
 * - Animated connection lines with moving segments
 * - Framer Motion reveal animations
 */

// Central Hub Visual - Pill shape with image background
function CentralHubVisual() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings - nested rounded rectangles with softer opacity */}
      <div className="absolute h-[160px] w-[280px] rounded-[80px] border border-neutral-200/40 sm:h-[200px] sm:w-[360px] sm:rounded-[100px] md:h-[240px] md:w-[440px]" />
      <div className="absolute h-[148px] w-[268px] rounded-[74px] border border-neutral-200/50 sm:h-[185px] sm:w-[345px] sm:rounded-[100px] md:h-[225px] md:w-[425px]" />

      {/* Soft glow behind the pill for blending */}
      <div className="absolute h-[144px] w-[264px] rounded-[72px] bg-neutral-100/80 blur-xl sm:h-[180px] sm:w-[350px] sm:rounded-[90px] md:h-[220px] md:w-[430px]" />

      {/* Main pill container with image */}
      <div className="relative h-[136px] w-[256px] overflow-hidden rounded-[68px] shadow-[0_0_40px_rgba(0,0,0,0.08)] sm:h-[170px] sm:w-[330px] sm:rounded-[85px] md:h-[210px] md:w-[410px] md:rounded-[105px]">
        {/* Background image */}
        <Image
          alt="Casaora Platform"
          className="object-cover"
          fill
          priority
          src="/casaora-platform.png"
        />

        {/* Soft edge vignette - blends image edges into container */}
        <div className="pointer-events-none absolute inset-0 rounded-[68px] shadow-[inset_0_0_30px_15px_rgba(250,249,245,0.4)] sm:rounded-[85px] md:rounded-[105px]" />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-white text-xl italic tracking-wide drop-shadow-md sm:text-2xl md:text-4xl">
            Casaora Platform
          </span>
        </div>
      </div>
    </div>
  );
}

// Process Step Node - Large pill shaped (like Duna)
function StepNode({
  label,
  delay,
  className = "",
}: {
  label: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-8 py-3 shadow-sm sm:px-12 sm:py-4 md:px-16 md:py-5 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, backgroundColor: "#FAF9F5" }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <span className="font-medium text-neutral-800 text-sm sm:text-base md:text-lg">{label}</span>
    </motion.div>
  );
}

// Animated Connection Line Component
function AnimatedLine({
  direction,
  delay,
}: {
  direction: "vertical" | "horizontal-left" | "horizontal-right";
  delay: number;
}) {
  const isVertical = direction === "vertical";
  const isLeft = direction === "horizontal-left";

  return (
    <div
      className={`relative overflow-hidden ${
        isVertical ? "h-12 w-[2px] md:h-16" : "h-[2px] w-12 md:w-20"
      }`}
    >
      {/* Base line - light gray */}
      <div
        className={`absolute bg-neutral-300 ${isVertical ? "h-full w-full" : "h-full w-full"}`}
      />

      {/* Animated dark segment moving toward center */}
      <motion.div
        animate={isVertical ? { y: "400%" } : isLeft ? { x: "400%" } : { x: "-400%" }}
        className={`absolute bg-neutral-800 ${isVertical ? "h-4 w-full" : "h-full w-8"}`}
        initial={isVertical ? { y: "-100%" } : isLeft ? { x: "-100%" } : { x: "100%" }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay,
        }}
      />
    </div>
  );
}

export function ProcessSection() {
  const t = useTranslations("home.process");

  return (
    <section className="bg-neutral-50 py-24 md:py-32" id="how-it-works">
      <Container className="mx-auto max-w-5xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="mb-4 inline-block font-mono text-neutral-500 text-xs uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-normal text-3xl text-neutral-900 tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600">{t("description")}</p>
        </motion.div>

        {/* Hub and Spoke Layout */}
        <div className="flex flex-col items-center">
          {/* Top Node - Search */}
          <StepNode delay={0.1} label={t("steps.search")} />

          {/* Top Connection Line */}
          <AnimatedLine delay={0} direction="vertical" />

          {/* Mobile: Simple vertical layout with Match node */}
          <div className="flex flex-col items-center sm:hidden">
            <StepNode delay={0.2} label={t("steps.match")} />
            <AnimatedLine delay={0.2} direction="vertical" />
          </div>

          {/* Center Hub (always visible) */}
          <motion.div
            className="sm:hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <CentralHubVisual />
          </motion.div>

          {/* Mobile: Book node below hub */}
          <div className="flex flex-col items-center sm:hidden">
            <AnimatedLine delay={0.4} direction="vertical" />
            <StepNode delay={0.4} label={t("steps.book")} />
          </div>

          {/* Desktop: Middle Row - Match + Hub + Book (hidden on mobile) */}
          <div className="hidden w-full items-center justify-center gap-0 sm:flex">
            {/* Left Node - Match */}
            <StepNode delay={0.2} label={t("steps.match")} />

            {/* Left Connection Line */}
            <AnimatedLine delay={0.3} direction="horizontal-left" />

            {/* Center Hub */}
            <motion.div
              className="mx-2 md:mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <CentralHubVisual />
            </motion.div>

            {/* Right Connection Line */}
            <AnimatedLine delay={0.5} direction="horizontal-right" />

            {/* Right Node - Book */}
            <StepNode delay={0.4} label={t("steps.book")} />
          </div>

          {/* Bottom Connection Line */}
          <AnimatedLine delay={0.6} direction="vertical" />

          {/* Bottom Node - Get Started */}
          <motion.div
            className="flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-8 py-3 shadow-sm sm:px-10 sm:py-4 md:px-14"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, backgroundColor: "#FAF9F5" }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <span className="font-medium text-neutral-800 text-sm sm:text-base md:text-lg">
              {t("steps.getStarted")}
            </span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
