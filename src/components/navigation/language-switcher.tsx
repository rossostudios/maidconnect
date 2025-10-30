"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * Language Switcher Component
 *
 * Allows users to switch between English and Spanish.
 * Uses next-intl for internationalization support.
 */

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: Locale) => {
    // Use next-intl's router which automatically handles locale prefixes
    router.replace(pathname, { locale: newLocale });
  };

  const languageNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
  };

  const buttonStyles =
    variant === "dark"
      ? "flex items-center gap-2 rounded-full border-2 border-[#26231f] bg-[#11100e] px-4 py-2 text-sm font-medium text-[#f3ece1] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
      : "flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm font-medium text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]";

  return (
    <div className="relative inline-block">
      <button
        aria-label="Switch language"
        className={buttonStyles}
        onClick={() => {
          const nextLocale = locale === "en" ? "es" : "en";
          switchLanguage(nextLocale as Locale);
        }}
      >
        <Globe className="h-4 w-4" />
        <span>{languageNames[locale]}</span>
      </button>
    </div>
  );
}
