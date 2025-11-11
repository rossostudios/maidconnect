"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

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
      ref={containerRef}
      className="relative overflow-hidden bg-white py-20 sm:py-24 md:py-32"
    >
      <Container className="max-w-7xl">
        {/* Centered Hero Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Heading */}
          <motion.h1
            variants={contentVariants}
            className="font-extrabold text-5xl text-stone-900 leading-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t("title") || "Medium length hero heading goes here"}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={contentVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed sm:text-xl"
          >
            {t("subtitle") ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={contentVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="min-w-[140px] bg-stone-900 text-white hover:bg-stone-800"
            >
              {t("cta.primary") || "Button"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[140px] border-2 border-stone-900 text-stone-900 hover:bg-stone-50"
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
              style={{ y: y1 }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=faces,top"
                alt="Professional service provider"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
              />
            </motion.div>

            {/* Image 2 - Medium scroll */}
            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&crop=faces,top"
                alt="Professional service provider"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
              />
            </motion.div>

            {/* Image 3 - Fastest scroll */}
            <motion.div
              style={{ y: y3 }}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=faces,top"
                alt="Professional service provider"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 300px"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
