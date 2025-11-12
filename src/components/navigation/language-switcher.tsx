"use client";

import { useLocale } from "next-intl";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Language Switcher Component
 *
 * Allows users to switch between English and Spanish.
 * Uses next-intl for internationalization support.
 */

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: Locale) => {
    // Use next-intl's router which automatically handles locale prefixes
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
      <button
        aria-label="Switch to English"
        className={`transition-colors hover:text-stone-700 ${
          locale === "en" ? "font-bold text-stone-900" : "text-stone-600"
        }`}
        onClick={() => switchLanguage("en")}
        type="button"
      >
        EN
      </button>
      <span className="text-stone-400">/</span>
      <button
        aria-label="Switch to Spanish"
        className={`transition-colors hover:text-stone-700 ${
          locale === "es" ? "font-bold text-stone-900" : "text-stone-600"
        }`}
        onClick={() => switchLanguage("es")}
        type="button"
      >
        ES
      </button>
    </div>
  );
}
