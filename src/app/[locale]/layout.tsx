import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { draftMode } from "next/headers";
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
import { CookieConsent } from "@/components/legal/cookie-consent";
import { FeedbackProvider } from "@/components/providers/feedback-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { DraftModeIndicator } from "@/components/sanity/draft-mode-indicator";
import { WebVitalsReporter } from "@/components/web-vitals";
import { type Locale, locales } from "@/i18n";
import { manrope, satoshi } from "../fonts";

// Custom Fonts for Casaora
// - Satoshi: Display text, headings (Swiss typography tradition)
// - Manrope: Body text, UI elements
// - Inter: Fallback for system compatibility
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

  return (
    <html lang={locale}>
      <body className={`${satoshi.variable} ${manrope.variable} ${inter.variable} antialiased`}>
        <WebVitalsReporter />
        <ErrorBoundary>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <PostHogProvider>
              <FeedbackProvider>
                <UnifiedCommandPaletteWrapper>
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
          </NextIntlClientProvider>
        </ErrorBoundary>
        {isDraftMode && <DraftModeIndicator />}
        <Toaster closeButton position="top-right" richColors toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
