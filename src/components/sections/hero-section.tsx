"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { HeroSearchBar } from "@/components/ui/hero-search-bar";

// Variants for orchestrated animations with motion.dev best practices
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // Stagger children by 0.1s
      delayChildren: 0.2, // Wait 0.2s before animating children
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring", // Use spring physics for natural motion
      stiffness: 100,
      damping: 15,
    },
  },
};

const trustSignalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
};

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-x-hidden bg-slate-50">
      {/* Background Image */}
      <div className="relative h-[600px] w-full sm:h-[700px] md:h-[750px] lg:h-[800px]">
        <Image
          alt="Beautiful home interior"
          className="object-cover"
          fill
          priority
          quality={95}
          src="/new-hero.jpg"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* Minimal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center py-12 sm:py-16 md:py-20 lg:py-24">
        <Container className="max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate="visible"
            className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:gap-8 md:gap-10 lg:gap-12"
            initial="hidden"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div
              className="tagline rounded-full bg-slate-50/10 px-4 py-2 text-slate-50 backdrop-blur-sm sm:px-6 sm:py-2.5"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants} // Performance optimization
            >
              {t("badge")}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="max-w-4xl font-extrabold text-4xl text-slate-50 leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants}
            >
              {t("title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="max-w-2xl text-lg text-slate-200 leading-relaxed sm:text-xl md:text-2xl"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants}
            >
              {t("subtitle")}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="w-full max-w-3xl"
              data-tour="search"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants}
            >
              <HeroSearchBar />
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              className="mt-4 flex flex-wrap items-center justify-center gap-4 text-slate-300 sm:mt-6 sm:gap-6 md:gap-8"
              style={{ willChange: "transform, opacity" }}
              variants={containerVariants}
            >
              <motion.div
                className="flex items-baseline gap-1.5 sm:gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants} // Gesture animation
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-slate-50 text-xl sm:text-2xl">500+</span>
                <span className="text-xs sm:text-sm">
                  {t("trustSignals.verified") || "Verified Professionals"}
                </span>
              </motion.div>

              <motion.div
                className="hidden h-4 w-px bg-slate-50/20 sm:block"
                variants={trustSignalVariants}
              />

              <motion.div
                className="flex items-baseline gap-1.5 sm:gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-slate-50 text-xl sm:text-2xl">15+</span>
                <span className="text-xs sm:text-sm">{t("trustSignals.cities") || "Cities"}</span>
              </motion.div>

              <motion.div
                className="hidden h-4 w-px bg-slate-50/20 sm:block"
                variants={trustSignalVariants}
              />

              <motion.div
                className="flex items-baseline gap-1.5 sm:gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-slate-50 text-xl sm:text-2xl">4.9★</span>
                <span className="text-xs sm:text-sm">
                  {t("trustSignals.rating") || "Average Rating"}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
