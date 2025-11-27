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
    default: "Casaora | Verified Housekeepers, Nannies & Chefs in Latin America",
    template: "%s | Casaora",
  },
  description:
    "Book background-checked housekeepers, nannies, and private chefs across Colombia, Paraguay, Uruguay, and Argentina. Secure payments, verified reviews, and the Casaora Happiness Guarantee.",
  keywords: [
    "housekeeper",
    "nanny",
    "private chef",
    "home cleaning",
    "childcare",
    "Latin America",
    "Colombia",
    "Argentina",
    "Uruguay",
    "Paraguay",
    "background check",
    "verified professionals",
  ],
  authors: [{ name: "Casaora" }],
  creator: "Casaora",
  publisher: "Casaora",
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
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    url: "https://casaora.co",
    siteName: "Casaora",
    title: "Casaora | Verified Housekeepers, Nannies & Chefs in Latin America",
    description:
      "Book background-checked housekeepers, nannies, and private chefs across Colombia, Paraguay, Uruguay, and Argentina.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Casaora - The new standard for home care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@casaora",
    creator: "@casaora",
    title: "Casaora | Verified Housekeepers, Nannies & Chefs",
    description:
      "Book background-checked housekeepers, nannies, and private chefs across Latin America.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

        {/* JSON-LD Organization Schema - Static structured data for SEO */}
        <script id="organization-schema" type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Casaora",
            "url": "https://casaora.co",
            "logo": "https://casaora.co/logo.png",
            "description": "The new standard for home care in Latin America",
            "sameAs": [
              "https://twitter.com/casaora",
              "https://instagram.com/casaora",
              "https://linkedin.com/company/casaora"
            ],
            "areaServed": [
              { "@type": "Country", "name": "Colombia" },
              { "@type": "Country", "name": "Paraguay" },
              { "@type": "Country", "name": "Uruguay" },
              { "@type": "Country", "name": "Argentina" }
            ]
          }`}
        </script>
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
