"use client";

import { Globe02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
          className="flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 font-medium text-[var(--foreground)] text-sm shadow-md transition hover:border-[var(--red)] hover:shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Globe02Icon} />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
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
            <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border-2 border-[#ebe5d8] bg-white shadow-xl">
              {languages.map((lang) => (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fbfafa] ${
                    lang.code === locale ? "bg-[#fbfafa] font-semibold" : ""
                  }`}
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  type="button"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[var(--foreground)] text-sm">{lang.name}</span>
                  {lang.code === locale && (
                    <svg
                      className="ml-auto h-5 w-5 text-[var(--red)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
