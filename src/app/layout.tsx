import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>{children}</SupabaseProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
