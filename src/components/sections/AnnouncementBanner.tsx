"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { conversionTracking } from "@/lib/integrations/posthog/conversion-tracking";

/**
 * AnnouncementBanner - Lia Design System
 *
 * Premium announcement banner with refined aesthetics:
 * - Warm gradient background (cream to white)
 * - Elegant entrance animation
 * - Dismissible with smooth fade-out
 * - Sticky positioning above navbar
 */
export function AnnouncementBanner() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Feature flag to disable banner entirely
  const enabled = process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED !== "false";
  const badgeEnv = process.env.NEXT_PUBLIC_ANNOUNCEMENT_BADGE;
  const titleEnv = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TITLE;
  const ctaEnv = process.env.NEXT_PUBLIC_ANNOUNCEMENT_CTA;
  const hrefEnv = process.env.NEXT_PUBLIC_ANNOUNCEMENT_HREF;

  useEffect(() => {
    // Check localStorage for dismissal
    const dismissed = localStorage.getItem("concierge-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Animate in after brief delay
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("concierge-banner-dismissed", "true");

    // Set dismissed state after animation completes
    setTimeout(() => setIsDismissed(true), 400);
  };

  if (isDismissed || !enabled) {
    return null;
  }

  const MESSAGES: Record<string, { badge: string; title: string; cta: string; href: string }> = {
    en: {
      badge: badgeEnv || "Now Hiring",
      title: titleEnv || "Work with vetted families across Latin America.",
      cta: ctaEnv || "Learn More",
      href: hrefEnv || "/pros",
    },
    es: {
      badge: process.env.NEXT_PUBLIC_ANNOUNCEMENT_BADGE_ES || "Estamos contratando",
      title:
        process.env.NEXT_PUBLIC_ANNOUNCEMENT_TITLE_ES ||
        "Trabaja con familias verificadas en Latinoamérica.",
      cta: process.env.NEXT_PUBLIC_ANNOUNCEMENT_CTA_ES || "Conoce más",
      href: process.env.NEXT_PUBLIC_ANNOUNCEMENT_HREF_ES || "/pros",
    },
  };
  const message = MESSAGES[locale] || MESSAGES.en;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden border-neutral-200 border-b bg-gradient-to-b from-orange-50/40 via-neutral-50/60 to-white/80"
          exit={{ y: -100, opacity: 0 }}
          initial={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle noise texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-2.5 md:py-2 lg:px-8">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-4 md:gap-6">
              {/* Content - Stacked on mobile, horizontal on tablet+ */}
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex w-full flex-col items-center gap-2 text-center sm:w-auto sm:flex-1 sm:flex-row sm:justify-center sm:gap-3 md:gap-4"
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {/* Badge - Prominent pill on mobile, inline on tablet+ */}
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex flex-shrink-0 items-center rounded-full border border-orange-200 bg-orange-500/10 px-3 py-1 font-medium text-orange-600 text-xs uppercase tracking-wider sm:rounded-lg sm:border-0 sm:px-2.5 sm:py-0.5 md:text-[0.6875rem]"
                  initial={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {message.badge}
                </motion.span>

                {/* Message - Responsive typography with optimized line breaks */}
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-0 max-w-md font-[family-name:var(--font-family-manrope)] text-[0.8125rem] text-neutral-700 leading-relaxed sm:max-w-none sm:flex-shrink sm:text-sm md:text-base md:leading-normal"
                  initial={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  <span className="text-neutral-900">{message.title}</span>{" "}
                  <span className="hidden whitespace-nowrap md:inline">
                    Top pay, vetted clients, 100% of your rates.
                  </span>
                  <span className="inline md:hidden">Top pay, vetted clients.</span>
                </motion.p>

                {/* CTA Link - Enhanced mobile tap target */}
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Link
                    className="group relative inline-flex flex-shrink-0 items-center gap-1.5 font-semibold text-orange-600 text-sm transition-colors hover:text-orange-700 sm:text-sm md:text-base"
                    href="/pros"
                    onClick={() =>
                      conversionTracking.heroCTAClicked({
                        ctaType: "browse_pros",
                        location: "announcement_banner",
                        ctaText: "Learn More",
                        variant: "control",
                      })
                    }
                  >
                    <span>Learn More</span>
                    <svg
                      aria-label="Arrow right"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      role="img"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Hover underline */}
                    <span className="-bottom-0.5 absolute left-0 h-px w-0 bg-orange-600 transition-all duration-300 group-hover:w-[calc(100%-1.25rem)]" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Dismiss Button - Absolute positioning on mobile for clean layout */}
              <motion.button
                animate={{ opacity: 1, scale: 1 }}
                aria-label="Dismiss announcement"
                className="group absolute top-2 right-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:static sm:h-8 sm:w-8 sm:rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                onClick={handleDismiss}
                transition={{ delay: 0.55, duration: 0.3 }}
                type="button"
              >
                <HugeiconsIcon
                  className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 sm:h-4 sm:w-4"
                  icon={Cancel01Icon}
                />

                {/* Ripple effect on hover */}
                <span className="absolute inset-0 scale-0 rounded-lg bg-neutral-900/5 transition-transform duration-500 group-hover:scale-100" />
              </motion.button>
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            animate={{ scaleX: 1 }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
            initial={{ scaleX: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
