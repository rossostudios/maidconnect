"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
      <div className="absolute h-[200px] w-[360px] rounded-[100px] border border-neutral-200/40 md:h-[240px] md:w-[440px]" />
      <div className="absolute h-[185px] w-[345px] rounded-[100px] border border-neutral-200/50 md:h-[225px] md:w-[425px]" />

      {/* Soft glow behind the pill for blending */}
      <div className="absolute h-[180px] w-[350px] rounded-[90px] bg-neutral-100/80 blur-xl md:h-[220px] md:w-[430px]" />

      {/* Main pill container with image */}
      <div className="relative h-[170px] w-[330px] overflow-hidden rounded-[85px] shadow-[0_0_40px_rgba(0,0,0,0.08)] md:h-[210px] md:w-[410px] md:rounded-[105px]">
        {/* Background image */}
        <Image alt="Casaora Platform" className="object-cover" fill priority src="/pricing.png" />

        {/* Soft edge vignette - blends image edges into container */}
        <div className="pointer-events-none absolute inset-0 rounded-[85px] shadow-[inset_0_0_30px_15px_rgba(250,249,245,0.4)] md:rounded-[105px]" />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-2xl text-white italic tracking-wide drop-shadow-md md:text-4xl">
            Casaora Platform
          </span>
        </div>
      </div>
    </div>
  );
}

// Process Step Node - Large pill shaped (like Duna)
function StepNode({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-12 py-4 shadow-sm md:px-16 md:py-5"
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, backgroundColor: "#FAF9F5" }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <span className="font-medium text-base text-neutral-800 md:text-lg">{label}</span>
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
  return (
    <section className="bg-neutral-50 py-24 md:py-32" id="how-it-works">
      <Container className="mx-auto max-w-5xl px-4">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="mb-4 inline-block font-mono text-neutral-500 text-xs uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-normal text-3xl text-neutral-900 tracking-tight md:text-4xl lg:text-5xl">
            Your home, simplified
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600">
            Three simple steps connect you with trusted household professionals
          </p>
        </motion.div>

        {/* Hub and Spoke Layout */}
        <div className="flex flex-col items-center">
          {/* Top Node - Search */}
          <StepNode delay={0.1} label="Search" />

          {/* Top Connection Line */}
          <AnimatedLine delay={0} direction="vertical" />

          {/* Middle Row - Match + Hub + Book */}
          <div className="flex w-full items-center justify-center gap-0">
            {/* Left Node - Match */}
            <StepNode delay={0.2} label="Match" />

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
            <StepNode delay={0.4} label="Book" />
          </div>

          {/* Bottom Connection Line */}
          <AnimatedLine delay={0.6} direction="vertical" />

          {/* Bottom Node - Get Started */}
          <motion.div
            className="flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 px-10 py-4 shadow-sm md:px-14"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, backgroundColor: "#FAF9F5" }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <span className="font-medium text-base text-neutral-800 md:text-lg">Get Started</span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
