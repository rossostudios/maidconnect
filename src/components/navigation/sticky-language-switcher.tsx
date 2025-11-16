"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, GlobeIcon, Tick02Icon } from "@hugeicons/core-free-icons";
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
          className="flex items-center gap-2 border-2 border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm shadow-md transition hover:border-neutral-300 hover:shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4" size={16} />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            size={16}
          />
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
            <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden border-2 border-neutral-200 bg-white shadow-xl">
              {languages.map((lang) => (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-50 ${
                    lang.code === locale ? "bg-neutral-50 font-semibold" : ""
                  }`}
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  type="button"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-neutral-900 text-sm">{lang.name}</span>
                  {lang.code === locale && (
                    <HugeiconsIcon icon={Tick02Icon} className="ml-auto h-5 w-5 text-neutral-700" size={20} />
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
