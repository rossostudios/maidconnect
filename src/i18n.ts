import { getRequestConfig } from "next-intl/server";
import { routing } from "./i18n/routing";

// Can be imported from a shared config
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en"; // English as global default

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the locale from the request (comes from URL params)
  const locale = await requestLocale;

  // Validate that the locale is supported, otherwise use default
  const isValidLocale = locale && locales.includes(locale as Locale);
  const validatedLocale: string = isValidLocale ? locale : routing.defaultLocale;

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default,
  };
});
