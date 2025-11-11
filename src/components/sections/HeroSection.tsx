"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Animation variants for content fade-in
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export function HeroSection() {
  const t = useTranslations("hero");
  const containerRef = useRef<HTMLElement>(null);

  // Scroll-based animations for portrait images
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Different scroll speeds for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section
      className="relative overflow-hidden bg-white py-20 sm:py-24 md:py-32"
      ref={containerRef}
    >
      <Container className="max-w-7xl">
        {/* Centered Hero Content */}
        <motion.div
          animate="visible"
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          {/* Heading */}
          <motion.h1
            className="font-extrabold text-5xl text-stone-900 leading-tight sm:text-6xl md:text-7xl lg:text-8xl"
            variants={contentVariants}
          >
            {t("title") || "Medium length hero heading goes here"}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed sm:text-xl"
            variants={contentVariants}
          >
            {t("subtitle") ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={contentVariants}
          >
            <Button className="min-w-[140px] bg-stone-900 text-white hover:bg-stone-800" size="lg">
              {t("cta.primary") || "Button"}
            </Button>
            <Button
              className="min-w-[140px] border-2 border-stone-900 text-stone-900 hover:bg-stone-50"
              size="lg"
              variant="outline"
            >
              {t("cta.secondary") || "Button"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Scrolling Portrait Images */}
        <div className="relative mt-20 sm:mt-24 md:mt-32">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Image 1 - Slowest scroll */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
              initial={{ opacity: 0, y: 60 }}
              style={{ y: y1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                alt="Professional service provider"
                className="object-cover"
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=faces,top"
              />
            </motion.div>

            {/* Image 2 - Medium scroll */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
              initial={{ opacity: 0, y: 80 }}
              style={{ y: y2 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                alt="Professional service provider"
                className="object-cover"
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&crop=faces,top"
              />
            </motion.div>

            {/* Image 3 - Fastest scroll */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
              initial={{ opacity: 0, y: 100 }}
              style={{ y: y3 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                alt="Professional service provider"
                className="object-cover"
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=faces,top"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
