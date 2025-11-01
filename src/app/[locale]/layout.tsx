import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";
import "../globals.css";
import { ChangelogBanner } from "@/components/changelog/changelog-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { EttaFloatingButton } from "@/components/etta/etta-floating-button";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FeedbackProvider } from "@/components/providers/feedback-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitalsReporter } from "@/components/web-vitals";
import { locales } from "@/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maidconnect.co"),
  title: {
    default: "Maidconnect · Trusted home professionals for expats in Colombia",
    template: "%s · Maidconnect",
  },
  description:
    "Maidconnect is the concierge marketplace that pairs foreigners living in Colombia with vetted domestic service professionals, bilingual support, and ongoing concierge assistance.",
  keywords: [
    "Maidconnect",
    "domestic services Colombia",
    "housekeeping Medellín",
    "expat concierge Colombia",
    "bilingual home staff",
  ],
  openGraph: {
    title: "Maidconnect · Trusted home professionals for expats in Colombia",
    description:
      "Concierge-led marketplace connecting foreigners with vetted domestic service professionals and ongoing support across Colombia.",
    url: "https://maidconnect.co",
    siteName: "Maidconnect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maidconnect · Trusted home professionals for expats in Colombia",
    description:
      "Smart matching, bilingual support, and concierge-led onboarding for domestic services across Colombia.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
                  <EttaFloatingButton locale={locale} />
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
