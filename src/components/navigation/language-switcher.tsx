"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Language Switcher - Lia Design System
 *
 * Refined segmented control with sharp edges, orange accent, and Geist typography.
 * Zero-radius aesthetic with precise transitions.
 *
 * Features:
 * - Sliding orange background indicator
 * - Sharp corners (no border-radius)
 * - Geist Sans typography
 * - Smooth transitions
 * - Full accessibility support
 */

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");

  const switchLanguage = (newLocale: Locale) => {
    // Announce to screen readers
    const languageName = newLocale === "en" ? "English" : "Spanish";
    setAnnouncement(`Language changed to ${languageName}`);

    // Use next-intl's router which automatically handles locale prefixes
    router.replace(pathname, { locale: newLocale });

    // Clear announcement after screen readers have time to announce it
    setTimeout(() => setAnnouncement(""), 1000);
  };

  return (
    <div className="relative">
      {/* Screen reader announcement region */}
      <div aria-atomic="true" aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>

      {/* Segmented Control - Sharp Lia Aesthetic */}
      <div
        aria-label="Language selection"
        className="relative inline-flex border border-neutral-200 bg-white p-1"
        role="group"
      >
        {/* Sliding orange background indicator */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-orange-500 transition-all duration-300 ease-out"
          style={{
            left: locale === "en" ? "4px" : "calc(50% + 0px)",
          }}
        />

        {/* EN Button */}
        <button
          aria-label="Switch to English"
          aria-pressed={locale === "en"}
          className={`relative z-10 px-4 py-1.5 font-[family-name:var(--font-geist-sans)] font-semibold text-xs uppercase tracking-wider transition-colors duration-300 ${
            locale === "en" ? "text-white" : "text-neutral-600 hover:text-neutral-900"
          }`}
          onClick={() => switchLanguage("en")}
          type="button"
        >
          EN
        </button>

        {/* ES Button */}
        <button
          aria-label="Switch to Spanish"
          aria-pressed={locale === "es"}
          className={`relative z-10 px-4 py-1.5 font-[family-name:var(--font-geist-sans)] font-semibold text-xs uppercase tracking-wider transition-colors duration-300 ${
            locale === "es" ? "text-white" : "text-neutral-600 hover:text-neutral-900"
          }`}
          onClick={() => switchLanguage("es")}
          type="button"
        >
          ES
        </button>
      </div>
    </div>
  );
}
