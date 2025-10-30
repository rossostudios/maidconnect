import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ locale }) => {
  // Use the provided locale if valid, otherwise fall back to default
  // The middleware handles routing, so this should always be valid
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
