import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { LogtailProvider } from "@logtail/next";
import { ErrorBoundary } from "@/components/error-boundary";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { locales } from "@/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        <LogtailProvider token={process.env.NEXT_PUBLIC_LOGTAIL_TOKEN}>
          <ErrorBoundary>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <SupabaseProvider>
                <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
              </SupabaseProvider>
              <CookieConsent />
            </NextIntlClientProvider>
          </ErrorBoundary>
        </LogtailProvider>
      </body>
    </html>
  );
}
