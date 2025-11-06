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
    <section className="relative overflow-x-hidden bg-white">
      {/* Background Image */}
      <div className="relative h-[700px] w-full sm:h-[750px] lg:h-[800px]">
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
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/60 to-stone-950/80" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <Container className="max-w-6xl">
          <motion.div
            animate="visible"
            className="mx-auto flex max-w-5xl flex-col items-center gap-12 text-center"
            initial="hidden"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div
              className="tagline rounded-full bg-white/10 px-6 py-2.5 text-white backdrop-blur-sm"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants} // Performance optimization
            >
              {t("badge")}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="serif-display-lg max-w-4xl text-white leading-[1.1]"
              style={{ willChange: "transform, opacity" }}
              variants={itemVariants}
            >
              {t("title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="lead max-w-2xl text-white/90"
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
              className="mt-6 flex flex-wrap items-center justify-center gap-8 text-white/80"
              style={{ willChange: "transform, opacity" }}
              variants={containerVariants}
            >
              <motion.div
                className="flex items-baseline gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants} // Gesture animation
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-2xl text-white">500+</span>
                <span className="text-sm">
                  {t("trustSignals.verified") || "Verified Professionals"}
                </span>
              </motion.div>

              <motion.div className="h-4 w-px bg-white/20" variants={trustSignalVariants} />

              <motion.div
                className="flex items-baseline gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-2xl text-white">15+</span>
                <span className="text-sm">{t("trustSignals.cities") || "Cities"}</span>
              </motion.div>

              <motion.div className="h-4 w-px bg-white/20" variants={trustSignalVariants} />

              <motion.div
                className="flex items-baseline gap-2"
                style={{ willChange: "transform" }}
                variants={trustSignalVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-2xl text-white">4.9★</span>
                <span className="text-sm">{t("trustSignals.rating") || "Average Rating"}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
