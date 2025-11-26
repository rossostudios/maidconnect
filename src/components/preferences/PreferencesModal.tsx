"use client";

/**
 * PreferencesModal - Airbnb-style language, region, and currency selector
 *
 * A modal dialog with two tabs:
 * - Language and region: Language selection, region (market) selection, auto-translate toggle
 * - Currency: Display currency selection
 */

import { Cancel01Icon, LanguageCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "@/i18n/routing";
import { useMarket } from "@/lib/contexts/MarketContext";
import { getCurrencyDisplayInfo, usePreferences } from "@/lib/contexts/PreferencesContext";
import {
  COUNTRIES,
  type CountryCode,
  CURRENCIES,
  type CurrencyCode,
} from "@/lib/shared/config/territories";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// Country flags for regions
const COUNTRY_FLAGS: Record<CountryCode, string> = {
  CO: "🇨🇴",
  PY: "🇵🇾",
  UY: "🇺🇾",
  AR: "🇦🇷",
};

// Language options
const LANGUAGES = [
  { code: "en", name: "English", region: "United States", flag: "🇺🇸" },
  { code: "es", name: "Español", region: "España", flag: "🇪🇸" },
] as const;

// Currency options with display info
const CURRENCY_OPTIONS: CurrencyCode[] = ["USD", "COP", "PYG", "UYU", "ARS"];

export function PreferencesModal({ isOpen, onClose }: Props) {
  const t = useTranslations("preferences");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { country, setCountry } = useMarket();
  const { displayCurrency, setDisplayCurrency, autoTranslate, setAutoTranslate } = usePreferences();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    // Modal will close after navigation
    onClose();
  };

  const handleRegionChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setDisplayCurrency(newCurrency);
  };

  return (
    <ModalOverlay
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-neutral-900/80",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:animate-out"
      )}
      isDismissable
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal
        className={cn(
          "mx-4 w-full max-w-xl",
          // Animation
          "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
          "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
          "duration-200"
        )}
      >
        <Dialog
          aria-label={t("title")}
          className={cn(
            "relative",
            "rounded-xl bg-white",
            "shadow-2xl",
            "max-h-[85vh] overflow-y-auto",
            "focus:outline-none"
          )}
        >
          {/* Close Button */}
          <Button
            aria-label="Close"
            className={cn(
              "absolute top-4 left-4 z-10",
              "rounded-full p-2",
              "hover:bg-neutral-100",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
            )}
            onPress={onClose}
          >
            <HugeiconsIcon className="h-5 w-5 text-neutral-700" icon={Cancel01Icon} />
          </Button>

          {/* Content */}
          <div className="px-6 pt-16 pb-8">
            <Tabs defaultValue="language">
              {/* Tab Navigation */}
              <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-neutral-200 border-b bg-transparent p-0">
                <TabsTrigger
                  className={cn(
                    "rounded-none bg-transparent px-0 pb-4 shadow-none",
                    "data-[selected]:border-neutral-900 data-[selected]:border-b-2",
                    "data-[selected]:bg-transparent data-[selected]:text-neutral-900",
                    "text-neutral-500 hover:text-neutral-900",
                    "font-semibold"
                  )}
                  value="language"
                >
                  {t("tabs.languageAndRegion")}
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    "rounded-none bg-transparent px-0 pb-4 shadow-none",
                    "data-[selected]:border-neutral-900 data-[selected]:border-b-2",
                    "data-[selected]:bg-transparent data-[selected]:text-neutral-900",
                    "text-neutral-500 hover:text-neutral-900",
                    "font-semibold"
                  )}
                  value="currency"
                >
                  {t("tabs.currency")}
                </TabsTrigger>
              </TabsList>

              {/* Language and Region Tab */}
              <TabsContent className="mt-8" value="language">
                {/* Translation Toggle */}
                <div className="flex items-center justify-between border-neutral-100 border-b py-4">
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon className="h-6 w-6 text-neutral-700" icon={LanguageCircleIcon} />
                    <div>
                      <p className="font-medium text-neutral-900">{t("translation.title")}</p>
                      <p className="text-neutral-500 text-sm">{t("translation.description")}</p>
                    </div>
                  </div>
                  <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
                </div>

                {/* Language Selection */}
                <div className="mt-8">
                  <h3 className="mb-4 font-semibold text-neutral-900">{t("language.title")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {LANGUAGES.map((lang) => (
                      <button
                        className={cn(
                          "flex flex-col items-start rounded-lg border-2 p-4 text-left",
                          "transition-all duration-200",
                          "hover:border-neutral-300",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
                          locale === lang.code
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200"
                        )}
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        type="button"
                      >
                        <span className="font-medium text-neutral-900">
                          {lang.flag} {lang.name}
                        </span>
                        <span className="text-neutral-500 text-sm">{lang.region}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region Selection */}
                <div className="mt-8">
                  <h3 className="mb-4 font-semibold text-neutral-900">{t("region.title")}</h3>
                  <p className="mb-4 text-neutral-500 text-sm">{t("region.description")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(COUNTRIES) as CountryCode[]).map((code) => {
                      const countryConfig = COUNTRIES[code];
                      return (
                        <button
                          className={cn(
                            "flex items-center gap-3 rounded-lg border-2 p-4 text-left",
                            "transition-all duration-200",
                            "hover:border-neutral-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
                            country === code
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200"
                          )}
                          key={code}
                          onClick={() => handleRegionChange(code)}
                          type="button"
                        >
                          <span className="text-2xl">{COUNTRY_FLAGS[code]}</span>
                          <span className="font-medium text-neutral-900">
                            {locale === "en" ? countryConfig.nameEn : countryConfig.nameEs}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Currency Tab */}
              <TabsContent className="mt-8" value="currency">
                <h3 className="mb-4 font-semibold text-neutral-900">{t("currency.title")}</h3>
                <p className="mb-6 text-neutral-500 text-sm">{t("currency.description")}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CURRENCY_OPTIONS.map((code) => {
                    const info = getCurrencyDisplayInfo(code);
                    const currencyConfig = CURRENCIES[code];
                    return (
                      <button
                        className={cn(
                          "flex flex-col items-start rounded-lg border-2 p-4 text-left",
                          "transition-all duration-200",
                          "hover:border-neutral-300",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
                          displayCurrency === code
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200"
                        )}
                        key={code}
                        onClick={() => handleCurrencyChange(code)}
                        type="button"
                      >
                        <span className="font-medium text-neutral-900">
                          {currencyConfig.symbol} – {code}
                        </span>
                        <span className="text-neutral-500 text-sm">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
