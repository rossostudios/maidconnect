import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "../globals.css";
import { AmaraFloatingButton } from "@/components/amara/amara-floating-button";
import { ChangelogBanner } from "@/components/changelog/changelog-banner";
import { UnifiedCommandPaletteWrapper } from "@/components/command-palette/unified-command-palette-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { AnnouncementBanner } from "@/components/sections/AnnouncementBanner";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FeedbackProvider } from "@/components/providers/feedback-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { DraftModeIndicator } from "@/components/sanity/draft-mode-indicator";
import { SkipLink, SkipLinks } from "@/components/ui/skip-link";
import { WebVitalsReporter } from "@/components/web-vitals";
import { type Locale, locales } from "@/i18n";
import { geistMono, geistSans } from "../fonts";

// Font configuration - Lia Design System
// - Geist Sans: Primary UI and marketing font
// - Geist Mono: Numbers, data, metrics
// - Inter: Fallback/system compatibility
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  icons: {
    icon: [
      { url: "/isologo.svg", type: "image/svg+xml" },
      { url: "/isologo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/isologo.svg", type: "image/svg+xml" }],
  },
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        data-nonce={nonce}
      >
        <ErrorBoundary>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SkipLinks>
              <SkipLink href="main-content">Skip to main content</SkipLink>
              <SkipLink href="footer">Skip to footer</SkipLink>
            </SkipLinks>
            <WebVitalsReporter />
            <PostHogProvider nonce={nonce}>
              <FeedbackProvider>
                <UnifiedCommandPaletteWrapper>
                  <AnnouncementBanner />
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
                </UnifiedCommandPaletteWrapper>
              </FeedbackProvider>
            </PostHogProvider>
            {isDraftMode && <DraftModeIndicator />}
            <Toaster
              closeButton
              position="top-right"
              richColors
              toastOptions={{ duration: 4000 }}
            />
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
