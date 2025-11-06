import { getRequestConfig } from "next-intl/server";
import { routing } from "./i18n/routing";

// Can be imported from a shared config
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es"; // Spanish-first for Colombian market

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the locale from the request (comes from URL params)
  let locale = await requestLocale;

  // Validate that the locale is supported, otherwise use default
  if (!(locale && routing.locales.includes(locale as any))) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
