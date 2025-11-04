import type { Metadata } from "next";
import { Cinzel, Spectral, Work_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";
import "../globals.css";
import { AmaraFloatingButton } from "@/components/amara/amara-floating-button";
import { ChangelogBanner } from "@/components/changelog/changelog-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FeedbackProvider } from "@/components/providers/feedback-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitalsReporter } from "@/components/web-vitals";
import { locales } from "@/i18n";

// Cinzel for brand/logo/headers (SemiBold weight)
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600"], // SemiBold
  display: "swap",
  preload: true,
});

// Spectral for body text (Regular weight)
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400"], // Regular
  display: "swap",
  preload: true,
});

// Work Sans for taglines/UI microcopy (Thin & Regular weights)
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["100", "400"], // Thin for taglines, Regular for UI
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casaora.com"),
  title: {
    default: "Casaora · The Art of Home",
    template: "%s · Casaora",
  },
  description:
    "Casaora is Colombia's premier boutique domestic staffing agency. Browse our curated network of exceptional household professionals—only the top 5% make it onto our platform. Pre-vetted excellence for discerning homes.",
  keywords: [
    "Casaora",
    "luxury domestic staffing Colombia",
    "private household staff Bogotá",
    "boutique staffing agency",
    "premium housekeepers Colombia",
    "private chef Cartagena",
    "estate staff Medellín",
  ],
  openGraph: {
    title: "Casaora · The Art of Home",
    description:
      "Colombia's premier boutique domestic staffing agency. Exceptional household professionals for exceptional homes. Only the top 5% accepted.",
    url: "https://casaora.com",
    siteName: "Casaora",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casaora · The Art of Home",
    description:
      "Browse Colombia's most exceptional household professionals. Pre-vetted, curated excellence. The Art of Home.",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Get the locale from params
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={`${cinzel.variable} ${spectral.variable} ${workSans.variable} antialiased`}>
        <WebVitalsReporter />
        <ErrorBoundary>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <FeedbackProvider>
                <ChangelogBanner />
                <Suspense fallback={<div>Loading...</div>}>
                  <SupabaseProvider>
                    <QueryProvider>
                      <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
                    </QueryProvider>
                  </SupabaseProvider>
                </Suspense>
                <Suspense fallback={null}>
                  <AmaraFloatingButton locale={locale} />
                </Suspense>
                <CookieConsent />
              </FeedbackProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
