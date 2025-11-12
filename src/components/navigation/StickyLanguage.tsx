"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Sticky Language Switcher Component
 *
 * A sticky floating language switcher for marketing pages.
 * Prominently displays language options with flag emojis.
 * Stays visible on scroll for easy access.
 */

export function StickyLanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: Locale) => {
    // Use next-intl's router which automatically handles locale prefixes and cookie
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const languages = [
    { code: "es" as Locale, name: "Español", flag: "🇨🇴" },
    { code: "en" as Locale, name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale) ?? languages[0]!;

  return (
    <div className="fixed top-4 right-4 z-50 md:top-6 md:right-6">
      {/* Mobile/Tablet: Dropdown */}
      <div className="relative">
        <button
          aria-label="Select language"
          className="flex items-center gap-2 rounded-full border-2 border-stone-200 bg-white px-4 py-2 font-medium text-sm text-stone-900 shadow-md transition hover:border-stone-300 hover:shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              role="button"
              tabIndex={-1}
            />

            {/* Options */}
            <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-xl">
              {languages.map((lang) => (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50 ${
                    lang.code === locale ? "bg-stone-50 font-semibold" : ""
                  }`}
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  type="button"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm text-stone-900">{lang.name}</span>
                  {lang.code === locale && <Check className="ml-auto h-5 w-5 text-stone-700" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
