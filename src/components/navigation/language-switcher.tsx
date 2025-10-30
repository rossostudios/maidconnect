"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, type Locale } from "@/i18n";

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
    // Remove the current locale from the pathname if it exists
    const currentLocaleInPath = locales.find((loc) => pathname.startsWith(`/${loc}`));
    let newPathname = pathname;

    if (currentLocaleInPath) {
      newPathname = pathname.replace(`/${currentLocaleInPath}`, "");
    }

    // Ensure pathname starts with /
    if (!newPathname.startsWith("/")) {
      newPathname = `/${newPathname}`;
    }

    // Add new locale prefix if not the default
    const finalPath = newLocale === "en" ? newPathname : `/${newLocale}${newPathname}`;

    router.push(finalPath);
  };

  const languageNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
  };

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm font-medium text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        onClick={() => {
          const nextLocale = locale === "en" ? "es" : "en";
          switchLanguage(nextLocale as Locale);
        }}
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span>{languageNames[locale]}</span>
      </button>
    </div>
  );
}
