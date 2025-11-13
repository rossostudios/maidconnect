"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Language Switcher Component
 *
 * Allows users to switch between English and Spanish.
 * Uses next-intl for internationalization support.
 * Includes screen reader announcements for accessibility.
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
    // This updates the URL and persists preference via URL locale prefix
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

      {/* Language toggle buttons */}
      <div
        aria-label="Language selection"
        className="flex items-center gap-2 font-medium text-neutral-900 text-sm"
        role="group"
      >
        <button
          aria-label="Switch to English"
          aria-pressed={locale === "en"}
          className={`transition-colors hover:text-neutral-700 ${
            locale === "en" ? "font-bold text-neutral-900" : "text-neutral-600"
          }`}
          onClick={() => switchLanguage("en")}
          type="button"
        >
          EN
        </button>
        <span aria-hidden="true" className="text-neutral-400">
          /
        </span>
        <button
          aria-label="Switch to Spanish"
          aria-pressed={locale === "es"}
          className={`transition-colors hover:text-neutral-700 ${
            locale === "es" ? "font-bold text-neutral-900" : "text-neutral-600"
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
