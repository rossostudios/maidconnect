"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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

  if (isDismissed) return null;

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

          <div className="relative mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Content */}
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-1 items-center justify-center gap-2 text-center sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {/* Badge */}
                <span className="hidden flex-shrink-0 bg-orange-500/10 px-2.5 py-1 font-medium text-orange-600 text-xs uppercase tracking-wider sm:inline-flex sm:items-center">
                  New
                </span>

                {/* Message */}
                <p className="flex-shrink-0 font-[family-name:var(--font-family-manrope)] text-neutral-700 text-sm sm:text-base">
                  <strong className="font-semibold text-neutral-900">New to Colombia?</strong>{" "}
                  <span className="hidden sm:inline">
                    Try our Concierge service — English-speaking coordinator, curated matches in 5
                    days.
                  </span>
                  <span className="sm:hidden">Try our Concierge — curated matches in 5 days.</span>
                </p>

                {/* CTA Link */}
                <Link
                  className="group relative inline-flex flex-shrink-0 items-center gap-1.5 font-semibold text-orange-600 text-sm transition-colors hover:text-orange-700 sm:text-base"
                  href="/concierge"
                  onClick={() =>
                    conversionTracking.heroCTAClicked({
                      ctaType: "concierge",
                      location: "announcement_banner",
                      ctaText: "Learn More",
                      variant: "control",
                    })
                  }
                >
                  <span>Learn More</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
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

              {/* Dismiss Button */}
              <motion.button
                animate={{ opacity: 1, scale: 1 }}
                aria-label="Dismiss announcement"
                className="group relative flex h-8 w-8 flex-shrink-0 items-center justify-center text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900"
                initial={{ opacity: 0, scale: 0.8 }}
                onClick={handleDismiss}
                transition={{ delay: 0.4, duration: 0.3 }}
                type="button"
              >
                <HugeiconsIcon
                  className="h-4 w-4 transition-transform group-hover:rotate-90"
                  icon={Cancel01Icon}
                />

                {/* Ripple effect on hover */}
                <span className="absolute inset-0 scale-0 bg-neutral-900/5 transition-transform duration-500 group-hover:scale-100" />
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
