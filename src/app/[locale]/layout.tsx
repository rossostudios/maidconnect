// Environment validation - fail fast on boot if config is invalid
import "@/env";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "../globals.css";

import { ChangelogBanner } from "@/components/changelog/changelog-banner";
import { UnifiedCommandPaletteWrapper } from "@/components/command-palette/unified-command-palette-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FeedbackProvider } from "@/components/providers/feedback-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ReactAriaProvider } from "@/components/providers/react-aria-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DraftModeIndicator } from "@/components/sanity/draft-mode-indicator";
import { SkipLink, SkipLinks } from "@/components/ui/skip-link";
import { WebVitalsReporter } from "@/components/web-vitals";
import { type Locale, locales } from "@/i18n";
import { MarketProvider } from "@/lib/contexts/MarketContext";
import { PreferencesProvider } from "@/lib/contexts/PreferencesContext";
import { RealtimeProvider } from "@/lib/integrations/supabase/RealtimeProvider";
import { geistSans } from "../fonts";

// Font configuration - Lia Design System
// - Geist Sans: Primary UI and marketing font (all text)
// - Geist Mono: Numbers, data, metrics, code

export const metadata: Metadata = {
  metadataBase: new URL("https://casaora.co"),
  title: {
    default: "Casaora® · Trusted Marketplace for Home Professionals",
    template: "%s · Casaora®",
  },
  description:
    "Casaora is the trusted marketplace for household help in Latin America. Connect with verified, professional domestic workers including nannies, housekeepers, caregivers, and cooks. Simple, fair, and dignified.",
  keywords: [
    "Casaora®",
    "domestic help marketplace",
    "hire housekeeper Latin America",
    "nanny services Colombia",
    "caregivers Mexico",
    "private chef booking",
    "verified home professionals",
    "household staff marketplace",
  ],
  icons: {
    icon: [
      { url: "/isologo.svg", type: "image/svg+xml" },
      { url: "/isologo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/isologo.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Casaora",
  },
  openGraph: {
    title: "Casaora® · Trusted Marketplace for Home Professionals",
    description:
      "The trusted marketplace for household help in Latin America. Connect with verified, professional domestic workers. Simple, fair, and dignified.",
    url: "https://casaora.co",
    siteName: "Casaora®",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casaora® · Trusted Marketplace for Home Professionals",
    description:
      "The trusted marketplace for household help in Latin America. Connect with verified, professional domestic workers.",
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
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  // Check if draft mode is enabled for Sanity Visual Editing
  const isDraftMode = (await draftMode()).isEnabled;

  // Get nonce from middleware for CSP-compliant inline scripts
  // The nonce is generated per-request in middleware.ts and passed via x-nonce header
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* LCP Preload: Hero image is the largest contentful paint element */}
        <link as="image" fetchPriority="high" href="/hero.png" rel="preload" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistSans.variable} antialiased`}
        data-nonce={nonce}
      >
        <ErrorBoundary>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MarketProvider>
              <PreferencesProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  disableTransitionOnChange
                  enableSystem
                >
                  <SkipLinks>
                    <SkipLink href="main-content">Skip to main content</SkipLink>
                    <SkipLink href="footer">Skip to footer</SkipLink>
                  </SkipLinks>
                  <WebVitalsReporter />
                  <PostHogProvider nonce={nonce}>
                    <FeedbackProvider>
                      <UnifiedCommandPaletteWrapper>
                        <ChangelogBanner />
                        <Suspense fallback={<div>Loading...</div>}>
                          <SupabaseProvider>
                            <RealtimeProvider>
                              <QueryProvider>
                                <KeyboardShortcutsProvider>
                                  <ReactAriaProvider>
                                    <NuqsAdapter>{children}</NuqsAdapter>
                                  </ReactAriaProvider>
                                </KeyboardShortcutsProvider>
                              </QueryProvider>
                            </RealtimeProvider>
                          </SupabaseProvider>
                        </Suspense>
                        <Suspense fallback={null}>
                          {/* <AmaraFloatingButton locale={locale} /> */}
                        </Suspense>
                        <CookieConsent />
                      </UnifiedCommandPaletteWrapper>
                    </FeedbackProvider>
                  </PostHogProvider>
                  {isDraftMode && <DraftModeIndicator />}
                </ThemeProvider>
              </PreferencesProvider>
              <Toaster
                closeButton
                position="top-right"
                richColors
                toastOptions={{ duration: 4000 }}
              />
            </MarketProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
