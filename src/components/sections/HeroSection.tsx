"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

// Refined easing for elegant motion
const smoothEase = [0.25, 0.1, 0.25, 1];
const springEase = [0.34, 1.56, 0.64, 1];

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: smoothEase },
  },
};

const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: springEase },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const imageStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

export function HeroSection() {
  const _t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const heroTitle = "Trusted Household Staff for Expats in Latin America.";
  const heroSubtitle =
    "From on-demand cleaning to full-time nannies. We handle the vetting, contracts, and payments so you can settle in with confidence.";
  const primaryCta = "Book Instantly with Amara";
  const secondaryCta = "Find Permanent Staff";

  // Split title into words for staggered animation
  const titleWords = heroTitle.split(" ");

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#fffaf5] via-[#fffefd] to-[#f3f6f9] text-neutral-900"
      ref={sectionRef}
    >
      {/* Subtle gradient overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/60 to-transparent" />

      {/* Subtle decorative elements */}
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-orange-100/30 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-100/20 blur-3xl" />

      <Container className="relative z-10 max-w-screen-2xl px-4 md:px-8 lg:px-12">
        <motion.div
          animate="visible"
          className="grid grid-cols-1 items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:py-28"
          initial="hidden"
          style={{ opacity: contentOpacity }}
          variants={stagger}
        >
          {/* Left Content Column */}
          <div className="flex flex-col gap-6 lg:col-span-6 lg:gap-8">
            {/* Word-by-word animated headline */}
            <motion.h1
              className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-[40px] text-neutral-950 leading-[1.05] tracking-tight sm:text-[50px] md:text-[60px]"
              variants={stagger}
            >
              {titleWords.map((word, index) => (
                <motion.span
                  className="mr-[0.25em] inline-block"
                  key={`${word}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20, rotateX: -20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: {
                        duration: 0.5,
                        ease: smoothEase,
                        delay: index * 0.05,
                      },
                    },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="max-w-xl text-lg text-neutral-600 leading-relaxed md:text-[19px]"
              variants={slideUp}
            >
              {heroSubtitle}
            </motion.p>

            {/* CTA Buttons with enhanced hover */}
            <motion.div className="flex flex-wrap items-center gap-3 md:gap-4" variants={stagger}>
              <motion.div variants={buttonVariants}>
                <Link href="/brief">
                  <Button
                    className="group hover:-translate-y-0.5 relative rounded-full bg-orange-500 px-7 py-3.5 text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/30 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "start_brief",
                        location: "hero",
                        ctaText: primaryCta,
                        variant: "control",
                      })
                    }
                    size="lg"
                  >
                    <span className="relative z-10">{primaryCta}</span>
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={buttonVariants}>
                <Link href="/how-it-works">
                  <Button
                    className="hover:-translate-y-0.5 rounded-full border-2 border-neutral-200 bg-white px-7 py-3.5 text-neutral-800 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "learn_more",
                        location: "hero",
                        ctaText: secondaryCta,
                        variant: "control",
                      })
                    }
                    size="lg"
                    variant="outline"
                  >
                    {secondaryCta}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust indicator */}
            <motion.div className="flex items-center gap-3" variants={fadeIn}>
              <div className="-space-x-1.5 flex">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-neutral-100 to-neutral-200"
                    key={i}
                  />
                ))}
              </div>
              <p className="font-medium text-neutral-600 text-sm">
                <span className="text-neutral-900">500+</span> families matched with trusted staff
              </p>
            </motion.div>
          </div>

          {/* Right Image Column with Parallax */}
          <motion.div
            className="relative lg:col-span-6"
            style={{ y: imageY }}
            variants={imageStagger}
          >
            <motion.div
              className="group relative mx-auto max-w-2xl rounded-[28px] border border-neutral-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-all duration-500 hover:shadow-[0_32px_100px_rgba(15,23,42,0.12)]"
              transition={{ duration: 0.3 }}
              variants={fadeInScale}
              whileHover={{ y: -4 }}
            >
              <div className="relative overflow-hidden rounded-t-[26px]">
                <div className="relative aspect-[5/4]">
                  <Image
                    alt="Casaora - Professional household staff"
                    className="object-cover brightness-[1.02] contrast-[1.02] saturate-[1.05] transition-transform duration-700 group-hover:scale-[1.02]"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 900px"
                    src="/casaorahero.png"
                  />
                </div>
                {/* Subtle gradient overlay on image */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
              </div>
              <motion.div
                className="flex items-center justify-between gap-3 rounded-b-[28px] border-neutral-200/80 border-t bg-neutral-50/80 px-5 py-4 text-neutral-700 text-sm"
                variants={slideUp}
              >
                <div>
                  <div className="font-semibold text-[13px] text-neutral-900">
                    On-demand & permanent staffing
                  </div>
                  <div className="text-neutral-500 text-xs">Vetted, insured, contract-ready</div>
                </div>
                <motion.span
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  className="rounded-full bg-emerald-100 px-3.5 py-1.5 font-semibold text-emerald-700 text-xs"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  5-Day Matches
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
